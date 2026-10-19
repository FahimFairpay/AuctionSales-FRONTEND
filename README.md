# FairPy Sales — nextjs-web

High-performance Next.js 16 (App Router + Turbopack) frontend for **FairPy Sales** automotive auction discovery and wholesale lead intelligence.

## Features

- **Next.js 16.3.6 & React 19:** Powered by Next.js Turbopack and React Query v5.
- **Inventory Discovery:** Real-time auction lot filtering, multi-image stacked preview carousel, damage tags, Run & Drive indicators, and ACV calculation.
- **FairScout.AI Copilot:** Conversational vehicle discovery drawer with high-end glassmorphism, multi-turn continuation, and DynamoDB cloud session synchronization.
- **Presets & Watchlists:** Buyer search presets with automated backend crawler notification triggers.
- **Wholesale Leads & Favorites:** One-click interest registration and direct wholesale buyer lead forwarding.
- **AWS Cognito Authentication:** Secure token management, session recovery, and role-based views.

## Getting Started

### 1. Environment Setup

Create `.env.local` using the template:

```bash
cp .env.example .env.local
```

Ensure the following variables are configured:
```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=us-east-1_ExamplePool
NEXT_PUBLIC_USER_POOL_CLIENT_ID=exampleclientid1234567890ab
NEXT_PUBLIC_API_BASE=https://exampleapi.execute-api.us-east-1.amazonaws.com/v1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Production Build

```bash
npm run build
npm run start
```
