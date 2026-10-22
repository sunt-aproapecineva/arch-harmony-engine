import { sendTemplateEmail } from './src/lib/email-templates/send-email';

const email = 'digoridaniel2009@gmail.com';
const registerUrl = `https://aa.morarvictor.com/register?email=${encodeURIComponent(email)}`;

const result = await sendTemplateEmail('invite-student', email, {
  templateData: { registerUrl, courseName: 'AA START · Ediția 2' },
  idempotencyKey: `invite-start-f2-${email}-${Date.now()}`,
});

console.log('SEND_RESULT', JSON.stringify(result));
