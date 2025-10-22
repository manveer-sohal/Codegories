import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinRoom } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import Input from "./ui/Input";
import { validateLobbyId, validateNickname } from "@/lib/validation";
import { JoinRoomStatus } from "@/types/JoinRoomStatus";
import { JoinRoomFormStatus } from "@/types/FormStatus";

function JoinLobbyForm() {
  const [nickname, setNickname] = useState("");
  const [lobbyId, setLobbyId] = useState("");
  const [nicknameError, setNicknameError] = useState<
    JoinRoomFormStatus | undefined
  >(undefined);
  const [lobbyIdError, setLobbyIdError] = useState<
    JoinRoomFormStatus | undefined
  >(undefined);

  const router = useRouter();

  const checkFormValid = () => {
    const lobbyIdError = validateLobbyId(lobbyId);
    if (lobbyIdError) setLobbyIdError(lobbyIdError as JoinRoomFormStatus);

    const nicknameError = validateNickname(nickname);
    if (nicknameError) setNicknameError(nicknameError as JoinRoomFormStatus);

    return nicknameError === undefined && lobbyIdError === undefined;
  };

  const handleJoinLobby = async () => {
    if (!checkFormValid()) {
      return;
    }
    const name = nickname.trim() || "Guest";

    // setPlayerName(name);

    const joinRoomStatus = await joinRoom(lobbyId, name);

    if (joinRoomStatus === JoinRoomStatus.ROOM_NOT_FOUND) {
      setLobbyIdError(JoinRoomFormStatus.LOBBY_ID_NOT_FOUND);
      return;
    }
    if (joinRoomStatus === JoinRoomStatus.JOIN_ERROR) {
      setLobbyIdError(JoinRoomFormStatus.JOIN_ERROR);
      return;
    }

    router.push(`/pregame/${lobbyId}`);
  };

  return (
    <div className="bg-blue-500 p-4 gap-2 flex flex-col">
      <p className="text-white/70 mt-2">Enter a nickname to join a lobby.</p>
      <Input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Your nickname"
        error={nicknameError}
      />
      <p className="text-white/70 mt-2">Enter lobby id to join a lobby.</p>
      <Input
        value={lobbyId}
        onChange={(e) => setLobbyId(e.target.value)}
        placeholder="Lobby id"
        error={lobbyIdError}
      />
      <Button onClick={handleJoinLobby} variant={"secondary"}>
        Join Lobby
      </Button>
    </div>
  );
}

export default JoinLobbyForm;
