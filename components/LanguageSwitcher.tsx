import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('pt')}
                className={`p-1 rounded hover:bg-surface-2 transition-colors ${i18n.language === 'pt' ? 'ring-1 ring-brand-primary' : ''}`}
                title="Português"
            >
                <img src="https://flagcdn.com/w40/pt.png" alt="PT" className="w-6 h-4 object-cover rounded-sm" />
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`p-1 rounded hover:bg-surface-2 transition-colors ${i18n.language === 'en' ? 'ring-1 ring-brand-primary' : ''}`}
                title="English"
            >
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-6 h-4 object-cover rounded-sm" />
            </button>
            <button
                onClick={() => changeLanguage('es')}
                className={`p-1 rounded hover:bg-surface-2 transition-colors ${i18n.language === 'es' ? 'ring-1 ring-brand-primary' : ''}`}
                title="Español"
            >
                <img src="https://flagcdn.com/w40/es.png" alt="ES" className="w-6 h-4 object-cover rounded-sm" />
            </button>
        </div>
    );
};
