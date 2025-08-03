export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuestionState extends Question {
  selectedAnswer?: string;
}

export interface QuizState {
  questions: QuestionState[];
  currentScore: number;
  isSubmitted: boolean;
}
