// app/api/auth/logout/route.js
import { authenticateUser } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { error } = await authenticateUser(request);
    
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Here you could implement token blacklisting if needed
    // For now, we'll just return success since JWT tokens are stateless
    // and will expire naturally
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}