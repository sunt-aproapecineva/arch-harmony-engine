import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const syncStudentClickUp = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    studentId: z.string().uuid(),
    courseId: z.string().min(1),
    exerciseId: z.string().min(1).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    if (context.userId !== data.studentId) {
      const { data: isAdmin, error } = await context.supabase.rpc('has_role', {
        _user_id: context.userId,
        _role: 'admin',
      });
      if (error || isAdmin !== true) throw new Error('Nu ai acces administrativ.');
    }
    const lovableApiKey = process.env['LOVABLE_API_KEY'];
    const connectionKey = process.env['CLICKUP_CONNECTION_KEY'];
    if (!lovableApiKey || !connectionKey) throw new Error('Conexiunea ClickUp nu este configurată pe server.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { syncStudentWithClickUp } = await import('./clickupSync.server');
    return syncStudentWithClickUp(supabaseAdmin, data, { lovableApiKey, connectionKey });
  });
