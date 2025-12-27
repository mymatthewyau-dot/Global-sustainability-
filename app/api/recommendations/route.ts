import { NextRequest, NextResponse } from 'next/server';
import { getLatestReading } from '@/lib/sensor-data';
import { calculateWQI } from '@/lib/wqi-calculator';
import { generateRecommendations, getRecommendationsByWQI } from '@/lib/recommendations';

/**
 * GET /api/recommendations?wqi=75
 * Generates recommendations based on sensor data and WQI
 * If wqi query param provided, uses that; otherwise calculates from latest reading
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wqiParam = searchParams.get('wqi');

    let recommendations;
    let wqiScore;

    if (wqiParam) {
      // Use provided WQI score
      const wqi = parseFloat(wqiParam);
      if (isNaN(wqi) || wqi < 0 || wqi > 100) {
        return NextResponse.json(
          { error: 'Invalid WQI value. Must be between 0 and 100.' },
          { status: 400 }
        );
      }
      wqiScore = wqi;
      recommendations = getRecommendationsByWQI(wqi);
    } else {
      // Calculate from latest sensor reading
      const latestReading = getLatestReading();

      if (!latestReading) {
        return NextResponse.json(
          { error: 'No sensor data available' },
          { status: 404 }
        );
      }

      const wqiResult = calculateWQI(latestReading);
      wqiScore = wqiResult.overall;
      recommendations = generateRecommendations(latestReading, wqiResult);
    }

    return NextResponse.json({
      wqi: wqiScore,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

