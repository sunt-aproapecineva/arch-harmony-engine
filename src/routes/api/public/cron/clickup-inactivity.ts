import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/cron/clickup-inactivity')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { authenticateCronRequest } = await import('@/integrations/supabase/cron-auth');
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const m = await import('@/lib/clickupInactivity.server');
        return Response.json(await m.refreshInactiveTags(supabaseAdmin, m.clickUpCredentials()));
      },
    },
  },
});
