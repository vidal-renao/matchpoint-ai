// ============================================================================
// MatchPoint AI — i18n Utility
// Lightweight translation hook for client components
// ============================================================================

import { useCallback } from 'react';

import en from '@/messages/en.json';
import es from '@/messages/es.json';
import de from '@/messages/de.json';

export type Locale = 'en' | 'es' | 'de';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es', 'de'];
export const DEFAULT_LOCALE: Locale = 'es';

type Messages = typeof en;

const messages: Record<Locale, Messages> = { en, es, de };

/**
 * Get a nested value from an object using a dot-separated path.
 * e.g. getNestedValue(obj, 'upload.title') => obj.upload.title
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path; // fallback: return the key itself
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : path;
}

/**
 * Translation function type.
 * Supports interpolation: t('profile.yearsExp', { count: 5 })
 */
export type TFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Hook: useTranslations
 * Returns a t() function bound to the given locale.
 */
export function useTranslations(locale: Locale = DEFAULT_LOCALE): TFunction {
  const dict = messages[locale] ?? messages[DEFAULT_LOCALE];

  const t: TFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let value = getNestedValue(dict as unknown as Record<string, unknown>, key);

      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          value = value.replace(`{${paramKey}}`, String(paramValue));
        }
      }

      return value;
    },
    [dict]
  );

  return t;
}

/**
 * Server-side translation (non-hook version).
 * Use in Server Components or Server Actions.
 */
export function getTranslations(locale: Locale = DEFAULT_LOCALE): TFunction {
  const dict = messages[locale] ?? messages[DEFAULT_LOCALE];

  return (key: string, params?: Record<string, string | number>) => {
    let value = getNestedValue(dict as unknown as Record<string, unknown>, key);

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(`{${paramKey}}`, String(paramValue));
      }
    }

    return value;
  };
}
