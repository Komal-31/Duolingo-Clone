'use client';

import React from 'react';
import { Exercise, SubmitAnswerResponse } from '@/types/lesson';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { TranslateExercise } from './TranslateExercise';
import { MatchPairsExercise } from './MatchPairsExercise';
import { FillBlankExercise } from './FillBlankExercise';
import { TypeAnswerExercise } from './TypeAnswerExercise';

interface ExerciseRendererProps {
  exercise: Exercise;
  userAnswer: unknown;
  onAnswerChange: (answer: unknown) => void;
  isSubmitted: boolean;
  submissionResult: SubmitAnswerResponse | null;
  disabled?: boolean;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  submissionResult,
  disabled = false,
}) => {
  switch (exercise.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceExercise
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={(ans) => onAnswerChange(ans)}
          isSubmitted={isSubmitted}
          submissionResult={submissionResult}
          disabled={disabled}
        />
      );

    case 'translate_to_target':
    case 'translate_to_source':
      return (
        <TranslateExercise
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={(ans) => onAnswerChange(ans)}
          isSubmitted={isSubmitted}
          submissionResult={submissionResult}
          disabled={disabled}
        />
      );

    case 'match_pairs':
      return (
        <MatchPairsExercise
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={(ans) => onAnswerChange(ans)}
          isSubmitted={isSubmitted}
          submissionResult={submissionResult}
          disabled={disabled}
        />
      );

    case 'fill_in_blank':
      return (
        <FillBlankExercise
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={(ans) => onAnswerChange(ans)}
          isSubmitted={isSubmitted}
          submissionResult={submissionResult}
          disabled={disabled}
        />
      );

    case 'type_answer':
      return (
        <TypeAnswerExercise
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={(ans) => onAnswerChange(ans)}
          isSubmitted={isSubmitted}
          submissionResult={submissionResult}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="mx-auto my-12 max-w-md rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 text-center">
          <p className="font-bold text-gray-700">Unsupported Exercise Type: {exercise.type}</p>
        </div>
      );
  }
};
