"use client";
import PreGameLobby from "@/components/PreGameLobby";
import { joinRoom } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PreGamePage() {
  const params = useParams<{ roomId: string }>();

  useEffect(() => {
    if (!params.roomId) return;
    joinRoom(params.roomId, useGameStore.getState().playerName);
  }, [params.roomId]);

  return (
    <div className="mx-auto max-w-xl mt-8 ">
      <PreGameLobby lobbyId={params.roomId} createdLobbyId={params.roomId} />
    </div>
  );
}
