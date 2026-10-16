'use client';

import React, { useEffect, useRef } from 'react';

interface InstagramEmbedProps {
  postUrl: string;
}

/**
 * Renders an embedded Instagram post using Instagram's official embed script.
 * Accepts any instagram.com/p/... or instagram.com/reel/... URL.
 */
export default function InstagramEmbed({ postUrl }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset container HTML each time postUrl changes
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <blockquote
          class="instagram-media"
          data-instgrm-captioned
          data-instgrm-permalink="${postUrl}"
          data-instgrm-version="14"
          style="
            background:#FFF;
            border:0;
            border-radius:3px;
            box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);
            margin: 0;
            max-width:540px;
            min-width:326px;
            padding:0;
            width:100%;
          "
        >
          <div style="padding:16px;">
            <a href="${postUrl}" target="_blank" rel="noopener noreferrer"
              style="background:#fff;line-height:0;padding:0 0;text-align:center;text-decoration:none;width:100%;">
              <div style="display:flex;align-items:center;justify-content:center;padding:20px 0 12px;">
                <svg width="50px" height="50px" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 6c6.6 0 7.4.03 10 .14 2.4.11 3.7.5 4.6.84a7.7 7.7 0 0 1 2.85 1.85 7.7 7.7 0 0 1 1.85 2.85c.34.9.73 2.2.84 4.6.1 2.6.14 3.4.14 10s-.03 7.4-.14 10c-.11 2.4-.5 3.7-.84 4.6a8.2 8.2 0 0 1-4.7 4.7c-.9.34-2.2.73-4.6.84-2.6.1-3.4.14-10 .14s-7.4-.03-10-.14c-2.4-.11-3.7-.5-4.6-.84a7.7 7.7 0 0 1-2.85-1.85 7.7 7.7 0 0 1-1.85-2.85c-.34-.9-.73-2.2-.84-4.6C6.03 37.4 6 36.6 6 30s.03-7.4.14-10c.11-2.4.5-3.7.84-4.6a7.7 7.7 0 0 1 1.85-2.85A7.7 7.7 0 0 1 15.4 6.98c.9-.34 2.2-.73 4.6-.84C22.6 6.03 23.4 6 30 6zm0-4c-6.7 0-7.5.03-10.2.15-2.6.12-4.4.54-5.96 1.15a11.7 11.7 0 0 0-4.26 2.77A11.7 11.7 0 0 0 6.8 10.24c-.61 1.56-1.03 3.36-1.15 5.96C5.53 18.9 5.5 19.7 5.5 30s.03 11.1.15 13.8c.12 2.6.54 4.4 1.15 5.96a11.7 11.7 0 0 0 2.77 4.26 11.7 11.7 0 0 0 4.26 2.77c1.56.61 3.36 1.03 5.96 1.15C18.9 58.07 19.7 58.1 30 58.1s11.1-.03 13.8-.15c2.6-.12 4.4-.54 5.96-1.15a12.2 12.2 0 0 0 7.03-7.03c.61-1.56 1.03-3.36 1.15-5.96.12-2.7.15-3.5.15-13.8s-.03-11.1-.15-13.8c-.12-2.6-.54-4.4-1.15-5.96a11.7 11.7 0 0 0-2.77-4.26A11.7 11.7 0 0 0 49.76 3.3c-1.56-.61-3.36-1.03-5.96-1.15C41.1 2.03 40.3 2 30 2zm0 15.2a12.8 12.8 0 1 0 0 25.6 12.8 12.8 0 0 0 0-25.6zm0 21.1a8.3 8.3 0 1 1 0-16.6 8.3 8.3 0 0 1 0 16.6zm16.3-21.6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                    fill="url(#ig-grad)"/>
                  <defs>
                    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#f09433"/>
                      <stop offset="25%" stop-color="#e6683c"/>
                      <stop offset="50%" stop-color="#dc2743"/>
                      <stop offset="75%" stop-color="#cc2366"/>
                      <stop offset="100%" stop-color="#bc1888"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p style="color:#c9c8cd;font-size:14px;line-height:17px;margin:8px 0 0;overflow:hidden;padding:8px 0 7px;text-align:center;">
                View this post on Instagram
              </p>
            </a>
          </div>
        </blockquote>
      `;
    }

    // Load or re-process the Instagram embed script
    const existingScript = document.getElementById('instagram-embed-script');
    if (existingScript) {
      // Script already loaded — tell Instagram to re-scan for new blockquotes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.instgrm?.Embeds?.process) {
        win.instgrm.Embeds.process();
      }
    } else {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [postUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '12px',
      }}
    />
  );
}
