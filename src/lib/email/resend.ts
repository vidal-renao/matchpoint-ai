// ============================================================================
// MatchPoint AI — Resend Email Notifications
// src/lib/email/resend.ts
//
// Sends email when a candidate scores ≥ 90% on any match.
// Uses Resend SDK. Fire-and-forget from the matching pipeline.
// ============================================================================

import { Resend } from 'resend';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY');
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'MatchPoint AI <noreply@matchpoint.ai>';

export interface HighScoreMatchEmailParams {
  to: string;           // candidate email
  candidateName: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  locale?: string;
  profileUrl?: string;
}

export async function sendHighScoreMatchEmail(params: HighScoreMatchEmailParams): Promise<void> {
  const {
    to, candidateName, jobTitle, company, overallScore, locale = 'es', profileUrl,
  } = params;

  const resend = getResend();
  const firstName = candidateName.split(' ')[0];

  const subject = overallScore >= 95
    ? `🎯 Perfect match found: ${jobTitle} at ${company}`
    : `✨ High-score match: ${jobTitle} at ${company} (${overallScore}%)`;

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #050505; color: #e5e5e5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    .logo-mark { width: 32px; height: 32px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 15px; font-weight: 500; color: #e5e5e5; }
    .score-badge { display: inline-block; font-size: 48px; font-weight: 700; color: #f59e0b; font-family: monospace; line-height: 1; margin-bottom: 4px; }
    .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 400; color: #ffffff; margin: 0 0 8px; line-height: 1.2; }
    .company { font-size: 15px; color: #f59e0b; margin-bottom: 24px; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card p { font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0; }
    .cta { display: inline-block; background: #f59e0b; color: #050505; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-bottom: 32px; }
    .footer { font-size: 11px; color: #374151; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-mark">
        <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L26 8v12l-12 6L2 20V8l12-6z" stroke="#050505" stroke-width="2" fill="none" />
          <circle cx="14" cy="14" r="4" fill="#050505" opacity="0.8" />
        </svg>
      </div>
      <span class="logo-text">MatchPoint AI</span>
    </div>

    <p style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">
      Hi ${firstName} — your AI just found a match
    </p>

    <div class="score-badge">${overallScore}%</div>
    <p class="score-label">Overall match score</p>

    <h1>${jobTitle}</h1>
    <p class="company">${company}</p>

    <div class="card">
      <p>
        Your dimensional profile scored <strong style="color:#f59e0b">${overallScore}%</strong>
        across Hard Skills, Experience, Culture and Logistics — placing this role in your
        ${overallScore >= 95 ? 'top tier' : 'high-priority'} match category.
      </p>
    </div>

    ${profileUrl ? `<a href="${profileUrl}" class="cta">View your matches →</a>` : ''}

    <div class="footer">
      <p>MatchPoint AI · AI-powered talent matching · You&apos;re receiving this because your match score exceeded 90%.</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
}
