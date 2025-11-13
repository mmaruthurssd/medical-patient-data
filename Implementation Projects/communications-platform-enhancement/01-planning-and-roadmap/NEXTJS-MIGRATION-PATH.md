---
type: architecture
tags: [nextjs, migration, future, modernization]
---

# Next.js Migration Path

**Purpose:** Document how to migrate the Communications Platform from Express + Apps Script to Next.js
**Status:** Future Planning
**Timeline:** When ready to modernize (6+ months from now)

---

## Overview

This document outlines how to rebuild the Communications Platform approval dashboard using **Next.js 14+** with App Router, replacing the current Express.js backend and Apps Script Web App frontend.

### Why Next.js?

**Advantages:**
- ✅ Modern React-based UI with Server Components
- ✅ Built-in API routes (replace Express backend)
- ✅ Excellent TypeScript support
- ✅ Server-side rendering for better performance
- ✅ Easy deployment (Vercel, self-hosted)
- ✅ Better developer experience
- ✅ Real-time updates with Server Actions
- ✅ Native authentication support (NextAuth.js)

**Disadvantages:**
- ❌ More complex deployment than Apps Script
- ❌ Requires hosting (not free like Apps Script)
- ❌ Need to manage authentication separately

---

## Current Architecture

```
┌─────────────────────────────────────┐
│  Communications MCP (Express.js)    │
│  • Node.js + TypeScript             │
│  • MCP protocol (stdio)             │
│  • HTTP API endpoints               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Google Sheets (Central Storage)    │
│  • Communications-Log               │
│  • Staged-Communications            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Apps Script Web App (Frontend)     │
│  • Code.gs (backend functions)      │
│  • ApprovalDashboard.html (UI)      │
└─────────────────────────────────────┘
```

---

## Target Architecture (Next.js)

```
┌─────────────────────────────────────┐
│  Communications MCP (Express.js)    │
│  • Node.js + TypeScript             │
│  • MCP protocol (stdio)             │
│  • HTTP API endpoints               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Google Sheets (Central Storage)    │
│  • Communications-Log               │
│  • Staged-Communications            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Next.js App (Unified Dashboard)    │
│  • App Router (React Server Comp)   │
│  • API Routes (replace Apps Script) │
│  • NextAuth.js (Google OAuth)       │
│  • Real-time updates                │
└─────────────────────────────────────┘
```

---

## Migration Strategy

### Phase 1: Setup Next.js Project

**Create new Next.js app:**

```bash
npx create-next-app@latest communications-dashboard \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd communications-dashboard
npm install googleapis next-auth zod
```

**Project structure:**

```
communications-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── staged/route.ts
│   │   │   ├── approve/[id]/route.ts
│   │   │   └── reject/[id]/route.ts
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── MessageCard.tsx
│   │   ├── ApprovalActions.tsx
│   │   ├── FilterBar.tsx
│   │   └── Statistics.tsx
│   ├── lib/
│   │   ├── google-sheets.ts
│   │   ├── auth.ts
│   │   └── types.ts
│   └── middleware.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

### Phase 2: Migrate Google Sheets Logic

**Create `src/lib/google-sheets.ts`:**

```typescript
// Re-use existing GoogleSheetsLogger class with minor adaptations

import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getGoogleSheetsClient() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getStagedCommunications() {
  const sheets = await getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
    range: 'Staged-Communications!A2:Z'
  });

  return parseRows(response.data.values || []);
}

export async function approveCommunication(
  operationId: string,
  approvedBy: string
) {
  const sheets = await getGoogleSheetsClient();

  // Implementation similar to Apps Script version
  // Update status, move to main log, trigger send
}

// ... other functions
```

---

### Phase 3: Setup NextAuth.js

**Create `src/app/api/auth/[...nextauth]/route.ts`:**

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

### Phase 4: Create API Routes

**`src/app/api/staged/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStagedCommunications } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const messages = await getStagedCommunications();
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
```

**`src/app/api/approve/[id]/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { approveCommunication } from '@/lib/google-sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await approveCommunication(params.id, session.user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to approve' },
      { status: 500 }
    );
  }
}
```

---

### Phase 5: Build React UI

**`src/app/dashboard/page.tsx` (Server Component):**

```typescript
import { getStagedCommunications } from '@/lib/google-sheets';
import MessageList from '@/components/MessageList';
import Statistics from '@/components/Statistics';
import FilterBar from '@/components/FilterBar';

export default async function DashboardPage() {
  const messages = await getStagedCommunications();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          📨 Communications Approval Dashboard
        </h1>
        <Statistics messages={messages} />
      </header>

      <FilterBar />

      <MessageList messages={messages} />
    </div>
  );
}
```

**`src/components/MessageCard.tsx` (Client Component):**

```typescript
'use client';

import { useState } from 'react';
import { CommunicationLogEntry } from '@/lib/types';

export function MessageCard({ message }: { message: CommunicationLogEntry }) {
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    setIsApproving(true);

    try {
      const response = await fetch(`/api/approve/${message.operationId}`, {
        method: 'POST'
      });

      if (response.ok) {
        // Refresh page or update UI
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to approve message');
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <div className={`border-2 rounded-lg p-6 ${getPriorityClass(message.priority)}`}>
      {message.phiFlag && (
        <div className="bg-yellow-100 border border-yellow-400 p-3 rounded mb-4">
          ⚠️ <strong>PHI WARNING:</strong> This message may contain protected health information.
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">
            {message.type.toUpperCase()}: {message.subject || 'No Subject'}
          </h3>
          <p className="text-sm text-gray-600">
            Staged by {message.stagedBy} • {formatDate(message.stagedAt!)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPriorityBadge(message.priority)}`}>
          {message.priority}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div><strong>From:</strong> {message.from}</div>
        <div><strong>To:</strong> {message.to}</div>
        <div><strong>Channel:</strong> {message.channel}</div>
      </div>

      <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500 mb-4">
        {message.bodyPreview}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isApproving ? 'Approving...' : '✅ Approve & Send'}
        </button>
        <button
          onClick={handleReject}
          disabled={isApproving}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          ❌ Reject
        </button>
      </div>
    </div>
  );
}
```

---

### Phase 6: Add Real-Time Updates

**Use Server Actions for optimistic UI updates:**

```typescript
// src/app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { approveCommunication } from '@/lib/google-sheets';

export async function approveMessage(operationId: string) {
  await approveCommunication(operationId, 'user@example.com');
  revalidatePath('/dashboard');
  return { success: true };
}
```

**Or use polling/WebSockets for real-time:**

```typescript
// src/components/MessageList.tsx
'use client';

import { useEffect, useState } from 'react';

export function MessageList({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    // Poll every 30 seconds
    const interval = setInterval(async () => {
      const response = await fetch('/api/staged');
      const newMessages = await response.json();
      setMessages(newMessages);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return <div>{/* Render messages */}</div>;
}
```

---

### Phase 7: Deployment

**Option 1: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

**Option 2: Self-Hosted (VPS)**

```bash
# Build
npm run build

# Start with PM2
npm i -g pm2
pm2 start npm --name "comms-dashboard" -- start
pm2 save
pm2 startup
```

**Option 3: Docker**

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t communications-dashboard .
docker run -p 3000:3000 \
  -e GOOGLE_CLIENT_ID=... \
  -e GOOGLE_CLIENT_SECRET=... \
  communications-dashboard
```

---

## Migration Checklist

### Pre-Migration
- [ ] Current system stable and well-documented
- [ ] All features tested and working
- [ ] Team comfortable with current implementation
- [ ] Business need for modernization (performance, features, etc.)

### Development
- [ ] Next.js project initialized
- [ ] Google Sheets integration ported
- [ ] NextAuth.js configured with Google OAuth
- [ ] API routes implemented
- [ ] React UI components built
- [ ] Tailwind CSS styling applied
- [ ] Real-time updates implemented

### Testing
- [ ] Unit tests for API routes
- [ ] Integration tests for Sheets operations
- [ ] E2E tests with Playwright
- [ ] Authentication flow tested
- [ ] Approval workflow tested end-to-end
- [ ] Mobile responsiveness verified

### Deployment
- [ ] Environment variables configured
- [ ] Domain/subdomain configured (e.g., comms.ssdspc.com)
- [ ] SSL certificate installed
- [ ] Hosting provider selected and configured
- [ ] Monitoring and logging set up
- [ ] Backup/rollback plan ready

### Post-Migration
- [ ] Old Apps Script Web App deprecated
- [ ] Team trained on new interface
- [ ] Documentation updated
- [ ] Performance monitoring active
- [ ] User feedback collected

---

## Cost Comparison

### Current (Apps Script)
- **Hosting:** $0 (Google Apps Script free)
- **Authentication:** $0 (built-in Google auth)
- **Total:** $0/month

### Next.js (Vercel)
- **Hosting:** $0-$20/month (Hobby: free, Pro: $20)
- **Authentication:** $0 (NextAuth.js free)
- **Domain:** ~$15/year (if custom domain)
- **Total:** $0-$20/month

### Next.js (Self-Hosted VPS)
- **VPS:** $5-$10/month (DigitalOcean, Linode)
- **Domain:** ~$15/year
- **SSL:** $0 (Let's Encrypt free)
- **Total:** $5-$10/month

---

## Timeline Estimate

**Total Time:** 2-3 weeks

| Phase | Task | Time |
|-------|------|------|
| 1 | Next.js setup | 1 day |
| 2 | Port Google Sheets logic | 2 days |
| 3 | NextAuth.js setup | 1 day |
| 4 | API routes | 2 days |
| 5 | React UI | 3-4 days |
| 6 | Real-time updates | 1 day |
| 7 | Testing & deployment | 2-3 days |
| 8 | Documentation & training | 1 day |

---

## When to Migrate

**Migrate when:**
- ✅ Current system has been stable for 6+ months
- ✅ Team wants better UI/UX
- ✅ Need for real-time updates
- ✅ Want better mobile experience
- ✅ Budget allows for hosting costs
- ✅ Have time for 2-3 week project

**Don't migrate if:**
- ❌ Current system works well
- ❌ No budget for hosting
- ❌ No pressing need for new features
- ❌ Team prefers simplicity
- ❌ Apps Script Web App meets all needs

---

## Benefits Summary

**Next.js Advantages:**
- ✅ Modern, polished UI with Tailwind CSS
- ✅ Better mobile experience
- ✅ Real-time updates
- ✅ Easier to add features (notifications, analytics)
- ✅ Better performance (Server Components)
- ✅ TypeScript end-to-end
- ✅ Professional developer experience

**Apps Script Advantages (Current):**
- ✅ Free hosting
- ✅ Simpler deployment
- ✅ Native Google Workspace integration
- ✅ Automatic authentication
- ✅ No hosting management needed

---

## Recommendation

**For now: Stick with Apps Script Web App**
- It's free, simple, and works well
- Meets all current requirements
- Easy to maintain

**Migrate to Next.js when:**
- You outgrow Apps Script capabilities
- Need advanced features (real-time, complex UI)
- Want to invest in a more professional solution
- Have budget and time for migration

---

**Document Version:** 1.0
**Created:** 2025-11-09
**Next Review:** When migration is considered (6+ months)
