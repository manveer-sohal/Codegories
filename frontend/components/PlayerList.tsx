import { useGameStore } from "@/lib/store";

export default function PlayerList() {
  const players = useGameStore((s) => s.players);
  return (
    <div>
      <h2>Player List</h2>
      {players.map((player) => (
        <div key={player.id}>{player.name}</div>
      ))}
    </div>
  );
}
