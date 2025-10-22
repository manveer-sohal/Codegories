export enum JoinRoomFormStatus {
  SUCCESS = "success",
  LOBBY_ID_NOT_FOUND = "lobby_id_not_found",
  JOIN_ERROR = "join_error",
  NICKNAME_REQUIRED = "nickname_required",
  NICKNAME_TOO_SHORT = "nickname_too_short",
  NICKNAME_TOO_LONG = "nickname_too_long",
  LOBBY_ID_REQUIRED = "lobby_id_required",
  LOBBY_ID_TOO_SHORT = "lobby_id_too_short",
  LOBBY_ID_TOO_LONG = "lobby_id_too_long",
}

export enum CreateLobbyFormStatus {
  SUCCESS = "success",
  LOBBY_ID_NOT_FOUND = "lobby_id_not_found",
  ROOM_EXISTS = "room_exists",
  NICKNAME_REQUIRED = "nickname_required",
  NICKNAME_TOO_SHORT = "nickname_too_short",
  NICKNAME_TOO_LONG = "nickname_too_long",
  LOBBY_ID_REQUIRED = "lobby_id_required",
  LOBBY_ID_TOO_SHORT = "lobby_id_too_short",
  LOBBY_ID_TOO_LONG = "lobby_id_too_long",
  CREATE_ERROR = "create_error",
}
