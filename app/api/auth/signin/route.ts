import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/instantdb';
import { getUserByEmail } from '@/lib/db-service';

/**
 * POST /api/auth/signin
 * Sign in user (simplified - in production use InstantDB's magic code auth)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'InstantDB is not configured' },
        { status: 500 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Note: In a real implementation, you would verify the password hash here
    // For now, we'll just return the user if they exist
    // In production, use InstantDB's magic code authentication

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    console.error('Error signing in:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    );
  }
}
