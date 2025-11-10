import { useState } from "react";
import { Button } from "./ui/button";
import {
  DataStructures,
  Algorithms,
  ProgrammingLanguages,
  TechCompanies,
  CSBuzzwords,
  ProgrammingKeywords,
  Frameworks,
} from "@/app/data/Data";
import { useGameStore } from "@/lib/store";

export default function CodegoriesBoard({ letter }: { letter: string }) {
  // const currentRound = useGameStore((s) => s.currentRound);
  // const codegoriesRoundData = useGameStore((s) => s.codegoriesRoundData);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  // const categories = codegoriesRoundData?.categories ?? [];
  const [submitted, setSubmitted] = useState<boolean>(false);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const playerId = useGameStore((s) => s.playerId);
  const categories = [
    "Data Structure",
    "Algorithm",
    "Programming Language",
    "CS Buzzword / Jargon",
    "Programming Keyword",
    "Tech Company",
    "Framework",
  ];
  const submitCategories = () => {
    setSubmitted(true);
    let score = 0;
    if (DataStructures[letter].has(answers["Data Structure"])) {
      score++;
    }
    if (Algorithms[letter].has(answers["Algorithm"])) {
      score++;
    }
    if (ProgrammingLanguages[letter].has(answers["Programming Language"])) {
      score++;
    }

    if (TechCompanies[letter].has(answers["Tech Company"])) {
      score++;
    }
    if (CSBuzzwords[letter].has(answers["CS Buzzword / Jargon"])) {
      score++;
    }
    if (ProgrammingKeywords[letter].has(answers["Programming Keyword"])) {
      score++;
    }
    if (Frameworks[letter].has(answers["Framework"])) {
      score++;
    }
    incrementScore(playerId ?? "", score);
  };

  return (
    <>
      {categories.map((category) => (
        <div key={category} className=" w-full flex flex-row gap-2">
          <div className="flex h-11 w-50 items-center gap-2 bg-white/10 rounded-md">
            <p className="px-2 w-full text-center">{category}</p>
          </div>
          <input
            disabled={submitted}
            type="text"
            className="w-full h-10 bg-white/30 rounded-md text-white p-2"
            onChange={(e) =>
              setAnswers({ ...answers, [category]: e.target.value })
            }
          />
        </div>
      ))}
      <Button
        disabled={submitted}
        className="w-full"
        onClick={() => submitCategories()}
      >
        Submit
      </Button>
    </>
  );
}
