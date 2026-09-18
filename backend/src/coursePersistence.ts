import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(__dirname, "../data");
const DELETED_COURSES_FILE = path.join(DATA_DIR, "deleted_courses.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DeletedCourseRecord {
  id?: string;
  slug?: string;
  title?: string;
  deletedAt: string;
}

function readRecords(): DeletedCourseRecord[] {
  try {
    if (!fs.existsSync(DELETED_COURSES_FILE)) {
      return [];
    }
    const content = fs.readFileSync(DELETED_COURSES_FILE, "utf-8").trim();
    if (!content) return [];
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading deleted_courses.json:", e);
    return [];
  }
}

function writeRecords(records: DeletedCourseRecord[]): void {
  try {
    fs.writeFileSync(DELETED_COURSES_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing deleted_courses.json:", e);
  }
}

/**
 * Check if a course (by ID, slug, or title) has been marked as deleted by an admin.
 */
export function isCourseDeleted(slugOrIdOrTitle: string | undefined | null): boolean {
  if (!slugOrIdOrTitle) return false;
  const target = slugOrIdOrTitle.trim().toLowerCase();
  const records = readRecords();
  return records.some(r => {
    if (r.id && r.id.toLowerCase() === target) return true;
    if (r.slug && r.slug.toLowerCase() === target) return true;
    if (r.title && r.title.toLowerCase() === target) return true;
    return false;
  });
}

/**
 * Mark a course as permanently deleted so seeders and runtime initializers
 * will never resurrect it across project restarts.
 */
export function markCourseDeleted(id?: string, slug?: string, title?: string): void {
  const records = readRecords();
  const exists = records.some(r => 
    (id && r.id === id) || 
    (slug && r.slug?.toLowerCase() === slug.toLowerCase())
  );
  if (!exists) {
    records.push({
      id: id || undefined,
      slug: slug || undefined,
      title: title || undefined,
      deletedAt: new Date().toISOString()
    });
    writeRecords(records);
    console.log(`🗑️ Course permanently tombstoned: [id: ${id || "n/a"}, slug: ${slug || "n/a"}, title: ${title || "n/a"}]`);
  }
}

/**
 * Remove course from deleted tombstone list if explicitly re-created by admin.
 */
export function unmarkCourseDeleted(slugOrId: string): void {
  const target = slugOrId.trim().toLowerCase();
  const records = readRecords();
  const filtered = records.filter(r => 
    r.id?.toLowerCase() !== target && 
    r.slug?.toLowerCase() !== target
  );
  if (filtered.length !== records.length) {
    writeRecords(filtered);
    console.log(`♻️ Course untombstoned: ${slugOrId}`);
  }
}
