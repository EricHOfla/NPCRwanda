import { NextResponse } from 'next/server';

export const revalidate = 900;

type XUserResponse = {
  data?: { id: string; name?: string; username?: string };
};
type XTimelineResponse = {
  data?: Array<{
    id: string;
    text: string;
    created_at?: string;
    public_metrics?: { like_count?: number; reply_count?: number; retweet_count?: number };
    attachments?: { media_keys?: string[] };
  }>;
  includes?: {
    media?: Array<{ media_key: string; type: string; url?: string; preview_image_url?: string; alt_text?: string }>;
  };
};

export async function GET() {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    return NextResponse.json({ error: 'X feed is not configured' }, { status: 503 });
  }

  const headers = { Authorization: `Bearer ${bearerToken}` };
  try {
    const userResponse = await fetch(
      'https://api.x.com/2/users/by/username/npc_rwanda',
      { headers, next: { revalidate: 900 } }
    );
    if (!userResponse.ok) {
      console.error('X user lookup failed:', userResponse.status);
      return NextResponse.json({ error: 'Unable to load X profile' }, { status: 502 });
    }

    const user = (await userResponse.json()) as XUserResponse;
    if (!user.data?.id) {
      return NextResponse.json({ error: 'X profile was not found' }, { status: 502 });
    }

    const params = new URLSearchParams({
      max_results: '10',
      exclude: 'replies,retweets',
      'tweet.fields': 'created_at,public_metrics,attachments',
      expansions: 'attachments.media_keys',
      'media.fields': 'media_key,type,url,preview_image_url,alt_text',
    });
    const postsResponse = await fetch(
      `https://api.x.com/2/users/${user.data.id}/tweets?${params.toString()}`,
      { headers, next: { revalidate: 900 } }
    );
    if (!postsResponse.ok) {
      console.error('X timeline request failed:', postsResponse.status);
      return NextResponse.json({ error: 'Unable to load recent X posts' }, { status: 502 });
    }

    const timeline = (await postsResponse.json()) as XTimelineResponse;
    const mediaByKey = new Map((timeline.includes?.media || []).map((media) => [media.media_key, media]));
    const posts = (timeline.data || []).map((post) => ({
      id: post.id,
      text: post.text,
      createdAt: post.created_at || null,
      url: `https://x.com/npc_rwanda/status/${post.id}`,
      metrics: post.public_metrics || {},
      media: (post.attachments?.media_keys || [])
        .map((key) => mediaByKey.get(key))
        .filter((media): media is NonNullable<typeof media> => Boolean(media))
        .map((media) => ({
          type: media.type,
          url: media.url || media.preview_image_url || null,
          alt: media.alt_text || 'NPC Rwanda post media',
        })),
    }));

    return NextResponse.json({
      profile: { name: user.data.name || 'NPC Rwanda', username: user.data.username || 'npc_rwanda' },
      posts,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('X feed request failed:', error);
    return NextResponse.json({ error: 'Unable to load X updates' }, { status: 502 });
  }
}
