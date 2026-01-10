import { NextRequest, NextResponse } from 'next/server';
import { getAquafarm, createAquafarm, updateAquafarm } from '@/lib/db-service';
import { getUserIdFromRequest, validateUserId } from '@/lib/auth-helper';

/**
 * GET /api/aquafarm?userId=xxx
 * Get user's aquafarm information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');
    
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 401 }
      );
    }

    const aquafarm = await getAquafarm(userId);

    return NextResponse.json({ aquafarm });
  } catch (error) {
    console.error('Error fetching aquafarm:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aquafarm' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/aquafarm
 * Create aquafarm
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 401 }
      );
    }

    // Check if farm already exists
    const existing = await getAquafarm(userId);
    if (existing) {
      return NextResponse.json(
        { error: 'Farm already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, location, imtaStartDate } = body;

    if (!name || !imtaStartDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, imtaStartDate' },
        { status: 400 }
      );
    }

    const aquafarm = await createAquafarm(userId, {
      name,
      location: location || '',
      imtaStartDate,
    });

    return NextResponse.json({ success: true, aquafarm }, { status: 201 });
  } catch (error) {
    console.error('Error creating aquafarm:', error);
    return NextResponse.json(
      { error: 'Failed to create aquafarm' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/aquafarm
 * Update aquafarm
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 401 }
      );
    }

    const existing = await getAquafarm(userId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Farm not found. Use POST to create.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.name) updates.name = body.name;
    if (body.location !== undefined) updates.location = body.location;
    if (body.imtaStartDate) updates.imtaStartDate = body.imtaStartDate;

    const aquafarm = await updateAquafarm(existing.id, userId, updates);

    return NextResponse.json({ success: true, aquafarm });
  } catch (error) {
    console.error('Error updating aquafarm:', error);
    return NextResponse.json(
      { error: 'Failed to update aquafarm' },
      { status: 500 }
    );
  }
}
