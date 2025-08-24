import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import QuizAttempt from '@/lib/db/models/quizAttempt';

export async function POST(req: NextRequest) {
  try {
    const { username, topic, score, totalQuestions } = await req.json();

    await dbConnect();

    const attempt = new QuizAttempt({
      username,
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
    console.error('Save attempt error:', error);
    return new Response(JSON.stringify({ message: 'Error saving attempt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    if (!username) {
      return new Response(JSON.stringify({ message: 'Username query parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const attempts = await QuizAttempt.find({ username })
      .sort({ date: -1 })
      .limit(50); // Limit to last 50 attempts

    return new Response(JSON.stringify({ attempts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Fetch attempts error:', error);
    return new Response(JSON.stringify({ message: 'Error fetching attempts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
