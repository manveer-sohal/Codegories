import { useState } from "react";
export default function OptionCard({
  option,
  selected,
  setSelectedOption,
  disabled,
}: {
  option: string;
  selected: boolean;
  setSelectedOption: (option: string) => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`flex flex-col bg-white/10 rounded-md p-4 gap-2 cursor-pointer ${
        disabled ? "cursor-not-allowed" : ""
      } ${disabled ? "opacity-50" : ""} ${hover ? "bg-white/20" : ""} ${
        selected ? "bg-white/40" : ""
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !disabled && setSelectedOption(option)}
    >
      <div className={`text-white/70 text-sm ${selected ? "text-white" : ""}`}>
        <p>{option}</p>
      </div>
    </div>
  );
}
