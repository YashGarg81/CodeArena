export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  contestRating: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  tags: string[];
  companies: string[];
  solveCount: number;
  attemptCount: number;
  isPremium: boolean;
}

export interface TestCase {
  input: string;
  output: string;
  isHidden: boolean;
}

export interface ProblemDetail extends Problem {
  description: string;
  hints: string[];
  editorial?: string;
  templates: Record<string, string>;
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
}

export interface TestResult {
  input: string;
  expected: string;
  got: string;
  passed: boolean;
  runtime: number;
  isHidden: boolean;
  error?: string;
}

export interface Submission {
  id: string;
  problemId: string;
  code: string;
  language: string;
  status: string;
  output: string | null;
  testResults: TestResult[] | null;
  runtime: number | null;
  beatsPercent: number | null;
  testCasesPassed: number;
  testCasesTotal: number;
  errorMessage: string | null;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  views: number;
  createdAt: string;
  user: { name: string; username: string; avatar?: string };
  _count: { comments: number };
}

export interface ForumPostDetail extends ForumPost {
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string; username: string; avatar?: string };
  }>;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  contestRating: number;
  xp: number;
  solvedCount: number;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedWeeks: number;
  stages: Array<{ title: string; week: string; problems?: string[]; topics?: string[] }>;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  estimatedHours: number;
  xpReward: number;
  lessonCount: number;
  enrollmentCount: number;
  userProgress: number | null;
  isEnrolled: boolean;
  isCompleted: boolean;
}

export interface LessonSummary {
  id: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  videoUrl?: string | null;
  hasQuiz: boolean;
  quizQuestionCount: number;
  isCompleted: boolean;
}

export interface CourseDetail extends CourseSummary {
  longDesc: string;
  lessons: LessonSummary[];
}

export interface LessonDetail {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  course: { id: string; slug: string; title: string };
  quiz: { id: string; title: string; xpReward: number; questionCount: number } | null;
  prevLesson: { id: string; title: string; order: number } | null;
  nextLesson: { id: string; title: string; order: number } | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  order: number;
}

export interface QuizData {
  id: string;
  title: string;
  xpReward: number;
  questions: QuizQuestion[];
  lastAttempt?: { score: number; total: number; createdAt: string } | null;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  xpEarned: number;
  breakdown: Array<{
    questionId: string;
    question: string;
    options: string[];
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface SDNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  icon: string;
  tech?: string;
  instances?: string;
}

export interface SDConnection {
  from: string;
  to: string;
  label?: string;
}

export interface SDTemplate {
  id: string;
  title: string;
  icon: string;
  difficulty: string;
  desc: string;
  rps: string;
  storage: string;
  readWriteRatio: string;
  latencyTarget: string;
  tradeOffs: string[];
  nodes: SDNode[];
  connections: SDConnection[];
}
