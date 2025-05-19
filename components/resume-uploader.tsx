// File: components/resume-uploader.tsx
// Description: Handles file selection and calls the Next.js API to analyze the resume.

"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Keep for "How it works"
import { FileText, Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";

export function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const validateFile = (selectedFile: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  }, [toast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        if (e.target) e.target.value = ""; // Reset file input if invalid
      }
    }
  }, [toast]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    // Also clear any previous analysis results if desired
    localStorage.removeItem("resumeAnalysisResult");
    localStorage.removeItem("resumeAnalyzed");
  }, []);

  const handleAnalyzeResume = async () => {
    if (!file) {
      toast({ title: "No File Selected", description: "Please select a resume file to analyze.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Call the Next.js API route that will proxy to Python
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      // Stop loading indicator after fetch, before processing response
      // This allows toast to show immediately if there's a server error
      // setIsProcessing(false); // Moved after response processing

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Analysis request failed. The server returned an unexpected response." }));
        console.error("Analysis API error response:", errorData);
        toast({
          title: "Analysis Failed",
          description: errorData.error || `Server error: ${response.statusText || response.status}`,
          variant: "destructive",
        });
        setIsProcessing(false); // Ensure loading stops on error
        return;
      }

      const analysisResult = await response.json();
       setIsProcessing(false); // Stop loading now that we have the result

      if (analysisResult.error) {
         toast({
          title: "Analysis Error",
          description: analysisResult.error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Resume Analyzed Successfully!",
        description: "Redirecting to your analysis results...",
      });

      localStorage.setItem("resumeAnalysisResult", JSON.stringify(analysisResult));
      localStorage.setItem("resumeAnalyzed", "true");

      // Navigate to the analysis tab on the resume page
      // A slight delay can ensure the toast is seen before navigation
      setTimeout(() => {
        router.push("/resume?tab=analysis");
        // router.refresh(); // Consider if needed, localStorage should handle state for now
      }, 1000); // 1 second delay

    } catch (error) {
      setIsProcessing(false);
      console.error("Client-side error analyzing resume:", error);
      let message = "An unexpected error occurred. Please check your connection and try again.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Upload Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleRemoveFile} disabled={isProcessing}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground">
              <Upload className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">Drag & drop your resume here</p>
              <p className="text-sm text-muted-foreground">or</p>
            </div>
            <label htmlFor="resume-upload" className={`inline-block ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <div className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 ${isProcessing ? 'bg-primary/50 text-primary-foreground/50' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                Browse Files
              </div>
              <input
                id="resume-upload"
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </label>
             <p className="text-xs text-muted-foreground pt-2">Supports PDF, DOC, DOCX (max 10MB)</p>
          </div>
        )}
      </div>

      {file && (
        <Button className="w-full text-base py-6" onClick={handleAnalyzeResume} disabled={isProcessing || !file}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            "Upload and Analyze Resume"
          )}
        </Button>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Upload your resume in PDF, DOC, or DOCX format.</p>
            <p>2. Our AI-powered Python backend extracts the text and analyzes its content, structure, and keywords.</p>
            <p>3. Receive a detailed report with an overall score, section-specific feedback, and actionable suggestions.</p>
            <p>4. Use the insights to optimize your resume for Applicant Tracking Systems (ATS) and impress recruiters!</p>
        </CardContent>
      </Card>
    </div>
  );
}
