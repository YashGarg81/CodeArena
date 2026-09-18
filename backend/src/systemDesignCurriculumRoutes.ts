// CodeArena — System Design Curriculum API
// Serves the step-by-step learning path and tracks per-user lesson progress.
//
// Lessons use stable slug ids ("<sectionSlug>/<lessonSlug>") so the API is
// deterministic regardless of database seeding. The SDSection / SDLesson tables
// mirror the curriculum for future admin editing; progress lives in
// SDLessonProgress keyed by lesson id.
import { type Request, type Response } from 'express';
import { auth, optionalAuth, type AuthenticatedRequest } from './auth';
import { prisma } from '../db';
import { CURRICULUM } from './systemDesignCurriculum';

// Stable lesson identifier: "<sectionSlug>/<lessonSlug>"
export const lessonIdOf = (sectionSlug: string, lessonSlug: string) => `${sectionSlug}/${lessonSlug}`;

// Progress DB is resilient; if it is unavailable we degrade to in-memory so the
// learning experience never breaks.
const fallbackProgress = new Map<string, { completed: boolean; score: number | null; completedAt: string }>();

const fallbackKey = (userId: string, lessonId: string) => `${userId}::${lessonId}`;

interface SectionPayload {
  slug: string;
  title: string;
  level: string;
  icon: string;
  description: string;
  order: number;
  lessons: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    durationMin: number;
    order: number;
    keyConcepts: string[];
    checklist: string[];
    quiz: { question: string; options: string[]; correct: number; explanation: string }[];
    resources: string[];
    content: string;
    completed?: boolean;
    score?: number | null;
  }>;
}

function toSectionPayload(section: (typeof CURRICULUM)[number], progress: Map<string, { completed: boolean; score: number | null }>): SectionPayload {
  return {
    slug: section.slug,
    title: section.title,
    level: section.level,
    icon: section.icon,
    description: section.description,
    order: section.order,
    lessons: section.lessons.map((lesson, lessonIndex) => {
      const lessonId = lessonIdOf(section.slug, lesson.slug);
      const p = progress.get(lessonId);
      return {
        id: lessonId,
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        durationMin: lesson.durationMin,
        order: lessonIndex + 1,
        keyConcepts: lesson.keyConcepts,
        checklist: lesson.checklist,
        quiz: lesson.quiz,
        resources: lesson.resources,
        content: lesson.content,
        completed: p?.completed ?? false,
        score: p?.score ?? null,
      };
    }),
  };
}

async function loadProgress(userId: string): Promise<Map<string, { completed: boolean; score: number | null }>> {
  const map = new Map<string, { completed: boolean; score: number | null }>();
  if (!userId) return map;
  try {
    const rows = await prisma.sdLessonProgress.findMany({ where: { userId } });
    for (const r of rows) {
      map.set(r.lessonId, { completed: r.completed, score: r.score });
    }
  } catch {
    const prefix = `${userId}::`;
    for (const [key, val] of fallbackProgress.entries()) {
      if (key.startsWith(prefix)) {
        map.set(key.slice(prefix.length), { completed: val.completed, score: val.score });
      }
    }
  }
  return map;
}

// GET /api/v1/system-design/curriculum
// Full step-by-step path with per-user progress (optional auth).
export function getCurriculum(_req: Request, res: Response): void {
  void loadProgress((_req as any).userId || '')
    .then(progress => {
      res.json({
        curriculum: CURRICULUM.map(section => toSectionPayload(section, progress)),
        totalLessons: CURRICULUM.reduce((acc, s) => acc + s.lessons.length, 0),
      });
    })
    .catch(() => res.json({
      curriculum: CURRICULUM.map(section => toSectionPayload(section, new Map())),
      totalLessons: CURRICULUM.reduce((acc, s) => acc + s.lessons.length, 0),
    }));
}

// GET /api/v1/system-design/curriculum/progress
export async function getCurriculumProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.userId || '';
  const progress = await loadProgress(userId);
  res.json({ progress: Object.fromEntries(progress.entries()) });
}

// POST /api/v1/system-design/curriculum/lessons/:id/complete
// Body: { score?: number } — marks lesson complete and stores quiz score.
export async function completeLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.userId || '';
  const lessonId = String(req.params.id || '');
  const score = typeof req.body?.score === 'number' ? Math.max(0, Math.min(100, Math.round(req.body.score))) : null;

  if (!lessonId || !lessonId.includes('/')) {
    res.status(400).json({ error: 'Invalid lesson id' });
    return;
  }

  if (!userId) {
    res.status(401).json({ error: 'Authentication required to track progress' });
    return;
  }

  try {
    await prisma.sdLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed: true, score, completedAt: new Date() },
      update: { completed: true, score, completedAt: new Date() },
    });
    res.json({ ok: true, lessonId, score });
  } catch {
    fallbackProgress.set(fallbackKey(userId, lessonId), {
      completed: true,
      score,
      completedAt: new Date().toISOString(),
    });
    res.json({ ok: true, lessonId, score, fallback: true });
  }
}

// POST /api/v1/system-design/curriculum/reset
export async function resetCurriculumProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.userId || '';
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    await prisma.sdLessonProgress.deleteMany({ where: { userId } });
  } catch {
    const prefix = `${userId}::`;
    for (const key of fallbackProgress.keys()) {
      if (key.startsWith(prefix)) fallbackProgress.delete(key);
    }
  }
  res.json({ ok: true });
}

export const registerCurriculumRoutes = (router: import('express').Router) => {
  router.get('/curriculum', optionalAuth, (req: Request, res: Response) => getCurriculum(req, res));
  router.get('/curriculum/progress', auth, (req: AuthenticatedRequest, res: Response) => {
    void getCurriculumProgress(req, res);
  });
  router.post('/curriculum/lessons/:id/complete', auth, (req: AuthenticatedRequest, res: Response) => {
    void completeLesson(req, res);
  });
  router.post('/curriculum/reset', auth, (req: AuthenticatedRequest, res: Response) => {
    void resetCurriculumProgress(req, res);
  });
};