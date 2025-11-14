import { useGameStore } from "./store";
import { JoinRoomStatus } from "@/types/JoinRoomStatus";
import { CreateLobbyFormStatus } from "@/types/FormStatus";
import { getSocket } from "./socket";

function connectSocket() {
  const s = getSocket();
  s.connect();
  return s;
}

export async function setGame(
  roomId: string,
  game: "codegories" | "speedstorm" | "trivia"
) {
  const s = connectSocket();

  console.log("set_game", roomId, game);

  s.emit("set_game", { roomId, game });
}

export async function resetGame(roomId: string) {
  const s = connectSocket();

  console.log("resetting game", roomId);

  try {
    const response = await s.emitWithAck("reset_game", { roomId });
    useGameStore.setState({ playerInput: [] });
    return response.success;
  } catch (error) {
    console.error("resetGame error", error);
    return false;
  }
}

export async function startGame(
  roomId: string,
  game: "codegories" | "speedstorm" | "trivia"
) {
  const s = connectSocket();

  console.log("starting game", roomId, game);
  s.emit("start_game", { roomId });
}

export async function joinRoom(
  roomId: string,
  name: string,
  avatar: string
): Promise<JoinRoomStatus> {
  const s = connectSocket();

  console.log("Trying to join room", roomId, name, avatar);
  try {
    const response = await s.emitWithAck("join_room", { roomId, name, avatar });
    console.log("joinRoom response", response);
    if (!response.success) {
      if (response.error === "room_not_found") {
        return JoinRoomStatus.ROOM_NOT_FOUND; // room not found
      }
      if (response.error === "join_room_error") {
        return JoinRoomStatus.JOIN_ERROR; // join room error
      }
      return JoinRoomStatus.JOIN_ERROR; // unknown error
    }
    // set the game store state
    useGameStore.setState({ roomId: roomId });
    useGameStore.setState({ playerType: "Player" });
    useGameStore.setState({ playerName: name });
    console.log("playerId", s.id);
    useGameStore.setState({ playerId: s.id });
    // useGameStore.setState({ avatar: avatar });

    return JoinRoomStatus.SUCCESS; // success
  } catch (error) {
    console.error("joinRoom error", error);
    return JoinRoomStatus.JOIN_ERROR; // unknown error
  }
}

export async function deleteLobby(roomId: string) {
  console.log("deleteLobby", roomId);
  const s = connectSocket();

  try {
    const response = await s.emitWithAck("delete_lobby", {
      roomId,
    });
    return response.success;
  } catch (error) {
    console.error("deleteLobby error", error);
    return false;
  }
}

export async function leaveRoom(roomId: string) {
  console.log("leaveRoom", roomId);
  const s = connectSocket();

  const response = await s.emitWithAck("leave_room", {
    roomId,
    playerType: useGameStore.getState().playerType,
  });
  useGameStore.getState().setRoomId(undefined);
  useGameStore.getState().reset();

  console.log("leaveRoom response", response);
}

export function updateScore(score: number, playerId: string) {
  const { roomId } = useGameStore.getState();
  if (!roomId) return;

  //update the score of the user immediately
  console.log("updateScore for player", playerId, score);

  //emit the score to the server
  getSocket().emit("submit_answer", { roomId, score });
}

// export function readyNextRound() {
//   const { roomId } = useGameStore.getState();
//   if (!roomId) return;
//   getSocket().emit("ready_next_round", { roomId });
// }

export function roundEnd() {
  console.log("end round");
  const { roomId } = useGameStore.getState();
  if (!roomId) return;
  getSocket().emit("round_end", { roomId });
}

// Create lobby helper: emits create_lobby and returns roomId via ack or event
export async function createLobby(
  name: string,
  avatar: string,
  roomIdOverride?: string
) {
  const s = connectSocket();

  console.log("createLobby", name, avatar, roomIdOverride);

  try {
    console.log("creating lobby", name, roomIdOverride);
    const response = await s.emitWithAck("create_lobby", {
      roomId: roomIdOverride,
      name,
      avatar,
    });
    if (response.success) {
      useGameStore.setState({ roomId: response.roomId ?? "" });
      useGameStore.setState({ phase: "lobby" });
      useGameStore.setState({ playerType: "Host" });
      useGameStore.setState({ playerId: s.id });
      return {
        roomId: response.roomId ?? "",
        error: CreateLobbyFormStatus.SUCCESS,
      };
    }

    if (response.error === "room_exists") {
      return { roomId: "", error: CreateLobbyFormStatus.ROOM_EXISTS };
    }
    if (response.error === "create_error") {
      return { roomId: "", error: CreateLobbyFormStatus.CREATE_ERROR };
    }
    return { roomId: "", error: CreateLobbyFormStatus.CREATE_ERROR };
  } catch (e) {
    console.error("createLobby error", e);
    return { roomId: "", error: CreateLobbyFormStatus.CREATE_ERROR };
  }
}

export async function checkRoomValid(roomId: string) {
  const s = connectSocket();

  const response = await s.emitWithAck("check_room_valid", {
    roomId,
  });
  return response.valid;
}
