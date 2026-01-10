import { NextRequest, NextResponse } from 'next/server';
import { getMilestones, addMilestone } from '@/lib/db-service';
import { detectMilestones, getAllMilestoneMetrics, getIMTAImpact } from '@/lib/milestone-calculator';
import { getUserIdFromRequest, validateUserId } from '@/lib/auth-helper';

/**
 * GET /api/milestones?userId=xxx
 * Retrieve user milestones with metrics
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

    const milestones = await getMilestones(userId);
    const metrics = await getAllMilestoneMetrics(userId);
    const imtaImpact = await getIMTAImpact(userId);

    return NextResponse.json({
      milestones,
      metrics,
      imtaImpact,
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/milestones?userId=xxx
 * Trigger milestone recalculation and detection
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

    // Detect new milestones
    const newMilestones = await detectMilestones(userId);

    // Save new milestones
    const savedMilestones = [];
    for (const milestone of newMilestones) {
      try {
        const saved = await addMilestone(userId, {
          milestoneType: milestone.milestoneType,
          description: milestone.description,
          dateAchieved: milestone.dateAchieved,
          metrics: milestone.metrics,
        });
        savedMilestones.push(saved);
      } catch (error) {
        console.error('Error saving milestone:', error);
      }
    }

    // Get updated metrics
    const metrics = await getAllMilestoneMetrics(userId);
    const imtaImpact = await getIMTAImpact(userId);

    return NextResponse.json({
      success: true,
      newMilestones: savedMilestones,
      metrics,
      imtaImpact,
    });
  } catch (error) {
    console.error('Error calculating milestones:', error);
    return NextResponse.json(
      { error: 'Failed to calculate milestones' },
      { status: 500 }
    );
  }
}
