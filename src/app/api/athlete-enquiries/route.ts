import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// NPC Rwanda does not accept public athlete applications or scouting enquiries.
export async function POST() {
  return NextResponse.json(
    { error: 'Public athlete applications are not accepted by NPC Rwanda.' },
    { status: 410 }
  );
}
