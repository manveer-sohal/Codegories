import { JoinRoomFormStatus } from "@/types/FormStatus";
import { CreateLobbyFormStatus } from "@/types/FormStatus";

export function validateLobbyId(
  lobbyId: string
): JoinRoomFormStatus | CreateLobbyFormStatus | undefined {
  if (!lobbyId.trim()) return JoinRoomFormStatus.LOBBY_ID_REQUIRED;
  if (lobbyId.length < 4) return JoinRoomFormStatus.LOBBY_ID_TOO_SHORT;
  if (lobbyId.length > 4) return JoinRoomFormStatus.LOBBY_ID_TOO_LONG;
  return undefined;
}

export function validateNickname(
  nickname: string
): JoinRoomFormStatus | CreateLobbyFormStatus | undefined {
  if (!nickname.trim()) return JoinRoomFormStatus.NICKNAME_REQUIRED;
  if (nickname.trim().length < 3) return JoinRoomFormStatus.NICKNAME_TOO_SHORT;
  if (nickname.trim().length > 10) return JoinRoomFormStatus.NICKNAME_TOO_LONG;
  return undefined;
}
