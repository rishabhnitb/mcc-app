import mongoose from 'mongoose';

export interface IQuizAttempt extends mongoose.Document {
  username: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: Date;
}

const quizAttemptSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
