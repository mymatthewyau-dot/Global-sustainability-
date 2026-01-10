import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sensor-data
 * This endpoint is now a simple passthrough
 * All sensor data operations happen client-side via InstantDB
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'This endpoint is deprecated. Use InstantDB client-side operations instead.',
    },
    { status: 200 }
  );
}
