import { useState } from "react";
import { Button } from "./ui/button";
import { createLobby } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import Input from "./ui/Input";
import { validateLobbyId, validateNickname } from "@/lib/validation";
import { CreateLobbyFormStatus } from "@/types/FormStatus";

function CreateLobbyForm() {
  const [createdLobbyId, setCreatedLobbyId] = useState("");
  const [nickname, setNickname] = useState("");
  // Ensure socket singleton is initialised lazily when actions run
  const router = useRouter();
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const [nicknameError, setNicknameError] = useState<
    CreateLobbyFormStatus | undefined
  >(undefined);
  const [lobbyIdError, setLobbyIdError] = useState<
    CreateLobbyFormStatus | undefined
  >(undefined);

  const [formStatus, setFormStatus] = useState<
    CreateLobbyFormStatus | undefined
  >(undefined);

  async function handleCreateLobby() {
    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setNicknameError(nicknameError as CreateLobbyFormStatus);
      return;
    }

    const lobbyIdError = validateLobbyId(createdLobbyId);
    if (lobbyIdError) {
      setLobbyIdError(lobbyIdError as CreateLobbyFormStatus);
      return;
    }

    const name = nickname.trim() || "Host";
    setPlayerName(name);
    const desiredId = createdLobbyId.trim() || undefined;
    try {
      const response = await createLobby(name, desiredId);
      if (response.error === CreateLobbyFormStatus.ROOM_EXISTS) {
        setLobbyIdError(CreateLobbyFormStatus.ROOM_EXISTS);
        return;
      }
      if (response.error === CreateLobbyFormStatus.CREATE_ERROR) {
        console.error("createLobby error", response.error);
        setFormStatus(CreateLobbyFormStatus.CREATE_ERROR);
        return;
      }
      if (response.error === CreateLobbyFormStatus.SUCCESS) {
        router.push(`/game/${response.roomId}`);
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="bg-green-500 p-4 gap-2 flex flex-col">
      <p className="text-white/70 mt-2">Create a new lobby.</p>
      <Input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Your nickname"
        error={nicknameError}
      />
      <p className="text-white/70 mt-2">Enter lobby id to create a lobby.</p>
      <Input
        value={createdLobbyId}
        onChange={(e) => setCreatedLobbyId(e.target.value)}
        placeholder="Lobby id"
        error={lobbyIdError}
      />
      <Button onClick={handleCreateLobby} variant={"secondary"}>
        Create Lobby
      </Button>
      {formStatus === CreateLobbyFormStatus.CREATE_ERROR && (
        <p className="text-red-500 mt-2">
          Something went wrong. Failed to create lobby
        </p>
      )}
    </div>
  );
}

export default CreateLobbyForm;
