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
  // socketId -> Player
  players: Map<string, Player>;
  lastSubmittedAnswer?: string;
  playerCount: number;
  playerInput: string[];
  setGame: (game: "codegories" | "speedstorm" | "trivia") => void;
  setPlayerInput: (input: string[]) => void;
  setPlayerName: (playerName: string) => void;
  setRoomId: (roomId: string | undefined) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setPhase: (phase: GamePhase) => void;
  setRound: (round: number) => void;
  setPlayersList: (players: Map<string, Player>) => void;
  // setDuration: (duration: number) => void;
  setCurrentRound: (round: RoundData | undefined) => void;
  updateTimeRemaining: (seconds: number) => void;
  updateScore: (playerId: string, score: number) => void;
  updateUserScore: (score: number) => void;
  setLastSubmittedAnswer: (answer?: string) => void;
  updateWinner: (playerId: string) => void;
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
  roomId: undefined,
  score: 0,
  round: 1,
  // duration: 30,
  playerCount: 0,
  players: new Map<string, Player>(),

  playerInput: [],

  updateWinner: (playerId: string) =>
    set((state) => {
      const player = state.players.get(playerId);

      if (!player) return { players: state.players };

      const updatedPlayer = { ...player, wins: player.wins + 1 };

      state.players.set(playerId, updatedPlayer);

      return { players: state.players };
    }),

  setGame: (game: "codegories" | "speedstorm" | "trivia") => set({ game }),

  setPlayerType: (playerType: "None" | "Host" | "Player") =>
    set({ playerType }),

  setPlayerInput: (input: string[]) => set({ playerInput: input }),

  setPlayersList: (players: Map<string, Player>) => set({ players: players }),

  // add a player to the players map
  addPlayer: (player: Player) =>
    set((state) => ({ players: state.players.set(player.id, player) })),

  // remove a player from the players map and return the updated players map for the new state
  removePlayer: (playerId: string) =>
    set((state) => {
      state.players.delete(playerId);
      return { players: state.players };
    }),

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

  //update score of user
  updateUserScore: (score: number) =>
    set((state) => {
      return { score: state.score + score };
    }),

  //update the score of a player
  updateScore: (playerId: string, newScore: number) =>
    set((state) => {
      const player = state.players.get(playerId);

      if (!player) return { players: state.players };

      const updatedPlayer = { ...player, score: newScore };

      state.players.set(playerId, updatedPlayer);

      return { players: state.players };
    }),

  getPlayerName: () => get().playerName,
  setPlayerName: (name: string) => set({ playerName: name }),

  setLastSubmittedAnswer: (answer) => set({ lastSubmittedAnswer: answer }),

  reset: () =>
    set({
      playerId: undefined,
      roomId: undefined,
      phase: "None",
      playerType: "None",
      playerName: "",
      players: new Map<string, Player>(),
      playerCount: 0,
      playerInput: [],
      score: 0,
      round: 1,
      currentRound: undefined,
      lastSubmittedAnswer: undefined,
      game: "codegories",
    }),
}));
