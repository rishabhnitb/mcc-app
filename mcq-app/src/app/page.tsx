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
    <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen flex flex-col items-center justify-center py-6 px-2 backdrop-blur-lg">
      <main className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] p-4 sm:p-8 w-full max-w-2xl mx-auto border border-indigo-100 hover:shadow-[0_20px_60px_rgba(8,_112,_184,_0.8)] transition-all duration-300">
        {/* Always show the form if quizState is null */}
        {quizState === null ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-sans tracking-tight animate-fade-in">MCQ Quiz</h1>
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
                    className={`p-6 sm:p-8 rounded-2xl shadow-xl border border-opacity-50 mb-8 max-w-xl mx-auto flex flex-col transform transition-all duration-300 hover:scale-[1.02]
                      ${isCorrect ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : ''}
                      ${isWrong ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' : 'bg-white/90 backdrop-blur-sm border-indigo-200'}
                    `}
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mr-2">Q{idx + 1}.</span>
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 font-sans leading-snug">{question.question}</h2>
                    </div>
                    <div className="flex flex-col gap-4 mt-2 border border-indigo-200 rounded-xl p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 backdrop-blur-sm">
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
                          <span className={`px-5 py-4 rounded-xl font-semibold font-sans text-lg sm:text-xl transition-all duration-300 shadow-lg text-left hover:shadow-xl
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
                      <div className="mt-4 p-4 rounded-xl bg-gray-50 text-gray-800 font-semibold text-lg">
                        <span className="font-bold text-blue-700">Your Selection:</span> {
                          question.selectedAnswer
                            ? <>{question.selectedAnswer}{question.selectedAnswer === question.correctAnswer ? <span className="font-extrabold text-green-700"> is right</span> : <span className="font-extrabold text-red-700"> is wrong</span>}</>
                            : <span className="italic text-gray-500">unanswered</span>
                        }
                      </div>
                    )}
                    {isWrong && (
                      <div className="mt-4 p-4 rounded-xl bg-red-100 text-red-800 font-semibold text-lg">
                        <div>
                          Correct Answer: <span className="bg-green-200 text-green-900 px-2 py-1 rounded">{question.correctAnswer}</span>
                        </div>
                        {question.explanation && (
                          <div className="mt-2 p-3 rounded bg-white text-gray-800 text-base font-normal border border-red-200">
                            <span className="font-bold text-red-700">Explanation:</span> {question.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="h-8 sm:h-12" />
              {!quizState.isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-xl font-bold text-3xl mt-8 shadow-[0_10px_30px_rgba(99,_102,_241,_0.5)] hover:shadow-[0_20px_40px_rgba(99,_102,_241,_0.6)] transition-all duration-300 transform hover:scale-[1.02] hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
                  style={{ fontSize: '2rem' }}
                >
                  Submit Answers
                </button>
              ) : (
                <div className="text-center space-y-6 mt-8">
                  <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl inline-block shadow-lg border border-indigo-200/50 backdrop-blur-sm" style={{ fontSize: '1.75rem' }}>
                    Your Score: <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">{quizState.currentScore}</span> / {quizState.questions.length}
                  </div>
                  <button
                    onClick={handleTryAgain}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-5 rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:from-emerald-600 hover:to-green-600"
                    style={{ fontSize: '1.75rem' }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="bg-gradient-to-r from-gray-400 to-slate-500 text-white p-5 rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:from-gray-500 hover:to-slate-600 ml-4"
                    style={{ fontSize: '1.75rem' }}
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
