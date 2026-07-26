// ─── LanguageSwitch 元件：語系切換 ───

import type { ReactNode } from 'react';
import { useI18nStore } from '../stores/i18n-store';
import { getAvailableLocales } from '../i18n';
import type { Locale } from '../i18n';
import styles from './LanguageSwitch.module.css';

const LOCALE_LABELS: Record<Locale, string> = {
  'zh-TW': '中文',
  en: 'EN',
};

export function LanguageSwitch(): ReactNode {
  const { locale, setLocale } = useI18nStore();

  return (
    <div className={styles.languageSwitch}>
      {getAvailableLocales().map((loc) => (
        <button
          key={loc}
          className={`${styles.langBtn} ${locale === loc ? styles.langBtnActive : ''}`}
          onClick={() => setLocale(loc)}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
