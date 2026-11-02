import * as React from 'react'
import { render } from '@react-email/render'
import { EmailAPIError, sendLovableEmail } from '@lovable.dev/email-js'
import { TEMPLATES } from './registry'

// Server-only: reads LOVABLE_API_KEY. Never import from client components.

// Configuration baked in at scaffold time
const SITE_NAME = "Arhitectura Afacerii"
// SENDER_DOMAIN is the verified sender subdomain FQDN (e.g., "notify.example.com").
// It MUST match the subdomain delegated to Lovable's nameservers. NEVER use the root domain.
const SENDER_DOMAIN = "notificari.live.morarvictor.com"
// FROM_DOMAIN is the domain shown in the From: header (e.g., "example.com").
// Can be the root domain when display_from_root is enabled — this is cosmetic only.
const FROM_DOMAIN = "notificari.live.morarvictor.com"

/**
 * Team addresses that receive a separate copy of every registry (transactional)
 * email successfully sent to a student. Auth emails (OTP, confirmations) never
 * go through this helper, so their secret codes never reach these addresses.
 */
export const STUDENT_EMAIL_MONITORS = [
  'founder@morarvictor.com',
  'vutcariov.valerie@gmail.com',
  'petru.munteanu@aasco.md',
] as const

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: 'recipient_suppressed' }

export interface SendTemplateEmailOptions {
  templateData?: Record<string, any>
  /** Dedupes retries of the same logical send; defaults to a random UUID (no dedupe). */
  idempotencyKey?: string
  replyTo?: string
}

/**
 * Renders a registered template and sends it through Lovable's managed email
 * API. Suppression, retries, and rate limits are enforced by Lovable
 * server-side. A suppressed recipient is an expected outcome
 * ({ sent: false }); any other failure throws — EmailAPIError exposes
 * .code and .status for branching.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {}
): Promise<SendTemplateEmailResult> {
  const apiKey = process.env['LOVABLE_API_KEY']
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY is not configured')
  }

  const template = TEMPLATES[templateName]
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`
    )
  }

  // Template-level `to` takes precedence — notification templates always
  // send to their fixed address.
  const recipient = template.to || to
  if (!recipient) {
    throw new Error('Recipient is required (the template defines no fixed recipient)')
  }

  const templateData = options.templateData ?? {}
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  const baseKey = options.idempotencyKey || crypto.randomUUID()

  try {
    await sendLovableEmail(
      {
        to: recipient,
        from: { name: SITE_NAME, address: `noreply@${FROM_DOMAIN}` },
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: templateName,
        idempotency_key: baseKey,
        ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      },
      { apiKey, sendUrl: process.env['LOVABLE_SEND_URL'] }
    )
  } catch (error) {
    if (error instanceof EmailAPIError && error.code === 'recipient_suppressed') {
      return { sent: false, reason: 'recipient_suppressed' }
    }
    throw error
  }

  // Monitor copies: separate sends, never affect the student result.
  const normalizedRecipient = recipient.trim().toLowerCase()
  const isMonitor = (STUDENT_EMAIL_MONITORS as readonly string[]).includes(normalizedRecipient)
  if (!isMonitor) {
    for (const monitor of STUDENT_EMAIL_MONITORS) {
      try {
        await sendLovableEmail(
          {
            to: monitor,
            from: { name: SITE_NAME, address: `noreply@${FROM_DOMAIN}` },
            sender_domain: SENDER_DOMAIN,
            subject: `[Copie elev: ${recipient}] ${subject}`,
            html,
            text,
            purpose: 'transactional',
            label: `${templateName}-monitor`,
            idempotency_key: `${baseKey}-monitor-${monitor}`,
          },
          { apiKey, sendUrl: process.env['LOVABLE_SEND_URL'] }
        )
      } catch (error) {
        console.error(`[send-email] monitor copy to ${monitor} failed`, error)
      }
    }
  }

  return { sent: true }
}
