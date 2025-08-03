"use client";
import { useState } from "react";

interface Props {
  onSubmit: (numQuestions: number, topic: string, customPrompt?: string) => void;
}

export default function QuestionForm({ onSubmit }: Props) {
  const [numQuestions, setNumQuestions] = useState(5);
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // If customPrompt is filled, disable topic input
  const useCustomPrompt = customPrompt.trim().length > 0;

  return (
    <form
      className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mb-10 flex flex-col gap-8 border border-gray-200 animate-fade-in"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(numQuestions, useCustomPrompt ? "" : topic, useCustomPrompt ? customPrompt : undefined);
      }}
    >
      <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-800 mb-6 text-center font-sans tracking-tight drop-shadow-lg">
        Start Your Quiz
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        <label className="font-semibold text-gray-700 flex items-center gap-3 text-lg sm:text-xl">
          Number of Questions:
          <input
            type="number"
            min={1}
            max={20}
            value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
            className="p-3 border-2 border-blue-200 rounded-lg w-24 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </label>
        <label className="font-semibold text-gray-700 flex items-center gap-3 text-lg sm:text-xl">
          Topic:
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="p-3 border-2 border-purple-200 rounded-lg w-64 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
            placeholder="e.g. Science, History, JavaScript"
            disabled={useCustomPrompt}
          />
        </label>
      </div>
      <div className="flex flex-col gap-3 mt-4">
        <label className="font-semibold text-gray-700 text-lg sm:text-xl">
          Custom Prompt (optional):
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="p-3 border-2 border-blue-200 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm mt-2"
            rows={3}
            placeholder="Write your own prompt for Gemini (disables topic input)"
          />
        </label>
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-blue-700 to-purple-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:from-blue-800 hover:to-purple-800 transition-colors"
      >
        Get Questions
      </button>
    </form>
  );
}
