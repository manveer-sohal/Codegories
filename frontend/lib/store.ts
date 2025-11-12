import { create } from "zustand";

export type GamePhase =
  | "None"
  | "lobby"
  | "playing"
  | "round_results"
  | "final_results";

export interface Player {
  id: string;
  name: string;
  playerType: "Host" | "Player";
  wins: number;
  avatar: string;
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

export interface CodegoriesRoundData {
  categories: string[];
  answers: string[];
  letter: string;
  timeRemaining: number; // seconds
  startedAt?: number; // epoch ms
}

export interface GameState {
  avatar: string;
  codegoriesRoundData?: CodegoriesRoundData;
  game: "codegories" | "speedstorm" | "trivia";
  playerType: "None" | "Host" | "Player";
  playerName: string;
  playerId?: string;
  roomId?: string;
  wins: number;
  phase: GamePhase;
  score: number;
  round: number;
  // duration: number;
  currentRound?: RoundData;
  scores: PlayerScore[];
  players: Player[];
  lastSubmittedAnswer?: string;
  playerCount: number;
  playerInput: string[];
  setGame: (game: "codegories" | "speedstorm" | "trivia") => void;
  setPlayerInput: (input: string[]) => void;
  setPlayerName: (playerName: string) => void;
  setRoomId: (roomId: string) => void;
  setPlayers: (players: Player[]) => void;
  setPhase: (phase: GamePhase) => void;
  setRound: (round: number) => void;
  // setDuration: (duration: number) => void;
  setCurrentRound: (round: RoundData | undefined) => void;
  updateTimeRemaining: (seconds: number) => void;
  setScores: (scores: PlayerScore[]) => void;
  incrementScore: (playerId: string, delta: number) => void;
  setLastSubmittedAnswer: (answer?: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  avatar: "avatar1",
  setAvatar: (avatar: string) => set({ avatar }),
  game: "codegories",
  playerType: "None",
  playerName: "",
  phase: "None",
  wins: 0,
  score: 0,
  round: 1,
  // duration: 30,
  scores: [],
  playerCount: 0,
  players: [],
  playerInput: [],
  setGame: (game: "codegories" | "speedstorm" | "trivia") => set({ game }),
  setPlayerType: (playerType: "None" | "Host" | "Player") =>
    set({ playerType }),
  setPlayerInput: (input: string[]) => set({ playerInput: input }),
  getPlayers: () => get().players,
  setPlayers: (players: Player[]) => set({ players }),
  setPlayerCount: (count: number) => set({ playerCount: count }),
  setRoomId: (roomId) => set({ roomId }),
  setPhase: (phase) => set({ phase }),
  setRound: (round) => set({ round }),
  setWins: (wins: number) => set({ wins }),
  // setDuration: (duration) => set({ duration }),
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
