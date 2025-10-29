import { useGameStore } from "@/lib/store";

export default function PlayerList() {
  const players = useGameStore((s) => s.players);
  return (
    <div className="bg-white/10 rounded-md p-2">
      <div className="bg-white/10 rounded-md p-2">
        <h2 className="text-white text-center">Player List</h2>
      </div>
      {players.map((player) => (
        <div key={player.id}>
          {player.name} ({player.playerType})
        </div>
      ))}
    </div>
  );
}
