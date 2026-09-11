// backend/src/storageService.ts
import crypto from "crypto";
import path from "path";
import fs from "fs";

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

/**
 * Cloud Object Storage Provider (supports AWS S3, Cloudflare R2, MinIO, GCS S3-compatible)
 */
export class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint?: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || "codearena-assets";
    this.region = process.env.AWS_REGION || "us-east-1";
    this.accessKey = process.env.AWS_ACCESS_KEY_ID || "";
    this.secretKey = process.env.AWS_SECRET_ACCESS_KEY || "";
    this.endpoint = process.env.S3_ENDPOINT; // e.g. https://<accountid>.r2.cloudflarestorage.com
  }

  async getPresignedUploadUrl(filename: string, mimeType: string, folder = "uploads"): Promise<PresignedUploadResult> {
    const ext = path.extname(filename);
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const sanitizedName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const fileKey = `${folder}/${Date.now()}-${uniqueId}-${sanitizedName}${ext}`;

    const host = this.endpoint ? new URL(this.endpoint).host : `${this.bucket}.s3.${this.region}.amazonaws.com`;
    const uploadUrl = this.endpoint ? `${this.endpoint}/${this.bucket}/${fileKey}` : `https://${host}/${fileKey}`;
    const downloadUrl = this.endpoint ? `${this.endpoint}/${this.bucket}/${fileKey}` : `https://${host}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      downloadUrl,
      expiresInSeconds: 900,
      headers: {
        "Content-Type": mimeType,
        "x-amz-acl": "public-read"
      }
    };
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    const host = this.endpoint ? new URL(this.endpoint).host : `${this.bucket}.s3.${this.region}.amazonaws.com`;
    return this.endpoint ? `${this.endpoint}/${this.bucket}/${fileKey}` : `https://${host}/${fileKey}`;
  }

  async deleteFile(_fileKey: string): Promise<boolean> {
    return true;
  }
}

/**
 * Local Fallback Storage Provider for zero-cloud environments
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.resolve(__dirname, "../../uploads");
    if (!fs.existsSync(this.uploadDir)) {
      try {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      } catch {}
    }
    this.baseUrl = process.env.APP_URL || "http://localhost:3000";
  }

  async getPresignedUploadUrl(filename: string, _mimeType: string, folder = "uploads"): Promise<PresignedUploadResult> {
    const ext = path.extname(filename);
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
    const targetPath = path.join(this.uploadDir, fileKey.replace(/^uploads\//, ""));
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function createStorageProvider(): StorageProvider {
  if (process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || process.env.STORAGE_DRIVER === "s3") {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}

export const storageService = createStorageProvider();
