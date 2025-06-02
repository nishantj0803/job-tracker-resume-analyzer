// File: app/resume/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react";
import Link from "next/link"; // Keep for potential links like Keyword Matcher
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, CheckCircle2, FileText, Info, Loader2, MessageSquareWarning, XCircle, Eye, ListChecks, SearchCheck, BrainCircuit } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { ResumeUploader } from "@/components/resume-uploader";
import { KeywordMatcher } from "@/components/keyword-matcher";
import { MainNav } from "@/components/main-nav";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Separator } from "@/components/ui/separator";


// Interface for the expected analysis result structure
interface ResumeAnalysisResult {
  score?: number;
  contentQuality?: number;
  atsCompatibility?: number;
  keywordOptimization?: number;
  suggestions?: string[];
  keywords?: {
    present?: string[];
    missing?: string[];
  };
  sections?: {
    summary?: { clarity?: number; impact?: number; feedback?: string };
    experience?: { achievementFocus?: number; quantifiableResults?: number; feedback?: string };
    skills?: { relevance?: number; organization?: number; feedback?: string };
  };
  error?: string;
  raw_text_preview?: string;
}

interface SectionDetailProps {
  title: string;
  data?: { clarity?: number; impact?: number; achievementFocus?: number; quantifiableResults?: number; relevance?: number; organization?: number; feedback?: string };
  metric1Name?: string;
  metric2Name?: string;
}

const SectionDetailCard: React.FC<SectionDetailProps> = ({ title, data, metric1Name, metric2Name }) => {
  if (!data) return null;

  const metric1Value = data.clarity ?? data.achievementFocus ?? data.relevance;
  const metric2Value = data.impact ?? data.quantifiableResults ?? data.organization;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {metric1Name && typeof metric1Value === 'number' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span>{metric1Name}</span>
              <span className="font-medium">{metric1Value}/10</span>
            </div>
            <Progress value={metric1Value * 10} className="h-2 mt-1" />
          </div>
        )}
        {metric2Name && typeof metric2Value === 'number' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span>{metric2Name}</span>
              <span className="font-medium">{metric2Value}/10</span>
            </div>
            <Progress value={metric2Value * 10} className="h-2 mt-1" />
          </div>
        )}
        {data.feedback && <p className="text-sm text-muted-foreground mt-2">{data.feedback}</p>}
      </CardContent>
    </Card>
  );
};


export default function ResumePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);

  const loadAnalysisFromStorage = useCallback(() => {
    console.log("ResumePage: Attempting to load analysis from localStorage.");
    setIsLoadingAnalysis(true);
    const storedResult = localStorage.getItem("resumeAnalysisResult");
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult) as ResumeAnalysisResult;
        console.log("ResumePage: Parsed analysis from localStorage:", parsedResult);
        setAnalysisResult(parsedResult);
        // If we loaded a result (even an error one), and the URL doesn't specify a tab, switch to analysis.
        if (!searchParams.get("tab")) {
             setActiveTab("analysis");
        }
      } catch (e) {
        console.error("ResumePage: Failed to parse stored analysis result:", e);
        setAnalysisResult({ error: "Could not load previous analysis data. It might be corrupted." } as ResumeAnalysisResult);
        if (!searchParams.get("tab")) {
            setActiveTab("analysis"); // Still show error on analysis tab
        }
      }
    } else {
      console.log("ResumePage: No resumeAnalysisResult found in localStorage.");
      setAnalysisResult(null); // No data to show
    }
    setIsLoadingAnalysis(false);
  }, [searchParams]);


  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }

    const resumeAnalyzedFlag = localStorage.getItem("resumeAnalyzed");
    if (resumeAnalyzedFlag === "true") {
      loadAnalysisFromStorage();
      localStorage.removeItem("resumeAnalyzed"); // Clear the flag after processing
      // Keep resumeAnalysisResult in localStorage for now, ResumeUploader will clear it on new file selection
    } else {
        // If not coming from a fresh analysis, still try to load any existing data
        // for example, if user navigates directly to /resume?tab=analysis
        if (tabParam === "analysis") {
            loadAnalysisFromStorage();
        } else {
            setIsLoadingAnalysis(false); // Not trying to load analysis for other tabs initially
        }
    }
  }, [searchParams, loadAnalysisFromStorage]);


  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/resume?tab=${newTab}`, { scroll: false });
    if (newTab === "analysis" && !analysisResult) {
        loadAnalysisFromStorage(); // Try to load if switching to analysis tab and no data yet
    }
  };
  
  const renderAnalysisContent = () => {
    if (isLoadingAnalysis) {
      return (
        <div className="space-y-6 p-1">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => ( <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-5 w-3/5 mb-1" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2 mb-2" /><Skeleton className="h-2 w-full" /></CardContent></Card>))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-1/2 mb-2" /><Skeleton className="h-4 w-4/5" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2 mb-2" /><Skeleton className="h-4 w-4/5" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
          </div>
          <Card><CardHeader><Skeleton className="h-7 w-2/5 mb-2" /><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        </div>
      );
    }

    if (analysisResult?.error) {
      return (
        <Card className="mt-4 border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><MessageSquareWarning /> Analysis Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{analysisResult.error}</p>
            <p className="text-sm text-muted-foreground">This might be due to an issue with the uploaded file (e.g., image-based PDF, password-protected, unreadable format) or a problem with the analysis service.</p>
            <Button onClick={() => handleTabChange("upload")} className="mt-2">
              Upload a Different Resume
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!analysisResult) {
      return (
        <Card className="mt-4 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="text-primary" /> No Analysis Data Available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>It looks like you haven't analyzed a resume yet.</p>
            <Button onClick={() => handleTabChange("upload")} className="mt-2">Upload & Analyze Resume</Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BrainCircuit size={24}/> Overall Resume Scores</CardTitle>
            <CardDescription>Summary of your resume's performance based on AI analysis.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Overall Score", value: analysisResult.score, Icon: FileText },
              { title: "Content Quality", value: analysisResult.contentQuality, Icon: FileText },
              { title: "ATS Compatibility", value: analysisResult.atsCompatibility, Icon: FileText },
              { title: "Keyword Optimization", value: analysisResult.keywordOptimization, Icon: FileText },
            ].map(({ title, value, Icon }) => (
              <Card key={title} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value ?? "N/A"}{typeof value === 'number' ? "/100" : ""}</div>
                  {typeof value === 'number' && <Progress value={value} className="h-2 mt-1" aria-label={`${title}: ${value} out of 100`} />}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Suggestions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks size={20}/> Improvement Suggestions</CardTitle>
              <CardDescription>AI-powered recommendations to enhance your resume.</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult.suggestions && analysisResult.suggestions.length > 0 ? (
                <ul className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li className="flex items-start gap-3 text-sm" key={index}>
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5 text-primary mt-1">
                        <Info className="h-4 w-4" />
                      </div>
                      <p>{suggestion}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific suggestions provided. Your resume looks great in these aspects or could not be fully assessed!</p>
              )}
            </CardContent>
          </Card>

          {/* Keywords Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><SearchCheck size={20}/> Keyword Analysis</CardTitle>
              <CardDescription>Keywords identified in your resume and potential gaps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" /> Present Keywords ({analysisResult.keywords?.present?.length ?? 0})
                </h3>
                {analysisResult.keywords?.present && analysisResult.keywords.present.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.present.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 border-green-400 text-green-700 dark:bg-green-900/40 dark:border-green-600 dark:text-green-300 text-xs"> {keyword} </Badge>
                    ))}
                  </div>
                ) : (<p className="text-sm text-muted-foreground">No prominent keywords were automatically identified.</p>)}
              </div>
              <Separator />
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" /> Suggested Missing Keywords ({analysisResult.keywords?.missing?.length ?? 0})
                </h3>
                 {analysisResult.keywords?.missing && analysisResult.keywords.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.missing.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 border-red-400 text-red-700 dark:bg-red-900/40 dark:border-red-600 dark:text-red-300 text-xs"> {keyword} </Badge>
                    ))}
                  </div>
                 ) : (<p className="text-sm text-muted-foreground">No critical missing keywords flagged for general analysis. Use the Keyword Matcher for job-specific insights.</p>)}
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => handleTabChange("keywords")}>
                  Compare with Job Description <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Section-Specific Analysis */}
        {analysisResult.sections && Object.keys(analysisResult.sections).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Detailed Section Analysis</CardTitle>
              <CardDescription>Breakdown of key resume sections based on AI review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SectionDetailCard title="Summary" data={analysisResult.sections.summary} metric1Name="Clarity" metric2Name="Impact" />
              <SectionDetailCard title="Work Experience" data={analysisResult.sections.experience} metric1Name="Achievement Focus" metric2Name="Quantifiable Results" />
              <SectionDetailCard title="Skills" data={analysisResult.sections.skills} metric1Name="Relevance" metric2Name="Organization" />
            </CardContent>
          </Card>
        )}

        {/* Raw Text Preview */}
         {analysisResult.raw_text_preview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye size={20}/> Extracted Text Preview</CardTitle>
              <CardDescription>This is a preview of the text extracted from your resume that was used for analysis (first 800 characters).</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 dark:bg-muted/20 p-4 rounded-md max-h-60 overflow-y-auto font-mono">
                {analysisResult.raw_text_preview}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <DashboardHeader
          heading="Resume Center"
          text="Upload, analyze, and optimize your resume for job applications."
        />
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="analysis" disabled={isLoadingAnalysis && !analysisResult && activeTab !== 'analysis'}>Analysis Results</TabsTrigger>
            <TabsTrigger value="keywords">Keyword Matcher</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <ResumeUploader />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            {renderAnalysisContent()}
          </TabsContent>

          <TabsContent value="keywords" className="mt-6">
            <KeywordMatcher />
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </div>
  );
}
