import { create } from "zustand";

export type GamePhase = "lobby" | "playing" | "round_results" | "final_results";

export interface Player {
  id: string;
  name: string;
}

export interface PlayerScore {
  playerId: string;
  name: string;
  score: number;
}

export interface RoundData {
  roundNumber: number;
  category: string;
  letter: string;
  timeRemaining: number; // seconds
  startedAt?: number; // epoch ms
}

export interface GameState {
  playerName: string;
  playerId?: string;
  roomId?: string;
  phase: GamePhase;
  score: number;
  round: number;
  currentRound?: RoundData;
  scores: PlayerScore[];
  players: Player[];
  lastSubmittedAnswer?: string;
  playerCount: number;
  playerInput: string[];
  setPlayerInput: (input: string[]) => void;
  setPlayerName: (playerName: string) => void;
  setRoomId: (roomId: string) => void;
  setPlayers: (players: Player[]) => void;
  setPhase: (phase: GamePhase) => void;
  setRound: (round: number) => void;
  setCurrentRound: (round: RoundData | undefined) => void;
  updateTimeRemaining: (seconds: number) => void;
  setScores: (scores: PlayerScore[]) => void;
  incrementScore: (playerId: string, delta: number) => void;
  setLastSubmittedAnswer: (answer?: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerName: "",
  phase: "lobby",
  score: 0,
  round: 1,
  scores: [],
  playerCount: 0,
  players: [],
  playerInput: [],

  setPlayerInput: (input: string[]) => set({ playerInput: input }),
  getPlayers: () => get().players,
  setPlayers: (players: Player[]) => set({ players }),
  setPlayerCount: (count: number) => set({ playerCount: count }),
  setRoomId: (roomId) => set({ roomId }),
  setPhase: (phase) => set({ phase }),
  setRound: (round) => set({ round }),
  setCurrentRound: (currentRound) => set({ currentRound }),
  updateTimeRemaining: (seconds) =>
    set((state) =>
      state.currentRound
        ? { currentRound: { ...state.currentRound, timeRemaining: seconds } }
        : {}
    ),
  setScores: (scores) => set({ scores }),
  getPlayerName: () => get().playerName,
  setPlayerName: (name: string) => set({ playerName: name }),
  incrementScore: (playerId, delta) =>
    set((state) => ({
      scores: state.scores.map((s) =>
        s.playerId === playerId ? { ...s, score: s.score + delta } : s
      ),
    })),
  setLastSubmittedAnswer: (answer) => set({ lastSubmittedAnswer: answer }),
  reset: () =>
    set({
      playerId: undefined,
      roomId: undefined,
      phase: "lobby",
      score: 0,
      round: 1,
      currentRound: undefined,
      scores: [],
      lastSubmittedAnswer: undefined,
    }),
}));
