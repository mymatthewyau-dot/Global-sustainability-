import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/instantdb';
import { createUser } from '@/lib/db-service';

/**
 * POST /api/auth/signup
 * Create a new user account
 * Note: InstantDB handles authentication separately, this creates the user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if admin is configured (needed for server-side operations)
    if (!admin) {
      // If admin is not configured, we can still create users using the client-side db
      // But for server-side, we need admin. Let's provide a helpful error message.
      return NextResponse.json(
        { 
          error: 'InstantDB admin token is not configured. Please set INSTANTDB_ADMIN_TOKEN in your .env.local file. You can get your admin token from https://instantdb.com/dashboard',
          hint: 'Create a .env.local file in the root directory with: INSTANTDB_ADMIN_TOKEN=your_token_here'
        },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUser = await admin.query({
      users: {
        $: { where: { email } },
      },
    });

    if (existingUser.data.users.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user profile
    // Note: Actual authentication will be handled client-side with InstantDB auth
    // This creates the user record in the database
    const user = await createUser(email, name);

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully. Please sign in.',
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
