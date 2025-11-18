import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'mg', flag: '🇲🇬', name: 'Malagasy' },
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="language-selector">
      <button className="language-button" title={t('changeLanguage')}>
        <span className="flag">{currentLang.flag}</span>
        <span className="lang-code">{currentLang.code.toUpperCase()}</span>
      </button>
      <div className="language-dropdown">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`language-option ${language === lang.code ? 'active' : ''}`}
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="flag">{lang.flag}</span>
            <span className="lang-name">{lang.name}</span>
            {language === lang.code && <span className="checkmark">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
