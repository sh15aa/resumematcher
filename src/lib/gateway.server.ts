/** Shared helpers for calling the Lovable AI Gateway Responses API and streaming text back. */

export function gatewayErrorMessage(status: number, detail: string): string {
  if (status === 429) return "Too many requests right now — please try again in a moment.";
  if (status === 402)
    return "AI credits are exhausted. Add credits in your workspace settings to continue.";
  if (status === 403) return "AI access is blocked for this workspace.";
  return `The AI service returned an error (${status}). ${detail.slice(0, 200)}`;
}

export async function callGateway(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<
  { ok: true; stream: ReadableStream<Uint8Array> } | { ok: false; status: number; message: string }
> {
  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return {
      ok: false,
      status: upstream.status || 500,
      message: gatewayErrorMessage(upstream.status, detail),
    };
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            for (const line of frame.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const event = JSON.parse(payload) as { type?: string; delta?: string };
                if (event.type === "response.output_text.delta" && event.delta) {
                  controller.enqueue(encoder.encode(event.delta));
                }
              } catch {
                /* ignore malformed frame */
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });

  return { ok: true, stream };
}

export function textStreamResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
