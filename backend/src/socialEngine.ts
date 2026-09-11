// backend/src/socialEngine.ts
import { EventEmitter } from "events";

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  type: "SOLVED_PROBLEM" | "WON_BATTLE" | "CONTEST_RANK" | "ACHIEVEMENT_UNLOCKED" | "POSTED_SOLUTION";
  problemTitle?: string;
  problemDifficulty?: "Easy" | "Medium" | "Hard";
  language?: string;
  timeTakenMinutes?: number;
  xpEarned?: number;
  timestamp: string;
  likes: number;
}

export interface ProblemDiscussionPost {
  id: string;
  problemId: string;
  userId: string;
  username: string;
  avatar?: string;
  category: "Approach" | "Bug" | "Question" | "Optimization";
  title: string;
  content: string;
  codeSnippet?: string;
  language?: string;
  upvotes: number;
  commentCount: number;
  createdAt: string;
}

export interface TournamentBracketNode {
  matchId: string;
  round: number; // 1 = Round of 128, 2 = Round of 64, 3 = Round of 32, 4 = QF, 5 = SF, 6 = Final
  roundName: string;
  player1: { userId: string; username: string; score?: number; elo: number };
  player2?: { userId: string; username: string; score?: number; elo: number };
  winnerId?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
}

export interface TeamProgrammingRoom {
  id: string;
  name: string;
  teamTag: string;
  members: Array<{ userId: string; username: string; role: "LEADER" | "MEMBER"; isOnline: boolean }>;
  teamRating: number;
  sharedCode: string;
  activeLanguage: string;
  chatMessages: Array<{ id: string; userId: string; username: string; text: string; timestamp: string }>;
  createdAt: string;
}

export class SocialAndTournamentEngine extends EventEmitter {
  private activityFeed: ActivityFeedItem[] = [
    {
      id: "act_1",
      userId: "user_yash",
      username: "Yash",
      type: "SOLVED_PROBLEM",
      problemTitle: "Network Flow Minimum Cut",
      problemDifficulty: "Hard",
      language: "C++",
      timeTakenMinutes: 18,
      xpEarned: 25,
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      likes: 14
    },
    {
      id: "act_2",
      userId: "user_rahul",
      username: "Rahul",
      type: "WON_BATTLE",
      problemTitle: "LRU Cache Design",
      problemDifficulty: "Medium",
      language: "Python",
      timeTakenMinutes: 7,
      xpEarned: 35,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      likes: 8
    }
  ];

  private discussions: ProblemDiscussionPost[] = [
    {
      id: "disc_1",
      problemId: "two-sum",
      userId: "user_aman",
      username: "Aman",
      category: "Approach",
      title: "Clean O(N) Hash Table One-Pass Solution with Invariant Proof",
      content: "Instead of iterating twice, we can check for complement in a hash map as we iterate. This guarantees O(1) average lookup.",
      codeSnippet: "const map = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const diff = target - nums[i];\n  if (map.has(diff)) return [map.get(diff), i];\n  map.set(nums[i], i);\n}",
      language: "javascript",
      upvotes: 42,
      commentCount: 7,
      createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
    }
  ];

  private followersMap = new Map<string, Set<string>>(); // userId -> Set of follower userIds
  private followingMap = new Map<string, Set<string>>(); // userId -> Set of following userIds

  private teams: TeamProgrammingRoom[] = [
    {
      id: "team_alpha",
      name: "Team Alpha",
      teamTag: "ALPHA",
      members: [
        { userId: "user_yash", username: "Yash", role: "LEADER", isOnline: true },
        { userId: "user_rahul", username: "Rahul", role: "MEMBER", isOnline: true },
        { userId: "user_aman", username: "Aman", role: "MEMBER", isOnline: false }
      ],
      teamRating: 1940,
      sharedCode: "// Team Alpha Shared Collaborative Workspace\nfunction solveTeamChallenge() {\n    console.log('Team Alpha ready!');\n}",
      activeLanguage: "cpp",
      chatMessages: [
        { id: "msg_1", userId: "user_yash", username: "Yash", text: "I'll take Problem A & B, Rahul take Problem C!", timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  public getActivityFeed(): ActivityFeedItem[] {
    return this.activityFeed;
  }

  public recordActivity(activity: Omit<ActivityFeedItem, "id" | "timestamp" | "likes">): ActivityFeedItem {
    const item: ActivityFeedItem = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      likes: 0
    };
    this.activityFeed.unshift(item);
    if (this.activityFeed.length > 100) this.activityFeed.pop();
    this.emit("activity_published", item);
    return item;
  }

  public toggleFollow(followerId: string, targetUserId: string): { following: boolean; followerCount: number } {
    if (!this.followersMap.has(targetUserId)) {
      this.followersMap.set(targetUserId, new Set());
    }
    if (!this.followingMap.has(followerId)) {
      this.followingMap.set(followerId, new Set());
    }

    const followers = this.followersMap.get(targetUserId)!;
    const following = this.followingMap.get(followerId)!;

    let isNowFollowing = false;
    if (followers.has(followerId)) {
      followers.delete(followerId);
      following.delete(targetUserId);
    } else {
      followers.add(followerId);
      following.add(targetUserId);
      isNowFollowing = true;
    }

    return { following: isNowFollowing, followerCount: followers.size };
  }

  public getDiscussions(problemId?: string): ProblemDiscussionPost[] {
    if (problemId) {
      return this.discussions.filter(d => d.problemId === problemId);
    }
    return this.discussions;
  }

  public createDiscussion(post: Omit<ProblemDiscussionPost, "id" | "upvotes" | "commentCount" | "createdAt">): ProblemDiscussionPost {
    const item: ProblemDiscussionPost = {
      ...post,
      id: `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      upvotes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString()
    };
    this.discussions.unshift(item);
    return item;
  }

  public generateTournamentBracket(playerCount = 16): TournamentBracketNode[] {
    const rounds = [
      { round: 1, name: "Round of 16", count: 8 },
      { round: 2, name: "Quarter Finals", count: 4 },
      { round: 3, name: "Semi Finals", count: 2 },
      { round: 4, name: "Grand Final 🏆", count: 1 }
    ];

    const nodes: TournamentBracketNode[] = [];
    let matchCounter = 1;

    for (const r of rounds) {
      for (let i = 0; i < r.count; i++) {
        nodes.push({
          matchId: `tourney_m_${matchCounter++}`,
          round: r.round,
          roundName: r.name,
          player1: { userId: `p_${i * 2 + 1}`, username: `GrandMaster_${i * 2 + 1}`, elo: 1800 + i * 20 },
          player2: { userId: `p_${i * 2 + 2}`, username: `CandidateMaster_${i * 2 + 2}`, elo: 1750 + i * 20 },
          status: r.round === 1 ? "IN_PROGRESS" : "SCHEDULED"
        });
      }
    }

    return nodes;
  }

  public getTeams(): TeamProgrammingRoom[] {
    return this.teams;
  }
}

export const socialAndTournamentEngine = new SocialAndTournamentEngine();
