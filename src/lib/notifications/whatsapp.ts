// ============================================================================
// MatchPoint AI — Twilio WhatsApp Notifications
// src/lib/notifications/whatsapp.ts
//
// Sends a WhatsApp message to ADMIN_PHONE_NUMBER when a candidate clears
// all AI filters (overall_score ≥ 90% → recommendation = strong_match).
//
// Env vars required:
//   TWILIO_ACCOUNT_SID   — from console.twilio.com
//   TWILIO_AUTH_TOKEN    — from console.twilio.com
//   TWILIO_WHATSAPP_FROM — e.g. whatsapp:+14155238886 (Twilio sandbox or approved sender)
//   ADMIN_PHONE_NUMBER   — e.g. +34612345678  (receives the alert)
// ============================================================================

export interface HighScoreAlertParams {
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string;
  company: string;
  overallScore: number;
  hardSkillsScore: number;
  experienceScore: number;
  cultureScore: number;
  logisticsScore: number;
  recommendation: string;
}

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_WHATSAPP_FROM;
  const to         = process.env.ADMIN_PHONE_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    throw new Error(
      'Missing Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, ADMIN_PHONE_NUMBER'
    );
  }

  return { accountSid, authToken, from, to };
}

function buildMessage(p: HighScoreAlertParams): string {
  const flag = p.overallScore >= 95 ? '🏆' : '✅';
  const toWhatsApp = (n: string) => `whatsapp:${n}`;

  const lines = [
    `${flag} *MATCH LISTO PARA FIRMA*`,
    ``,
    `👤 *${p.candidateName}*${p.candidateEmail ? `\n📧 ${p.candidateEmail}` : ''}`,
    `💼 *${p.jobTitle}* — ${p.company}`,
    ``,
    `📊 *Puntuación global: ${p.overallScore}%*`,
    `  • Hard Skills:  ${p.hardSkillsScore}%`,
    `  • Experiencia:  ${p.experienceScore}%`,
    `  • Cultura:      ${p.cultureScore}%`,
    `  • Logística:    ${p.logisticsScore}%`,
    ``,
    `🤖 IA: ${p.recommendation.replace(/_/g, ' ')}`,
    ``,
    `El candidato ha superado todos los filtros automáticos y está listo para la fase de firma.`,
  ];

  return lines.join('\n');
}

/**
 * Send a WhatsApp alert to the admin when a candidate clears all AI filters.
 * Uses the Twilio REST API directly (no SDK dependency needed).
 * Fire-and-forget safe — caller should .catch() any thrown errors.
 */
export async function sendAdminWhatsAppAlert(
  params: HighScoreAlertParams
): Promise<void> {
  const { accountSid, authToken, from, to } = getConfig();

  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromNumber = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

  const body = new URLSearchParams({
    From: fromNumber,
    To:   toNumber,
    Body: buildMessage(params),
  });

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio API error ${res.status}: ${text}`);
  }
}
