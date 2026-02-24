# Favorite Restaurants Tracking App

Modern **Next.js 15** app (App Router) built with **TypeScript**, **Tailwind CSS**, **Prisma + SQLite**, and **Playwright** for end-to-end testing.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite
- **ORM**: Prisma
- **Testing**: Playwright (`@playwright/test`)

## Getting Started

### 1. Install dependencies

```bash
cd favorite-restaurants
npm install
```

### 2. Set up the database

The app uses a local SQLite database at `prisma/dev.db` (configured via `.env`).

Run Prisma migrations (this will also generate the Prisma Client):

```bash
npx prisma migrate dev --name init
```

You can regenerate the Prisma client later with:

```bash
npx prisma generate
```

### 3. Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### 4. Using the app

- **Add restaurant**: Use the form at the top of the page.
  - **Name** (required)
  - **Notes** (optional)
  - **Photo upload** (optional)
- Uploaded images are stored locally under `public/uploads` and referenced from the database.

### 5. Playwright end-to-end tests

Install Playwright browsers (once):

```bash
npx playwright install --with-deps
```

Run the tests:

```bash
npm run test:e2e
```

The sample test in `tests/homepage.spec.ts` checks that the homepage loads and the main heading and intro text are visible.

## Useful Scripts

- **`npm run dev`** – Start Next.js dev server
- **`npm run build`** – Build for production
- **`npm run start`** – Start production server
- **`npm run lint`** – Run ESLint
- **`npm run test:e2e`** – Run Playwright tests
- **`npm run prisma:migrate`** – Run `prisma migrate dev`
- **`npm run prisma:generate`** – Run `prisma generate`

