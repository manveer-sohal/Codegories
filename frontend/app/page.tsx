"use client";

import JoinLobbyForm from "@/components/JoinLobbyForm";
import CreateLobbyForm from "@/components/CreateLobbyForm";
export default function Home() {
  return (
    <div className="mx-auto max-w-xl mt-8 ">
      <h1 className="text-3xl font-bold mb-4">Welcome to Codegories</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Join Lobby */}
        <div className="col-span-1">
          <JoinLobbyForm />
        </div>

        {/* Create Lobby */}
        <div className="col-span-1">
          <CreateLobbyForm />
        </div>
      </div>
    </div>
  );
}
