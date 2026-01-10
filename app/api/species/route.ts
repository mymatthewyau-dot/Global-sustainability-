import { NextRequest, NextResponse } from 'next/server';
import { getSpeciesAdded, addSpecies, updateSpecies, deleteSpecies } from '@/lib/db-service';
import { getUserIdFromRequest, validateUserId } from '@/lib/auth-helper';

/**
 * GET /api/species?userId=xxx&limit=50
 * Retrieve species added by user
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
    const species = await getSpeciesAdded(userId, limit);

    // Group by species name
    const speciesByType = species.reduce((acc, entry) => {
      if (!acc[entry.speciesName]) {
        acc[entry.speciesName] = [];
      }
      acc[entry.speciesName].push(entry);
      return acc;
    }, {} as Record<string, typeof species>);

    // Calculate totals
    const totalSpecies = species.reduce((sum, entry) => sum + entry.quantity, 0);
    const uniqueSpeciesCount = Object.keys(speciesByType).length;

    return NextResponse.json({
      species,
      summary: {
        totalSpecies,
        uniqueSpeciesCount,
        speciesByType: Object.entries(speciesByType).map(([name, entries]) => ({
          name,
          totalQuantity: entries.reduce((sum, e) => sum + e.quantity, 0),
          entries: entries.length,
          firstAdded: entries[entries.length - 1].dateAdded,
          lastAdded: entries[0].dateAdded,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching species:', error);
    return NextResponse.json(
      { error: 'Failed to fetch species' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/species
 * Add new species entry
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
    const { speciesName, quantity, dateAdded, notes } = body;

    if (!speciesName || !quantity || !dateAdded) {
      return NextResponse.json(
        { error: 'Missing required fields: speciesName, quantity, dateAdded' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    const speciesEntry = await addSpecies(userId, {
      speciesName,
      quantity: parseFloat(quantity),
      dateAdded,
      notes: notes || '',
    });

    return NextResponse.json(
      { success: true, species: speciesEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding species:', error);
    return NextResponse.json(
      { error: 'Failed to add species' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/species?id=xxx
 * Update species entry
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
    const speciesId = searchParams.get('id');

    if (!speciesId) {
      return NextResponse.json(
        { error: 'Species entry ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.speciesName) updates.speciesName = body.speciesName;
    if (body.quantity !== undefined) {
      if (body.quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be greater than 0' },
          { status: 400 }
        );
      }
      updates.quantity = parseFloat(body.quantity);
    }
    if (body.dateAdded) updates.dateAdded = body.dateAdded;
    if (body.notes !== undefined) updates.notes = body.notes;

    const updatedEntry = await updateSpecies(speciesId, userId, updates);

    return NextResponse.json({ success: true, species: updatedEntry });
  } catch (error) {
    console.error('Error updating species:', error);
    return NextResponse.json(
      { error: 'Failed to update species' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/species?id=xxx
 * Delete species entry
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
    const speciesId = searchParams.get('id');

    if (!speciesId) {
      return NextResponse.json(
        { error: 'Species entry ID is required' },
        { status: 400 }
      );
    }

    await deleteSpecies(speciesId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting species:', error);
    return NextResponse.json(
      { error: 'Failed to delete species' },
      { status: 500 }
    );
  }
}
