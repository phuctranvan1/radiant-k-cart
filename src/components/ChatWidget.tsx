import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beauty-advisor`;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "안녕하세요 ✨ I'm **Soomi**, your GLOW beauty advisor. Ask me about routines, ingredients, or product picks.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    let acc = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-10) }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Too many requests — please slow down.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add funds in workspace.");
        else toast.error("Chat unavailable right now.");
        setLoading(false);
        return;
      }

      // Push empty assistant placeholder
      setMessages((p) => [...p, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json) as {
              choices?: { delta?: { content?: string } }[];
            };
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              acc += content;
              setMessages((p) =>
                p.map((m, i) => (i === p.length - 1 ? { ...m, content: acc } : m)),
              );
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-gold shadow-gold flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="AI Beauty Advisor"
      >
        {open ? (
          <X className="text-primary-foreground" />
        ) : (
          <MessageCircle className="text-primary-foreground" />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[92vw] max-w-md h-[70vh] luxe-card rounded-2xl shadow-luxe flex flex-col overflow-hidden transition-all duration-400 origin-bottom-right ${
          open
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-90 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-gold p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Sparkles className="text-primary-foreground" size={18} />
          </div>
          <div>
            <h3 className="font-display text-lg text-primary-foreground leading-none">Soomi</h3>
            <p className="text-[11px] text-primary-foreground/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
              AI Beauty Advisor
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              style={{ animation: `msg-appear 0.3s ease-out ${Math.min(i * 0.05, 0.3)}s both` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-gold text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_strong]:text-gold">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {/* Typing indicator */}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div
              className="flex justify-start"
              style={{ animation: "msg-appear 0.3s ease-out both" }}
            >
              <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span
                  className="w-2 h-2 rounded-full bg-muted-foreground/60"
                  style={{ animation: "typing-dot 1.4s ease-in-out infinite" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-muted-foreground/60"
                  style={{ animation: "typing-dot 1.4s ease-in-out 0.2s infinite" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-muted-foreground/60"
                  style={{ animation: "typing-dot 1.4s ease-in-out 0.4s infinite" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about routines, ingredients..."
            className="flex-1 bg-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
            disabled={loading}
          />
          <Button
            onClick={send}
            disabled={loading || !input.trim()}
            size="icon"
            className="rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90 transition-all hover:scale-105 active:scale-95"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
