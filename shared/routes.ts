import { z } from 'zod';
import { insertMessageSchema, messages } from './schema';

export const api = {
  contact: {
    submit: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertMessageSchema,
      responses: {
        200: z.custom<typeof messages.$inferSelect>(),
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
