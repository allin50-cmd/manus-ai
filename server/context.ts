import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { db } from './db';

export function createContext({ req, res }: CreateExpressContextOptions) {
  const userId = (req.session as any)?.userId as number | undefined;
  return { req, res, db, userId };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
