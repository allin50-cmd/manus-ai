import express from 'express';
import session from 'express-session';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routes';
import { createContext } from './context';
import path from 'path';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// tRPC API
app.use('/api/trpc', createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// Auth endpoints
app.get('/api/auth/me', async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { db } = await import('./db');
    const { users } = await import('./schema');
    const { eq } = await import('drizzle-orm');
    const [user] = await db.select({
      id: users.id, email: users.email, name: users.name,
      onboardingCompleted: users.onboardingCompleted, plan: users.plan, role: users.role,
    }).from(users).where(eq(users.id, userId));
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`FineGuard Pro server running on port ${PORT}`);
});

export default app;
