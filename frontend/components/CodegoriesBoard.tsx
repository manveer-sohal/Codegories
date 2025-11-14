import { useCallback, useEffect, useState } from "react";
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
import { updateScore } from "@/lib/socket_util";
export default function CodegoriesBoard({ letter }: { letter: string }) {
  // const currentRound = useGameStore((s) => s.currentRound);
  // const codegoriesRoundData = useGameStore((s) => s.codegoriesRoundData);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  // const categories = codegoriesRoundData?.categories ?? [];
  const [submitted, setSubmitted] = useState<boolean>(false);
  const timeRemaining = useGameStore((s) => s.currentRound?.timeRemaining);
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
  const submitCategories = useCallback(() => {
    let score = 0;
    if (submitted) return;
    setSubmitted(true);

    if (DataStructures[letter].has(answers["Data Structure"])) {
      console.log("Data Structure correct");
      score++;
    }
    if (Algorithms[letter].has(answers["Algorithm"])) {
      console.log("Algorithm correct");
      score++;
    }
    if (ProgrammingLanguages[letter].has(answers["Programming Language"])) {
      console.log("Programming Language correct");
      score++;
    }

    if (TechCompanies[letter].has(answers["Tech Company"])) {
      console.log("Tech Company correct");
      score++;
    }
    if (CSBuzzwords[letter].has(answers["CS Buzzword / Jargon"])) {
      console.log("CS Buzzword / Jargon correct");
      score++;
    }
    if (ProgrammingKeywords[letter].has(answers["Programming Keyword"])) {
      console.log("Programming Keyword correct");
      score++;
    }
    if (Frameworks[letter].has(answers["Framework"])) {
      console.log("Framework correct");
      score++;
    }
    updateScore(score, playerId!);
  }, [submitted, answers, letter, playerId]);

  // so if any value in submitcategories dependencie array changes, we create a new function so it has the updated value
  useEffect(() => {
    // if time remaining is 0, submit categories automatically
    if (timeRemaining && timeRemaining <= 0) {
      submitCategories();
    }
  }, [timeRemaining, submitCategories]);

  return (
    <>
      {categories.map((category) => (
        <div key={category} className=" w-full flex flex-row gap-2">
          <div className="flex h-11 w-50 items-center gap-2 bg-white/10 rounded-md">
            <p className="px-2 w-full text-center">{category}</p>
          </div>
          <input
            disabled={
              submitted ||
              !timeRemaining ||
              (timeRemaining && timeRemaining <= 0)
                ? true
                : false
            }
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
