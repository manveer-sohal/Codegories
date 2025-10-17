"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Final Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm">
            Results summary will appear here.
          </p>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => router.push("/")}>Play Again</Button>
      </div>
    </div>
  );
}
