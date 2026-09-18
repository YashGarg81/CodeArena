// backend/src/storageService.ts
import crypto from "crypto";
import path from "path";
import fs from "fs";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
  ".pdf", ".txt", ".md", ".json", ".csv",
  ".py", ".js", ".ts", ".cpp", ".java", ".go", ".rs"
]);

export const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".php", ".phtml", ".pl", ".cgi",
  ".msi", ".vbs", ".scr", ".com", ".ps1", ".jar", ".war", ".dll"
]);

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  downloadUrl: string;
  expiresInSeconds: number;
  headers?: Record<string, string>;
}

export interface StorageProvider {
  getPresignedUploadUrl(filename: string, mimeType: string, folder?: string): Promise<PresignedUploadResult>;
  getDownloadUrl(fileKey: string): Promise<string>;
  deleteFile(fileKey: string): Promise<boolean>;
}

export function getUploadsDir(): string {
  const dir = path.resolve(__dirname, "../uploads");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return dir;
}

/**
 * Validates a storage key against path traversal, null bytes, Windows drive letters, and UNC paths.
 */
export function validateStorageKey(rawKey: string): { safe: boolean; error?: string; cleanKey?: string } {
  if (!rawKey || typeof rawKey !== "string") {
    return { safe: false, error: "Invalid file key provided" };
  }

  // Check for null bytes
  if (rawKey.includes("\0") || rawKey.includes("%00")) {
    return { safe: false, error: "Null byte injection detected" };
  }

  // Check for URL-encoded traversal
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawKey);
  } catch {
    return { safe: false, error: "Malformed URL encoding in file key" };
  }

  // Check again for null bytes after decode
  if (decoded.includes("\0")) {
    return { safe: false, error: "Null byte injection detected" };
  }

  // Check for Windows drive letters (e.g. C:, D:)
  if (/^[a-zA-Z]:/.test(decoded) || /^[a-zA-Z]:/.test(rawKey)) {
    return { safe: false, error: "Windows drive letters are strictly forbidden" };
  }

  // Check for UNC network paths (e.g. \\server\share or //server/share)
  if (/^\\\\[^\\]/.test(rawKey) || /^\/\/[^/]/.test(rawKey) || /^\\\\/.test(decoded) || /^\/\//.test(decoded)) {
    return { safe: false, error: "UNC paths are strictly forbidden" };
  }

  // Check for leading slashes / absolute paths
  if (rawKey.startsWith("/") || rawKey.startsWith("\\") || decoded.startsWith("/") || decoded.startsWith("\\")) {
    return { safe: false, error: "Absolute paths are strictly forbidden" };
  }

  // Check for directory traversal sequences
  if (decoded.includes("..") || rawKey.includes("..")) {
    return { safe: false, error: "Path traversal sequence '..' is forbidden" };
  }

  // Normalize path separators to forward slash and strip leading slashes
  const normalized = path.posix.normalize(decoded.replace(/\\/g, "/")).replace(/^\/+/, "");

  // Prevent absolute paths or escape
  if (path.isAbsolute(normalized) || normalized.startsWith("..")) {
    return { safe: false, error: "Path traversal or absolute path detected" };
  }

  return { safe: true, cleanKey: normalized };
}

/**
 * Resolves a safe filesystem path guaranteed to remain within the intended uploads root.
 */
export async function resolveSafeStoragePath(cleanKey: string): Promise<{ safe: boolean; resolvedPath?: string; error?: string }> {
  const uploadsDir = getUploadsDir();
  // Strip redundant 'uploads/' prefix if present
  const relativePart = cleanKey.replace(/^uploads\//, "");
  const resolved = path.resolve(uploadsDir, relativePart);

  // Verification 1: String prefix containment
  if (!resolved.startsWith(uploadsDir)) {
    return { safe: false, error: "Path traversal out of storage boundary detected" };
  }

  // Verification 2: If file exists, verify realpath to prevent symlink breakouts
  if (fs.existsSync(resolved)) {
    try {
      const real = await fs.promises.realpath(resolved);
      if (!real.startsWith(uploadsDir)) {
        return { safe: false, error: "Symlink escape out of storage boundary detected" };
      }
    } catch {
      return { safe: false, error: "Failed to resolve canonical storage path" };
    }
  }

  return { safe: true, resolvedPath: resolved };
}

/**
 * Verifies file access authorization to prevent IDOR on private files.
 */
export function checkFileAccess(cleanKey: string, userId?: string, userRole?: string): { allowed: boolean; status: number; error?: string } {
  const relative = cleanKey.replace(/^uploads\//, "");

  // Public assets (avatars, problem diagrams, public documentation)
  if (relative.startsWith("public/") || relative.startsWith("avatars/")) {
    return { allowed: true, status: 200 };
  }

  // Admin has global read access for auditing and moderation
  if (userRole === "ADMIN") {
    return { allowed: true, status: 200 };
  }

  // Private user-scoped assets: e.g. "usr_123/filename.pdf" or "u_123/..."
  const parts = relative.split("/");
  if (parts.length >= 2) {
    const ownerId = parts[0];
    if (!userId) {
      return { allowed: false, status: 401, error: "Authentication required to access private assets" };
    }
    if (userId === ownerId) {
      return { allowed: true, status: 200 };
    }
    return { allowed: false, status: 403, error: "Forbidden: You do not have permission to access this asset" };
  }

  // Fallback: If no user prefix is present and not explicitly public, require authentication
  if (!userId) {
    return { allowed: false, status: 401, error: "Authentication required" };
  }
  return { allowed: true, status: 200 };
}

/**
 * Saves a file asynchronously with size and extension validation and server-generated unique naming.
 */
export async function saveStorageFile(
  userId: string,
  rawFilename: string,
  fileBuffer: Buffer,
  isPublic = false
): Promise<{ success: boolean; key?: string; error?: string; status: number }> {
  // Check max size
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    return { success: false, status: 413, error: `File size exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit` };
  }

  const ext = path.extname(rawFilename).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { success: false, status: 400, error: `File type '${ext}' is strictly prohibited for security reasons` };
  }

  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return { success: false, status: 400, error: `File extension '${ext}' is not supported` };
  }

  const uniqueId = crypto.randomBytes(12).toString("hex");
  const sanitizedBasename = path.basename(rawFilename, ext).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || "file";
  const scopeFolder = isPublic ? "public" : userId;
  const storedName = `${Date.now()}_${uniqueId}_${sanitizedBasename}${ext || ".bin"}`;
  const fileKey = `${scopeFolder}/${storedName}`;

  const uploadsDir = getUploadsDir();
  const targetDir = path.resolve(uploadsDir, scopeFolder);
  if (!fs.existsSync(targetDir)) {
    await fs.promises.mkdir(targetDir, { recursive: true });
  }

  const targetPath = path.resolve(targetDir, storedName);

  // Prevent accidental overwrite
  if (fs.existsSync(targetPath)) {
    return { success: false, status: 409, error: "Target file already exists. Please retry." };
  }

  await fs.promises.writeFile(targetPath, fileBuffer);
  return { success: true, key: fileKey, status: 200 };
}

/**
 * Local Fallback Storage Provider
 */
export class LocalStorageProvider implements StorageProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.APP_URL || "http://localhost:3000";
    getUploadsDir();
  }

  async getPresignedUploadUrl(filename: string, _mimeType: string, folder = "uploads"): Promise<PresignedUploadResult> {
    const ext = path.extname(filename).toLowerCase();
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const sanitizedName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const fileKey = `${folder}/${Date.now()}-${uniqueId}-${sanitizedName}${ext}`;

    return {
      uploadUrl: `${this.baseUrl}/api/v1/storage/upload?key=${encodeURIComponent(fileKey)}`,
      fileKey,
      downloadUrl: `${this.baseUrl}/api/v1/storage/files/${encodeURIComponent(fileKey)}`,
      expiresInSeconds: 900
    };
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    return `${this.baseUrl}/api/v1/storage/files/${encodeURIComponent(fileKey)}`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    const check = validateStorageKey(fileKey);
    if (!check.safe || !check.cleanKey) return false;
    const resolved = await resolveSafeStoragePath(check.cleanKey);
    if (!resolved.safe || !resolved.resolvedPath) return false;
    if (fs.existsSync(resolved.resolvedPath)) {
      try {
        await fs.promises.unlink(resolved.resolvedPath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function createStorageProvider(): StorageProvider {
  return new LocalStorageProvider();
}

export const storageService = createStorageProvider();
