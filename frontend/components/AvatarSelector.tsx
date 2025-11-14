import Image from "next/image";
import avatar1 from "../images/avatar1.png";
import avatar2 from "../images/avatar2.png";
import avatar3 from "../images/avatar3.png";
import avatar4 from "../images/avatar4.png";
import avatar5 from "../images/avatar5.png";
import avatar6 from "../images/avatar6.png";
import { useGameStore } from "@/lib/store";

export default function AvatarSelector() {
  const avatar = useGameStore((s) => s.avatar);
  const handleAvatarClick = (avatar: string) => {
    useGameStore.setState({ avatar });
  };
  return (
    <div className="align-center flex flex-col gap-4 bg-white/10 rounded-md p-4 w-full">
      <h1 className="text-center text-2xl font-bold">Avatar Selector</h1>
      <div className="grid grid-cols-3 gap-2 w-full">
        <div
          className={`flex justify-center items-center cursor-pointer ${
            avatar === "avatar1" ? "scale-110 border-2 border-purple-600" : ""
          }`}
        >
          <Image
            src={avatar1}
            alt="Avatar 1"
            width={100}
            height={100}
            onClick={() => handleAvatarClick("avatar1")}
          />
        </div>
        <div
          className={`flex justify-center items-center cursor-pointer ${
            avatar === "avatar2" ? "scale-110 border-2 border-purple-600" : ""
          }`}
        >
          <Image
            src={avatar2}
            alt="Avatar 2"
            width={100}
            height={100}
            onClick={() => handleAvatarClick("avatar2")}
          />
        </div>
        <div
          className={`flex justify-center items-center cursor-pointer ${
            avatar === "avatar3" ? "scale-110 border-2 border-purple-600" : ""
          }`}
        >
          <Image
            src={avatar3}
            alt="Avatar 3"
            width={100}
            height={100}
            onClick={() => handleAvatarClick("avatar3")}
          />
        </div>
        <div
          className={`flex justify-center items-center cursor-pointer ${
            avatar === "avatar4" ? "scale-110 border-2 border-purple-600" : ""
          }`}
        >
          <Image
            src={avatar4}
            alt="Avatar 4"
            width={100}
            height={100}
            onClick={() => handleAvatarClick("avatar4")}
          />
        </div>
        <div
          className={`flex justify-center items-center cursor-pointer ${
            avatar === "avatar5" ? "scale-110 border-2 border-purple-600" : ""
          }`}
        >
          <Image
            src={avatar5}
            alt="Avatar 5"
            width={100}
            height={100}
            onClick={() => handleAvatarClick("avatar5")}
          />
        </div>
        <div
          className={`flex justify-center items-center cursor-pointer ${
            avatar === "avatar6" ? "scale-110 border-2 border-purple-600" : ""
          }`}
        >
          <Image
            src={avatar6}
            alt="Avatar 6"
            width={80}
            height={100}
            onClick={() => handleAvatarClick("avatar6")}
          />
        </div>
      </div>
    </div>
  );
}
