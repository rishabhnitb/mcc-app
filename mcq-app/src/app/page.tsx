"use client";

import React, { useState } from "react";
import Image from "next/image";
import { QuestionState, QuizState } from '../types';
import QuestionForm from './QuestionForm';

export default function Home() {
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

  const fetchQuestions = async (numQuestions: number, topic: string, customPrompt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numQuestions, topic, customPrompt }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuizState({
          questions: (data.questions as QuestionState[]).map((q) => ({ ...q, selectedAnswer: undefined })),
          currentScore: 0,
          isSubmitted: false,
        });
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to fetch questions');
      }
    } catch (e) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleOptionSelect = (questionId: number, option: string) => {
    setQuizState((prev: QuizState | null) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q: QuestionState) =>
              q.id === questionId ? { ...q, selectedAnswer: option } : q
            ),
          }
        : null
    );
  };

  const handleSubmit = () => {
    setQuizState((prev: QuizState | null) =>
      prev
        ? {
            ...prev,
            currentScore: prev.questions.reduce(
              (acc: number, q: QuestionState) => (q.selectedAnswer === q.correctAnswer ? acc + 1 : acc),
              0
            ),
            isSubmitted: true,
          }
        : null
    );
  };

  const handleTryAgain = () => {
    setQuizState((prev: QuizState | null) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q: QuestionState) => ({ ...q, selectedAnswer: undefined })),
            currentScore: 0,
            isSubmitted: false,
          }
        : null
    );
  };

  const handleStartOver = () => {
    setQuizState(null);
    setShowForm(true);
    setError(null);
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 min-h-screen flex flex-col items-center justify-center py-6 px-2">
      <main className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-2xl mx-auto border border-gray-200">
        {/* Always show the form if quizState is null */}
        {quizState === null ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-blue-800 font-sans drop-shadow-lg tracking-tight">MCQ Quiz</h1>
            <QuestionForm onSubmit={fetchQuestions} />
            {loading && <div className="text-center text-blue-700 font-bold mb-4 animate-pulse text-lg sm:text-xl">Loading questions...</div>}
            {error && <div className="text-center text-red-600 font-bold mb-4 text-lg sm:text-xl">{error}</div>}
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-blue-800 font-sans drop-shadow-lg tracking-tight">MCQ Quiz</h1>
            <div className="space-y-8 sm:space-y-10">
              {quizState.questions.map((question: QuestionState, idx: number) => {
                const isCorrect = quizState.isSubmitted && question.selectedAnswer === question.correctAnswer;
                const isWrong = quizState.isSubmitted && question.selectedAnswer !== question.correctAnswer;
                return (
                  <div
                    key={question.id}
                    className={`p-6 sm:p-8 rounded-2xl shadow-xl border-2 border-blue-300 mb-8 max-w-xl mx-auto flex flex-col
                      ${isCorrect ? 'bg-green-100' : ''}
                      ${isWrong ? 'bg-red-100' : 'bg-white'}
                    `}
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-lg sm:text-xl font-bold text-blue-700 mr-2">Q{idx + 1}.</span>
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 font-sans leading-snug drop-shadow-md">{question.question}</h2>
                    </div>
                    <div className="flex flex-col gap-4 mt-2 border border-blue-200 rounded-xl p-2 bg-blue-50">
                      {question.options.map((option: string, optIdx: number) => (
                        <label key={option} className="flex items-center cursor-pointer w-full gap-4">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={question.selectedAnswer === option}
                            onChange={() => handleOptionSelect(question.id, option)}
                            disabled={quizState.isSubmitted}
                            className="accent-blue-600 w-6 h-6"
                          />
                          <span className={`px-5 py-4 rounded-xl font-semibold font-sans text-lg sm:text-2xl transition-colors duration-150 shadow-md text-left
                            ${question.selectedAnswer === option
                              ? 'bg-blue-600 text-white scale-105'
                              : quizState.isSubmitted
                              ? option === question.correctAnswer
                                ? 'bg-green-500 text-white scale-105'
                                : question.selectedAnswer === option
                                ? 'bg-red-500 text-white scale-105'
                                : 'bg-blue-50 text-gray-700'
                              : 'bg-white text-blue-700 hover:bg-blue-100'}
                          `}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                    {isWrong && (
                      <div className="mt-4 p-4 rounded-xl bg-red-100 text-red-800 font-semibold text-lg">
                        Correct Answer: <span className="bg-green-200 text-green-900 px-2 py-1 rounded">{question.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {!quizState.isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white p-6 rounded-xl font-bold text-3xl mt-8 shadow-lg hover:from-blue-800 hover:to-purple-800 transition-colors"
                  style={{ backgroundColor: '#4f46e5', fontSize: '2rem' }}
                >
                  Submit Answers
                </button>
              ) : (
                <div className="text-center space-y-6 mt-8">
                  <div className="text-2xl sm:text-4xl font-bold text-purple-700 drop-shadow-lg bg-blue-100 p-5 rounded-xl inline-block" style={{ fontSize: '1.75rem' }}>
                    Your Score: <span className="text-blue-700">{quizState.currentScore}</span> / {quizState.questions.length}
                  </div>
                  <button
                    onClick={handleTryAgain}
                    className="bg-green-600 text-white p-5 rounded-xl font-bold text-2xl shadow hover:bg-green-700 transition-colors"
                    style={{ backgroundColor: '#22c55e', fontSize: '1.75rem' }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="bg-gray-400 text-white p-5 rounded-xl font-bold text-2xl shadow hover:bg-gray-500 transition-colors ml-4"
                    style={{ backgroundColor: '#6b7280', fontSize: '1.75rem' }}
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
