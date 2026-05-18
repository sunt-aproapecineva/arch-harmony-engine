// @ts-nocheck
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const RecoverySchema = z.object({
  studentId: z.string().uuid(),
  responses: z.array(z.object({ exercise_id: z.string().min(1).max(120), response: z.unknown() })).max(50),
});

export const recoverStudentExerciseResponses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RecoverySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    });
    if (roleError || isAdmin !== true) throw new Error('Nu ai acces pentru această operațiune.');

    const rows = data.responses.map((item) => ({
      user_id: data.studentId,
      exercise_id: item.exercise_id,
      response: item.response,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length === 0) return { saved: 0 };

    const { error } = await supabaseAdmin
      .from('exercise_responses')
      .upsert(rows, { onConflict: 'user_id,exercise_id' });
    if (error) throw new Error(error.message || 'Nu am putut recupera răspunsurile locale.');
    return { saved: rows.length };
  });