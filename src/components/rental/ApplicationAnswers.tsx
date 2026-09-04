import type { ApplicationAnswer } from '@/types/rental';

interface ApplicationAnswersProps {
  answers: ApplicationAnswer[];
}

export function ApplicationAnswers({ answers }: ApplicationAnswersProps) {
  if (answers.length === 0) {
    return <p className="text-sm text-ink-muted">No screening answers on this application.</p>;
  }

  return (
    <dl className="grid gap-4">
      {answers.map((item) => (
        <div key={item.questionId}>
          <dt className="text-sm font-medium text-ink">{item.prompt}</dt>
          <dd className="mt-1 text-sm text-ink-muted">{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
