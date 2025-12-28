// Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars, then run:
//   node scripts/create-avatar-bucket.js

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'avatars';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ name: BUCKET, public: true }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to create bucket:', res.status, text);
      process.exit(2);
    }

    const data = await res.json();
    console.log('Bucket created:', data);
  } catch (err) {
    console.error('Error creating bucket:', err);
    process.exit(3);
  }
})();
