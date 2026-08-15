# NPC Rwanda Image Paths Reference Guide

All images are now seeded with proper file paths organized by type and purpose. This document shows where each image should be stored in the `/public/assets/img/` directory structure.

## Directory Structure

```
public/
└── assets/
    └── img/
        ├── logo.png (Main NPC Rwanda logo - 300x300px recommended)
        ├── favicon.ico (Browser favicon)
        ├── avatars/ (Athlete and leadership photos)
        ├── curated/ (News, events, sports, and page hero images)
        ├── partners/ (Partner and sponsor logos)
        └── [existing files]
```

---

## IMAGE CATEGORIES & LOCATIONS

### 1. ATHLETE AVATARS (`/assets/img/avatars/`)
Used in: Athletes dashboard, Athletes listing page

| Image File | Display Purpose |
|-----------|-----------------|
| `kundineza-jd.jpg` | Jean de Dieu Kundineza - Sitting Volleyball |
| `mukobwankawe-l.jpg` | Liliane Mukobwankawe - Sitting Volleyball |
| `muvunyi-h.jpg` | Hermas Muvunyi - Para Athletics |
| `nshimiyimana-e.jpg` | Eric Nshimiyimana - Wheelchair Basketball |
| `mukamugiraneza-c.jpg` | Claudine Mukamugiraneza - Goalball |
| `habineza-p.jpg` | Patrick Habineza - Amputee Football |
| `mukamusoni-g.jpg` | Grace Mukamusoni - Para Athletics |
| `kwizera-s.jpg` | Samuel Kwizera - Wheelchair Basketball |
| `habimana-t.jpg` | Therese Habimana - Sitting Volleyball |
| `munyankindi-d.jpg` | David Munyankindi - Goalball |

**Recommended specs**: 300x300px, JPEG format, portrait orientation

---

### 2. NEWS ARTICLE COVER IMAGES (`/assets/img/curated/`)
Used in: News dashboard, News page, News cards

| Image File | Article Title |
|-----------|----------------|
| `news-goalball.jpg` | Goalball Championship: Elevating Visibility and Support |
| `news-volleyball.jpg` | Sitting Volleyball: Rwanda vs France Friendly Series |
| `news-boccia.jpg` | Boccia Championship at Petit Stadium |
| `news-athletics.jpg` | Para-Athletics: National Record Broken in 1500m Sprint |
| `news-basketball.jpg` | Wheelchair Basketball League Kicks Off Season |
| `news-strategy.jpg` | NPC Rwanda Strategic Plan 2024-2028 Released |
| `news-football.jpg` | Amputee Football Squad Announced for Regional Tournament |
| `news-safeguarding.jpg` | Safeguarding Training for All District Coordinators |
| `news-certification.jpg` | NPC Rwanda Receives Gold Standard Certification |

**Recommended specs**: 800x450px, JPEG format, landscape orientation

---

### 3. SPORTS DISCIPLINE IMAGES (`/assets/img/curated/`)
Used in: Sports page, Sports dashboard, Sports listing

| Image File | Sport Program |
|-----------|---------------|
| `sport-volleyball.jpg` | Sitting Volleyball |
| `sport-basketball.jpg` | Wheelchair Basketball |
| `sport-football.jpg` | Amputee Football |
| `sport-athletics.jpg` | Para Athletics |
| `sport-goalball.jpg` | Goalball |
| `sport-boccia.jpg` | Boccia |
| `sport-powerlifting.jpg` | Para Powerlifting |
| `sport-swimming.jpg` | Para Swimming |

**Recommended specs**: 600x400px, JPEG format, action/sport photography

---

### 4. EVENT IMAGES (`/assets/img/curated/`)
Used in: Events dashboard, Events page, Event cards

| Image File | Event Name |
|-----------|-----------|
| `event-paralympic-games.jpg` | National Paralympic Games 2026 |
| `event-athletics-grandprix.jpg` | IPC Athletics Grand Prix |
| `event-powerlifting.jpg` | Para-Powerlifting District Championship |
| `event-goalball-camp.jpg` | Goalball Training Camp |
| `event-volleyball-league.jpg` | Sitting Volleyball National League - Round 3 |
| `event-welfare-conference.jpg` | Para-Athlete Welfare Conference |

**Recommended specs**: 800x450px, JPEG format, landscape orientation

---

### 5. LEADERSHIP/BOARD MEMBER AVATARS (`/assets/img/avatars/`)
Used in: Leadership/Governance page, Board members listing, Dashboard

| Image File | Board Member | Position |
|-----------|------------|----------|
| `murema-jb.jpg` | Dr. Jean Baptiste Murema | President |
| `nizeyimana-p.jpg` | Prosper Nizeyimana | Vice President |
| `nshimiyimana-i.jpg` | Innocent Nshimiyimana | Secretary General |
| `mukamusoni-t.jpg` | Theresa Mukamusoni | Treasurer |
| `munyaneza-c.jpg` | Claude Munyaneza | Audit Committee Chair |
| `umutoni-a.jpg` | Alice Umutoni | Senior Auditor |
| `nsengimana-e.jpg` | Emmanuel Nsengimana | Conflict Resolution Chair |
| `uwamariya-jd.jpg` | Jeanne d'Arc Uwamariya | Legal Advisor |
| `habimana-v.jpg` | Vincent Habimana | Technical Director |
| `kayitare-m.jpg` | Maria Kayitare | Athlete Welfare Officer |

**Recommended specs**: 300x300px, JPEG format, portrait orientation, professional headshots

---

### 6. PARTNER LOGOS (`/assets/img/partners/`)
Used in: About/Partners section, Footer, Dashboard partners listing

| Logo File | Partner Name |
|-----------|-------------|
| `logo-minisports.svg` | Ministry of Sports (Rwanda) |
| `logo-ipc.svg` | International Paralympic Committee |
| `logo-apc.svg` | African Paralympic Committee |
| `logo-nudor.svg` | National Union of Disability Organisations |
| `logo-wpv.svg` | World ParaVolley |

**Recommended specs**: SVG format (scalable), maintain aspect ratio, 200x80px base size

---

### 7. PAGE HERO/BACKGROUND IMAGES (`/assets/img/curated/`)
Used in: Page headers, Hero sections, Banner backgrounds

| Image File | Page/Section |
|-----------|-------------|
| `home-hero.jpg` | Home page hero section |
| `about-hero.jpg` | About page hero section |
| `about-history.jpg` | About page - History section |

**Recommended specs**: 1920x1080px, JPEG format, full-width hero images

---

### 8. SYSTEM IMAGES
Used in: Site configuration and branding

| Location | File | Purpose |
|----------|------|---------|
| `/assets/img/` | `logo.png` | Main NPC Rwanda logo for site-wide use |
| `/assets/img/` | `favicon.ico` | Browser favicon (16x16, 32x32) |

**Logo specs**: 300x300px minimum, PNG with transparency

---

## IMAGE QUALITY GUIDELINES

### File Formats
- **Photos/People**: JPEG (quality 85-90)
- **Logos/Graphics**: SVG (preferred) or PNG
- **Hero sections**: JPEG or WebP

### Resolution Standards
- **Avatars**: 300x300px (square)
- **News covers**: 800x450px (16:9)
- **Sports images**: 600x400px (3:2)
- **Event images**: 800x450px (16:9)
- **Partner logos**: 200x80px (flexible, maintain ratio)
- **Hero images**: 1920x1080px (16:9)

### Color & Contrast
- Avatars: Professional, well-lit, minimal background
- News/Sports: High contrast, vibrant action photography
- Logos: Clear visibility at all sizes, good contrast ratio (minimum 4.5:1)
- Hero images: Professional branding-aligned photography

### File Size Optimization
- Avatars: 50-100KB
- News/Sports covers: 150-250KB
- Hero sections: 200-400KB
- Logos: 20-80KB (SVG typically smaller)

---

## DATABASE IMAGE FIELD MAPPINGS

### Athletes Table
```
avatar: /assets/img/avatars/{filename}
```

### News Articles Table
```
img: /assets/img/curated/{filename}
```

### Sports Disciplines Table
```
img: /assets/img/curated/{filename}
```

### Events Table
```
img: /assets/img/curated/{filename}
```

### Leaders Table
```
avatar: /assets/img/avatars/{filename}
```

### Partners Table
```
logo: /assets/img/partners/{filename}
```

### System Settings Table
```
key: 'logo' → value: '/assets/img/logo.png'
key: 'favicon' → value: '/assets/img/favicon.ico'
```

### Site Content Table
```
key: 'hero.image' → value: '/assets/img/curated/home-hero.jpg'
key: 'about.heroImage' → value: '/assets/img/curated/about-hero.jpg'
key: 'about.historyImage' → value: '/assets/img/curated/about-history.jpg'
key: 'footer.logo' → value: '/assets/img/logo.png'
```

---

## DEPLOYMENT CHECKLIST

- [ ] Create `/public/assets/img/avatars/` directory
- [ ] Create `/public/assets/img/curated/` directory
- [ ] Create `/public/assets/img/partners/` directory
- [ ] Upload all athlete avatars (10 images)
- [ ] Upload all news cover images (9 images)
- [ ] Upload all sports discipline images (8 images)
- [ ] Upload all event images (6 images)
- [ ] Upload all leadership avatars (10 images)
- [ ] Upload all partner logos (5 images)
- [ ] Upload hero and background images (3+ images)
- [ ] Upload main logo and favicon
- [ ] Test all image links on deployed site
- [ ] Verify responsive image loading on mobile
- [ ] Check image optimization and load times

---

## NOTES

- All paths in the database are absolute from the `/public` root
- Images are served by Next.js static file serving
- Use Next.js `Image` component for automatic optimization
- Configure Image component in `next.config.ts` for remote image domains if needed
- CDN integration can be added for faster global delivery
- Consider WebP format conversion for modern browsers to reduce file size

---

*Last Updated: 2026-07-13*
*Database Version: Seed v3 (with comprehensive image paths)*
