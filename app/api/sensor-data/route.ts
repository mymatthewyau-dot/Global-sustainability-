import { NextRequest, NextResponse } from 'next/server';
import { SensorReading } from '@/types';
import { addSensorReading, generateMockSensorReading } from '@/lib/sensor-data';

/**
 * POST /api/sensor-data
 * Accepts sensor reading payload and stores it
 * If no payload provided, generates a mock reading
 */
export async function POST(request: NextRequest) {
  try {
    let reading: SensorReading;

    const body = await request.json().catch(() => null);
    
    if (body && body.timestamp) {
      // Validate required fields
      const requiredFields = ['temperature', 'ph', 'do', 'turbidity', 'salinity', 'ammonia', 'tn', 'tp'];
      const missingFields = requiredFields.filter(field => body[field] === undefined);
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }

      reading = body as SensorReading;
    } else {
      // Generate mock reading if no payload provided
      reading = generateMockSensorReading();
    }

    // Validate ranges (basic validation)
    if (reading.temperature < 0 || reading.temperature > 40) {
      return NextResponse.json(
        { error: 'Temperature out of valid range (0-40°C)' },
        { status: 400 }
      );
    }

    if (reading.ph < 0 || reading.ph > 14) {
      return NextResponse.json(
        { error: 'pH out of valid range (0-14)' },
        { status: 400 }
      );
    }

    // Add reading to history
    addSensorReading(reading);

    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data recorded successfully',
        reading,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to process sensor data' },
      { status: 500 }
    );
  }
}

