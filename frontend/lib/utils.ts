import { type ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useGameStore } from "./store";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

//reset the round data for a new round
export function newRound() {
  useGameStore.setState({
    playerInput: [],
    scores: [],
    lastSubmittedAnswer: undefined,
  });
}
