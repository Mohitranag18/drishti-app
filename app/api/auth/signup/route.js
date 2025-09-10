// app/api/auth/signup/route.js
import { hashPassword } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password, username, first_name, last_name } = await request.json();

    // Validation
    if (!email || !password || !username || !first_name || !last_name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      }, { status: 400 });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        username,
        first_name,
        last_name
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        is_verified: true,
        created_at: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
