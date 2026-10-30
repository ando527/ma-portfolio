// Builds the enquiry email (HTML + plain text) and sends it through Resend.
// This is the only file that knows about Resend, so switching provider later
// means changing `sendContactEmail` and nothing else.
//
// Everything the visitor typed goes into the HTML through `escapeHtml`, even
// inside attributes. Validation (worker/validate.ts) is a second layer, not the
// only one.

import { SITE_TYPES, BUDGETS, TIMELINES, SOURCES, labelFor } from '../src/lib/contact-schema.ts'
import type { Env } from './env.ts'
import type { ContactInput } from './validate.ts'

const RESEND_URL = 'https://api.resend.com/emails'
const SUBJECT_MAX = 120
const SUBJECT_PREFIX = 'New enquiry from '
const NOT_GIVEN = 'Not given'
const SITE_NAME = 'mitchellanderson.com.au'
const REQUEST_TIMEOUT_MS = 10_000

// ------------------------------------------------------------------ helpers

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Replace control characters and line/paragraph separators with a space, then collapse whitespace. */
function singleLine(s: string): string {
  return s
    .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** First `max` UTF-16 units of `s` without cutting a surrogate pair; adds an ellipsis when cut. */
function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  let out = ''
  for (const ch of s) {
    if (out.length + ch.length > max - 1) break
    out += ch
  }
  return out.trimEnd() + '…'
}

function labels(input: ContactInput) {
  return {
    siteType: labelFor(SITE_TYPES, input.siteType) ?? input.siteType,
    budget: labelFor(BUDGETS, input.budget) ?? input.budget,
    timeline: input.timeline ? (labelFor(TIMELINES, input.timeline) ?? input.timeline) : undefined,
    source: input.source ? (labelFor(SOURCES, input.source) ?? input.source) : undefined,
  }
}

function formatSentAt(sentAt: Date): string {
  const text = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Brisbane',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(sentAt)
  return `${text} (Brisbane time)`
}

function firstName(name: string): string {
  const first = name.split(/\s+/)[0] || name
  return truncate(first, 30)
}

/** hostname + path for display, without the scheme or a lone trailing slash. */
function displayUrl(href: string): string {
  try {
    const u = new URL(href)
    const path = u.pathname === '/' ? '' : u.pathname
    return truncate(`${u.host}${path}${u.search}`, 60)
  } catch {
    return truncate(href, 60)
  }
}

function mailtoHref(email: string, subject: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`
}

// ------------------------------------------------------------------ subject

export function buildSubject(input: ContactInput): string {
  const l = labels(input)
  // "Not sure yet · Not sure yet" would be meaningless in an inbox list.
  const siteType = input.siteType === 'unsure' ? 'Site type TBC' : l.siteType
  const budget = input.budget === 'unsure' ? 'Budget TBC' : l.budget
  const suffix = ` · ${singleLine(siteType)} · ${singleLine(budget)}`
  const room = Math.max(1, SUBJECT_MAX - SUBJECT_PREFIX.length - suffix.length)
  const name = truncate(singleLine(input.name), room)
  return `${SUBJECT_PREFIX}${name}${suffix}`
}

// --------------------------------------------------------------------- text

export function buildEmailText(input: ContactInput, sentAt: Date): string {
  const l = labels(input)
  const lines: string[] = []
  lines.push('NEW ENQUIRY', '===========', '')
  lines.push(`Name:           ${input.name}`)
  if (input.company) lines.push(`Company:        ${input.company}`)
  lines.push(`Email:          ${input.email}`)
  if (input.currentSite) lines.push(`Current site:   ${input.currentSite}`)
  lines.push('', 'PROJECT AT A GLANCE', '-------------------')
  lines.push(`Website type:   ${l.siteType}`)
  lines.push(`Budget:         ${l.budget}`)
  lines.push(`Timeline:       ${l.timeline ?? NOT_GIVEN}`)
  lines.push(`Found me via:   ${l.source ?? NOT_GIVEN}`)
  lines.push('', 'MESSAGE', '-------', input.message)
  lines.push('', '---', `Sent from the contact form on ${SITE_NAME}`, formatSentAt(sentAt))
  lines.push(`Hit Reply to answer ${firstName(input.name)} directly (reply-to is set to their email).`)
  return lines.join('\n') + '\n'
}

// --------------------------------------------------------------------- html

const HEADING_FONT = "'Archivo', 'Helvetica Neue', Arial, sans-serif"
const BODY_FONT = "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif"

const C = {
  page: '#FDF7F7',
  card: '#FFFFFF',
  border: '#F9DDE1',
  header: '#24080E',
  brand: '#7C1D2E',
  label: '#6B2035',
  ink: '#1C0A0E',
  muted: '#8A6F75',
  headerMuted: '#D9A9B2',
  eyebrow: '#F9DDE1',
} as const

function gridCell(label: string, value: string | undefined): string {
  const content =
    value === undefined
      ? `<span style="color:${C.muted};font-weight:400;">${NOT_GIVEN}</span>`
      : escapeHtml(value)
  return `<td width="50%" valign="top" style="width:50%;padding:12px 14px;font-family:${BODY_FONT};">
              <div style="font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;font-weight:700;color:${C.label};">${escapeHtml(label)}</div>
              <div style="padding-top:4px;font-size:15px;line-height:21px;font-weight:600;color:${C.ink};word-break:break-word;overflow-wrap:anywhere;">${content}</div>
            </td>`
}

function contactRow(label: string, valueHtml: string): string {
  return `<tr>
            <td style="padding:0 0 14px 0;font-family:${BODY_FONT};">
              <div style="font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;font-weight:700;color:${C.label};">${escapeHtml(label)}</div>
              <div style="padding-top:4px;font-size:15px;line-height:22px;font-weight:600;color:${C.ink};word-break:break-word;overflow-wrap:anywhere;">${valueHtml}</div>
            </td>
          </tr>`
}

export function buildEmailHtml(input: ContactInput, sentAt: Date): string {
  const l = labels(input)
  const subject = buildSubject(input)
  const first = firstName(input.name)
  const replyHref = mailtoHref(input.email, 'Re: your enquiry')
  const preheader = escapeHtml(truncate(singleLine(input.message), 90))
  const pad = '&zwnj;&nbsp;'.repeat(40)

  const linkStyle = `color:${C.brand};text-decoration:underline;`
  const emailLink = `<a href="${escapeHtml(mailtoHref(input.email, 'Re: your enquiry'))}" style="${linkStyle}">${escapeHtml(input.email)}</a>`

  const contactRows = [contactRow('Email', emailLink)]
  if (input.currentSite) {
    contactRows.push(
      contactRow(
        'Current website',
        `<a href="${escapeHtml(input.currentSite)}" style="${linkStyle}">${escapeHtml(displayUrl(input.currentSite))}</a>`,
      ),
    )
  }

  const message = escapeHtml(input.message).replace(/\n/g, '<br>')

  const companyBlock = input.company
    ? `<div style="padding-top:6px;font-family:${BODY_FONT};font-size:16px;line-height:22px;color:${C.headerMuted};word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(input.company)}</div>`
    : ''

  return `<!doctype html>
<html lang="en-AU" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
<style>
  @media only screen and (max-width: 620px) {
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .name { font-size: 26px !important; line-height: 32px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.page};opacity:0;">${preheader}${pad}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${C.page};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${C.card};border:1px solid ${C.border};border-radius:16px;border-collapse:separate;overflow:hidden;">
        <tr>
          <td class="px" bgcolor="${C.header}" style="background-color:${C.header};padding:32px 32px 28px 32px;border-radius:16px 16px 0 0;">
            <div style="font-family:${BODY_FONT};font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:${C.eyebrow};">NEW ENQUIRY</div>
            <h1 class="name" style="margin:10px 0 0 0;font-family:${HEADING_FONT};font-size:30px;line-height:36px;font-weight:800;color:#FFFFFF;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(input.name)}</h1>
            ${companyBlock}
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:28px 32px 4px 32px;">
            <div style="font-family:${HEADING_FONT};font-size:13px;line-height:18px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:${C.ink};padding-bottom:10px;">Project at a glance</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${C.page};border:1px solid ${C.border};border-radius:12px;border-collapse:separate;">
              <tr>
                ${gridCell('Website type', l.siteType)}
                ${gridCell('Budget', l.budget)}
              </tr>
              <tr>
                ${gridCell('Timeline', l.timeline)}
                ${gridCell('Found me via', l.source)}
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:24px 32px 6px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          ${contactRows.join('\n          ')}
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:6px 32px 8px 32px;">
            <div style="font-family:${HEADING_FONT};font-size:13px;line-height:18px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:${C.ink};padding-bottom:10px;">Message</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              <tr>
                <td bgcolor="${C.page}" style="background-color:${C.page};border-left:3px solid ${C.brand};border-radius:4px;padding:16px 18px;font-family:${BODY_FONT};font-size:15px;line-height:24px;color:${C.ink};word-break:break-word;overflow-wrap:anywhere;">${message}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" align="left" style="padding:24px 32px 32px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="${C.brand}" style="background-color:${C.brand};border-radius:999px;">
                  <a href="${escapeHtml(replyHref)}" style="display:inline-block;padding:14px 28px;min-height:16px;font-family:${BODY_FONT};font-size:16px;line-height:18px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:999px;">Reply to ${escapeHtml(first)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:18px 32px 24px 32px;border-top:1px solid ${C.border};font-family:${BODY_FONT};font-size:12px;line-height:18px;color:${C.muted};">
            Sent from the contact form on ${SITE_NAME}<br>
            ${escapeHtml(formatSentAt(sentAt))}<br>
            Hitting Reply in your mail app works too: the reply-to address is set to ${escapeHtml(first)}'s email.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`
}

// --------------------------------------------------------------------- send

export async function sendContactEmail(
  env: Pick<Env, 'RESEND_API_KEY' | 'CONTACT_TO' | 'CONTACT_FROM' | 'CONTACT_DRY_RUN'>,
  input: ContactInput,
): Promise<void> {
  const subject = buildSubject(input)

  if (env.CONTACT_DRY_RUN === '1') {
    // Subject only: no visitor email, message or recipient in the logs.
    console.log(`[contact dry run] would send: ${subject}`)
    return
  }

  const sentAt = new Date()
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: env.CONTACT_TO,
      reply_to: input.email,
      subject,
      html: buildEmailHtml(input, sentAt),
      text: buildEmailText(input, sentAt),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    // Status only: the upstream body can echo request details.
    throw new Error(`Resend responded with status ${res.status}`)
  }
}
