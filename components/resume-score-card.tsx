// File: components/resume-score-card.tsx
"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck2, AlertTriangle, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "./ui/button";

export function ResumeScoreCard() {
  const [score, setScore] = useState<number | null>(null);
  const [hasAnalysis, setHasAnalysis] = useState(false);

  useEffect(() => {
    // This code runs only on the client, after the component mounts
    try {
      const storedResult = localStorage.getItem("resumeAnalysisResult");
      if (storedResult) {
        const analysisData = JSON.parse(storedResult);
        // Assuming the score is stored as analysisData.score or analysisData.overall_score
        const analysisScore = analysisData.score ?? analysisData.overall_score ?? null;
        if (typeof analysisScore === 'number') {
           setScore(analysisScore);
        }
        setHasAnalysis(true);
      } else {
        setHasAnalysis(false);
      }
    } catch (error) {
        console.error("Failed to parse resume analysis from localStorage", error);
        setHasAnalysis(false);
    }
  }, []);

  if (!hasAnalysis) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-4">
                    <p className="mb-3">No resume analysis found.</p>
                    <Button asChild size="sm">
                        <Link href="/resume">Analyze Your Resume</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
  }

  if (score === null) {
      return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground py-4">
                    <p>Analysis found, but score is missing.</p>
                    <p className="text-xs">Consider re-analyzing your resume.</p>
                 </div>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
        <FileCheck2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{score}%</div>
        <p className="text-xs text-muted-foreground">Based on your latest analysis.</p>
        <Progress value={score} className="mt-2" />
      </CardContent>
    </Card>
  );
}