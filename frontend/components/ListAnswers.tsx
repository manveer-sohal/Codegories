import { useGameStore } from "@/lib/store";

export default function ListAnswers() {
  const playerInput = useGameStore((s) => s.playerInput);

  return (
    <div>
      {playerInput.length > 0 &&
        playerInput.map((answer) => <div key={answer}>{answer}</div>)}
    </div>
  );
}
