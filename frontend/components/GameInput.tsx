"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitAnswer } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { dataStructures } from "@/app/data/Data";

export default function GameInput() {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const letter = useGameStore((s) => s.currentRound?.letter);
  const setLastSubmittedAnswer = useGameStore((s) => s.setLastSubmittedAnswer);
  const setPlayerInput = useGameStore((s) => s.setPlayerInput);
  const [inputStatus, setInputStatus] = useState<
    "correct" | "incorrect" | "pending" | "empty" | "duplicate"
  >("empty");
  const timeRemaining = useGameStore((s) => s.currentRound?.timeRemaining);
  const [playerAnswer, setPlayerAnswer] = useState<Set<string>>(new Set());

  // useEffect(() => {
  //   setValue(playerInput[0] || "");
  // }, [playerInput]);

  useEffect(() => {
    setValue("");
    inputRef.current?.focus();
  }, [letter]);

  useEffect(() => {
    if (value.length > 0) {
      setInputStatus("empty");
    }
  }, [value]);

  const handleSubmitAnswer = (answer: string) => {
    console.log("answer", playerAnswer);
    answer = answer.toLowerCase();
    if (playerAnswer.has(answer)) {
      console.log("duplicate");
      setInputStatus("duplicate");
      return;
    }
    if (!dataStructures.has(answer)) {
      console.log("incorrect");
      setInputStatus("incorrect");
      return;
    }
    console.log("adding answer", answer);
    setPlayerAnswer((prev) => {
      prev.add(answer);
      return prev;
    });
    setPlayerInput([...playerAnswer]);
    setInputStatus("correct");
    submitAnswer(value.trim());
    setLastSubmittedAnswer(value.trim());
    setValue("");
  };

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      className="flex items-center gap-2 w-full"
    >
      <input
        disabled={
          !timeRemaining || (timeRemaining && timeRemaining <= 0) ? true : false
        }
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a valid answer..."
        className="flex-1 rounded-md bg-black/40 border border-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <Button
        disabled={
          !timeRemaining || (timeRemaining && timeRemaining <= 0) ? true : false
        }
        onClick={() => handleSubmitAnswer(value)}
        type="submit"
      >
        Submit
      </Button>
      {inputStatus === "correct" && <p className="text-green-500">Correct</p>}
      {inputStatus === "incorrect" && <p className="text-red-500">Incorrect</p>}
      {inputStatus === "duplicate" && (
        <p className="text-yellow-500">Duplicate</p>
      )}
      {inputStatus === "pending" && <p className="text-blue-500">Pending</p>}
    </form>
  );
}
