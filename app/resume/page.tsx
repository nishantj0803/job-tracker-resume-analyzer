// File: app/resume/page.tsx
// Description: Displays the resume analysis results.

"use client"

import { useEffect, useState } from "react"
// import Link from "next/link" // Keep if needed for other links
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, CheckCircle2, FileText, Info, Loader2, XCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ResumeUploader } from "@/components/resume-uploader"
import { KeywordMatcher } from "@/components/keyword-matcher" // Assuming this will also be dynamic
import { MainNav } from "@/components/main-nav"
import { useSearchParams, useRouter } from "next/navigation" // Added useRouter
import { Skeleton } from "@/components/ui/skeleton"

// Interface for the expected analysis result structure
interface ResumeAnalysisResult {
  score?: number; // Make fields optional to handle partial data or errors
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

export default function ResumePage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // For programmatic navigation
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true); // Start true to show loading initially

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }

    const resumeAnalyzedFlag = localStorage.getItem("resumeAnalyzed");
    if (resumeAnalyzedFlag === "true") {
      const storedResult = localStorage.getItem("resumeAnalysisResult");
      if (storedResult) {
        try {
          const parsedResult = JSON.parse(storedResult) as ResumeAnalysisResult;
          setAnalysisResult(parsedResult);
          setActiveTab("analysis"); 
        } catch (e) {
          console.error("Failed to parse stored analysis result:", e);
          setAnalysisResult({ error: "Could not load analysis results. The data might be corrupted." } as ResumeAnalysisResult);
          setActiveTab("analysis"); // Still go to analysis to show error
        }
      } else {
         // Flag is set but no data, could mean an issue or direct navigation
         // If navigating directly to /resume?tab=analysis without prior upload, this is expected
         console.warn("resumeAnalyzed flag set, but no analysisResult in localStorage.");
         setAnalysisResult(null); // Ensure no stale data is shown
      }
      // Clear flags after processing
      localStorage.removeItem("resumeAnalyzed");
      localStorage.removeItem("resumeAnalysisResult");
    }
    setIsLoadingAnalysis(false); // Done with initial loading/checking
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/resume?tab=${newTab}`, { scroll: false }); // Update URL without full reload
  };
  
  const renderAnalysisContent = () => {
    if (isLoadingAnalysis) { // Show skeleton when loading initial analysis
      return (
        <div className="space-y-6 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => ( <Card key={i}><CardHeader><Skeleton className="h-5 w-2/3 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3 mb-2" /><Skeleton className="h-3 w-full" /></CardContent></Card>))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-3/5 mb-2" /><Skeleton className="h-4 w-4/5" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-3/5 mb-2" /><Skeleton className="h-4 w-4/5" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
          </div>
          <Card><CardHeader><Skeleton className="h-7 w-2/5 mb-2" /><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      );
    }

    if (analysisResult?.error) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><XCircle /> Analysis Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-destructive-foreground">{analysisResult.error}</p>
            <p className="text-sm text-muted-foreground">This might be due to an issue with the uploaded file (e.g., image-based PDF, password-protected) or a problem with the analysis service.</p>
            <Button onClick={() => handleTabChange("upload")} className="mt-2">Try Uploading Again</Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!analysisResult) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="text-blue-500" /> No Analysis Data Available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>It looks like you haven't analyzed a resume yet, or the previous analysis data could not be loaded.</p>
            <Button onClick={() => handleTabChange("upload")} className="mt-2">Upload & Analyze Resume</Button>
          </CardContent>
        </Card>
      );
    }

    // Main analysis display
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisResult.score ?? "N/A"}/100</div>
              {typeof analysisResult.score === 'number' && <div className="mt-2"> <Progress value={analysisResult.score} className="h-2" /> </div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Quality</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisResult.contentQuality ?? "N/A"}/100</div>
               {typeof analysisResult.contentQuality === 'number' && <div className="mt-2"> <Progress value={analysisResult.contentQuality} className="h-2" /> </div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ATS Compatibility</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisResult.atsCompatibility ?? "N/A"}/100</div>
              {typeof analysisResult.atsCompatibility === 'number' && <div className="mt-2"> <Progress value={analysisResult.atsCompatibility} className="h-2" /> </div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keyword Optimization</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisResult.keywordOptimization ?? "N/A"}/100</div>
              {typeof analysisResult.keywordOptimization === 'number' && <div className="mt-2"> <Progress value={analysisResult.keywordOptimization} className="h-2" /> </div>}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Improvement Suggestions</CardTitle>
              <CardDescription>AI-powered recommendations to enhance your resume.</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult.suggestions && analysisResult.suggestions.length > 0 ? (
                <ul className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li className="flex items-start gap-3" key={index}>
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5 text-primary mt-1">
                        <Info className="h-4 w-4" />
                      </div>
                      <p className="text-sm">{suggestion}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific suggestions at the moment. Your resume looks good in these areas!</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis</CardTitle>
              <CardDescription>Identified keywords in your resume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Present Keywords ({analysisResult.keywords?.present?.length ?? 0})
                </h3>
                {analysisResult.keywords?.present && analysisResult.keywords.present.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.present.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"> {keyword} </Badge>
                    ))}
                  </div>
                ) : (<p className="text-sm text-muted-foreground">No prominent keywords were identified from your resume.</p>)}
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" /> Suggested Missing Keywords ({analysisResult.keywords?.missing?.length ?? 0})
                </h3>
                 {analysisResult.keywords?.missing && analysisResult.keywords.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.missing.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"> {keyword} </Badge>
                    ))}
                  </div>
                 ) : (<p className="text-sm text-muted-foreground">No critical missing keywords identified for general analysis. Use the 'Keyword Matcher' for specific jobs.</p>)}
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => handleTabChange("keywords")}>
                  Compare with Job Description <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {analysisResult.sections && Object.keys(analysisResult.sections).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Section Analysis</CardTitle>
              <CardDescription>Breakdown of key resume sections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisResult.sections.summary && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <div className="grid gap-4 sm:grid-cols-2 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm"> <span>Clarity</span> <span className="font-medium">{analysisResult.sections.summary.clarity ?? 'N/A'}/10</span> </div>
                      {typeof analysisResult.sections.summary.clarity === 'number' && <Progress value={analysisResult.sections.summary.clarity * 10} className="h-2" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm"> <span>Impact</span> <span className="font-medium">{analysisResult.sections.summary.impact ?? 'N/A'}/10</span> </div>
                      {typeof analysisResult.sections.summary.impact === 'number' && <Progress value={analysisResult.sections.summary.impact * 10} className="h-2" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysisResult.sections.summary.feedback || "No specific feedback for summary."}</p>
                </div>
              )}
              {analysisResult.sections.experience && (
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Work Experience</h3>
                    <div className="grid gap-4 sm:grid-cols-2 mb-2">
                        <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm"> <span>Achievement Focus</span> <span className="font-medium">{analysisResult.sections.experience.achievementFocus ?? 'N/A'}/10</span> </div>
                        {typeof analysisResult.sections.experience.achievementFocus === 'number' && <Progress value={analysisResult.sections.experience.achievementFocus * 10} className="h-2" />}
                        </div>
                        <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm"> <span>Quantifiable Results</span> <span className="font-medium">{analysisResult.sections.experience.quantifiableResults ?? 'N/A'}/10</span> </div>
                        {typeof analysisResult.sections.experience.quantifiableResults === 'number' && <Progress value={analysisResult.sections.experience.quantifiableResults * 10} className="h-2" />}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysisResult.sections.experience.feedback || "No specific feedback for experience."}</p>
                 </div>
              )}
               {analysisResult.sections.skills && (
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Skills</h3>
                    <div className="grid gap-4 sm:grid-cols-2 mb-2">
                        <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm"> <span>Relevance</span> <span className="font-medium">{analysisResult.sections.skills.relevance ?? 'N/A'}/10</span> </div>
                        {typeof analysisResult.sections.skills.relevance === 'number' && <Progress value={analysisResult.sections.skills.relevance * 10} className="h-2" />}
                        </div>
                        <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm"> <span>Organization</span> <span className="font-medium">{analysisResult.sections.skills.organization ?? 'N/A'}/10</span> </div>
                        {typeof analysisResult.sections.skills.organization === 'number' && <Progress value={analysisResult.sections.skills.organization * 10} className="h-2" />}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysisResult.sections.skills.feedback || "No specific feedback for skills."}</p>
                 </div>
              )}
            </CardContent>
          </Card>
        )}
         {analysisResult.raw_text_preview && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Text Preview (First 800 Chars)</CardTitle>
              <CardDescription>This is a preview of the text extracted from your resume for analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 dark:bg-muted/20 p-3 rounded-md max-h-60 overflow-y-auto">
                {analysisResult.raw_text_preview}
              </p>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysisResult && !isLoadingAnalysis && activeTab !== 'analysis'}>Analysis Results</TabsTrigger>
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
