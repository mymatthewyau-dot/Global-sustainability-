import { NextRequest, NextResponse } from 'next/server';
import { getFeedHistory, addFeedHistory, updateFeedHistory, deleteFeedHistory } from '@/lib/db-service';
import { getUserIdFromRequest, validateUserId } from '@/lib/auth-helper';

/**
 * GET /api/feed-history?userId=xxx&limit=50
 * Retrieve user's feed history with pagination
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

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const feedHistory = await getFeedHistory(userId, limit);

    // Calculate summary statistics
    const totalFeed = feedHistory.reduce((sum, entry) => sum + entry.quantity, 0);
    const feedByType = feedHistory.reduce((acc, entry) => {
      acc[entry.feedType] = (acc[entry.feedType] || 0) + entry.quantity;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      feedHistory,
      summary: {
        totalFeed,
        feedByType,
        entryCount: feedHistory.length,
      },
    });
  } catch (error) {
    console.error('Error fetching feed history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feed-history
 * Add new feed entry
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

    const body = await request.json();
    const { feedType, quantity, timestamp, notes } = body;

    if (!feedType || !quantity || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: feedType, quantity, timestamp' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    const feedEntry = await addFeedHistory(userId, {
      feedType,
      quantity: parseFloat(quantity),
      timestamp,
      notes: notes || '',
    });

    return NextResponse.json(
      { success: true, feedEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding feed history:', error);
    return NextResponse.json(
      { error: 'Failed to add feed history' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/feed-history?id=xxx
 * Update feed entry
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

    const searchParams = request.nextUrl.searchParams;
    const feedId = searchParams.get('id');

    if (!feedId) {
      return NextResponse.json(
        { error: 'Feed entry ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.feedType) updates.feedType = body.feedType;
    if (body.quantity !== undefined) {
      if (body.quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be greater than 0' },
          { status: 400 }
        );
      }
      updates.quantity = parseFloat(body.quantity);
    }
    if (body.timestamp) updates.timestamp = body.timestamp;
    if (body.notes !== undefined) updates.notes = body.notes;

    const updatedEntry = await updateFeedHistory(feedId, userId, updates);

    return NextResponse.json({ success: true, feedEntry: updatedEntry });
  } catch (error) {
    console.error('Error updating feed history:', error);
    return NextResponse.json(
      { error: 'Failed to update feed history' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feed-history?id=xxx
 * Delete feed entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const feedId = searchParams.get('id');

    if (!feedId) {
      return NextResponse.json(
        { error: 'Feed entry ID is required' },
        { status: 400 }
      );
    }

    await deleteFeedHistory(feedId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feed history:', error);
    return NextResponse.json(
      { error: 'Failed to delete feed history' },
      { status: 500 }
    );
  }
}
