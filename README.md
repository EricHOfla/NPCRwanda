# National Paralympic Committee of Rwanda (NPC Rwanda) Web Application

A full-stack web application and content management portal for the **National Paralympic Committee of Rwanda (NPC Rwanda)**. Built with Next.js 16, React 19, Prisma ORM, PostgreSQL, and Docker.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, TypeScript, React 19)
- **Database**: PostgreSQL
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (`jose`, `bcryptjs`)
- **Styling & UI**: Bootstrap 5, AOS (Animate On Scroll), CSS Modules
- **Containerization**: Docker & Docker Compose (Optimized Multi-Stage Standalone Build)
- **Deployment Support**: VPS (Docker Compose), Coolify, Vercel

---

## ✨ Features

- 🏅 **Sports & Athletes Directory**: Showcase Paralympic sports (Sitting Volleyball, Boccia, Goalball, etc.) and featured athletes.
- 📰 **News & Announcements**: Dynamic news platform with detailed single news pages and categories.
- 📜 **Governance & Transparency**: Public access to governance policies, leadership structure, and organizational documents.
- 🤝 **Members & Partners**: Directories for Federations, Clubs, Associations, and DPSCO contacts.
- 🔐 **Admin Dashboard**: Secure administrative portal to manage site content, news, events, partners, and user accounts.
- 🌐 **Multi-Language Support**: Built-in translation support (English, French, Kinyarwanda).
- ♿ **Accessibility**: High-contrast modes, ARIA labels, responsive navigation, and keyboard accessibility.

---

## 📁 Project Structure

```text
NPCRwanda/
├── prisma/               # Database schema & seed scripts
│   ├── schema.prisma     # Prisma data models (User, Athlete, News, Event, etc.)
│   └── seed.ts           # Initial database seeding script
├── src/
│   ├── app/              # Next.js App Router (Pages & API Routes)
│   │   ├── api/          # REST API endpoints for all entities
│   │   ├── dashboard/    # Protected Admin Dashboard
│   │   └── ...           # Public pages (about, sports, news, governance, etc.)
│   ├── components/       # Reusable UI components (Header, Footer, Accessibility, etc.)
│   ├── context/          # React Contexts (Language, Data state)
│   └── lib/              # Database & Auth helpers (prisma client, JWT auth)
├── public/               # Static assets & image uploads
├── Dockerfile            # Multi-stage production Docker build
├── docker-compose.yml    # Docker services (Next.js app + PostgreSQL)
└── next.config.ts        # Next.js standalone output configuration
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (local or containerized)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/EricHOfla/NPCRwanda.git
cd NPCRwanda
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL database URL and secret key:
```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/npc-database"
JWT_SECRET="your_secret_key"
```

### 3. Database Migration & Seed
```bash
# Push database schema
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

### Run Locally with Docker Compose
You can run the entire stack (Next.js App + PostgreSQL DB) in containers with a single command:

```bash
docker compose up --build
```
The application will be accessible at `http://localhost:3000`.

### Deploying to Remote VPS / Coolify

1. **Commit & Push to Git**:
   ```bash
   git push origin main
   ```
2. **On your Server (via SSH)**:
   ```bash
   git clone https://github.com/EricHOfla/NPCRwanda.git
   cd NPCRwanda
   cp .env.example .env
   docker compose up -d --build
   docker exec -it npc_rwanda_web npx prisma db push
   ```
3. **With Coolify**: Select **Docker Compose** or **Dockerfile**, set your environment variables, and click **Deploy**.

---

## 📝 License

This project is developed for the **National Paralympic Committee of Rwanda**. All rights reserved.
