import { useState } from "react";
import OptionCard from "./OptionCard";

const question = "What is the capital of France?";
const options = ["Paris", "London", "Berlin", "Madrid"];

export default function Quiz() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  return (
    <div className="bg-white/10 rounded-md p-4 space-y-4">
      <div className="flex flex-row w-full items-center gap-2">
        <div className="p-2 flex flex-row justify-center items-center">1/2</div>
        <div className="w-full rounded-md p-2 flex flex-row justify-center items-center">
          <p>{question}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <OptionCard
            key={option}
            option={option}
            selected={selectedOption === option}
            setSelectedOption={setSelectedOption}
            disabled={!!selectedOption}
          />
        ))}
      </div>
    </div>
  );
}
