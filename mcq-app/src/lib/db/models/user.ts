import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  username: string;
  email?: string;
  password: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    validate: {
      validator: function(v: string) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, and underscores'
    }
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 6;
      },
      message: 'Password must be at least 6 characters long'
    }
  },
  profileImage: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: { [key: string]: any }) {
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
