'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLesson } from '@/hooks/useLesson';
import { useExercise } from '@/hooks/useExercise';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { ExerciseRenderer } from '@/components/lesson/ExerciseRenderer';
import { FeedbackBar } from '@/components/lesson/FeedbackBar';
import { OutOfHeartsModal } from '@/components/lesson/OutOfHeartsModal';
import { LessonCompleteModal } from '@/components/lesson/LessonCompleteModal';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  const lessonIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const lessonId = parseInt(lessonIdParam || '1', 10) || 1;

  const [showQuitModal, setShowQuitModal] = useState(false);

  // Lesson state & engine flow
  const {
    loading,
    error,
    currentExercise,
    progressPercent,
    heartsRemaining,
    isOutOfHearts,
    isCompleting,
    isLessonComplete,
    completionData,
    submitAnswer,
    nextExercise,
    refillHearts,
    doPracticeRefill,
    restartLesson,
  } = useLesson(lessonId);

  // Active exercise input & submission state
  const {
    userAnswer,
    setAnswer,
    canSubmit,
    isSubmitted,
    isChecking,
    submissionResult,
    submit,
  } = useExercise({
    exercise: currentExercise,
    onSubmit: submitAnswer,
  });

  const handleReturnHome = () => {
    router.push('/learn');
  };

  return (
    <div className="flex min-h-screen flex-col bg-white select-none">
      {/* 1. Lesson Header with Exit button, Progress Bar, and Hearts */}
      <LessonHeader
        progressPercent={progressPercent}
        heartsRemaining={heartsRemaining}
        onExit={() => setShowQuitModal(true)}
      />

      {/* 2. Main Exercise Area */}
      <main className="flex-1 flex flex-col justify-center pb-32 pt-6">
        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <RefreshCw className="h-10 w-10 animate-spin text-[#58cc02]" />
            <p className="text-base font-black text-gray-500">
              Loading lesson exercises...
            </p>
          </div>
        ) : error ? (
          <div className="mx-auto my-12 max-w-md rounded-3xl border-2 border-red-200 bg-red-50 p-6 text-center shadow-lg">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <h3 className="text-lg font-black text-red-700">Unable to load lesson</h3>
            <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={restartLesson}
                className="btn-duo-green flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider text-white"
              >
                Try Again
              </button>
              <button
                onClick={handleReturnHome}
                className="btn-duo-gray flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider text-gray-600"
              >
                Return
              </button>
            </div>
          </div>
        ) : currentExercise ? (
          <div className="w-full">
            <ExerciseRenderer
              exercise={currentExercise}
              userAnswer={userAnswer}
              onAnswerChange={setAnswer}
              isSubmitted={isSubmitted}
              submissionResult={submissionResult}
              disabled={isChecking || isCompleting}
            />
          </div>
        ) : null}
      </main>

      {/* 3. Persistent Bottom Feedback Bar */}
      {!loading && !error && currentExercise && (
        <FeedbackBar
          isSubmitted={isSubmitted}
          isCorrect={submissionResult?.is_correct ?? null}
          correctAnswer={submissionResult?.correct_answer}
          explanation={submissionResult?.explanation}
          canSubmit={canSubmit}
          isChecking={isChecking}
          onCheck={submit}
          onContinue={nextExercise}
        />
      )}

      {/* 4. Out of Hearts Modal */}
      <OutOfHeartsModal
        isOpen={isOutOfHearts}
        onPracticeRefill={doPracticeRefill}
        onInstantRefill={() => refillHearts('gems')}
        onReturnHome={handleReturnHome}
      />

      {/* 5. Lesson Complete Celebration Modal */}
      <LessonCompleteModal
        isOpen={isLessonComplete}
        completionData={completionData}
        onContinue={handleReturnHome}
      />

      {/* 6. Quit Confirmation Dialog */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl border-2 border-[#e5e5e5] bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <LogOut className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-black text-[#4b4b4b]">
              Quit lesson?
            </h3>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              All progress in this session will be lost. Are you sure you want to quit?
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="btn-duo-green w-full rounded-xl py-3 text-sm font-black uppercase tracking-wider text-white"
              >
                Keep Learning
              </button>
              <button
                type="button"
                onClick={handleReturnHome}
                className="btn-duo-gray w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-wider text-red-500 hover:text-red-700"
              >
                Quit Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
