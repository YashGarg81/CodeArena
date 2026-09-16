import { prisma } from "../db";

function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const str = input.trim();
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  if (str.length === 11 && !str.includes("/") && !str.includes(" ")) return str;
  return null;
}

export async function migrateVideoUrls() {
  console.log("🔄 Starting automatic migration: videoUrl -> videoId...");

  try {
    // 1. Check if raw column videoUrl exists in database via SQL (if PostgreSQL is used)
    try {
      const colCheck: any = await (prisma as any).$queryRawUnsafe(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Lesson' AND column_name IN ('videoUrl', 'videoId');
      `);

      const colNames = Array.isArray(colCheck) ? colCheck.map((c: any) => c.column_name) : [];
      console.log(`Database Lesson columns found: ${colNames.join(", ")}`);

      // If videoId doesn't exist, add it
      if (!colNames.includes("videoId")) {
        console.log("Adding column 'videoId' to table 'Lesson'...");
        await (prisma as any).$executeRawUnsafe(`ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "videoId" TEXT;`);
      }

      // If videoUrl exists in table, migrate data
      if (colNames.includes("videoUrl")) {
        console.log("Found legacy 'videoUrl' column. Migrating records...");
        const legacyRows: any = await (prisma as any).$queryRawUnsafe(`
          SELECT id, "videoUrl", "videoId" FROM "Lesson" WHERE "videoUrl" IS NOT NULL;
        `);

        let migratedCount = 0;
        for (const row of legacyRows) {
          if (!row.videoId && row.videoUrl) {
            const ytid = extractYouTubeId(row.videoUrl);
            if (ytid) {
              await (prisma as any).$executeRawUnsafe(`
                UPDATE "Lesson" SET "videoId" = $1 WHERE id = $2;
              `, ytid, row.id);
              migratedCount++;
            }
          }
        }
        console.log(`✅ Migrated ${migratedCount} legacy lesson records to YouTube videoId format.`);
      }
    } catch (sqlErr: any) {
      console.log("Direct raw SQL check skipped or table does not exist yet:", sqlErr.message);
    }

    // 2. Also check records via Prisma model
    try {
      const lessons = await prisma.lesson.findMany({
        select: { id: true, videoId: true }
      });

      console.log(`Checked ${lessons.length} lessons in Prisma.`);
      let updatedCount = 0;

      for (const l of lessons) {
        if (l.videoId && l.videoId.startsWith("http")) {
          const ytid = extractYouTubeId(l.videoId);
          if (ytid && ytid !== l.videoId) {
            await prisma.lesson.update({
              where: { id: l.id },
              data: { videoId: ytid }
            });
            updatedCount++;
          }
        }
      }

      if (updatedCount > 0) {
        console.log(`✅ Sanitized ${updatedCount} lessons from URL format to pure YouTube ID format.`);
      }
    } catch (prismaErr: any) {
      console.log("Prisma check:", prismaErr.message);
    }

    console.log("🎉 Migration completed successfully!");
  } catch (err: any) {
    console.error("Migration error:", err);
  }
}

if (import.meta.main) {
  migrateVideoUrls().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
