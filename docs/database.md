# CodeArena — Database Schema & Data Models

## Technology Stack
- **Database Engine**: PostgreSQL 18.3
- **ORM / Query Builder**: Prisma ORM
- **Migration Strategy**: Declarative Schema Sync (`prisma db push` / `prisma migrate`)

## Relational Schema Entities

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  DEVELOPER
  CANDIDATE
  INTERVIEWER
  INSTRUCTOR
  COMPANY
  ADMIN
}

enum Difficulty {
  Easy
  Medium
  Hard
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  username        String         @unique
  name            String
  password        String
  avatar          String?
  bio             String?
  role            Role           @default(DEVELOPER)
  location        String?
  website         String?
  github          String?
  linkedin        String?
  contestRating   Int            @default(1200)
  maxRating       Int            @default(1200)
  xp              Int            @default(0)
  level           Int            @default(1)
  streak          Int            @default(0)
  longestStreak   Int            @default(0)
  reputation      Int            @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  submissions     Submissions[]
  contestParticipations ContestParticipant[]
  articles        Article[]
  comments        Comment[]
  questions       Question[]
  answers         Answer[]
  projects        Project[]
  achievements    UserAchievement[]
  notes           Note[]
}

model Problems {
  id              String         @id
  title           String
  difficulty      Difficulty
  category        String
  tags            String[]
  companies       String[]
  order           Int            @default(0)
  description     String
  hints           String[]
  templates       Json
  testCases       Json
  solveCount      Int            @default(0)
  attemptCount    Int            @default(0)
  isPremium       Boolean        @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  submissions     Submissions[]
}

model Submissions {
  id              String         @id @default(uuid())
  problemId       String
  userId          String?
  code            String
  language        String
  status          String
  runtime         Float?
  memory          Float?
  output          String?
  errorMessage    String?
  testCasesPassed Int            @default(0)
  testCasesTotal  Int            @default(0)
  createdAt       DateTime       @default(now())

  problem         Problems       @relation(fields: [problemId], references: [id])
  user            User?          @relation(fields: [userId], references: [id])
}

model Contest {
  id              String         @id @default(uuid())
  title           String
  description     String
  startTime       DateTime
  endTime         DateTime
  durationMinutes Int            @default(90)
  status          String         @default("Upcoming")
  problemIds      String[]
  createdAt       DateTime       @default(now())

  participants    ContestParticipant[]
}

model ContestParticipant {
  id              String         @id @default(uuid())
  contestId       String
  userId          String
  score           Int            @default(0)
  penalty         Int            @default(0)
  rank            Int?
  ratingChange    Int?
  createdAt       DateTime       @default(now())

  contest         Contest        @relation(fields: [contestId], references: [id])
  user            User           @relation(fields: [userId], references: [id])
}

model Roadmap {
  id              String         @id
  title           String
  description     String
  icon            String
  category        String
  level           String
  estimatedHours  Int
  modules         Json
}

model Article {
  id              String         @id @default(uuid())
  title           String
  slug            String         @unique
  content         String
  authorId        String
  tags            String[]
  upvotes         Int            @default(0)
  createdAt       DateTime       @default(now())

  author          User           @relation(fields: [authorId], references: [id])
  comments        Comment[]
}

model Question {
  id              String         @id @default(uuid())
  title           String
  body            String
  authorId        String
  tags            String[]
  upvotes         Int            @default(0)
  viewCount       Int            @default(0)
  createdAt       DateTime       @default(now())

  author          User           @relation(fields: [authorId], references: [id])
  answers         Answer[]
}

model Answer {
  id              String         @id @default(uuid())
  questionId      String
  body            String
  authorId        String
  isAccepted      Boolean        @default(false)
  upvotes         Int            @default(0)
  createdAt       DateTime       @default(now())

  question        Question       @relation(fields: [questionId], references: [id])
  author          User           @relation(fields: [authorId], references: [id])
}

model Comment {
  id              String         @id @default(uuid())
  articleId       String
  authorId        String
  content         String
  createdAt       DateTime       @default(now())

  article         Article        @relation(fields: [articleId], references: [id])
  author          User           @relation(fields: [authorId], references: [id])
}

model Project {
  id              String         @id @default(uuid())
  title           String
  description     String
  ownerId         String
  files           Json
  isPublic        Boolean        @default(true)
  stars           Int            @default(0)
  createdAt       DateTime       @default(now())

  owner           User           @relation(fields: [ownerId], references: [id])
}

model Note {
  id              String         @id @default(uuid())
  userId          String
  title           String
  content         String
  tags            String[]
  problemId       String?
  createdAt       DateTime       @default(now())

  user            User           @relation(fields: [userId], references: [id])
}

model Achievement {
  id              String         @id
  title           String
  description     String
  icon            String
  xpReward        Int            @default(50)
  category        String

  users           UserAchievement[]
}

model UserAchievement {
  id              String         @id @default(uuid())
  userId          String
  achievementId   String
  unlockedAt      DateTime       @default(now())

  user            User           @relation(fields: [userId], references: [id])
  achievement     Achievement    @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
}
```
