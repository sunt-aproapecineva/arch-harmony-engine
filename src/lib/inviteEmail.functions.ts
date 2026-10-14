import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

/**
 * Trimite invitația „invite-student" unui elev nou adăugat în whitelist.
 * Doar adminii o pot apela; șablonul este fix.
 */
export const sendStudentInvite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      email: z.string().trim().email().max(255),
      courseId: z.string().min(1).max(64),
      courseName: z.string().min(1).max(120),
      origin: z.string().url().max(200),
      retryKey: z.string().max(64).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await (context.supabase as any).rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    });
    if (roleError || isAdmin !== true) return { ok: false, error: 'Nu ai acces administrativ.' };

    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const email = data.email.toLowerCase();
    const registerUrl = `${data.origin}/register?email=${encodeURIComponent(email)}`;

    const log = async (row: Record<string, unknown>) => {
      const { error } = await (supabaseAdmin as any).from('email_send_log').insert({
        message_id: null,
        template_name: 'invite-student',
        recipient_email: email,
        ...row,
      });
      if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message });
    };

    try {
      const result = await sendTemplateEmail('invite-student', email, {
        templateData: { registerUrl, courseName: data.courseName },
        idempotencyKey: `invite-${data.courseId}-${email}${data.retryKey ? `-${data.retryKey}` : ''}`,
      });
      if (result.sent) {
        await log({ status: 'sent' });
        return { ok: true };
      }
      await log({ status: 'suppressed' });
      return { ok: false, error: 'adresa a refuzat anterior emailurile noastre' };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await log({ status: 'failed', error_message: message });
      return { ok: false, error: message };
    }
  });
