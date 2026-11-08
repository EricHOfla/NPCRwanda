'use client';

import { useEffect, useState } from 'react';

type XPost = {
  id: string;
  text: string;
  createdAt: string | null;
  url: string;
  metrics: { like_count?: number; reply_count?: number; retweet_count?: number };
  media: Array<{ type: string; url: string | null; alt: string }>;
};

export default function XLatestPosts() {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/social/x-feed')
      .then(async (response) => {
        if (!response.ok) throw new Error('X feed unavailable');
        return response.json();
      })
      .then((data: { posts?: XPost[] }) => {
        if (!active) return;
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      })
      .catch(() => {
        if (active) setUnavailable(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const formatDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="d-flex flex-column gap-3">
      {loading && (
        <div className="text-center py-5 text-muted" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Loading latest posts…
        </div>
      )}
      {!loading && unavailable && (
        <div className="text-center py-4 px-3 rounded-3" style={{ background: '#f8fafc' }}>
          <p className="mb-2 text-muted">Latest posts are temporarily unavailable.</p>
          <a href="https://x.com/npc_rwanda" target="_blank" rel="noopener noreferrer" className="fw-semibold">
            View NPC Rwanda on X
          </a>
        </div>
      )}
      {!loading && !unavailable && posts.length === 0 && (
        <div className="text-center py-4 text-muted">No recent posts are available.</div>
      )}
      {posts.map((post) => (
        <article key={post.id} className="p-3 rounded-3 border" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 38, height: 38, background: '#111', flexShrink: 0 }}>NPC</span>
              <div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>NPC Rwanda</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>@npc_rwanda</div>
              </div>
            </div>
            <span className="text-muted text-nowrap" style={{ fontSize: '0.76rem' }}>{formatDate(post.createdAt)}</span>
          </div>
          <p className="mb-2" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.6 }}>{post.text}</p>
          {post.media.filter((item) => item.url && (item.type === 'photo' || item.type === 'video' || item.type === 'animated_gif')).map((item, index) => (
            <a key={index} href={post.url} target="_blank" rel="noopener noreferrer" className="d-block mb-2">
              <img src={item.url!} alt={item.alt} loading="lazy"
                style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 10 }} />
            </a>
          ))}
          <div className="d-flex align-items-center justify-content-between pt-2 border-top">
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              ♥ {post.metrics.like_count ?? 0} · ↻ {post.metrics.retweet_count ?? 0} · {post.metrics.reply_count ?? 0} replies
            </span>
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="fw-semibold text-decoration-none" style={{ fontSize: '0.82rem' }}>
              View on X ↗
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
