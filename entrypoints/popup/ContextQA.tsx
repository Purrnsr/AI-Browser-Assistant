import React, { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { askPageQuestionStream } from "./ollamaChat";
import type { Message } from "./ollamaChat";

export const ContextQA: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pageContext, setPageContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Extracting page context...");

  useEffect(() => {
    async function loadTabContext() {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];

        if (!activeTab?.id) {
          setStatus("No active tab found.");
          return;
        }

        if (
          !activeTab.url ||
          activeTab.url.startsWith("chrome://") ||
          activeTab.url.startsWith("edge://") ||
          activeTab.url.startsWith("about:")
        ) {
          setStatus("Cannot extract context on browser internal pages.");
          return;
        }

        // Direct execution on the active tab DOM
        const results = await browser.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            const clone = document.body.cloneNode(true) as HTMLElement;
            const removeSelectors = [
              "script",
              "style",
              "noscript",
              "nav",
              "header",
              "footer",
              "aside",
              ".vector-header-container",
              ".vector-toc",
              "#mw-navigation",
            ];
            clone.querySelectorAll(removeSelectors.join(",")).forEach((el) => el.remove());
            return (clone.innerText || clone.textContent || "")
                .replace(/\n\s*\n/g, "\n")
                .trim()
                .slice(0, 10000);
            },
        });

        const extractedText = results?.[0]?.result as string | undefined;
        if (extractedText && extractedText.length > 0) {
          setPageContext(extractedText);
          setStatus(`Page context loaded (${extractedText.length} chars) ✓`);
        } else {
          setStatus("No readable text found on page.");
        }
      } catch (err) {
        console.error("Extraction error:", err);
        setStatus("Could not extract tab context (Refresh page).");
      }
    }

    loadTabContext();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setIsLoading(true);

    try {
      await askPageQuestionStream(
        userText,
        pageContext,
        messages,
        (chunk: string) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            const lastMessage = updated[lastIndex];

            if (lastMessage && lastMessage.role === "assistant") {
              updated[lastIndex] = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
            }
            return updated;
          });
        }
      );
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Error: Ollama runtime unreachable. Ensure Ollama is running." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "380px" }}>
      <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>
        {status}
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: "12px", color: "#888", textAlign: "center", marginTop: "40px" }}>
            Ask anything about this webpage...
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              whiteSpace: "pre-wrap",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#2563eb" : "#f1f5f9",
              color: msg.role === "user" ? "#fff" : "#1e293b",
              maxWidth: "85%",
            }}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "8px",
            fontSize: "12px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "8px 14px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};