import { useEffect, useState } from 'react';
import {
  deleteFromKnowledgeBase,
  getKnowledgeBaseItems,
  saveToKnowledgeBase,
} from '../../src/features/knowledge-base/knowledgeBaseService';
import type { KnowledgeBaseItem } from '../../src/features/knowledge-base/database';

interface KnowledgeBaseProps {
  title: string;
  sourceUrl: string;
  content: string;
}

export function KnowledgeBase({
  title,
  sourceUrl,
  content,
}: KnowledgeBaseProps) {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);

  const loadItems = async () => {
    setLoadingItems(true);

    try {
      const savedItems = await getKnowledgeBaseItems();
      setItems(savedItems);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      setMessage('Unable to load saved information.');
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const saveCurrentPage = async () => {
    if (!content.trim()) {
      setMessage('Please extract the webpage before saving it.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await saveToKnowledgeBase({
        title: title || 'Untitled Page',
        sourceUrl,
        sourceIdentifier: sourceUrl,
        contentType: 'webpage',
        content,
      });

      setMessage('Page saved to Knowledge Base.');
      await loadItems();
    } catch (error) {
      console.error('Failed to save page:', error);
      setMessage(
        'Unable to save the page. Make sure Ollama is running.'
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId: number) => {
    try {
      await deleteFromKnowledgeBase(itemId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId)
      );
      setMessage('Item deleted.');
    } catch (error) {
      console.error('Failed to delete knowledge base item:', error);
      setMessage('Unable to delete the item.');
    }
  };

  return (
    <div
      style={{
        marginTop: '12px',
        padding: '10px',
        background: '#f8fafc',
        borderRadius: '6px',
      }}
    >
      <strong style={{ color: '#0f172a', fontSize: '12px' }}>
        PERSONAL KNOWLEDGE BASE
      </strong>

      <button
        onClick={saveCurrentPage}
        disabled={saving || !content.trim()}
        style={{
          width: '100%',
          marginTop: '8px',
          padding: '8px',
          background: '#7c3aed',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: saving ? 'default' : 'pointer',
          fontSize: '12.5px',
        }}
      >
        {saving ? 'Saving...' : 'Save Page to Knowledge Base'}
      </button>

      {message && (
        <div
          style={{
            marginTop: '7px',
            fontSize: '11.5px',
            color: '#475569',
          }}
        >
          {message}
        </div>
      )}

      <div style={{ marginTop: '12px' }}>
        <strong style={{ fontSize: '11.5px', color: '#334155' }}>
          SAVED INFORMATION
        </strong>

        {loadingItems && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '11.5px',
              color: '#64748b',
            }}
          >
            Loading...
          </div>
        )}

        {!loadingItems && items.length === 0 && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '11.5px',
              color: '#64748b',
            }}
          >
            No saved information yet.
          </div>
        )}

        {!loadingItems &&
          items.map((item) => (
            <div
              key={item.id}
              style={{
                marginTop: '7px',
                padding: '8px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '5px',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '11.5px',
                  color: '#0f172a',
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  marginTop: '3px',
                  fontSize: '10.5px',
                  color: '#64748b',
                  wordBreak: 'break-word',
                }}
              >
                {item.sourceUrl || 'No source URL'}
              </div>

              <button
                onClick={() => deleteItem(item.id!)}
                style={{
                  marginTop: '6px',
                  padding: '4px 7px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10.5px',
                }}
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}