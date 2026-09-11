export type ArenaGameMode = "classic" | "speed" | "score" | "best_of_3" | "survival";
export type ArenaDifficulty = "All" | "Easy" | "Medium" | "Hard";

export interface ArenaPlayer {
  id: string;
  username: string;
  elo: number;
  progress: number;
  testsPassed: number;
  status: "coding" | "submitted" | "forfeit" | "disconnected";
  score: number;
  wins: number;
  lastActive: number;
}

export interface ArenaMatch {
  matchId: string;
  roomCode?: string;
  isPrivate: boolean;
  gameMode: ArenaGameMode;
  difficulty: ArenaDifficulty;
  language?: string;
  player1: ArenaPlayer;
  player2: ArenaPlayer;
  spectators: Array<{ id: string; username: string }>;
  problems: Array<{ id: string; title: string; difficulty: string; description: string; totalTests: number }>;
  currentRound: number;
  totalRounds: number;
  startTime: number;
  durationSeconds: number;
  status: "waiting" | "active" | "completed" | "rematch_requested";
  winnerId?: string | null;
  rematchVotes?: string[];
}

export class BattleArenaService {
  private activeMatches = new Map<string, ArenaMatch>();
  private matchQueue: Array<{
    userId: string;
    username: string;
    elo: number;
    gameMode: ArenaGameMode;
    difficulty: ArenaDifficulty;
    language?: string;
  }> = [];
  private battleHistory: Array<{
    matchId: string;
    gameMode: string;
    player1: string;
    player2: string;
    winner: string;
    deltaElo: number;
    completedAt: number;
  }> = [
    { matchId: "hist_1", gameMode: "classic", player1: "alex_coder", player2: "sarah_dev", winner: "alex_coder", deltaElo: 28, completedAt: Date.now() - 3600000 * 2 },
    { matchId: "hist_2", gameMode: "best_of_3", player1: "david_algo", player2: "alex_coder", winner: "alex_coder", deltaElo: 32, completedAt: Date.now() - 3600000 * 5 },
    { matchId: "hist_3", gameMode: "speed", player1: "sarah_dev", player2: "neo_matrix", winner: "neo_matrix", deltaElo: 24, completedAt: Date.now() - 3600000 * 12 },
  ];

  public enqueuePlayer(player: {
    userId: string;
    username: string;
    elo: number;
    gameMode?: ArenaGameMode;
    difficulty?: ArenaDifficulty;
    language?: string;
    autoMatchBot?: boolean;
  }): { match?: ArenaMatch; queued: boolean } {
    const mode = player.gameMode || "classic";
    const diff = player.difficulty || "All";

    const existingIdx = this.matchQueue.findIndex(p => p.userId === player.userId);
    if (existingIdx !== -1) {
      this.matchQueue[existingIdx] = { ...player, gameMode: mode, difficulty: diff };
      return { queued: true };
    }

    // Match with suitable opponent by game mode & elo bracket (within 350 pts)
    const opponentIdx = this.matchQueue.findIndex(
      p => p.gameMode === mode && (diff === "All" || p.difficulty === "All" || p.difficulty === diff) && Math.abs(p.elo - player.elo) <= 350
    );

    if (opponentIdx !== -1) {
      const opponent = this.matchQueue.splice(opponentIdx, 1)[0];
      if (opponent) {
        const match = this.createMatch(player, opponent, mode, diff, false);
        return { match, queued: false };
      }
    }

    // If autoMatchBot is requested and queue is empty, simulate instant challenger
    if (player.autoMatchBot) {
      const challengers = [
        { userId: "bot_algo_master", username: "master_coder_99", elo: player.elo + Math.floor(Math.random() * 60 - 30) },
        { userId: "bot_byte_ninja", username: "byte_ninja_x", elo: player.elo + Math.floor(Math.random() * 80 - 40) },
        { userId: "bot_algo_queen", username: "algo_queen_pro", elo: player.elo + Math.floor(Math.random() * 50 - 25) },
        { userId: "bot_syntax_pro", username: "syntax_samurai", elo: player.elo + Math.floor(Math.random() * 70 - 35) }
      ];
      const challenger: { userId: string; username: string; elo: number } = challengers[Math.floor(Math.random() * challengers.length)] ?? {
        userId: "bot_algo_master",
        username: "master_coder_99",
        elo: player.elo
      };
      const match = this.createMatch(player, challenger, mode, diff, false);
      return { match, queued: false };
    }

    this.matchQueue.push({ ...player, gameMode: mode, difficulty: diff });
    return { queued: true };
  }

  public computeMatchDuration(mode: ArenaGameMode, diff: ArenaDifficulty): number {
    // Base times by difficulty level (Easy: 10m, Medium: 15m, Hard: 20m, All: 15m)
    let baseSeconds = 900; // 15 mins
    if (diff === "Easy") baseSeconds = 600; // 10 mins
    else if (diff === "Medium") baseSeconds = 900; // 15 mins
    else if (diff === "Hard") baseSeconds = 1200; // 20 mins

    // Mode multipliers
    if (mode === "speed") return Math.round(baseSeconds * 0.4); // Fast sprint: 4 to 8 mins
    if (mode === "survival") return Math.round(baseSeconds * 0.7); // 7 to 14 mins
    if (mode === "best_of_3") return Math.round(baseSeconds * 1.5); // 15 to 30 mins for 3 rounds
    return baseSeconds; // classic / score
  }

  public createPrivateRoom(player: { userId: string; username: string; elo: number; gameMode?: ArenaGameMode; difficulty?: ArenaDifficulty; language?: string }): ArenaMatch {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const mode = player.gameMode || "classic";
    const diff = player.difficulty || "Medium";
    const durationSeconds = this.computeMatchDuration(mode, diff);

    const match: ArenaMatch = {
      matchId: `room_${roomCode}`,
      roomCode,
      isPrivate: true,
      gameMode: mode,
      difficulty: diff,
      language: player.language || "all",
      player1: { id: player.userId, username: player.username, elo: player.elo, progress: 0, testsPassed: 0, status: "coding", score: 0, wins: 0, lastActive: Date.now() },
      player2: { id: "", username: "Waiting for player...", elo: 1200, progress: 0, testsPassed: 0, status: "coding", score: 0, wins: 0, lastActive: Date.now() },
      spectators: [],
      problems: this.getProblemsForMode(mode, diff),
      currentRound: 1,
      totalRounds: mode === "best_of_3" ? 3 : 1,
      startTime: 0, // Starts when both players join
      durationSeconds,
      status: "waiting",
      winnerId: null,
      rematchVotes: []
    };

    this.activeMatches.set(match.matchId, match);
    return match;
  }

  public joinPrivateRoom(roomCode: string, player: { userId: string; username: string; elo: number }): ArenaMatch | null {
    const match = Array.from(this.activeMatches.values()).find(m => m.roomCode === roomCode.toUpperCase());
    if (!match) return null;
    if (match.player1.id === player.userId) return match;

    if (!match.player2.id || match.player2.id === "") {
      match.player2 = {
        id: player.userId,
        username: player.username,
        elo: player.elo,
        progress: 0,
        testsPassed: 0,
        status: "coding",
        score: 0,
        wins: 0,
        lastActive: Date.now()
      };
      match.status = "active";
      match.startTime = Date.now(); // Synchronized battle countdown begins
      return match;
    }

    // Join as spectator if room is already full
    if (!match.spectators.some(s => s.id === player.userId)) {
      match.spectators.push({ id: player.userId, username: player.username });
    }
    return match;
  }

  private createMatch(
    p1: { userId: string; username: string; elo: number },
    p2: { userId: string; username: string; elo: number },
    gameMode: ArenaGameMode,
    difficulty: ArenaDifficulty,
    isPrivate: boolean
  ): ArenaMatch {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const match: ArenaMatch = {
      matchId,
      isPrivate,
      gameMode,
      difficulty,
      player1: { id: p1.userId, username: p1.username, elo: p1.elo, progress: 0, testsPassed: 0, status: "coding", score: 0, wins: 0, lastActive: Date.now() },
      player2: { id: p2.userId, username: p2.username, elo: p2.elo, progress: 0, testsPassed: 0, status: "coding", score: 0, wins: 0, lastActive: Date.now() },
      spectators: [],
      problems: this.getProblemsForMode(gameMode, difficulty),
      currentRound: 1,
      totalRounds: gameMode === "best_of_3" ? 3 : 1,
      startTime: Date.now(),
      durationSeconds: this.computeMatchDuration(gameMode, difficulty),
      status: "active",
      winnerId: null,
      rematchVotes: []
    };

    this.activeMatches.set(matchId, match);
    return match;
  }

  private getProblemsForMode(mode: ArenaGameMode, _diff: ArenaDifficulty) {
    if (mode === "best_of_3") {
      return [
        { id: "two-sum", title: "Two Sum", difficulty: "Easy", description: "Find two indices that sum to target.", totalTests: 5 },
        { id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", description: "Reverse a singly linked list.", totalTests: 5 },
        { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Medium", description: "Determine if input string of brackets is valid.", totalTests: 5 }
      ];
    }
    if (mode === "survival") {
      return [
        { id: "two-sum", title: "Wave 1: Two Sum", difficulty: "Easy", description: "Solve fast to survive to the next wave!", totalTests: 5 },
        { id: "valid-parentheses", title: "Wave 2: Valid Parentheses", difficulty: "Medium", description: "Bracket validation with memory constraints.", totalTests: 5 },
        { id: "trapping-rain-water", title: "Boss Wave: Trapping Rain Water", difficulty: "Hard", description: "Compute trapped water volume.", totalTests: 5 }
      ];
    }
    return [
      { id: "two-sum", title: "Two Sum", difficulty: "Easy", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", totalTests: 5 }
    ];
  }

  public getMatch(matchId: string): ArenaMatch | undefined {
    return this.activeMatches.get(matchId);
  }

  public updatePlayerProgress(matchId: string, userId: string, testsPassed: number, totalTests: number): ArenaMatch | null {
    const match = this.activeMatches.get(matchId);
    if (!match || match.status !== "active") return null;

    const progress = Math.min(Math.round((testsPassed / totalTests) * 100), 100);
    const player = match.player1.id === userId ? match.player1 : match.player2.id === userId ? match.player2 : null;
    if (!player) return match;

    player.testsPassed = testsPassed;
    player.progress = progress;
    player.lastActive = Date.now();

    if (progress === 100) {
      player.status = "submitted";
      player.wins += 1;
      player.score += 100;

      if (match.gameMode === "best_of_3") {
        if (player.wins >= 2 || match.currentRound >= 3) {
          match.status = "completed";
          match.winnerId = player.wins >= 2 ? userId : (match.player1.wins > match.player2.wins ? match.player1.id : match.player2.id);
          this.recordHistory(match);
        } else {
          match.currentRound += 1;
          match.player1.progress = 0;
          match.player1.testsPassed = 0;
          match.player2.progress = 0;
          match.player2.testsPassed = 0;
        }
      } else {
        match.status = "completed";
        match.winnerId = userId;
        this.recordHistory(match);
      }
    }

    return match;
  }

  public requestRematch(matchId: string, userId: string): ArenaMatch | null {
    const match = this.activeMatches.get(matchId);
    if (!match) return null;
    if (!match.rematchVotes) match.rematchVotes = [];
    if (!match.rematchVotes.includes(userId)) match.rematchVotes.push(userId);

    if (match.rematchVotes.length >= 2) {
      match.status = "active";
      match.winnerId = null;
      match.currentRound = 1;
      match.rematchVotes = [];
      match.player1.progress = 0;
      match.player1.testsPassed = 0;
      match.player1.wins = 0;
      match.player1.status = "coding";
      match.player2.progress = 0;
      match.player2.testsPassed = 0;
      match.player2.wins = 0;
      match.player2.status = "coding";
      match.startTime = Date.now();
    } else {
      match.status = "rematch_requested";
    }

    return match;
  }

  public getBattleHistory() {
    return this.battleHistory;
  }

  private recordHistory(match: ArenaMatch) {
    const winnerUsername = match.winnerId === match.player1.id ? match.player1.username : match.player2.username;
    this.battleHistory.unshift({
      matchId: match.matchId,
      gameMode: match.gameMode,
      player1: match.player1.username,
      player2: match.player2.username,
      winner: winnerUsername,
      deltaElo: 26,
      completedAt: Date.now()
    });
    if (this.battleHistory.length > 50) this.battleHistory.pop();
  }

  public calculateEloDelta(playerElo: number, opponentElo: number, won: boolean, kFactor = 32): { newElo: number; delta: number } {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const actualScore = won ? 1 : 0;
    const delta = Math.round(kFactor * (actualScore - expectedScore));
    return {
      newElo: Math.max(100, playerElo + delta),
      delta
    };
  }
}

export const battleArenaService = new BattleArenaService();

