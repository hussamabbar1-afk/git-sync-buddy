import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendChatMessage } from "@/lib/chat.functions";

type ChatMessage = { role: "user" | "assistant"; content: string };

const storageKey = (widgetKey: string) => `handwerkai_chat_${widgetKey}`;

export function ChatWidget({
  widgetKey,
  welcomeMessage,
}: {
  widgetKey: string;
  welcomeMessage?: string | null;
}) {
  const send = useServerFn(sendChatMessage);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    conversationId.current = sessionStorage.getItem(storageKey(widgetKey));
  }, [widgetKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    setPending(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);

    try {
      const result = await send({
        data: {
          widget_key: widgetKey,
          message: text,
          ...(conversationId.current ? { conversation_id: conversationId.current } : {}),
        },
      });

      if (result.conversation_id) {
        conversationId.current = result.conversation_id;
        sessionStorage.setItem(storageKey(widgetKey), result.conversation_id);
      }

      setMessages((m) => [
        ...m,
        { role: "assistant", content: result.message || "…" },
      ]);
    } catch {
      setError("Die Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex h-80 flex-col rounded-md border">
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {welcomeMessage ? (
          <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-xs">
            {welcomeMessage}
          </div>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {message.content}
          </div>
        ))}
        {pending ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Antwort wird geladen …
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="border-t px-3 py-2 text-xs text-destructive">{error}</p>
      ) : null}

      <div className="flex gap-2 border-t p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Nachricht schreiben"
          disabled={pending}
        />
        <Button onClick={() => void handleSend()} disabled={pending || !input.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
