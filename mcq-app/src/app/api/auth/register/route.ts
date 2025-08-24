import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/user';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  let conn;
  try {
    console.log('Starting registration process...');
    
    // Parse request body first to fail fast if invalid
    const body = await request.json();
    console.log('Registration attempt:', { 
      username: body.username, 
      email: body.email,
      hasPassword: !!body.password
    });

    const { username, email, password } = body;

    // Validate required fields early
    if (!username || !password) {
      console.log('Missing required fields:', { 
        hasUsername: !!username, 
        hasPassword: !!password 
      });
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

    // Check if username already exists
    try {
      console.log('Checking for existing username:', username);
      const existingUser = await User.findOne({ username }).maxTimeMS(5000);
      if (existingUser) {
        console.log('Username already taken:', {
          attemptedUsername: username,
          existingUserId: existingUser._id
        });
        return NextResponse.json(
          { 
            message: 'Username already exists',
            details: 'Please choose a different username',
            code: 'USERNAME_TAKEN'
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      throw error;
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email }).maxTimeMS(5000);
      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Create new user
    console.log('Creating new user...');
    let user;
    try {
      user = new User({
        username,
        email,
        password,
      });
      await user.validate();
      await user.save();
      console.log('User saved successfully');
    } catch (error: any) {
      console.error('User creation error:', error);
      
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return NextResponse.json(
          { message: `${field} already exists` },
          { status: 400 }
        );
      }
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
        return NextResponse.json(
          { message: 'Validation failed', errors: validationErrors },
          { status: 400 }
        );
      }
      
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', {
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
      { 
        message: 'Error registering user',
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          type: error.name,
          details: error.stack
        } : undefined
      },
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
