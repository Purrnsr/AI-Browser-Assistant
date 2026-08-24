import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { browser } from 'wxt/browser';
import { askPageQuestionStream, type Message } from './ollamaChat';

export function ContextQA() {
  const [context, setContext] = useState<string>('');
  const [contextStatus, setContextStatus] = useState<string>('Extracting page context...');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPageText() {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab?.id) {
          setContextStatus('No active tab detected');
          return;
        }

        const results = await browser.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            const clone = document.body.cloneNode(true) as HTMLElement;
            const removeSelectors = [
              'script', 'style', 'noscript', 'nav', 'header', 'footer',
              'aside', '.vector-header-container', '.vector-toc', '#mw-navigation'
            ];
            clone.querySelectorAll(removeSelectors.join(',')).forEach((el) => el.remove());
            return (clone.innerText || clone.textContent || '').replace(/\n\s*\n/g, '\n').trim();
          },
        });

        const extracted = results?.[0]?.result || '';
        if (extracted.trim().length > 0) {
          const sliced = extracted.slice(0, 10000);
          setContext(sliced);
          setContextStatus(`Page context loaded (${sliced.length} chars) ✓`);
        } else {
          setContextStatus('No readable text found on this page');
        }
      } catch (err) {
        console.error('Extraction error:', err);
        setContextStatus('Unable to extract content. Refresh the tab and retry.');
      }
    }
    loadPageText();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userQuery = input.trim();
    setInput('');

    const previousHistory = [...messages];

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userQuery },
      { role: 'assistant', content: '' },
    ]);
    setIsStreaming(true);

    try {
      await askPageQuestionStream(
        userQuery,
        context,
        previousHistory,
        (chunk: string) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            const targetMessage = updated[lastIdx];
            
            if (targetMessage && targetMessage.role === 'assistant') {
              updated[lastIdx] = {
                ...targetMessage,
                content: targetMessage.content + chunk,
              };
            }
            return updated;
          });
        }
      );
    } catch (err: any) {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0) {
          updated[lastIdx] = {
            role: 'assistant',
            content: `⚠️ Error: ${err?.message || 'Failed to generate answer'}`,
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', width: '100%' }}>
      {/* Context Badge */}
      <div style={{
        fontSize: '11px',
        color: context ? '#059669' : '#64748b',
        background: context ? '#ecfdf5' : '#f8fafc',
        padding: '5px 8px',
        borderRadius: '5px',
        textAlign: 'center',
        marginBottom: '8px',
        border: '1px solid',
        borderColor: context ? '#a7f3d0' : '#e2e8f0',
        flexShrink: 0
      }}>
        {contextStatus}
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingRight: '4px',
        marginBottom: '10px'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '40px' }}>
            Ask anything about this webpage!
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              backgroundColor: m.role === 'user' ? '#2563eb' : '#f1f5f9',
              color: m.role === 'user' ? '#ffffff' : '#0f172a',
              fontSize: '12.5px',
              lineHeight: '1.4',
              wordBreak: 'break-word',
            }}
          >
            {m.role === 'user' ? (
              m.content
            ) : (
              <div style={{ margin: 0 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content || (isStreaming && idx === messages.length - 1 ? '● ● ●' : '')}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '6px', flexShrink: 0, width: '100%' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isStreaming}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '8px 10px',
            fontSize: '12.5px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          style={{
            padding: '8px 14px',
            backgroundColor: isStreaming || !input.trim() ? '#94a3b8' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '12.5px',
            fontWeight: 500,
            flexShrink: 0
          }}
        >
          {isStreaming ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}