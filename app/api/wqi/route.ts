import { NextResponse } from 'next/server';
import { getLatestReading, getLast24Hours } from '@/lib/sensor-data';
import { calculateWQI, calculateWQITrend } from '@/lib/wqi-calculator';

/**
 * GET /api/wqi
 * Calculates WQI from latest sensor data
 * Returns overall score, category, breakdown, and 24h trend
 */
export async function GET() {
  try {
    const latestReading = getLatestReading();

    if (!latestReading) {
      return NextResponse.json(
        { error: 'No sensor data available' },
        { status: 404 }
      );
    }

    // Calculate WQI for latest reading
    const wqiScore = calculateWQI(latestReading);

    // Get 24h trend data
    const last24Hours = getLast24Hours();
    const trend = calculateWQITrend(last24Hours);

    return NextResponse.json({
      ...wqiScore,
      trend: {
        timestamps: trend.timestamps,
        scores: trend.wqiScores,
      },
      latestReading,
      readings24h: last24Hours, // Include full readings for chart
    });
  } catch (error) {
    console.error('Error calculating WQI:', error);
    return NextResponse.json(
      { error: 'Failed to calculate WQI' },
      { status: 500 }
    );
  }
}

