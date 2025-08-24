import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/user';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  let conn;
  try {
    console.log('Starting login process...');
    
    // Parse request body first to fail fast if invalid
    const body = await request.json();
    console.log('Login attempt for username:', body.username);
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB with retries
    let retries = 3;
    while (retries > 0) {
      try {
        conn = await dbConnect();
        console.log('MongoDB connected successfully');
        break;
      } catch (error) {
        console.error(`Failed to connect to MongoDB (${retries} retries left):`, error);
        retries--;
        if (retries === 0) {
          return NextResponse.json(
            { message: 'Database connection error. Please try again.' },
            { status: 503 }
          );
        }
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Find user by username
    const user = await User.findOne({ username }).maxTimeMS(5000); // Add timeout
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(), // Ensure ID is a string
        username: user.username,
        email: user.email,
      },
    };

    console.log('Sending login response:', { ...responseData, token: '[REDACTED]' });
    
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Check if it's a connection error
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: 'Connection error. Please try again.' },
        { status: 503 }
      );
    }

    // MongoDB specific errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return NextResponse.json(
        { message: 'Database error. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  } finally {
    // If the connection was established but there was an error later,
    // make sure we handle any cleanup needed
    if (conn && mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connection.close();
      } catch (cleanupError) {
        console.warn('Error during connection cleanup:', cleanupError);
      }
    }
  }
}
