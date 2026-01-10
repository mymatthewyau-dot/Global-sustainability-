import { NextRequest } from 'next/server';
import { admin } from './instantdb';

/**
 * Extract userId from request headers or body
 * In a production app, this would verify JWT tokens or session cookies
 * For now, we'll expect userId to be passed in the request
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try to get userId from headers (set by client)
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return userId;
  }

  // Try to get from request body (for POST requests)
  try {
    const body = await request.json().catch(() => null);
    if (body && body.userId) {
      return body.userId;
    }
  } catch {
    // Body might not be JSON or might be empty
  }

  return null;
}

/**
 * Validate that userId exists in the database
 */
export async function validateUserId(userId: string): Promise<boolean> {
  if (!admin) {
    return false;
  }

  try {
    const result = await admin.query({
      users: {
        $: { where: { id: userId } },
      },
    });
    return result.data.users.length > 0;
  } catch {
    return false;
  }
}
