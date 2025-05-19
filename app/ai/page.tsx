"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { MainNav } from "@/components/main-nav"
import { Bot, Loader2, Send, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

type Message = {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
}

const predefinedQuestions = [
  "How can I improve my resume for tech roles?",
  "What are some common interview questions for software engineers?",
  "How should I follow up after an interview?",
  "What's the best way to negotiate a job offer?",
  "How can I stand out in a competitive job market?",
  "What skills are most in-demand for data science roles?",
]

export default function AIPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      content:
        "You are a helpful AI career assistant that provides advice on job searching, resume writing, and interview preparation.",
      role: "system",
      timestamp: new Date(),
    },
    {
      id: "welcome-1",
      content: "Hello! I'm your AI career assistant. How can I help you with your job search or resume today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Prepare the messages for the API call
      const messagesToSend = messages.concat(userMessage)

      // Call the API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messagesToSend }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error(`API error (${response.status}):`, errorData)
        throw new Error(`API request failed with status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.response) {
        throw new Error("Invalid response format from API")
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      // Add an error message in the chat
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error while generating a response. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuestionClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <DashboardShell>
        <DashboardHeader
          heading="AI Career Assistant"
          text="Get personalized career advice, resume tips, and job search strategies."
        />
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="resume-help">Resume Help</TabsTrigger>
            <TabsTrigger value="interview-prep">Interview Prep</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Chat with AI Assistant</CardTitle>
                  <CardDescription>Ask questions about your job search, resume, or career</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {messages
                        .filter((msg) => msg.role !== "system")
                        .map((message) => (
                          <div
                            key={message.id}
                            className={cn("flex", {
                              "justify-end": message.role === "user",
                              "justify-start": message.role === "assistant",
                            })}
                          >
                            <div
                              className={cn("flex max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm", {
                                "bg-primary text-primary-foreground": message.role === "user",
                                "bg-muted": message.role === "assistant",
                              })}
                            >
                              <div className="flex items-center gap-2">
                                {message.role === "assistant" ? (
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>
                                      <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>
                                      <User className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <span className="font-semibold">
                                  {message.role === "user" ? "You" : "AI Assistant"}
                                </span>
                              </div>
                              <div className="break-words whitespace-pre-wrap">{message.content}</div>
                            </div>
                          </div>
                        ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              <div className="col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Suggested Questions</CardTitle>
                    <CardDescription>Click on a question to ask the AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {predefinedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left text-sm h-auto py-2 px-3 whitespace-normal"
                          onClick={() => handleQuestionClick(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="resume-help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Optimization</CardTitle>
                <CardDescription>Get AI-powered suggestions to improve your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Our AI can analyze your resume and provide personalized suggestions to help you stand out to
                    employers and applicant tracking systems.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Content Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Identify missing key skills and experiences</li>
                          <li>Suggest stronger action verbs</li>
                          <li>Recommend quantifiable achievements</li>
                          <li>Optimize for relevant keywords</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Format & Structure</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Improve readability and organization</li>
                          <li>Ensure ATS compatibility</li>
                          <li>Optimize section ordering</li>
                          <li>Enhance visual hierarchy</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <Button className="w-full" asChild>
                    <a href="/resume">Analyze Your Resume</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="interview-prep" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interview Preparation</CardTitle>
                <CardDescription>Practice with AI-powered interview simulations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Practice common interview questions with our AI assistant and get feedback on your responses to
                    improve your interview skills.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Technical Interviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Programming challenges</li>
                          <li>System design questions</li>
                          <li>Technical knowledge assessment</li>
                          <li>Problem-solving scenarios</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Behavioral Interviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>STAR method responses</li>
                          <li>Leadership and teamwork examples</li>
                          <li>Conflict resolution scenarios</li>
                          <li>Cultural fit assessment</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <Button className="w-full">Start Interview Practice</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </div>
  )
}
