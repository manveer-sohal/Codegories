import { useGameStore } from "@/lib/store";
import Image from "next/image";
import avatar1 from "../images/avatar1.png";
import avatar2 from "../images/avatar2.png";
import avatar3 from "../images/avatar3.png";
import avatar4 from "../images/avatar4.png";
import avatar5 from "../images/avatar5.png";
import avatar6 from "../images/avatar6.png";

const avatarMap = {
  avatar1: avatar1,
  avatar2: avatar2,
  avatar3: avatar3,
  avatar4: avatar4,
  avatar5: avatar5,
  avatar6: avatar6,
};
export default function PlayerList() {
  const players = useGameStore((s) => s.players);
  const playersList = Array.from(players.values());
  console.log("playersList", playersList);
  return (
    <div className="bg-white/10 rounded-md p-2">
      <div className="bg-white/10 rounded-md p-2">
        <h2 className="text-white text-center">Player List</h2>
      </div>
      {playersList.map((player, index) => (
        <div key={index} className="flex items-center justify-between p-1">
          <Image
            src={avatarMap[player.avatar as keyof typeof avatarMap]}
            alt={player.name}
            width={34}
            height={34}
          />
          <p>
            {player.name} ({player.playerType})
          </p>
          <p>{player.wins > 0 ? `(${player.wins})` : ""}</p>
        </div>
      ))}
    </div>
  );
}
