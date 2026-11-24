import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const refreshInactiveClickUpTags = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (error || isAdmin !== true) throw new Error('Nu ai acces administrativ.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const m = await import('./clickupInactivity.server');
    return m.refreshInactiveTags(supabaseAdmin, m.clickUpCredentials());
  });

export const clearMyInactiveTag = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const m = await import('./clickupInactivity.server');
    await m.clearInactiveTag(supabaseAdmin, context.userId, m.clickUpCredentials());
    return { ok: true };
  });
