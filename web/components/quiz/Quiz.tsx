import { useState } from 'react';
import { generateQuiz, fetchCategories } from '../../lib/api';
import type { MCQuestion, FBQuestion } from '../../lib/api';
import { useEffect } from 'react';

type Phase = 'setup' | 'quiz' | 'results';

interface ShuffledMC {
  question: MCQuestion;
  displayOptions: string[];
  correctDisplayIndex: number;
}

interface FBAnswer {
  question: FBQuestion;
  userAnswer: string;
  correct: boolean;
}

type QuizItem =
  | { type: 'mc'; data: ShuffledMC; selectedIndex: number | null }
  | { type: 'fb'; data: FBAnswer; submitted: boolean; showHint: boolean };

function shuffleMC(q: MCQuestion): ShuffledMC {
  const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const displayOptions = indices.map(i => q.options[i]);
  const correctDisplayIndex = indices.indexOf(q.correctIndex);
  return { question: q, displayOptions, correctDisplayIndex };
}

export function Quiz() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<QuizItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    fetchCategories()
      .then(cats => setCategories(cats.map(c => c.category).filter(Boolean) as string[]))
      .catch(() => {});
  }, []);

  async function startQuiz() {
    setLoading(true);
    setError(null);
    try {
      const quiz = await generateQuiz({ category: selectedCategory || undefined, count });
      const built: QuizItem[] = quiz.questions.map(q => {
        if (q.type === 'multiple_choice') {
          return { type: 'mc', data: shuffleMC(q), selectedIndex: null };
        } else {
          return {
            type: 'fb',
            data: { question: q, userAnswer: '', correct: false },
            submitted: false,
            showHint: false,
          };
        }
      });
      setItems(built);
      setCurrentIdx(0);
      setPhase('quiz');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  function selectMC(itemIdx: number, displayIdx: number) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== itemIdx || item.type !== 'mc') return item;
        return { ...item, selectedIndex: displayIdx };
      })
    );
  }

  function submitFB(itemIdx: number) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== itemIdx || item.type !== 'fb') return item;
        const correct =
          item.data.userAnswer.trim().toLowerCase() ===
          item.data.question.answer.trim().toLowerCase();
        return {
          ...item,
          submitted: true,
          data: { ...item.data, correct },
        };
      })
    );
  }

  function toggleHint(itemIdx: number) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== itemIdx || item.type !== 'fb') return item;
        return { ...item, showHint: !item.showHint };
      })
    );
  }

  function updateFBAnswer(itemIdx: number, value: string) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== itemIdx || item.type !== 'fb') return item;
        return { ...item, data: { ...item.data, userAnswer: value } };
      })
    );
  }

  function isCurrentAnswered() {
    const item = items[currentIdx];
    if (!item) return false;
    if (item.type === 'mc') return item.selectedIndex !== null;
    return item.submitted;
  }

  function score() {
    return items.filter(item => {
      if (item.type === 'mc') {
        return item.selectedIndex === item.data.correctDisplayIndex;
      }
      return item.data.correct;
    }).length;
  }

  function reset() {
    setPhase('setup');
    setItems([]);
    setCurrentIdx(0);
    setError(null);
  }

  // ─── Setup ───────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-1">Quiz</h1>
        <p className="text-gray-600 text-sm mb-8">
          Test your knowledge with multiple choice and fill-in-the-blank questions.
        </p>

        <div className="max-w-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">All categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Number of questions
            </label>
            <div className="flex gap-2">
              {[3, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    count === n
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={startQuiz}
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating quiz…' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Results ─────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const s = score();
    const pct = Math.round((s / items.length) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center py-8">
          <div className="text-5xl font-bold text-gray-900 mb-2">{pct}%</div>
          <p className="text-gray-600">
            {s} of {items.length} correct
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {items.map((item, i) => {
            const correct =
              item.type === 'mc'
                ? item.selectedIndex === item.data.correctDisplayIndex
                : item.data.correct;
            const prompt =
              item.type === 'mc' ? item.data.question.prompt : item.data.question.prompt;
            const answer =
              item.type === 'mc'
                ? item.data.displayOptions[item.data.correctDisplayIndex]
                : item.data.question.answer;

            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <p className="text-sm text-gray-700 mb-1">{prompt}</p>
                <p className="text-sm font-medium text-gray-900">✓ {answer}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={reset}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ─── Quiz ─────────────────────────────────────────────────────────────────
  const item = items[currentIdx];
  const answered = isCurrentAnswered();

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500">
          {currentIdx + 1} / {items.length}
        </span>
        <div className="flex gap-1">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-6 rounded-full transition-colors ${i <= currentIdx ? 'bg-gray-900' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {item.type === 'mc' && (
        <MCView
          item={item}
          itemIdx={currentIdx}
          onSelect={selectMC}
        />
      )}

      {item.type === 'fb' && (
        <FBView
          item={item}
          itemIdx={currentIdx}
          onSubmit={submitFB}
          onToggleHint={toggleHint}
          onUpdateAnswer={updateFBAnswer}
        />
      )}

      <div className="mt-6 flex justify-end">
        {currentIdx < items.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(i => i + 1)}
            disabled={!answered}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => setPhase('results')}
            disabled={!answered}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            See Results
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MCView({
  item,
  itemIdx,
  onSelect,
}: {
  item: Extract<QuizItem, { type: 'mc' }>;
  itemIdx: number;
  onSelect: (itemIdx: number, displayIdx: number) => void;
}) {
  const { question, displayOptions, correctDisplayIndex } = item.data;
  const selected = item.selectedIndex;
  const answered = selected !== null;

  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Multiple choice</p>
      <p className="text-lg font-medium text-gray-900 mb-1">{question.prompt}</p>
      {question.lakota && (
        <p className="text-2xl font-bold text-gray-800 mb-6">{question.lakota}</p>
      )}
      <div className="space-y-2">
        {displayOptions.map((opt, di) => {
          let cls =
            'w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ';
          if (!answered) {
            cls += 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50';
          } else if (di === correctDisplayIndex) {
            cls += 'border-green-400 bg-green-50 text-green-800';
          } else if (di === selected) {
            cls += 'border-red-300 bg-red-50 text-red-700';
          } else {
            cls += 'border-gray-200 bg-white opacity-50';
          }
          return (
            <button key={di} onClick={() => !answered && onSelect(itemIdx, di)} className={cls}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FBView({
  item,
  itemIdx,
  onSubmit,
  onToggleHint,
  onUpdateAnswer,
}: {
  item: Extract<QuizItem, { type: 'fb' }>;
  itemIdx: number;
  onSubmit: (idx: number) => void;
  onToggleHint: (idx: number) => void;
  onUpdateAnswer: (idx: number, val: string) => void;
}) {
  const { question, userAnswer, correct } = item.data;

  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Fill in the blank</p>
      <p className="text-lg font-medium text-gray-900 mb-6">{question.prompt}</p>

      {!item.submitted ? (
        <div className="space-y-3">
          <input
            type="text"
            value={userAnswer}
            onChange={e => onUpdateAnswer(itemIdx, e.target.value)}
            onKeyDown={e => e.key === 'Enter' && userAnswer.trim() && onSubmit(itemIdx)}
            placeholder="Type your answer…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <div className="flex gap-2">
            {question.hint && (
              <button
                onClick={() => onToggleHint(itemIdx)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {item.showHint ? 'Hide hint' : 'Show hint'}
              </button>
            )}
            <button
              onClick={() => userAnswer.trim() && onSubmit(itemIdx)}
              disabled={!userAnswer.trim()}
              className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              Check
            </button>
          </div>
          {item.showHint && question.hint && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Hint: {question.hint}
            </p>
          )}
        </div>
      ) : (
        <div
          className={`rounded-xl border p-4 ${correct ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'}`}
        >
          <p className="text-sm font-medium mb-1">
            {correct ? '✓ Correct!' : '✗ Not quite'}
          </p>
          {!correct && (
            <p className="text-sm text-gray-600">
              Answer: <span className="font-medium text-gray-900">{question.answer}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
