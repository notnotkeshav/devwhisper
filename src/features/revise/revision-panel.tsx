"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Eye, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Note } from "@/lib/db/schema";
import { markReviewedAction } from "./actions";

const modes = ["quick", "deep", "interview", "architecture", "flash"] as const;
const confidenceLevels = [
  { label: "Hard", value: 0.2, variant: "secondary" as const },
  { label: "OK", value: 0.5, variant: "secondary" as const },
  { label: "Easy", value: 0.9, variant: "default" as const }
];

export function RevisionPanel({ notes }: { notes: Note[] }) {
  const [mode, setMode] = useState<(typeof modes)[number]>("quick");
  const [showAnswer, setShowAnswer] = useState(false);
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();

  const current = notes[index];

  if (!current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue complete</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          All notes reviewed. Create KB notes with summaries to build the revision queue.
        </CardContent>
      </Card>
    );
  }

  function handleReview(confidence: number) {
    startTransition(async () => {
      await markReviewedAction(current.id, confidence);
      setShowAnswer(false);
      setIndex((i) => i + 1);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="grid content-start gap-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Mode
        </p>
        {modes.map((item) => (
          <Button
            key={item}
            variant={mode === item ? "default" : "secondary"}
            onClick={() => setMode(item)}
            className="justify-start capitalize"
            size="sm"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            {item}
          </Button>
        ))}
        <p className="mt-4 px-1 text-xs text-muted-foreground">
          {index + 1} / {notes.length} notes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{current.title}</CardTitle>
          <p className="text-xs text-muted-foreground capitalize">
            {current.status} · forgetting {current.forgettingScore.toFixed(2)}
          </p>
        </CardHeader>
        <CardContent className="grid gap-5">
          {current.shortSummary && (
            <section>
              <h2 className="mb-2 text-sm font-semibold">30-second summary</h2>
              <p className="text-sm text-muted-foreground">{current.shortSummary}</p>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold">Reconstruct</h2>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Explain the core idea, failure modes, and linked concepts from memory.
              </p>
              {showAnswer && (
                <div className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                  {current.deepSummary || current.mediumSummary || current.markdown.slice(0, 800)}
                </div>
              )}
              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                onClick={() => setShowAnswer((v) => !v)}
              >
                {showAnswer ? <Eye className="size-4" /> : <Lightbulb className="size-4" />}
                {showAnswer ? "Hide answer" : "Show answer"}
              </Button>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold">How did it go?</h2>
            <div className="flex gap-2">
              {confidenceLevels.map((level) => (
                <Button
                  key={level.label}
                  variant={level.variant}
                  size="sm"
                  disabled={pending}
                  onClick={() => handleReview(level.value)}
                >
                  <CheckCircle className="size-3.5" aria-hidden />
                  {level.label}
                </Button>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
