import { useCallback, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/Button';
import {
  isScreeningQuestionType,
  MAX_SCREENING_PROMPT,
  MAX_SCREENING_QUESTIONS,
  MIN_SCREENING_PROMPT,
  newQuestionId,
  type ScreeningQuestion,
  type ScreeningQuestionType,
} from '@/types/rental';

interface ScreeningQuestionEditorProps {
  questions: ScreeningQuestion[];
  onChange: (questions: ScreeningQuestion[]) => void;
  disabled?: boolean;
}

interface QuestionRowProps {
  question: ScreeningQuestion;
  index: number;
  canRemove: boolean;
  disabled: boolean;
  onChange: (index: number, question: ScreeningQuestion) => void;
  onRemove: (index: number) => void;
}

const fieldClasses =
  'w-full rounded-xl border border-line bg-base px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none';

function QuestionRow({ question, index, canRemove, disabled, onChange, onRemove }: QuestionRowProps) {
  const handlePromptChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(index, { ...question, prompt: event.target.value });
    },
    [index, onChange, question],
  );

  const handleTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (isScreeningQuestionType(event.target.value)) {
        onChange(index, { ...question, type: event.target.value });
      }
    },
    [index, onChange, question],
  );

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <li className="rounded-2xl border border-line bg-base p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor={`question-prompt-${question.id}`} className="mb-2 block text-sm font-medium text-ink">
            Question {index + 1}
          </label>
          <input
            id={`question-prompt-${question.id}`}
            type="text"
            value={question.prompt}
            onChange={handlePromptChange}
            disabled={disabled}
            maxLength={MAX_SCREENING_PROMPT}
            placeholder="Ask about pets, income, move-in date…"
            className={fieldClasses}
          />
          <p className="mt-1 text-xs text-ink-muted">
            {MIN_SCREENING_PROMPT}–{MAX_SCREENING_PROMPT} characters
          </p>
        </div>
        <div className="sm:w-40">
          <label htmlFor={`question-type-${question.id}`} className="mb-2 block text-sm font-medium text-ink">
            Answer type
          </label>
          <select
            id={`question-type-${question.id}`}
            value={question.type}
            onChange={handleTypeChange}
            disabled={disabled}
            className={fieldClasses}
          >
            <option value="text">Short text</option>
            <option value="yesno">Yes / no</option>
          </select>
        </div>
      </div>
      {canRemove ? (
        <Button className="mt-3" size="sm" variant="secondary" onClick={handleRemove} disabled={disabled}>
          Remove
        </Button>
      ) : null}
    </li>
  );
}

export function ScreeningQuestionEditor({ questions, onChange, disabled = false }: ScreeningQuestionEditorProps) {
  const handleRowChange = useCallback(
    (index: number, question: ScreeningQuestion) => {
      onChange(questions.map((item, itemIndex) => (itemIndex === index ? question : item)));
    },
    [onChange, questions],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(questions.filter((_, itemIndex) => itemIndex !== index));
    },
    [onChange, questions],
  );

  const handleAdd = useCallback(() => {
    const question: ScreeningQuestion = {
      id: newQuestionId(),
      prompt: '',
      type: 'text' satisfies ScreeningQuestionType,
    };
    onChange([...questions, question]);
  }, [onChange, questions]);

  return (
    <div>
      <ul className="grid gap-4">
        {questions.map((question, index) => (
          <QuestionRow
            key={question.id}
            question={question}
            index={index}
            canRemove={questions.length > 1}
            disabled={disabled}
            onChange={handleRowChange}
            onRemove={handleRemove}
          />
        ))}
      </ul>
      <Button
        className="mt-4"
        variant="secondary"
        onClick={handleAdd}
        disabled={disabled || questions.length >= MAX_SCREENING_QUESTIONS}
      >
        Add question
      </Button>
    </div>
  );
}
