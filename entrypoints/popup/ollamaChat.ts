export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function askPageQuestionStream(
  userQuery: string,
  pageContext: string,
  history: Message[],
  onChunk: (chunk: string) => void,
  model = "llama3.2"
): Promise<void> {
  const systemPrompt = `You are an AI browser assistant. Answer the user's question directly based on the provided webpage context. If the webpage context contains relevant information, use and cite it directly.

WEBPAGE CONTEXT:
${pageContext}`;

  const payloadMessages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userQuery },
  ];

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      stream: true,
      keep_alive: "30m",
      options: {
        temperature: 0.2,
        num_predict: 256,   // Limits response length to avoid long rambling
        num_ctx: 4096,       // Keeps the KV cache bounded
      },
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to connect to local Ollama runtime.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const rawChunk = decoder.decode(value, { stream: true });
    const lines = rawChunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          onChunk(parsed.message.content);
        }
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    }
  }
}