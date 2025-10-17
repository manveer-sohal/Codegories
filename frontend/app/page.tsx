"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { createLobby, joinRoom } from "@/lib/socket";

export default function Home() {
  const [nickname, setNickname] = useState("");
  // Ensure socket singleton is initialised lazily when actions run
  const router = useRouter();
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [lobbyId, setLobbyId] = useState("");
  const [createdLobbyId, setCreatedLobbyId] = useState("");

  async function handleJoinLobby() {
    if (!lobbyId.trim()) return;
    const name = nickname.trim() || "Guest";
    setPlayerName(name);
    joinRoom(lobbyId, name);
    router.push(`/pregame/${lobbyId}`);
  }
  async function handleCreateLobby() {
    const name = nickname.trim() || "Host";
    setPlayerName(name);
    try {
      const desiredId = createdLobbyId.trim() || undefined;
      const roomId = await createLobby(name, desiredId);
      setLobbyId(roomId);
      joinRoom(roomId, name);
      router.push(`/pregame/${roomId}`);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mx-auto max-w-xl mt-8 ">
      <h1 className="text-3xl font-bold mb-4">Welcome to Codegories</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Join Lobby */}
        <div className="bg-blue-500 col-span-1 p-4">
          <p className="text-white/70 mb-6">
            Enter a nickname to join a lobby.
          </p>
          <div className="flex items-center gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              className="flex-1 rounded-md bg-black/40 border border-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <p className="text-white/70 mb-6">Enter lobby id to join a lobby.</p>
          <div className="flex items-center gap-2">
            <input
              value={lobbyId}
              onChange={(e) => setLobbyId(e.target.value)}
              placeholder="Lobby id"
              className="flex-1 rounded-md bg-black/40 border border-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={handleJoinLobby}>Join Lobby</Button>
          </div>
        </div>
        {/* Create Lobby */}
        <div className="bg-red-500 col-span-2 p-4">
          <p className="text-white/70 mb-6">Create a new lobby.</p>
          <input
            value={createdLobbyId}
            onChange={(e) => setCreatedLobbyId(e.target.value)}
            placeholder="Lobby id"
            className="flex-1 rounded-md bg-black/40 border border-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button onClick={handleCreateLobby}>Create Lobby</Button>
        </div>
      </div>
    </div>
  );
}
