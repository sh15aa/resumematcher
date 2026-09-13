/**
 * Multi-Provider AI Gateway
 * Supports Google Gemini, OpenAI, xAI Grok, and Lovable AI.
 * Handles server-side streaming and structured JSON output with zero external dependencies.
 */

export type AiProvider = "gemini" | "openai" | "grok" | "lovable";

export interface ActiveAiConfig {
  provider: AiProvider | null;
  apiKey: string;
  model: string;
}

/**
 * Discovers the active AI provider based on environment variables.
 * Cascade Priority:
 * 1. Explicit AI_PROVIDER variable if specified
 * 2. GEMINI_API_KEY (Google Gemini 3.8 Flash — Recommended: free tier, 1M context, fastest)
 * 3. OPENAI_API_KEY (OpenAI GPT-4o-mini / GPT-4o)
 * 4. GROK_API_KEY / XAI_API_KEY (xAI Grok 2)
 * 5. LOVABLE_API_KEY (Lovable Gateway)
 */
export function getActiveAiConfig(): ActiveAiConfig {
  const explicit = (process.env["AI_PROVIDER"] || "").trim().toLowerCase() as AiProvider;

  const geminiKey = (process.env["GEMINI_API_KEY"] || "").trim();
  const geminiModel = (process.env["GEMINI_MODEL"] || "gemini-3.8-flash").trim();

  const openAiKey = (process.env["OPENAI_API_KEY"] || "").trim();
  const openAiModel = (process.env["OPENAI_MODEL"] || "gpt-4o-mini").trim();

  const grokKey = (process.env["GROK_API_KEY"] || process.env["XAI_API_KEY"] || "").trim();
  const grokModel = (process.env["GROK_MODEL"] || "grok-2-latest").trim();

  const lovableKey = (process.env["LOVABLE_API_KEY"] || "").trim();

  if (explicit === "gemini" && geminiKey) {
    return { provider: "gemini", apiKey: geminiKey, model: geminiModel };
  }
  if (explicit === "openai" && openAiKey) {
    return { provider: "openai", apiKey: openAiKey, model: openAiModel };
  }
  if (explicit === "grok" && grokKey) {
    return { provider: "grok", apiKey: grokKey, model: grokModel };
  }
  if (explicit === "lovable" && lovableKey) {
    return { provider: "lovable", apiKey: lovableKey, model: "openai/gpt-5.6-sol" };
  }

  // Automatic preference hierarchy: Gemini -> OpenAI -> Grok -> Lovable
  if (geminiKey) return { provider: "gemini", apiKey: geminiKey, model: geminiModel };
  if (openAiKey) return { provider: "openai", apiKey: openAiKey, model: openAiModel };
  if (grokKey) return { provider: "grok", apiKey: grokKey, model: grokModel };
  if (lovableKey) return { provider: "lovable", apiKey: lovableKey, model: "openai/gpt-5.6-sol" };

  return { provider: null, apiKey: "", model: "" };
}

export interface StreamAiOptions {
  systemPrompt: string;
  userPrompt: string;
  isJson?: boolean;
}

export async function streamAiText(
  options: StreamAiOptions,
): Promise<
  | { ok: true; stream: ReadableStream<Uint8Array>; provider: AiProvider }
  | { ok: false; status: number; message: string }
> {
  const config = getActiveAiConfig();
  if (!config.provider || !config.apiKey) {
    return {
      ok: false,
      status: 400,
      message:
        "No AI API key configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or GROK_API_KEY in your environment.",
    };
  }

  switch (config.provider) {
    case "gemini":
      return streamGemini(config.apiKey, config.model, options);
    case "openai":
      return streamOpenAiCompatible(
        "https://api.openai.com/v1/chat/completions",
        config.apiKey,
        config.model,
        options,
        "openai",
      );
    case "grok":
      return streamOpenAiCompatible(
        "https://api.x.ai/v1/chat/completions",
        config.apiKey,
        config.model,
        options,
        "grok",
      );
    case "lovable":
      return streamLovable(config.apiKey, options);
    default:
      return { ok: false, status: 400, message: `Unsupported provider: ${config.provider}` };
  }
}

/**
 * Google Gemini Server-Sent Events (SSE) Streaming
 */
async function streamGemini(
  apiKey: string,
  model: string,
  options: StreamAiOptions,
): Promise<
  | { ok: true; stream: ReadableStream<Uint8Array>; provider: "gemini" }
  | { ok: false; status: number; message: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const body = {
    systemInstruction: {
      parts: [{ text: options.systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: options.userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      ...(options.isJson ? { responseMimeType: "application/json" } : {}),
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    return {
      ok: false,
      status: response.status || 500,
      message: `Gemini API error (${response.status}): ${errorText.slice(0, 300)}`,
    };
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = response.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const event = JSON.parse(payload);
              const textDelta = event?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textDelta) {
                controller.enqueue(encoder.encode(textDelta));
              }
            } catch {
              // Ignore partial or unparseable SSE frame
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });

  return { ok: true, stream, provider: "gemini" };
}

/**
 * OpenAI & xAI Grok Compatible SSE Streaming
 */
async function streamOpenAiCompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  options: StreamAiOptions,
  providerName: "openai" | "grok",
): Promise<
  | { ok: true; stream: ReadableStream<Uint8Array>; provider: "openai" | "grok" }
  | { ok: false; status: number; message: string }
> {
  const body = {
    model,
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userPrompt },
    ],
    stream: true,
    temperature: 0.2,
    ...(options.isJson ? { response_format: { type: "json_object" } } : {}),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    return {
      ok: false,
      status: response.status || 500,
      message: `${providerName.toUpperCase()} API error (${response.status}): ${errorText.slice(0, 300)}`,
    };
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = response.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const event = JSON.parse(payload);
              const textDelta = event?.choices?.[0]?.delta?.content;
              if (textDelta) {
                controller.enqueue(encoder.encode(textDelta));
              }
            } catch {
              // Ignore partial frame
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });

  return { ok: true, stream, provider: providerName };
}

/**
 * Lovable AI Gateway streaming (legacy compatibility)
 */
async function streamLovable(
  apiKey: string,
  options: StreamAiOptions,
): Promise<
  | { ok: true; stream: ReadableStream<Uint8Array>; provider: "lovable" }
  | { ok: false; status: number; message: string }
> {
  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      reasoning: { effort: "low", summary: "auto" },
      instructions: options.systemPrompt,
      input: [{ role: "user", content: [{ type: "input_text", text: options.userPrompt }] }],
      ...(options.isJson ? { text: { format: { type: "json_object" } } } : {}),
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return {
      ok: false,
      status: upstream.status || 500,
      message: `Lovable API error (${upstream.status}): ${detail.slice(0, 200)}`,
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
                /* ignore */
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

  return { ok: true, stream, provider: "lovable" };
}

/**
 * Backward compatibility helper for legacy callGateway calls
 */
export async function callGateway(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<
  { ok: true; stream: ReadableStream<Uint8Array> } | { ok: false; status: number; message: string }
> {
  const instructions = (body["instructions"] as string) || "";
  const input = (body["input"] as any[])?.[0]?.content?.[0]?.text || "";
  const result = await streamAiText({
    systemPrompt: instructions,
    userPrompt: input,
    isJson: Boolean(body["text"]),
  });
  if (result.ok) {
    return { ok: true, stream: result.stream };
  }
  return { ok: false, status: result.status, message: result.message };
}

export function textStreamResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
