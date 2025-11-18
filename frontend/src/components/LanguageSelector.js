import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'mg', flag: '🇲🇬', name: 'Malagasy' },
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="language-selector">
      <button className="language-button" onClick={handleClick} title={t('changeLanguage')}>
        <span className="flag">{currentLang.flag}</span>
        <span className="lang-code">{currentLang.code.toUpperCase()}</span>
      </button>
      <div className={`language-dropdown ${isOpen ? 'open' : ''}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`language-option ${language === lang.code ? 'active' : ''}`}
            onClick={() => handleSelect(lang.code)}
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
