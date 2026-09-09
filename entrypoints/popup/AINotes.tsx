import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { browser } from 'wxt/browser';
import {
  getSavedNotes,
  saveNote,
  updateNote,
  deleteNote,
  type SavedNote,
} from '../../src/features/ai-notes/storage';

interface ExtractedImage {
  src: string;
  alt: string;
  caption: string;
}

interface AINotesProps {
  content: string;
  images: ExtractedImage[];
}

export function AINotes({ content, images }: AINotesProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedNote, setSavedNote] = useState<SavedNote | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await getSavedNotes();
        setSavedNotes(storedNotes);
      } catch (err) {
        console.error('[AI Notes] Failed to load saved notes:', err);
      }
    };

    loadNotes();
  }, []);

  const generateNotes = async () => {
    if (!content.trim()) {
      setError('Please extract the webpage before generating notes.');
      return;
    }

    setLoading(true);
    setError('');
    setEditing(false);

    try {
      const response = await browser.runtime.sendMessage({
        type: 'AI_NOTES_GENERATE',
        content,
      });

      if (!response?.success) {
        throw new Error(
          response?.error || 'Failed to generate notes.'
        );
      }

      setNotes(response.notes || '');
      setSavedNote(null);
    } catch (err) {
      console.error('[AI Notes] Generation failed:', err);

      setError(
        'Unable to generate notes. Make sure Ollama is running and the llama3.2 model is available.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!notes.trim()) {
      return;
    }

    try {
      setError('');

      if (savedNote) {
        await updateNote(savedNote.id, notes);

        const updatedSavedNote = {
          ...savedNote,
          content: notes,
          updatedAt: Date.now(),
        };

        setSavedNote(updatedSavedNote);

        setSavedNotes((previous) =>
          previous.map((note) =>
            note.id === savedNote.id
              ? updatedSavedNote
              : note
          )
        );
      } else {
        const newNote = await saveNote(notes);

        setSavedNote(newNote);
        setSavedNotes((previous) => [newNote, ...previous]);
      }

      setEditing(false);
    } catch (err) {
      console.error('[AI Notes] Failed to save note:', err);
      setError('Unable to save the note.');
    }
  };

  const handleDelete = async () => {
    if (!savedNote) {
      return;
    }

    try {
      await deleteNote(savedNote.id);

      setSavedNotes((previous) =>
        previous.filter((note) => note.id !== savedNote.id)
      );

      setSavedNote(null);
      setNotes('');
      setEditing(false);
    } catch (err) {
      console.error('[AI Notes] Failed to delete note:', err);
      setError('Unable to delete the note.');
    }
  };

  const openSavedNote = (note: SavedNote) => {
    setNotes(note.content);
    setSavedNote(note);
    setEditing(false);
    setError('');
  };

  /*
   * Render AI-generated Markdown while replacing
   * [[IMAGE:N]] markers with original webpage images.
   */
  const renderNotesWithImages = () => {
    if (!notes.trim()) {
      return null;
    }

    const markerRegex = /\[\[IMAGE:(\d+)\]\]/g;

    const parts: Array<{
      type: 'markdown' | 'image';
      content?: string;
      index?: number;
    }> = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = markerRegex.exec(notes)) !== null) {
      const markdownBefore = notes.slice(
        lastIndex,
        match.index
      );

      if (markdownBefore.trim()) {
        parts.push({
          type: 'markdown',
          content: markdownBefore,
        });
      }

      parts.push({
        type: 'image',
        index: Number(match[1]),
      });

      lastIndex = markerRegex.lastIndex;
    }

    const remainingMarkdown = notes.slice(lastIndex);

    if (remainingMarkdown.trim()) {
      parts.push({
        type: 'markdown',
        content: remainingMarkdown,
      });
    }

    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'markdown') {
            return (
              <ReactMarkdown
                key={`markdown-${index}`}
                remarkPlugins={[remarkGfm]}
              >
                {part.content || ''}
              </ReactMarkdown>
            );
          }

          const imageIndex = part.index ?? -1;
          const image = images[imageIndex];

          if (!image) {
            console.warn(
              `[AI Notes] Image marker [[IMAGE:${imageIndex}]] has no matching image.`
            );

            return null;
          }

          return (
            <div
              key={`image-${imageIndex}-${index}`}
              style={{
                margin: '12px 0',
              }}
            >
              <img
                src={image.src}
                alt={
                  image.alt ||
                  `Webpage image ${imageIndex + 1}`
                }
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              />

              {(image.caption || image.alt) && (
                <div
                  style={{
                    marginTop: '5px',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    color: '#64748b',
                  }}
                >
                  {image.caption || image.alt}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={generateNotes}
        disabled={loading || !content.trim()}
        style={{
          width: '100%',
          padding: '8px',
          background: '#7c3aed',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'default' : 'pointer',
          fontSize: '12.5px',
        }}
      >
        {loading
          ? 'Generating Notes...'
          : 'Generate AI Notes'}
      </button>

      {error && (
        <div
          style={{
            color: '#dc2626',
            fontSize: '12px',
            marginTop: '8px',
          }}
        >
          {error}
        </div>
      )}

      {savedNotes.length > 0 && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px',
            background: '#f1f5f9',
            borderRadius: '6px',
          }}
        >
          <strong
            style={{
              fontSize: '12px',
              color: '#0f172a',
            }}
          >
            SAVED NOTES
          </strong>

          <div style={{ marginTop: '6px' }}>
            {savedNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => openSavedNote(note)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px',
                  marginBottom: '4px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                }}
              >
                {note.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {notes && !loading && (
        <div
          style={{
            marginTop: '10px',
            background: '#f8fafc',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}
        >
          <strong style={{ color: '#0f172a' }}>
            AI-GENERATED NOTES
          </strong>

          {editing ? (
            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              style={{
                width: '100%',
                minHeight: '300px',
                marginTop: '8px',
                padding: '8px',
                boxSizing: 'border-box',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                resize: 'vertical',
                fontSize: '12px',
                lineHeight: '1.5',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                lineHeight: '1.5',
              }}
            >
              {renderNotesWithImages()}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginTop: '10px',
            }}
          >
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  flex: 1,
                  padding: '7px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                }}
              >
                Edit
              </button>
            )}

            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '7px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '11.5px',
              }}
            >
              {editing ? 'Save Changes' : 'Save Note'}
            </button>

            {editing && (
              <button
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  padding: '7px',
                  background: '#64748b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                }}
              >
                Cancel
              </button>
            )}

            {savedNote && (
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '7px',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}