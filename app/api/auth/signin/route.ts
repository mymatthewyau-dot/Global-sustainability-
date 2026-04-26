import { NextRequest, NextResponse } from 'next/server';

// Auth is handled client-side via InstantDB. This endpoint is not used by the app.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Use InstantDB client-side auth. This endpoint is deprecated.' },
    { status: 410 }
  );
}
