// ============================================================================
// Home Page — CV Upload entry point
// Route: /[locale]
// ============================================================================

import { CvUploadForm } from '@/components/candidates/CvUploadForm';
import { type Locale } from '@/lib/i18n';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  return (
    <main className="min-h-screen bg-base flex items-center justify-center">
      <CvUploadForm locale={locale} />
    </main>
  );
}
