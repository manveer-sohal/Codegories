import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  category: string;
  letter: string;
}

export default function CategoryCard({ category, letter }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category}</span>
          <span className="text-2xl font-black text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
            {letter}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/70 text-sm">
          Enter as many unique valid answers as you can.
        </p>
      </CardContent>
    </Card>
  );
}
