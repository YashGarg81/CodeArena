import { prisma } from "../db";

export async function resetAndSeedDatabaseUsers(): Promise<void> {
  console.log("🧹 Purging old user accounts from database...");

  const adminPasswordHash = await Bun.password.hash("Admin123!");
  const devPasswordHash = await Bun.password.hash("Dev123!");
  const userPasswordHash = await Bun.password.hash("User123!");

  try {
    // Clear dependent relations first
    await prisma.$executeRawUnsafe(`DELETE FROM "Comments";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Posts";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Note";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Snippet";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "ContestParticipant";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "RatingHistory";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "UserAchievement";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Vote";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Submissions";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Session";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "RefreshToken";`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "User";`).catch(() => {});

    console.log("🌱 Seeding fresh canonical accounts: Admin, Developer, Student...");

    // 1. Admin
    await prisma.user.create({
      data: {
        id: "usr_admin_1",
        name: "CodeArena Administrator",
        email: "admin@codearena.dev",
        username: "admin",
        password: adminPasswordHash,
        role: "ADMIN",
        bio: "Platform Administrator & System Architect",
        contestRating: 2100,
        xp: 5000,
        level: 15,
        streak: 30,
        isEmailVerified: true,
        tokenVersion: 0,
      } as any
    });

    // 2. Developer
    await prisma.user.create({
      data: {
        id: "usr_dev_1",
        name: "Lead Developer",
        email: "developer@codearena.dev",
        username: "developer",
        password: devPasswordHash,
        role: "DEVELOPER",
        bio: "Core Engine Developer & CodeArena Engineer",
        contestRating: 1850,
        xp: 2500,
        level: 8,
        streak: 15,
        isEmailVerified: true,
        tokenVersion: 0,
      } as any
    });

    // 3. Student / User
    await prisma.user.create({
      data: {
        id: "usr_user_1",
        name: "CodeArena Student",
        email: "user@codearena.dev",
        username: "user",
        password: userPasswordHash,
        role: "STUDENT",
        bio: "Competitive Programmer & Algorithmic Problem Solver",
        contestRating: 1200,
        xp: 100,
        level: 1,
        streak: 3,
        isEmailVerified: true,
        tokenVersion: 0,
      } as any
    });

    console.log("✅ Successfully purged and seeded fresh canonical accounts into database!");
  } catch (err: any) {
    console.error("⚠️ Error while resetting database users:", err?.message || err);
  }
}

// Auto-run when executed directly via bun
if (import.meta.main) {
  resetAndSeedDatabaseUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
