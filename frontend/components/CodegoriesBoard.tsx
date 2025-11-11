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
import { updateScore } from "@/lib/socket";
export default function CodegoriesBoard({ letter }: { letter: string }) {
  // const currentRound = useGameStore((s) => s.currentRound);
  // const codegoriesRoundData = useGameStore((s) => s.codegoriesRoundData);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [score, setScore] = useState<number>(0);
  // const categories = codegoriesRoundData?.categories ?? [];
  const [submitted, setSubmitted] = useState<boolean>(false);
  const timeRemaining = useGameStore((s) => s.currentRound?.timeRemaining);
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
    if (submitted) return;
    setSubmitted(true);
    if (DataStructures[letter].has(answers["Data Structure"])) {
      setScore(score + 1);
    }
    if (Algorithms[letter].has(answers["Algorithm"])) {
      setScore(score + 1);
    }
    if (ProgrammingLanguages[letter].has(answers["Programming Language"])) {
      setScore(score + 1);
    }

    if (TechCompanies[letter].has(answers["Tech Company"])) {
      setScore(score + 1);
    }
    if (CSBuzzwords[letter].has(answers["CS Buzzword / Jargon"])) {
      setScore(score + 1);
    }
    if (ProgrammingKeywords[letter].has(answers["Programming Keyword"])) {
      setScore(score + 1);
    }
    if (Frameworks[letter].has(answers["Framework"])) {
      setScore(score + 1);
    }
    console.log("score", score);
    if (score > 0) {
      updateScore(score);
    }
  }, [submitted, answers, letter, score]);

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
