import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/user';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(req: NextRequest) {
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
    const data = await req.json();

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update email if provided
    if (data.email !== undefined) {
      if (data.email) {
        const existingEmail = await User.findOne({ email: data.email, _id: { $ne: user._id } });
        if (existingEmail) {
          return new Response(JSON.stringify({ message: 'Email already exists' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      user.email = data.email;
    }

    // Update password if provided
    if (data.password) {
      user.password = data.password;
    }

    await user.save();

    return new Response(JSON.stringify({ message: 'Profile updated successfully' }), {
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

    console.error('Profile update error:', error);
    return new Response(JSON.stringify({ message: 'Error updating profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
