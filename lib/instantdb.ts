import { init } from '@instantdb/react';

const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || '0ff4c356-edb9-4b27-b6e6-7e1e32c7ccd8';
const ADMIN_TOKEN = process.env.INSTANTDB_ADMIN_TOKEN || '';

// Check if APP_ID is configured (required for client-side db)
const isAppIdConfigured = APP_ID && APP_ID !== 'your_app_id_here';

// Check if ADMIN_TOKEN is configured (required for server-side admin operations)
const isAdminConfigured = ADMIN_TOKEN && ADMIN_TOKEN !== 'your_admin_token_here';

if (!isAppIdConfigured) {
  console.warn('⚠️ InstantDB APP_ID is not configured.');
  console.warn('   Set NEXT_PUBLIC_INSTANTDB_APP_ID in .env.local');
}

if (!isAdminConfigured) {
  console.warn('⚠️ InstantDB ADMIN_TOKEN is not configured.');
  console.warn('   Some server-side operations may not work. Set INSTANTDB_ADMIN_TOKEN in .env.local');
  console.warn('   Get your admin token from: https://instantdb.com/dashboard');
}

// Initialize InstantDB client (works without admin token)
// Note: InstantDB infers schema automatically, no need to pass schema
export const db = isAppIdConfigured ? init({
  appId: APP_ID,
}) : null;

// Initialize Admin dynamically (only import when needed to avoid type errors)
let AdminClass: any = null;
try {
  // Dynamic import to avoid type errors if Admin doesn't exist
  AdminClass = require('@instantdb/admin').Admin || require('@instantdb/admin').default;
} catch {
  // Admin not available
}

export const admin = isAdminConfigured && AdminClass ? new AdminClass({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
}) : null;

