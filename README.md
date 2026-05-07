# GymDesk - Gym Management Web Application

A complete, production-ready Gym Management Web Application tailored for gym managers, featuring a large, clear UI, member management, point-of-sale fee tracking, and reporting.

## Tech Stack
- **Frontend**: React (Vite) + React Router + Tailwind CSS + shadcn/ui components (handcrafted)
- **Backend**: Express + Prisma ORM
- **Database**: PostgreSQL (via Neon.tech)
- **Authentication**: JWT stored in HTTP-only cookies

## Requirements
- Node.js 18+
- PostgreSQL database (e.g., Neon.tech Free Tier)

## Setup & Deployment Guide

### Step 1: Clone Repository
Clone the repository from GitHub to your local machine or terminal.

### Step 2: Environment Variables
Copy the `.env.example` file to `.env` (or `.env.local` for Vite compatibility in some contexts, but `.env` is best):
```bash
cp .env.example .env
```
Fill in the `DATABASE_URL` with your Neon PostgreSQL connection string.
Set a secure random string for `NEXTAUTH_SECRET` (used as the JWT signing secret).

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Initialize Database
Run the Prisma string to push the schema to your Neon database:
```bash
npx prisma db push
```

### Step 5: Seed the Admin Account
Create the initial manager account (admin@gymdesk.com / admin123):
```bash
npx tsx prisma/seed.ts
```
> **Note:** Please change the admin password after your first login for security!

### Step 6: Test Locally
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Step 7: Push to Vercel (Zero-Config Deploy)
While this workspace uses Express+Vite to run optimally in the preview environment, standard deployment can be done to any platform supporting Node.js containers (like Render, Railway, or Google Cloud Run).
To deploy it **specifically** to Vercel if migrating the API to Next.js API Routes is desired, you can easily port the Express code, OR deploy this exact repository to **Render** for a true Zero-Config deployment of an Express server. 

**Wait! To deploy this repo to Vercel as-is:**
1. This is a Vite + Express App. Vercel supports Vite SPAs natively. However, to run the Express backend on Vercel, you need a `vercel.json` rewrite.
2. Given this setup, deploying to **Render.com** or **Railway.app** is truly zero-config (just connect GitHub, it detects `package.json`, and run `npm run build && npm run start`).

If you *strictly* want Vercel deployment:
Add a `vercel.json` to handle the serverless express function or migrate the `/api` routes to Next.js.
