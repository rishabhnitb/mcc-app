"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import UserHeader from '@/components/auth/UserHeader';
import { QuestionState, QuizState } from '@/types';

export default function Quiz() {
  const { user } = useAuth();
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    try {
      const savedQuiz = localStorage.getItem('currentQuiz');
      if (!savedQuiz) {
        router.push('/quiz-setup');
        return;
      }

      const { questions, topic } = JSON.parse(savedQuiz);
      setQuizState({
        questions: questions.map((q: QuestionState) => ({ ...q, selectedAnswer: undefined })),
        currentScore: 0,
        isSubmitted: false,
        topic
      });
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const handleOptionSelect = (questionId: number, option: string) => {
    if (quizState?.isSubmitted) return;

    setQuizState(prev => prev ? {
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, selectedAnswer: option } : q
      ),
    } : null);
  };

  const handleSubmit = async () => {
  if (!quizState) return;

  const score = quizState.questions.reduce(
    (acc, q) => (q.selectedAnswer === q.correctAnswer ? acc + 1 : acc),
    0
  );

  try {
    await fetch('/api/quiz/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            topic: quizState.topic,
            score,
            totalQuestions: quizState.questions.length,
            username: user?.username || user?.email,
        }),
        credentials: "include", // 👈 important: send cookies/session
    });

    setQuizState(prev => prev ? {
      ...prev,
      currentScore: score,
      isSubmitted: true,
    } : null);
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    setError('Failed to save quiz results. Please try again.');
  }
 };

  const handleTryAgain = () => {
    setQuizState(prev => prev ? {
      ...prev,
      questions: prev.questions.map(q => ({ ...q, selectedAnswer: undefined })),
      currentScore: 0,
      isSubmitted: false,
    } : null);
  };

  const handleStartOver = () => {
    localStorage.removeItem('currentQuiz');
    router.push('/quiz-setup');
  };

  if (!user) return null;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!quizState) return <div>No quiz found. Please start a new quiz.</div>;

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen">
      <UserHeader />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8">
          {quizState.isSubmitted && (
            <div className="text-center space-y-4 mb-8">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl inline-block shadow-lg border border-indigo-200/50 backdrop-blur-sm">
                Your Score: <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  {quizState.currentScore}
                </span> / {quizState.questions.length}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleTryAgain}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:from-emerald-600 hover:to-green-600"
                >
                  Try Again
                </button>
                <button
                  onClick={handleStartOver}
                  className="bg-gradient-to-r from-gray-400 to-slate-500 text-white px-6 py-3 rounded-xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:from-gray-500 hover:to-slate-600"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {quizState.questions.map((question, idx) => {
              const isCorrect = quizState.isSubmitted && question.selectedAnswer === question.correctAnswer;
              const isWrong = quizState.isSubmitted && question.selectedAnswer !== question.correctAnswer;

              return (
                <div
                  key={question.id}
                  className={`p-6 rounded-2xl shadow-xl border border-opacity-50 mb-8 max-w-xl mx-auto flex flex-col transform transition-all duration-300 hover:scale-[1.02]
                    ${isCorrect ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : ''}
                    ${isWrong ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' : 'bg-white/90 backdrop-blur-sm border-indigo-200'}
                  `}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mr-2">
                      Q{idx + 1}.
                    </span>
                    <h2 className="text-lg font-bold text-gray-800 font-sans leading-snug">
                      {question.question}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center cursor-pointer w-full gap-4"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={question.selectedAnswer === option}
                          onChange={() => handleOptionSelect(question.id, option)}
                          disabled={quizState.isSubmitted}
                          className="accent-blue-600 w-6 h-6"
                        />
                        <span className={`px-4 py-3 rounded-xl font-medium font-sans text-base sm:text-lg transition-all duration-300 shadow-md text-left hover:shadow-lg flex-grow
                          ${question.selectedAnswer === option
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-[1.02]'
                            : quizState.isSubmitted
                            ? option === question.correctAnswer
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-[1.02]'
                              : question.selectedAnswer === option
                              ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white scale-[1.02]'
                              : 'bg-white/80 text-gray-700 backdrop-blur-sm'
                            : 'bg-white/90 text-indigo-700 hover:bg-indigo-50 backdrop-blur-sm'}
                        `}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>

                  {quizState.isSubmitted && (
                    <div className="mt-4">
                      {isWrong && (
                        <div className="p-4 rounded-xl bg-red-100 text-red-800">
                          <div className="font-semibold">
                            Correct Answer: <span className="bg-green-200 text-green-900 px-2 py-1 rounded">
                              {question.correctAnswer}
                            </span>
                          </div>
                          {question.explanation && (
                            <div className="mt-2 p-3 rounded bg-white text-gray-800 text-base">
                              <span className="font-bold text-red-700">Explanation:</span> {question.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizState.isSubmitted && (
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 rounded-xl font-bold text-xl sm:text-2xl mt-8 shadow-[0_10px_30px_rgba(99,_102,_241,_0.5)] hover:shadow-[0_20px_40px_rgba(99,_102,_241,_0.6)] transition-all duration-300 transform hover:scale-[1.02] hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
            >
              Submit Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
