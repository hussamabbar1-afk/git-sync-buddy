import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FALLBACK_CHAT_ENDPOINT = "https://mohamad-alabar.app.n8n.cloud/webhook/chat";

const schema = z.object({
  widget_key: z.string().min(1),
  message: z.string().min(1),
  conversation_id: z.string().min(1).optional(),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const endpoint = process.env['N8N_CHAT_ENDPOINT'] || FALLBACK_CHAT_ENDPOINT;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        data.conversation_id
          ? {
              widget_key: data.widget_key,
              conversation_id: data.conversation_id,
              message: data.message,
            }
          : { widget_key: data.widget_key, message: data.message },
      ),
    });

    if (!res.ok) {
      throw new Error(`Chat-Backend antwortete mit Status ${res.status}`);
    }

    const raw = (await res.json().catch(() => null)) as unknown;
    const payload = Array.isArray(raw) ? raw[0] : raw;

    if (!payload || typeof payload !== "object") {
      throw new Error("Ungültige Antwort vom Chat-Backend");
    }

    const body = payload as { message?: unknown; conversation_id?: unknown };

    return {
      message: typeof body.message === "string" ? body.message : "",
      conversation_id:
        typeof body.conversation_id === "string" ? body.conversation_id : null,
    };
  });
