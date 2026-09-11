// backend/src/ratingEngine.ts
import { prisma } from "../db";

export interface ParticipantRatingInput {
  userId: string;
  rank: number;
  score: number;
  oldRating: number;
}

export interface RatingChangeResult {
  userId: string;
  oldRating: number;
  newRating: number;
  change: number;
  rankTitle: string;
}

export function getRankTitle(rating: number): string {
  if (rating >= 2200) return "Grandmaster";
  if (rating >= 1900) return "Master";
  if (rating >= 1600) return "Expert";
  if (rating >= 1400) return "Specialist";
  if (rating >= 1200) return "Pupil";
  return "Newbie";
}

/**
 * Calculates competitive Elo rating adjustments for contest participants.
 */
export function calculateEloRatings(participants: ParticipantRatingInput[]): RatingChangeResult[] {
  if (participants.length === 0) return [];
  const first = participants[0];
  if (!first) return [];

  if (participants.length === 1) {
    return [{
      userId: first.userId,
      oldRating: first.oldRating,
      newRating: first.oldRating,
      change: 0,
      rankTitle: getRankTitle(first.oldRating)
    }];
  }

  const results: RatingChangeResult[] = [];

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    if (!p) continue;
    let expectedRank = 0.5;

    for (let j = 0; j < participants.length; j++) {
      if (i === j) continue;
      const other = participants[j];
      if (other) {
        expectedRank += 1 / (1 + Math.pow(10, (p.oldRating - other.oldRating) / 400));
      }
    }

    const actualRank = p.rank;
    const rankDiff = expectedRank - actualRank;
    const K = 32; // Volatility factor
    const change = Math.round(K * (rankDiff / (participants.length / 2)));
    const newRating = Math.max(100, p.oldRating + change);

    results.push({
      userId: p.userId,
      oldRating: p.oldRating,
      newRating,
      change,
      rankTitle: getRankTitle(newRating)
    });
  }

  return results;
}

/**
 * Applies contest Elo rating updates to database records.
 */
export async function applyContestRatings(contestId: string): Promise<RatingChangeResult[]> {
  const participants = await prisma.contestParticipant.findMany({
    where: { contestId },
    include: { user: { select: { id: true, contestRating: true } } },
    orderBy: [{ score: "desc" }, { penalty: "asc" }]
  });

  if (participants.length === 0) return [];

  const ratingInputs: ParticipantRatingInput[] = participants.map((p: any, idx: number) => ({
    userId: p.userId,
    rank: idx + 1,
    score: p.score,
    oldRating: p.user?.contestRating || 1200
  }));

  const changes = calculateEloRatings(ratingInputs);

  for (const c of changes) {
    await prisma.user.update({
      where: { id: c.userId },
      data: { contestRating: c.newRating }
    });

    await prisma.ratingHistory.create({
      data: {
        userId: c.userId,
        contestId,
        rating: c.newRating,
        change: c.change
      }
    });
  }

  return changes;
}
