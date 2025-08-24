import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import QuizAttempt from '@/lib/db/models/quizAttempt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { topic, score, totalQuestions } = await req.json();

    await dbConnect();

    const attempt = new QuizAttempt({
      userId: decoded.userId,
      topic,
      score,
      totalQuestions,
      date: new Date()
    });

    await attempt.save();

    return new Response(JSON.stringify({ message: 'Attempt saved successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return new Response(JSON.stringify({ message: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Save attempt error:', error);
    return new Response(JSON.stringify({ message: 'Error saving attempt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await dbConnect();

    const attempts = await QuizAttempt.find({ userId: decoded.userId })
      .sort({ date: -1 })
      .limit(50); // Limit to last 50 attempts

    return new Response(JSON.stringify({ attempts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return new Response(JSON.stringify({ message: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Fetch attempts error:', error);
    return new Response(JSON.stringify({ message: 'Error fetching attempts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
