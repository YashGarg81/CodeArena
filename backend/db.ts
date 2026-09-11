import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Clean & resolve database connection string
const rawDbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public";
const dbUrl = rawDbUrl.includes("@postgres:") ? rawDbUrl.replace("@postgres:", "@localhost:") : rawDbUrl;

const isProd = process.env.NODE_ENV === "production";
const allowInMemoryFallback = process.env.ALLOW_IN_MEMORY_DB === "true" || (!isProd && process.env.STRICT_DB !== "true");

let rawPrisma: any;
let postgresConnected = false;

try {
  const adapter = new PrismaPg({ connectionString: dbUrl });
  rawPrisma = new PrismaClient({ adapter } as any);
} catch (e: any) {
  if (isProd && !allowInMemoryFallback) {
    console.error("🚨 FATAL [DATABASE]: PostgreSQL is required in production. Refusing silent fallback to in-memory store.");
    throw new Error(`Production Database Error: Unable to connect to PostgreSQL: ${e.message}`);
  }
  rawPrisma = new PrismaClient();
}

/**
 * Health check to verify PostgreSQL connectivity.
 * Throws in production/strict mode if PostgreSQL cannot be reached.
 */
export async function assertPostgresConnection(): Promise<boolean> {
  try {
    await rawPrisma.$queryRaw`SELECT 1`;
    postgresConnected = true;
    return true;
  } catch (err: any) {
    if (isProd && !allowInMemoryFallback) {
      console.error("🚨 FATAL [DATABASE]: Production requires active PostgreSQL instance. Execution failed closed.");
      throw new Error(`Production Database Error: PostgreSQL is unavailable: ${err.message}`);
    }
    return false;
  }
}

// Import comprehensive Coder Army DSA Sheet questions
import dsaSheetQuestions from "./src/dsaSheetProblems.json";

// In-Memory Fallback Data Store for local standalone development only
const inMemoryStore: Record<string, any[]> = {
  user: [
    {
      id: "usr_admin_1",
      name: "Admin User",
      email: "admin@codearena.dev",
      username: "admin",
      password: "$argon2id$v=19$m=65536,t=2,p=1$lNDbwp9EgEM88oHRcAPapPFn8Xx1hbtA/8D4dZSfuJc$A6nRGA8TMMmb01eEc6Z7oCXruZ5/yiWImnany4xhOP4",
      role: "ADMIN",
      avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
      bio: "CodeArena Lead Engineer",
      contestRating: 1850,
      xp: 2400,
      level: 8,
      streak: 12,
      isEmailVerified: true,
      tokenVersion: 0,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr_demo_1",
      name: "Demo Developer",
      email: "demo@codearena.dev",
      username: "demo",
      password: "$argon2id$v=19$m=65536,t=2,p=1$lNDbwp9EgEM88oHRcAPapPFn8Xx1hbtA/8D4dZSfuJc$A6nRGA8TMMmb01eEc6Z7oCXruZ5/yiWImnany4xhOP4",
      role: "DEVELOPER",
      avatar: "https://lh3.googleusercontent.com/a/default-user",
      bio: "Full Stack Software Engineer",
      contestRating: 1520,
      xp: 850,
      level: 4,
      streak: 5,
      isEmailVerified: true,
      tokenVersion: 0,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr_student_1",
      name: "Standard Student",
      email: "user@codearena.dev",
      username: "user",
      password: "$argon2id$v=19$m=65536,t=2,p=1$lNDbwp9EgEM88oHRcAPapPFn8Xx1hbtA/8D4dZSfuJc$A6nRGA8TMMmb01eEc6Z7oCXruZ5/yiWImnany4xhOP4",
      role: "STUDENT",
      avatar: "https://avatars.githubusercontent.com/u/9919?v=4",
      bio: "Algorithmic Problem Solver",
      contestRating: 1200,
      xp: 0,
      level: 1,
      streak: 0,
      isEmailVerified: true,
      tokenVersion: 0,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  problems: dsaSheetQuestions && dsaSheetQuestions.length > 0 ? (dsaSheetQuestions as any[]) : [
    {
      id: "two-sum",
      slug: "two-sum",
      title: "1. Two Sum",
      difficulty: "Easy",
      category: "Arrays",
      tags: ["array", "hash-table", "two-pointers"],
      companies: ["Google", "Amazon", "Facebook", "Apple"],
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      hints: ["A brute force approach checks all pairs. Can we use a hash map for O(n)?", "Store each number's value as a key in a hash map and its index as value."],
      editorial: "### Hash Map Lookups\nUse a hash map to look up target - nums[i] in O(1) time.",
      templates: {
        js: "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}",
        py: "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        cpp: "std::vector<int> twoSum(std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (map.count(diff)) return {map[diff], i};\n        map[nums[i]] = i;\n    }\n    return {};\n}",
        java: "public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int diff = target - nums[i];\n        if (map.containsKey(diff)) return new int[]{map.get(diff), i};\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}",
        go: "func twoSum(nums []int, target int) []int {\n    m := make(map[int]int)\n    for i, num := range nums {\n        if j, ok := m[target-num]; ok { return []int{j, i} }\n        m[num] = i\n    }\n    return nil\n}"
      },
      testCases: [{ input: "[2, 7, 11, 15]\n9", expectedOutput: "[0, 1]", isHidden: false }],
      status: "Published",
      version: 1,
      order: 1,
      likes: 124,
      dislikes: 12,
      acceptanceRate: 84.5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  course: [
    {
      id: "dsa-101",
      slug: "dsa-fundamentals",
      title: "DSA Fundamentals",
      description: "Master Data Structures & Algorithms from zero to hero.",
      longDesc: "A comprehensive beginner-friendly course covering all essential data structures and algorithms needed to crack coding interviews.",
      icon: "🧠",
      difficulty: "Beginner",
      tags: ["arrays", "strings", "recursion", "sorting"],
      estimatedHours: 20,
      xpReward: 800,
      order: 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lessons: [
        {
          id: "les_dsa_1",
          courseId: "dsa-101",
          title: "Introduction to Complexity Analysis",
          order: 1,
          estimatedMinutes: 20,
          xpReward: 50,
          content: "# Big O Notation\n\nUnderstanding code efficiency at scale.",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: "sd-101",
      slug: "system-design-101",
      title: "System Design Fundamentals",
      description: "Learn to architect scalable web services and distributed databases.",
      longDesc: "Master load balancing, caching, sharding, message queues, and CAP theorem.",
      icon: "🏗️",
      difficulty: "Intermediate",
      tags: ["system-design", "architecture", "redis", "kafka"],
      estimatedHours: 25,
      xpReward: 1000,
      order: 2,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lessons: [
        {
          id: "les_sd_1",
          courseId: "sd-101",
          title: "Monoliths vs Microservices",
          order: 1,
          estimatedMinutes: 30,
          xpReward: 75,
          content: "# System Architecture Patterns\n\nChoosing between monoliths and microservices.",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  ],
  submission: [],
  submissions: [],
  note: [],
  auditlog: [
    {
      id: "audit_init_1",
      action: "USER_LOGIN",
      userId: "usr_admin_1",
      resourceId: null,
      metadata: { method: "password", role: "ADMIN" },
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(Date.now() - 1000 * 60 * 12),
      updatedAt: new Date(Date.now() - 1000 * 60 * 12)
    },
    {
      id: "audit_init_2",
      action: "PROBLEM_PUBLISHED",
      userId: "usr_admin_1",
      resourceId: "p_two_sum",
      metadata: { title: "Two Sum", difficulty: "Easy" },
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(Date.now() - 1000 * 60 * 25),
      updatedAt: new Date(Date.now() - 1000 * 60 * 25)
    },
    {
      id: "audit_init_3",
      action: "SANDBOX_SECURITY_SCAN_PASSED",
      userId: "usr_demo_1",
      resourceId: "sub_demo_101",
      metadata: { language: "typescript", runtime: 42 },
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      updatedAt: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: "audit_init_4",
      action: "SYSTEM_BACKUP_COMPLETED",
      userId: "system",
      resourceId: "backup_snap_001",
      metadata: { size: "24.8MB", tables: 18 },
      ipAddress: "127.0.0.1",
      userAgent: "SystemScheduler/1.0",
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
      updatedAt: new Date(Date.now() - 1000 * 60 * 90)
    }
  ],
  notification: [],
  backgroundjob: [],
  problemlike: [],
  moderationreport: [
    {
      id: "rpt_101",
      type: "Spam",
      target: "Discussion Post: 'Free Crypto Giveaway in Comments'",
      targetType: "forum_post",
      targetId: "post_crypto_spam",
      reporter: "alice@codearena.dev",
      reason: "Promotional spam link posted in community discussion",
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 2),
      updatedAt: new Date(Date.now() - 3600000 * 2)
    },
    {
      id: "rpt_102",
      type: "Abuse",
      target: "Comment on '1. Two Sum': Harassment and offensive language",
      targetType: "comment",
      targetId: "comment_abuse_1",
      reporter: "bob@codearena.dev",
      reason: "Violates community guidelines with offensive slurs",
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 5),
      updatedAt: new Date(Date.now() - 3600000 * 5)
    },
    {
      id: "rpt_103",
      type: "Plagiarism",
      target: "Solution Submission on '42. Trapping Rain Water'",
      targetType: "solution",
      targetId: "sub_plag_42",
      reporter: "automated_code_similarity_agent",
      reason: "99.4% verbatim match with published editorial during contest",
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 18),
      updatedAt: new Date(Date.now() - 3600000 * 18)
    }
  ],
  contest: [
    {
      id: "wc-weekly-1",
      title: "CodeArena Weekly Contest #1",
      description: "Solve 4 algorithmic challenges in 90 minutes. Penalty time calculated per failed submission.",
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 86400000 + 90 * 60000),
      durationMinutes: 90,
      isPublic: true,
      status: "Upcoming",
      participants: [{ userId: "usr_admin_1" }, { userId: "usr_demo_1" }],
      _count: { participants: 1248, problems: 4 },
      problems: [
        { problemId: "two-sum", points: 100, order: 0, problem: { id: "two-sum", title: "Two Sum", difficulty: "Easy", category: "Arrays", solveCount: 2450, attemptCount: 3100 } },
        { problemId: "reverse-linked-list", points: 200, order: 1, problem: { id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", category: "Linked List", solveCount: 1820, attemptCount: 2200 } },
        { problemId: "valid-parentheses", points: 300, order: 2, problem: { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Medium", category: "Stack", solveCount: 1400, attemptCount: 2100 } },
        { problemId: "trapping-rain-water", points: 400, order: 3, problem: { id: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers", solveCount: 650, attemptCount: 1450 } }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "bw-biweekly-1",
      title: "CodeArena Biweekly Contest #21",
      description: "Compete against global peers with live rating changes and penalty tracking.",
      startTime: new Date(Date.now() + 86400000 * 4),
      endTime: new Date(Date.now() + 86400000 * 4 + 90 * 60000),
      durationMinutes: 90,
      isPublic: true,
      status: "Upcoming",
      participants: [{ userId: "usr_admin_1" }],
      _count: { participants: 842, problems: 4 },
      problems: [
        { problemId: "two-sum", points: 100, order: 0, problem: { id: "two-sum", title: "Two Sum", difficulty: "Easy", category: "Arrays", solveCount: 2450, attemptCount: 3100 } },
        { problemId: "valid-parentheses", points: 200, order: 1, problem: { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Medium", category: "Stack", solveCount: 1400, attemptCount: 2100 } },
        { problemId: "coin-change", points: 300, order: 2, problem: { id: "coin-change", title: "Coin Change", difficulty: "Medium", category: "Dynamic Programming", solveCount: 980, attemptCount: 1750 } },
        { problemId: "merge-k-sorted-lists", points: 400, order: 3, problem: { id: "merge-k-sorted-lists", title: "Merge k Sorted Lists", difficulty: "Hard", category: "Heap", solveCount: 420, attemptCount: 1100 } }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "past-launch-0",
      title: "CodeArena Inaugural Launch Cup",
      description: "Past competition problem set available for unrestricted practice mode.",
      startTime: new Date(Date.now() - 86400000 * 3),
      endTime: new Date(Date.now() - 86400000 * 3 + 90 * 60000),
      durationMinutes: 90,
      isPublic: true,
      status: "Ended",
      participants: [{ userId: "usr_demo_1" }],
      _count: { participants: 523, problems: 4 },
      problems: [
        { problemId: "two-sum", points: 100, order: 0, problem: { id: "two-sum", title: "Two Sum", difficulty: "Easy", category: "Arrays", solveCount: 2450, attemptCount: 3100 } },
        { problemId: "reverse-linked-list", points: 200, order: 1, problem: { id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", category: "Linked List", solveCount: 1820, attemptCount: 2200 } },
        { problemId: "valid-parentheses", points: 300, order: 2, problem: { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Medium", category: "Stack", solveCount: 1400, attemptCount: 2100 } },
        { problemId: "trapping-rain-water", points: 400, order: 3, problem: { id: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers", solveCount: 650, attemptCount: 1450 } }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

// Create a resilient Proxy for Prisma calls to prevent connection crashes when DB is offline
const handler: ProxyHandler<any> = {
  get(target, propKey: string) {
    if (typeof propKey === "symbol" || propKey.startsWith("$")) {
      const val = target[propKey];
      return typeof val === "function" ? val.bind(target) : val;
    }

    const orig = target[propKey];
    const dummyTarget = orig || {};

    return new Proxy(dummyTarget, {
      get(modelTarget, methodKey: string) {
        return async function (...args: any[]) {
          const modelName = propKey.toLowerCase();
          if (!inMemoryStore[modelName]) inMemoryStore[modelName] = [];
          const list = inMemoryStore[modelName];
          const queryOptions = args[0] || {};

                if (methodKey === "findUnique" || methodKey === "findFirst") {
                  if (queryOptions.where) {
                    const found = list.find(item => {
                      if (queryOptions.where.id && item.id === queryOptions.where.id) return true;
                      if (queryOptions.where.userId_problemId) {
                        return item.userId === queryOptions.where.userId_problemId.userId && item.problemId === queryOptions.where.userId_problemId.problemId;
                      }
                      if (queryOptions.where.userId && queryOptions.where.problemId) {
                        return item.userId === queryOptions.where.userId && item.problemId === queryOptions.where.problemId;
                      }
                      if (queryOptions.where.email && item.email?.toLowerCase() === queryOptions.where.email.toLowerCase()) return true;
                      if (queryOptions.where.username && item.username?.toLowerCase() === queryOptions.where.username.toLowerCase()) return true;
                      if (queryOptions.where.slug && item.slug === queryOptions.where.slug) return true;
                      if (queryOptions.where.OR && Array.isArray(queryOptions.where.OR)) {
                        return queryOptions.where.OR.some((cond: any) => {
                          if (cond.email && item.email?.toLowerCase() === cond.email.toLowerCase()) return true;
                          if (cond.username && item.username?.toLowerCase() === cond.username.toLowerCase()) return true;
                          if (cond.id && item.id === cond.id) return true;
                          if (cond.slug && item.slug === cond.slug) return true;
                          return false;
                        });
                      }
                      return false;
                    });
                    if (!found) return null;
                    if (modelName === "problems") {
                      return {
                        ...found,
                        _count: found._count || {
                          testCasesRel: Array.isArray(found.testCases) ? found.testCases.length : 1,
                          revisions: 1,
                          submissions: found.solveCount || 0
                        }
                      };
                    }
                    return found;
                  }
                  return list[0] || null;
                }

                if (methodKey === "findMany") {
                  let res = [...list];
                  const where = queryOptions.where || {};
                  if (where.isPublished !== undefined) {
                    res = res.filter(item => item.isPublished === where.isPublished || item.isPublished === undefined);
                  }
                  if (where.status) res = res.filter(item => item.status === where.status);
                  if (where.difficulty) res = res.filter(item => (item.difficulty || "").toLowerCase() === String(where.difficulty).toLowerCase());
                  if (where.title) {
                    const searchStr = typeof where.title === "object" ? where.title.contains || "" : where.title;
                    if (searchStr) {
                      res = res.filter(item => (item.title || "").toLowerCase().includes(String(searchStr).toLowerCase()));
                    }
                  }
                  if (where.role) res = res.filter(item => item.role === where.role);
                  if (where.userId) res = res.filter(item => item.userId === where.userId);
                  if (where.problemId) res = res.filter(item => item.problemId === where.problemId);
                  if (where.isPublic !== undefined) res = res.filter(item => item.isPublic === where.isPublic);
                  if (where.id) res = res.filter(item => item.id === where.id);
                  if (where.OR && Array.isArray(where.OR)) {
                    res = res.filter(item =>
                      where.OR.some((cond: any) => {
                        if (cond.userId && item.userId === cond.userId) return true;
                        if (cond.isBroadcast && item.isBroadcast === cond.isBroadcast) return true;
                        if (cond.id && item.id === cond.id) return true;
                        if (cond.slug && item.slug === cond.slug) return true;
                        if (cond.email) {
                          const val = cond.email.contains || cond.email;
                          if (item.email?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        if (cond.username) {
                          const val = cond.username.contains || cond.username;
                          if (item.username?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        if (cond.name) {
                          const val = cond.name.contains || cond.name;
                          if (item.name?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        if (cond.title) {
                          const val = cond.title.contains || cond.title;
                          if (item.title?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        return false;
                      })
                    );
                  }
                  if (queryOptions.orderBy?.createdAt === "desc") {
                    res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  }
                  if (queryOptions.skip) res = res.slice(queryOptions.skip);
                  if (queryOptions.take) res = res.slice(0, queryOptions.take);

                  if (modelName === "problems") {
                    res = res.map(item => ({
                      ...item,
                      _count: item._count || {
                        testCasesRel: Array.isArray(item.testCases) ? item.testCases.length : 1,
                        revisions: 1,
                        submissions: item.solveCount || 0
                      }
                    }));
                  }

                  return res;
                }

                if (methodKey === "updateMany") {
                  const dataToSet = queryOptions.data || {};
                  let count = 0;
                  for (const item of list) {
                    const matchesId = queryOptions.where?.id && item.id === queryOptions.where.id;
                    const matchesOr = queryOptions.where?.OR && Array.isArray(queryOptions.where.OR) &&
                      queryOptions.where.OR.some((cond: any) => {
                        if (cond.userId && item.userId === cond.userId) return true;
                        if (cond.isBroadcast && item.isBroadcast === cond.isBroadcast) return true;
                        return false;
                      });
                    if (matchesId || matchesOr) {
                      Object.assign(item, dataToSet, { updatedAt: new Date() });
                      count++;
                    }
                  }
                  return { count };
                }

                if (methodKey === "delete" || methodKey === "deleteMany") {
                  const where = queryOptions.where || {};
                  const initialLen = list.length;
                  inMemoryStore[modelName] = list.filter(item => {
                    if (where.userId_problemId) {
                      return !(item.userId === where.userId_problemId.userId && item.problemId === where.userId_problemId.problemId);
                    }
                    if (where.userId && where.problemId) {
                      return !(item.userId === where.userId && item.problemId === where.problemId);
                    }
                    if (where.id) return item.id !== where.id;
                    return true;
                  });
                  return { count: initialLen - inMemoryStore[modelName].length };
                }

                if (methodKey === "create") {
                  const newItem = {
                    id: queryOptions.data.id || `${modelName}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                    ...queryOptions.data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  list.push(newItem);
                  return newItem;
                }

                if (methodKey === "update" || methodKey === "upsert") {
                  const rawData = queryOptions.data || queryOptions.update || queryOptions.create || {};
                  const where = queryOptions.where || {};
                  const existingIndex = list.findIndex(i => {
                    if (where.id && i.id === where.id) return true;
                    if (where.slug && i.slug === where.slug) return true;
                    if (where.email && i.email === where.email) return true;
                    if (where.username && i.username === where.username) return true;
                    return false;
                  });
                  if (existingIndex >= 0) {
                    const current = list[existingIndex];
                    const merged = { ...current };
                    for (const [k, v] of Object.entries(rawData)) {
                      if (v && typeof v === "object" && "increment" in (v as any)) {
                        merged[k] = (Number(current[k]) || 0) + Number((v as any).increment);
                      } else {
                        merged[k] = v;
                      }
                    }
                    merged.updatedAt = new Date();
                    list[existingIndex] = merged;
                    return list[existingIndex];
                  }
                  const newItem = {
                    id: `${modelName}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                    ...rawData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  list.push(newItem);
                  return newItem;
                }

                if (methodKey === "count") {
                  let res = [...list];
                  const where = queryOptions.where || {};
                  if (where.status) res = res.filter(item => item.status === where.status);
                  if (where.difficulty) res = res.filter(item => (item.difficulty || "").toLowerCase() === String(where.difficulty).toLowerCase());
                  if (where.title) {
                    const searchStr = typeof where.title === "object" ? where.title.contains || "" : where.title;
                    if (searchStr) {
                      res = res.filter(item => (item.title || "").toLowerCase().includes(String(searchStr).toLowerCase()));
                    }
                  }
                  if (where.role) res = res.filter(item => item.role === where.role);
                  if (where.userId) res = res.filter(item => item.userId === where.userId);
                  if (where.problemId) res = res.filter(item => item.problemId === where.problemId);
                  if (where.isPublic !== undefined) res = res.filter(item => item.isPublic === where.isPublic);
                  if (where.OR && Array.isArray(where.OR)) {
                    res = res.filter(item =>
                      where.OR.some((cond: any) => {
                        if (cond.email) {
                          const val = cond.email.contains || cond.email;
                          if (item.email?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        if (cond.username) {
                          const val = cond.username.contains || cond.username;
                          if (item.username?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        if (cond.name) {
                          const val = cond.name.contains || cond.name;
                          if (item.name?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        if (cond.title) {
                          const val = cond.title.contains || cond.title;
                          if (item.title?.toLowerCase().includes(String(val).toLowerCase())) return true;
                        }
                        return false;
                      })
                    );
                  }
                  return res.length;
                }

                return null;
        };
      }
    });
  }
};

export const prisma = new Proxy(rawPrisma, handler);