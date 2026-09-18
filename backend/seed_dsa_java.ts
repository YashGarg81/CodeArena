import { prisma } from "./db";
import fs from "fs";
import path from "path";
import { isCourseDeleted } from "./src/coursePersistence";

export async function seedDsaInJavaCourse(): Promise<void> {
  const courseSlug = "dsa-in-java";
  if (isCourseDeleted(courseSlug)) {
    console.log("ℹ️ 'DSA in Java' course was deleted by administrator; skipping re-seed.");
    return;
  }

  console.log("🌱 Seeding 'DSA in Java (from Beginning)' complete playlist course...");

  const playlistFile = path.join(__dirname, "parsed_dsa_java_playlist.json");
  let videos: { order: number; videoId: string; title: string; duration: string }[] = [];
  if (fs.existsSync(playlistFile)) {
    videos = JSON.parse(fs.readFileSync(playlistFile, "utf8"));
  }

  const course = await prisma.course.upsert({
    where: { slug: courseSlug },
    update: {
      title: "DSA in Java (from Beginning)",
      description: "Complete Data Structures & Algorithms Series in Java by Love Babbar — 100 Comprehensive Lecture Modules",
      longDesc: "Master Data Structures & Algorithms in Java from absolute basics to advanced competitive programming topics: Java setup, loops, arrays, binary search, recursion, linked lists, stacks, queues, trees, graphs, and dynamic programming.",
      icon: "☕",
      difficulty: "Beginner",
      tags: ["java", "dsa", "algorithms", "data-structures", "babbar", "interview-prep"],
      estimatedHours: 65,
      xpReward: 2500,
      isPublished: true,
      order: 0,
    },
    create: {
      slug: courseSlug,
      title: "DSA in Java (from Beginning)",
      description: "Complete Data Structures & Algorithms Series in Java by Love Babbar — 100 Comprehensive Lecture Modules",
      longDesc: "Master Data Structures & Algorithms in Java from absolute basics to advanced competitive programming topics: Java setup, loops, arrays, binary search, recursion, linked lists, stacks, queues, trees, graphs, and dynamic programming.",
      icon: "☕",
      difficulty: "Beginner",
      tags: ["java", "dsa", "algorithms", "data-structures", "babbar", "interview-prep"],
      estimatedHours: 65,
      xpReward: 2500,
      isPublished: true,
      order: 0,
    }
  });

  console.log(`Course upserted: ${course.title} (ID: ${course.id})`);

  let count = 0;
  for (const v of videos) {
    const youtubeUrl = `https://www.youtube.com/watch?v=${v.videoId}`;
    const lessonContent = `# ${v.title}

Welcome to **${v.title}** of the complete Java DSA Series!

### 🎯 What You Will Learn
In this comprehensive lecture module, you will learn the core concepts, implementation details, memory representations, time & space complexities, and hands-on coding walkthroughs in Java.

### 🎬 Lecture Video
Watch the full high-definition video lecture embedded above to follow along with the instructor step-by-step.

### 💡 Practice Tips
- Write and execute the Java code yourself in your IDE or our playground.
- Analyze the time and space complexity ($O(N)$, $O(\\log N)$, etc.) for each solution.
- Complete the exercise and mark this lesson as complete to claim your **+50 XP** reward!
`;

    await prisma.lesson.upsert({
      where: {
        courseId_order: {
          courseId: course.id,
          order: v.order
        }
      },
      update: {
        title: v.title,
        videoId: v.videoId,
        content: lessonContent,
        estimatedMinutes: 35,
        xpReward: 50
      },
      create: {
        courseId: course.id,
        title: v.title,
        videoId: v.videoId,
        content: lessonContent,
        order: v.order,
        estimatedMinutes: 35,
        xpReward: 50
      }
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} video lessons for 'DSA in Java (from Beginning)'!`);
}

if (import.meta.main) {
  seedDsaInJavaCourse().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
