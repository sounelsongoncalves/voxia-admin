---
description: How to add translations to a new page
---

1.  **Identify Strings:** Open the page component (e.g., `pages/DriversList.tsx`) and identify all hardcoded strings.
2.  **Add Keys to JSON:**
    *   Open `src/i18n/locales/pt.json`, `en.json`, and `es.json`.
    *   Add a new section for the page (e.g., `"drivers": { ... }`) or add to existing sections like `"common"` or `"table"`.
    *   Add the keys and translations for each language.
3.  **Update Component:**
    *   Import `useTranslation`: `import { useTranslation } from 'react-i18next';`
    *   Initialize hook: `const { t } = useTranslation();`
    *   Replace strings with `t('section.key')`.
4.  **Verify:** Check if the strings appear correctly in all languages.
