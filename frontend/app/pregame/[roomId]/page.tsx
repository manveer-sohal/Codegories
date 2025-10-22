"use client";
import PreGameLobby from "@/components/PreGameLobby";
import { checkRoomValid, joinRoom } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PreGamePage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!params.roomId) {
      router.push("/");
      return;
    }
    //check if the room is valid
    checkRoomValid(params.roomId)
      .then((valid: boolean) => {
        if (!valid) {
          router.push("/");
          return;
        }
      })
      .catch((error) => {
        console.error("checkRoomValid error", error);
        router.push("/");
        return;
      });
  }, [params.roomId, router]);

  return (
    <div className="mx-auto max-w-xl mt-8 ">
      <PreGameLobby lobbyId={params.roomId} createdLobbyId={params.roomId} />
    </div>
  );
}
