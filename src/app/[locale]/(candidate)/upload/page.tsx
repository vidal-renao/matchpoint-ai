// ============================================================================
// Upload Page — protected CV upload route
// Route: /[locale]/upload (requires auth via middleware)
// ============================================================================

import { Header } from '@/components/layout/Header';
import { CvUploadForm } from '@/components/candidates/CvUploadForm';
import type { Locale } from '@/lib/i18n';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function UploadPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased overflow-x-hidden">
        <div className="ambient-glow" />
        <div className="pt-14 min-h-screen flex flex-col">
          <CvUploadForm locale={locale} />
        </div>
      </div>
    </>
  );
}
