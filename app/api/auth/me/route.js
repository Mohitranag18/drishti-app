// app/api/auth/me/route.js
import { authenticateUser } from '../../../lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
