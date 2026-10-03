import { useState } from 'react';
import { browser } from 'wxt/browser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  body: string;
}

interface GetEmailsResponse {
  success: boolean;
  emails?: EmailMessage[];
  error?: string;
}

interface SummarizeEmailResponse {
  success: boolean;
  summary?: string;
  error?: string;
}

interface GenerateEmailReplyResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

export function EmailAssistant() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] =
    useState<EmailMessage | null>(null);

  const [summary, setSummary] = useState('');
  const [reply, setReply] = useState('');

  const [userIntent, setUserIntent] = useState('');
  const [responseStyle, setResponseStyle] =
    useState('Professional and polite');

  const [loadingEmails, setLoadingEmails] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [generatingReply, setGeneratingReply] =
    useState(false);

  const [error, setError] = useState('');

  const loadEmails = async () => {
    setLoadingEmails(true);
    setError('');
    setSummary('');
    setReply('');
    setSelectedEmail(null);

    try {
      const response =
        (await browser.runtime.sendMessage({
          type: 'EMAIL_GET_RECENT',
          maxResults: 10,
        })) as GetEmailsResponse;

      if (!response?.success) {
        throw new Error(
          response?.error || 'Failed to retrieve emails.'
        );
      }

      setEmails(response.emails || []);
    } catch (err) {
      console.error(
        '[Email Assistant] Failed to load emails:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to retrieve Gmail messages.'
      );
    } finally {
      setLoadingEmails(false);
    }
  };

  const summarizeSelectedEmail = async () => {
    if (!selectedEmail) {
      return;
    }

    setSummarizing(true);
    setError('');

    try {
      const response =
        (await browser.runtime.sendMessage({
          type: 'EMAIL_SUMMARIZE',
          email: selectedEmail,
        })) as SummarizeEmailResponse;

      if (!response?.success) {
        throw new Error(
          response?.error || 'Failed to summarize email.'
        );
      }

      setSummary(response.summary || '');
    } catch (err) {
      console.error(
        '[Email Assistant] Summarization failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to summarize the email.'
      );
    } finally {
      setSummarizing(false);
    }
  };

  const generateReply = async () => {
    if (!selectedEmail) {
      return;
    }

    if (!userIntent.trim()) {
      setError(
        'Please describe what you want to say in the reply.'
      );
      return;
    }

    setGeneratingReply(true);
    setError('');

    try {
      const response =
        (await browser.runtime.sendMessage({
          type: 'EMAIL_REPLY_GENERATE',
          email: selectedEmail,
          userIntent,
          responseStyle,
        })) as GenerateEmailReplyResponse;

      if (!response?.success) {
        throw new Error(
          response?.error || 'Failed to generate reply.'
        );
      }

      setReply(response.reply || '');
    } catch (err) {
      console.error(
        '[Email Assistant] Reply generation failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate the reply.'
      );
    } finally {
      setGeneratingReply(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        paddingBottom: '10px',
      }}
    >
      <button
        onClick={loadEmails}
        disabled={loadingEmails}
        style={{
          width: '100%',
          padding: '8px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loadingEmails ? 'default' : 'pointer',
          fontSize: '12.5px',
        }}
      >
        {loadingEmails
          ? 'Connecting to Gmail...'
          : 'Connect & Load Recent Emails'}
      </button>

      {error && (
        <div
          style={{
            color: '#dc2626',
            fontSize: '12px',
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}

      {emails.length > 0 && (
        <div>
          <strong
            style={{
              display: 'block',
              marginBottom: '6px',
              color: '#0f172a',
              fontSize: '12px',
            }}
          >
            RECENT EMAILS
          </strong>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  setSummary('');
                  setReply('');
                  setError('');
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background:
                    selectedEmail?.id === email.id
                      ? '#eff6ff'
                      : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '11.5px',
                    color: '#0f172a',
                  }}
                >
                  {email.subject}
                </div>

                <div
                  style={{
                    marginTop: '2px',
                    fontSize: '10.5px',
                    color: '#64748b',
                  }}
                >
                  {email.sender}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedEmail && (
        <>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '9px',
              background: '#f8fafc',
            }}
          >
            <strong
              style={{
                display: 'block',
                color: '#0f172a',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              {selectedEmail.subject}
            </strong>

            <div
              style={{
                fontSize: '10.5px',
                color: '#64748b',
                marginBottom: '7px',
              }}
            >
              From: {selectedEmail.sender}
            </div>

            <div
              style={{
                fontSize: '11.5px',
                color: '#334155',
                whiteSpace: 'pre-wrap',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              {selectedEmail.body}
            </div>
          </div>

          <button
            onClick={summarizeSelectedEmail}
            disabled={summarizing}
            style={{
              width: '100%',
              padding: '8px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: summarizing ? 'default' : 'pointer',
              fontSize: '12.5px',
            }}
          >
            {summarizing
              ? 'Summarizing Email...'
              : 'Summarize Email'}
          </button>

          {summary && !summarizing && (
            <div
              style={{
                background: '#f8fafc',
                padding: '9px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '11.5px',
              }}
            >
              <strong>AI SUMMARY</strong>

              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>
          )}

          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '10px',
            }}
          >
            <strong
              style={{
                display: 'block',
                color: '#0f172a',
                fontSize: '12px',
                marginBottom: '6px',
              }}
            >
              REPLY ASSISTANT
            </strong>

            <textarea
              value={userIntent}
              onChange={(event) =>
                setUserIntent(event.target.value)
              }
              placeholder="What do you want to say in your reply?"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                resize: 'vertical',
                fontSize: '11.5px',
              }}
            />

            <select
              value={responseStyle}
              onChange={(event) =>
                setResponseStyle(event.target.value)
              }
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '7px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '11.5px',
                background: '#fff',
              }}
            >
              <option>Professional and polite</option>
              <option>Brief and direct</option>
              <option>Friendly and professional</option>
              <option>Formal</option>
            </select>

            <button
              onClick={generateReply}
              disabled={
                generatingReply || !userIntent.trim()
              }
              style={{
                width: '100%',
                marginTop: '7px',
                padding: '8px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor:
                  generatingReply || !userIntent.trim()
                    ? 'default'
                    : 'pointer',
                fontSize: '12.5px',
              }}
            >
              {generatingReply
                ? 'Generating Reply...'
                : 'Generate Reply Suggestion'}
            </button>
          </div>

          {reply && !generatingReply && (
            <div
              style={{
                background: '#f8fafc',
                padding: '9px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#0f172a',
                  marginBottom: '5px',
                }}
              >
                DRAFT REPLY — REVIEW BEFORE SENDING
              </strong>

              <textarea
                value={reply}
                onChange={(event) =>
                  setReply(event.target.value)
                }
                rows={7}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '7px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  resize: 'vertical',
                  fontSize: '11.5px',
                  background: '#fff',
                }}
              />

              <div
                style={{
                  marginTop: '6px',
                  fontSize: '10.5px',
                  color: '#64748b',
                }}
              >
                The generated response is only a suggestion.
                Review and edit it before using it in your
                email client.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}