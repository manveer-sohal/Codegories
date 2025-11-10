import { useGameStore } from "@/lib/store";

export default function PlayerList() {
  const players = useGameStore((s) => s.players);
  return (
    <div className="bg-white/10 rounded-md p-2">
      <div className="bg-white/10 rounded-md p-2">
        <h2 className="text-white text-center">Player List</h2>
      </div>
      {players.map((player, index) => (
        <div key={index} className="flex items-center justify-between p-1">
          <p>
            {player.name} ({player.playerType})
          </p>
          <p>{player.wins > 0 ? `(${player.wins})` : ""}</p>
        </div>
      ))}
    </div>
  );
}
