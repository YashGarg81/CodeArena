import { PrismaClient } from "./generated/prisma";
const prisma = new PrismaClient();

async function main() {
  try {
    const raw = await prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
        enrollments: false
      }
    });
    console.log("Found courses:", raw.length);
    if (raw.length > 0) {
      console.log("Sample item keys:", Object.keys(raw[0]));
      console.log("Sample item _count:", (raw[0] as any)._count);
      console.log("Sample item:", JSON.stringify(raw[0], null, 2));
    }
  } catch (e) {
    console.error("Error querying courses:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
