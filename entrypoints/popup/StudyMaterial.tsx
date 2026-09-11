import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { browser } from 'wxt/browser';

interface StudyMaterialProps {
  content: string;
}

export function StudyMaterial({
  content,
}: StudyMaterialProps) {
  const [studyMaterial, setStudyMaterial] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateStudyMaterial = async () => {
    if (!content.trim()) {
      setError(
        'Please extract the webpage before generating study material.'
      );
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await browser.runtime.sendMessage({
        type: 'STUDY_MATERIAL_GENERATE',
        content,
      });

      if (!response?.success) {
        throw new Error(
          response?.error ||
            'Failed to generate study material.'
        );
      }

      setStudyMaterial(response.studyMaterial || '');
    } catch (err) {
      console.error(
        '[Study Material] Generation failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate study material. Make sure Ollama is running and the llama3.2 model is available.'
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
  <div
    style={{
      marginTop: '10px',
    }}
  >
    <button
        onClick={generateStudyMaterial}
        disabled={generating || !content.trim()}
        style={{
          width: '100%',
          padding: '8px',
          background: '#7c3aed',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor:
            generating || !content.trim()
              ? 'not-allowed'
              : 'pointer',
          fontSize: '12.5px',
        }}
      >
        {generating
          ? 'Generating Study Material...'
          : 'Generate Study Material'}
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

      {studyMaterial && (
        <div
          style={{
            marginTop: '10px',
            fontSize: '12px',
            lineHeight: '1.5',
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {studyMaterial}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}