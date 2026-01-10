import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalReadings, getWQIScoresByUser, getAquafarm } from '@/lib/db-service';
import { calculateWQI } from '@/lib/wqi-calculator';
import { getUserIdFromRequest, validateUserId } from '@/lib/auth-helper';

/**
 * GET /api/trends?userId=xxx&days=30
 * Returns detailed trend analysis with improvement metrics
 * Calculates WQI improvement over time and before/after IMTA comparison
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params or headers
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');
    
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Please include userId query parameter or x-user-id header.' },
        { status: 401 }
      );
    }

    // Validate userId
    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 401 }
      );
    }

    // Get days parameter (default 30)
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Get aquafarm to check IMTA start date
    const aquafarm = await getAquafarm(userId);
    const imtaStartDate = aquafarm?.imtaStartDate ? new Date(aquafarm.imtaStartDate) : null;

    // Get historical readings
    const readings = await getHistoricalReadings(userId, days);
    
    if (readings.length === 0) {
      return NextResponse.json({
        readings: [],
        wqiTrend: [],
        improvementMetrics: null,
        beforeAfterIMTA: null,
      });
    }

    // Calculate WQI for each reading
    const wqiTrend = readings.map((reading) => {
      const wqi = calculateWQI(reading);
      return {
        timestamp: reading.timestamp,
        wqi: wqi.overall,
        category: wqi.category,
      };
    });

    // Calculate improvement metrics
    const improvementMetrics = calculateImprovementMetrics(wqiTrend);

    // Calculate before/after IMTA comparison if IMTA start date exists
    let beforeAfterIMTA = null;
    if (imtaStartDate && readings.length > 0) {
      const beforeReadings = readings.filter(
        (r) => new Date(r.timestamp) < imtaStartDate
      );
      const afterReadings = readings.filter(
        (r) => new Date(r.timestamp) >= imtaStartDate
      );

      if (beforeReadings.length > 0 && afterReadings.length > 0) {
        const beforeWQI = beforeReadings.map((r) => calculateWQI(r).overall);
        const afterWQI = afterReadings.map((r) => calculateWQI(r).overall);

        const avgBefore = beforeWQI.reduce((a, b) => a + b, 0) / beforeWQI.length;
        const avgAfter = afterWQI.reduce((a, b) => a + b, 0) / afterWQI.length;
        const improvement = ((avgAfter - avgBefore) / avgBefore) * 100;

        beforeAfterIMTA = {
          before: {
            averageWQI: parseFloat(avgBefore.toFixed(2)),
            readingCount: beforeReadings.length,
            dateRange: {
              start: beforeReadings[0].timestamp,
              end: beforeReadings[beforeReadings.length - 1].timestamp,
            },
          },
          after: {
            averageWQI: parseFloat(avgAfter.toFixed(2)),
            readingCount: afterReadings.length,
            dateRange: {
              start: afterReadings[0].timestamp,
              end: afterReadings[afterReadings.length - 1].timestamp,
            },
          },
          improvementPercent: parseFloat(improvement.toFixed(2)),
          imtaStartDate: imtaStartDate.toISOString(),
        };
      }
    }

    return NextResponse.json({
      readings,
      wqiTrend,
      improvementMetrics,
      beforeAfterIMTA,
    });
  } catch (error) {
    console.error('Error calculating trends:', error);
    return NextResponse.json(
      { error: 'Failed to calculate trends' },
      { status: 500 }
    );
  }
}

/**
 * Calculate improvement metrics from WQI trend
 */
function calculateImprovementMetrics(
  wqiTrend: Array<{ timestamp: string; wqi: number; category: string }>
): {
  overallImprovement: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  averageWQI: number;
  bestWQI: number;
  worstWQI: number;
} {
  if (wqiTrend.length === 0) {
    return {
      overallImprovement: 0,
      trendDirection: 'stable',
      averageWQI: 0,
      bestWQI: 0,
      worstWQI: 0,
    };
  }

  const wqiValues = wqiTrend.map((t) => t.wqi);
  const averageWQI = wqiValues.reduce((a, b) => a + b, 0) / wqiValues.length;
  const bestWQI = Math.max(...wqiValues);
  const worstWQI = Math.min(...wqiValues);

  // Compare first half vs second half to determine trend
  const midpoint = Math.floor(wqiTrend.length / 2);
  const firstHalf = wqiTrend.slice(0, midpoint);
  const secondHalf = wqiTrend.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.wqi, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.wqi, 0) / secondHalf.length;

  const improvement = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  let trendDirection: 'improving' | 'declining' | 'stable';
  if (improvement > 5) {
    trendDirection = 'improving';
  } else if (improvement < -5) {
    trendDirection = 'declining';
  } else {
    trendDirection = 'stable';
  }

  return {
    overallImprovement: parseFloat(improvement.toFixed(2)),
    trendDirection,
    averageWQI: parseFloat(averageWQI.toFixed(2)),
    bestWQI: parseFloat(bestWQI.toFixed(2)),
    worstWQI: parseFloat(worstWQI.toFixed(2)),
  };
}
