"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { leaveRoom } from "@/lib/socket";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const playerName = useGameStore((s) => s.playerName);
  const roomId = useGameStore((s) => s.roomId);
  const router = useRouter();
  const leaveLobby = () => {
    if (!roomId) return;
    router.push("/");
    useGameStore.setState({ phase: "lobby" });
    useGameStore.setState({ playerInput: [] });
    leaveRoom(roomId);
  };
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/20">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-semibold tracking-wide">
          Codegories
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm hidden sm:block">
            {playerName || "Guest"}
          </span>
          {roomId && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/" onClick={leaveLobby}>
                Leave
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
