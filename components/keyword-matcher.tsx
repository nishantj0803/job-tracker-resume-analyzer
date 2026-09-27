// File: components/keyword-matcher.tsx
// Description: Compares job description keywords with resume text,
// rendering an explainable match (matched / missing / overlap / breakdown).

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, XCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface KeywordAnalysisResult {
  /** Legacy key (kept for compatibility). */
  matching?: string[];
  matched?: string[];
  missing: string[];
  score: number;
  experienceOverlap?: string;
  breakdown?: {
    skillsMatch: number;
    experienceOverlap: number;
    seniorityFit: number;
  };
  summary?: string;
  error?: string;
}

interface StoredResumeAnalysis {
  raw_text_preview?: string;
  error?: string;
}

export function KeywordMatcher() {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] =
    useState<KeywordAnalysisResult | null>(null);
  const [resumeTextForMatcher, setResumeTextForMatcher] = useState<
    string | null
  >(null);
  const [isLoadingResumeText, setIsLoadingResumeText] = useState(true);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const { toast } = useToast();

  const loadResumeTextFromStorage = useCallback(() => {
    setIsLoadingResumeText(true);
    setResumeError(null);
    try {
      const storedResult = localStorage.getItem("resumeAnalysisResult");
      if (storedResult) {
        const parsedResult: StoredResumeAnalysis = JSON.parse(storedResult);
        if (parsedResult.error) {
          setResumeError(
            `The previously analyzed resume had an error: ${parsedResult.error}. Please re-upload and analyze.`
          );
          setResumeTextForMatcher(null);
        } else if (
          parsedResult.raw_text_preview &&
          parsedResult.raw_text_preview.trim() !== ""
        ) {
          setResumeTextForMatcher(parsedResult.raw_text_preview);
        } else {
          setResumeError(
            "No resume text found from the last analysis. Please upload and analyze your resume first."
          );
          setResumeTextForMatcher(null);
        }
      } else {
        setResumeError(
          "No resume has been analyzed yet. Please upload and analyze your resume on the 'Upload & Analyze' tab first."
        );
        setResumeTextForMatcher(null);
      }
    } catch {
      setResumeError(
        "Could not load previously analyzed resume data. It might be corrupted."
      );
      setResumeTextForMatcher(null);
    }
    setIsLoadingResumeText(false);
  }, []);

  useEffect(() => {
    loadResumeTextFromStorage();
  }, [loadResumeTextFromStorage]);

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 20) {
      toast({
        title: "Job Description Too Short",
        description: "Please paste a fuller job description (20+ characters).",
        variant: "destructive",
      });
      return;
    }

    if (!resumeTextForMatcher) {
      toast({
        title: "Resume Text Missing",
        description:
          resumeError ||
          "Please upload and analyze your resume on the 'Upload & Analyze' tab first.",
        variant: "destructive",
      });
      loadResumeTextFromStorage();
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const response = await fetch("/api/resume/compare-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText: resumeTextForMatcher,
        }),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(
          resultData.error || `Request failed with status ${response.status}`
        );
      }

      if (resultData.error) {
        toast({
          title: "Keyword Comparison Error",
          description: resultData.error,
          variant: "destructive",
        });
        setAnalysisResults(null);
      } else {
        setAnalysisResults(resultData as KeywordAnalysisResult);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to compare keywords. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const matched = analysisResults?.matched ?? analysisResults?.matching ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Description Input</CardTitle>
          <CardDescription>
            Paste the job description you want to compare your resume against.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here..."
            className="min-h-[200px] lg:min-h-[250px] text-sm"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </CardContent>
      </Card>

      {!isLoadingResumeText && !resumeTextForMatcher && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Info size={20} /> Resume Text Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive-foreground mb-3">
              {resumeError || "The text from your last resume analysis could not be loaded."}
            </p>
            <Button variant="outline" onClick={loadResumeTextFromStorage}>
              Attempt to Reload Resume Text
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Ensure you have successfully uploaded and analyzed a resume on the
              &apos;Upload &amp; Analyze&apos; tab.
            </p>
          </CardContent>
        </Card>
      )}
      {isLoadingResumeText && (
        <div className="flex items-center justify-center p-4 space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading analyzed resume text...</span>
        </div>
      )}

      <Button
        className="w-full text-base py-6"
        onClick={handleAnalyze}
        disabled={
          isAnalyzing ||
          jobDescription.trim().length < 20 ||
          !resumeTextForMatcher ||
          isLoadingResumeText
        }
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Comparing Keywords...
          </>
        ) : (
          "Compare Keywords with My Resume"
        )}
      </Button>

      {analysisResults && !analysisResults.error && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>
                  {analysisResults.score}% match
                </CardTitle>
                <CardDescription className="mt-1">
                  {analysisResults.experienceOverlap ??
                    `${matched.length}/${matched.length + analysisResults.missing.length} core requirements`}
                </CardDescription>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Match Score</p>
                <p className="text-2xl font-bold">{analysisResults.score}%</p>
              </div>
            </div>
            {analysisResults.summary && (
              <p className="text-sm text-muted-foreground mt-2">
                {analysisResults.summary}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {analysisResults.breakdown && (
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["Skills match", analysisResults.breakdown.skillsMatch],
                    ["Experience overlap", analysisResults.breakdown.experienceOverlap],
                    ["Seniority fit", analysisResults.breakdown.seniorityFit],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{value}%</p>
                    <Progress value={value} className="h-1.5 mt-2" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Matched ({matched.length})
              </h3>
              {matched.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matched.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No direct keyword matches found from the job description in
                  your resume.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Missing ({analysisResults.missing.length})
              </h3>
              {analysisResults.missing.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysisResults.missing.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Great! No critical keywords from the job description seem to
                  be missing from your resume.
                </p>
              )}
            </div>
            {analysisResults.missing.length > 0 && (
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <Info size={16} /> Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-700 dark:text-amber-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Consider incorporating some of the &quot;Missing
                      Keywords&quot; into your resume if they accurately reflect
                      your skills and experience.
                    </li>
                    <li>
                      Focus on using these keywords naturally within your
                      experience bullet points or summary.
                    </li>
                    <li>
                      Tailoring your resume for each specific job application by
                      including relevant keywords can significantly improve your
                      chances.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
