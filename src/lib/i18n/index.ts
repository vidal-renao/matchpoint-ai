// ============================================================================
// MatchPoint AI — i18n
// src/lib/i18n/index.ts
//
// Lightweight translation hook — no heavy i18n library needed.
// Supports dot-notation keys and {param} interpolation.
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

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  let current: unknown = obj;
  for (const key of path.split('.')) {
    if (!current || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : path;
}

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

/** Client hook — returns a t() bound to locale */
export function useTranslations(locale: Locale = DEFAULT_LOCALE): TFunction {
  const dict = messages[locale] ?? messages[DEFAULT_LOCALE];
  return useCallback(
    (key, params) => {
      let value = getNestedValue(dict as unknown as Record<string, unknown>, key);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [dict]
  );
}

/** Server utility — use in Server Components / Server Actions */
export function getTranslations(locale: Locale = DEFAULT_LOCALE): TFunction {
  const dict = messages[locale] ?? messages[DEFAULT_LOCALE];
  return (key, params) => {
    let value = getNestedValue(dict as unknown as Record<string, unknown>, key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  };
}
