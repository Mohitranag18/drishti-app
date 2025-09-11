// app/api/user/preferences/route.js
import { authenticateUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate that only allowed preference fields are being updated
    const allowedFields = [
      'push_notification', 
      'dark_mode', 
      'wellness_reminders', 
      'weekly_summary'
    ];
    
    const updateData = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        // Ensure boolean values
        if (typeof value !== 'boolean') {
          return NextResponse.json(
            { error: `${key} must be a boolean value` }, 
            { status: 400 }
          );
        }
        updateData[key] = value;
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid preference fields to update' }, 
        { status: 400 }
      );
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        is_verified: true,
        total_points: true,
        current_streak: true,
        longest_streak: true,
        sessions: true,
        push_notification: true,
        dark_mode: true,
        wellness_reminders: true,
        weekly_summary: true,
        created_at: true,
        updated_at: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}