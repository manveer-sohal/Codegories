import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinRoom } from "@/lib/socket_util";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import { validateLobbyId, validateNickname } from "@/lib/validation";
import { JoinRoomStatus } from "@/types/JoinRoomStatus";
import { JoinRoomFormStatus } from "@/types/FormStatus";
import { useGameStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

function JoinLobbyForm() {
  const [nickname, setNickname] = useState("");
  const [lobbyId, setLobbyId] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    if (!checkFormValid()) {
      return;
    }
    const name = nickname.trim() || "Guest";
    const avatar = useGameStore.getState().avatar;
    // setPlayerName(name);
    console.log("joining room", lobbyId, name);
    const joinRoomStatusAck = await joinRoom(lobbyId, name, avatar);
    console.log("joinRoomStatusAck", joinRoomStatusAck);
    if (joinRoomStatusAck === JoinRoomStatus.ROOM_NOT_FOUND) {
      console.log("room not found");
      setLobbyIdError(JoinRoomFormStatus.LOBBY_ID_NOT_FOUND);
      setLoading(false);
      return;
    }
    if (joinRoomStatusAck === JoinRoomStatus.JOIN_ERROR) {
      console.log("join error");
      setLobbyIdError(JoinRoomFormStatus.JOIN_ERROR);
      setLoading(false);
      return;
    }

    console.log("joining room", lobbyId);

    router.push(`/game/${lobbyId}`);
    setLoading(false);
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
        placeholder="Lobby id (4 digits)"
        error={lobbyIdError}
      />
      <Button
        onClick={handleJoinLobby}
        variant={"secondary"}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Lobby"}
      </Button>
    </div>
  );
}

export default JoinLobbyForm;
