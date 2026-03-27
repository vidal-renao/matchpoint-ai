import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Comma-separated list of admin emails, e.g. "max@company.com,cto@company.com"
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${locale}/login?next=/${locale}/admin`);
    }

    const adminEmails = getAdminEmails();
    const userEmail = user.email?.toLowerCase() ?? '';
    const isAdmin = adminEmails.length === 0 || adminEmails.includes(userEmail);

    if (!isAdmin) {
      redirect(`/${locale}/matches`);
    }
  } catch {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  return <>{children}</>;
}
