import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatWithAssistant, useGenerateContent, ChatMessage, ChatMessageRole } from "@workspace/api-client-react";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Hash, Video, Calendar, BrainCircuit, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chatMutation = useChatWithAssistant();
  const generateMutation = useGenerateContent();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    setError(null);
    const userMsg: ChatMessage = { role: ChatMessageRole.user, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    chatMutation.mutate({ data: { message: input, history: messages } }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: ChatMessageRole.assistant, content: data.reply }]);
      },
      onError: (err: any) => {
        const status = err?.response?.status ?? err?.status;
        if (status === 403) {
          setError("premium");
        } else if (status === 401) {
          setError("auth");
        } else {
          setError("AI service is temporarily unavailable. Please try again.");
        }
      }
    });
  };

  const handleQuickAction = (type: "caption" | "hashtags" | "viral_ideas" | "content_plan") => {
    setError(null);
    generateMutation.mutate({ data: { type, topic: "My latest video" } }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: ChatMessageRole.assistant, content: data.result }]);
      },
      onError: (err: any) => {
        const status = err?.response?.status ?? err?.status;
        if (status === 403) setError("premium");
        else if (status === 401) setError("auth");
        else setError("Failed to generate content. Please try again.");
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">AI Content Assistant</h1>
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-semibold">Premium</span>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            { type: "caption" as const, icon: Sparkles, label: "Caption" },
            { type: "hashtags" as const, icon: Hash, label: "Hashtags" },
            { type: "viral_ideas" as const, icon: Video, label: "Viral Ideas" },
            { type: "content_plan" as const, icon: Calendar, label: "Content Plan" },
          ].map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant="outline"
              onClick={() => handleQuickAction(type)}
              disabled={generateMutation.isPending}
              className="bg-card border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
            >
              <Icon className="w-4 h-4 mr-2" /> {label}
            </Button>
          ))}
        </div>

        {/* Error banners */}
        {error === "premium" && (
          <div className="mb-3 flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-primary">Premium required.</span>
              <span className="text-muted-foreground ml-1">Upgrade to use the AI assistant.</span>
            </div>
            <Button asChild size="sm" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link href="/upgrade">Upgrade ₦2,000/mo</Link>
            </Button>
          </div>
        )}
        {error === "auth" && (
          <div className="mb-3 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <span className="text-muted-foreground">Session expired. Please <a href="/sign-in" className="text-primary underline">sign in again</a>.</span>
          </div>
        )}
        {error && error !== "premium" && error !== "auth" && (
          <div className="mb-3 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <span className="text-muted-foreground">{error}</span>
          </div>
        )}

        {/* Chat window */}
        <Card className="flex-1 flex flex-col border-border bg-card overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
                <BrainCircuit className="w-16 h-16 mb-4" />
                <p className="font-medium">How can I help you grow today?</p>
                <p className="text-xs mt-1">Ask me anything about content, captions, hashtags, or strategy.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {(chatMutation.isPending || generateMutation.isPending) && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground max-w-[80%] rounded-2xl rounded-bl-sm p-3.5 text-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-border bg-background/50">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask for ideas, captions, strategy…"
                className="bg-muted border-none focus-visible:ring-primary/50"
              />
              <Button
                type="submit"
                disabled={chatMutation.isPending || !input.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
