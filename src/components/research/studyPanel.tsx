
import React, { useState } from 'react';
import type { QuizSet, FlashcardSet } from '../../services/db';

interface Props {
  quizSet?: QuizSet;
  flashcardSet?: FlashcardSet;
  onClose: () => void;
}

export const StudyPanel: React.FC<Props> = ({ quizSet, flashcardSet, onClose }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (quizSet) {
    const q = quizSet.questions[currentQIndex];
    const isLast = currentQIndex === quizSet.questions.length - 1;

    const handleAnswer = (idx: number) => {
      if (!q || selectedOption !== null) return;
      setSelectedOption(idx);
      if (idx === q.correctAnswer) setScore((prev) => prev + 1);
    };

    return (
      <div className="p-4 border rounded bg-white shadow-md max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">{quizSet.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
        </div>

        {q ? (
          <div>
            <span className="text-xs text-gray-500">Question {currentQIndex + 1}/{quizSet.questions.length}</span>
            <p className="font-medium text-xs my-2">{q.question}</p>
            <div className="space-y-1.5 mb-3">
              {q.options.map((opt: string, idx: number) => {
                let btnColor = 'border-gray-200';
                if (selectedOption !== null) {
                  if (idx === q.correctAnswer) btnColor = 'bg-green-100 border-green-500 text-green-800';
                  else if (idx === selectedOption) btnColor = 'bg-red-100 border-red-500 text-red-800';
                }
                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-2 text-xs rounded border ${btnColor}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {selectedOption !== null && (
              <div className="mb-3 p-2 bg-blue-50 text-blue-900 border border-blue-200 text-xs rounded">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
            {selectedOption !== null && (
              <button
                onClick={() => { setSelectedOption(null); setCurrentQIndex((prev) => prev + 1); }}
                className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
              >
                {isLast ? "Finish Quiz" : "Next Question"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-xs">
            <h4 className="font-bold text-sm mb-1">Quiz Completed!</h4>
            <p>Score: <strong>{score} / {quizSet.questions.length}</strong></p>
          </div>
        )}
      </div>
    );
  }

  if (flashcardSet) {
    const card = flashcardSet.cards[cardIndex];

    return (
      <div className="p-4 border rounded bg-white shadow-md max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">{flashcardSet.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          className="h-36 border rounded-lg p-3 flex items-center justify-center text-center cursor-pointer bg-gray-50 hover:bg-gray-100 mb-3"
        >
          <p className="text-xs font-medium text-gray-800">
            {flipped ? card?.explanation : card?.concept}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs">
          <button
            disabled={cardIndex === 0}
            onClick={() => { setFlipped(false); setCardIndex((prev) => prev - 1); }}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>{cardIndex + 1} / {flashcardSet.cards.length}</span>
          <button
            disabled={cardIndex === flashcardSet.cards.length - 1}
            onClick={() => { setFlipped(false); setCardIndex((prev) => prev + 1); }}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return null;
};