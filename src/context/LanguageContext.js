import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../constants/translations';
import { getAppLanguage, saveAppLanguage } from '../services/localStorageService';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ta'); // Default to Tamil
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    async function loadLang() {
      try {
        const stored = await getAppLanguage();
        if (stored.language) {
          setLanguageState(stored.language);
        }
        setHasChosenLanguage(stored.hasChosenLanguage);
      } catch (e) {
        console.warn('Error loading language from storage:', e);
      } finally {
        setIsLanguageLoaded(true);
      }
    }
    loadLang();
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    saveAppLanguage(lang);
  };

  const chooseLanguage = (lang) => {
    setLanguageState(lang);
    setHasChosenLanguage(true);
    saveAppLanguage(lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'ta' ? 'en' : 'ta';
    setLanguage(nextLang);
  };

  /**
   * Translation helper with support for:
   * 1. Direct keys: t('welcomeTitle')
   * 2. Nested dot paths: t('timelineSteps.step1Title')
   * 3. Fallback to timelineSteps sub-object: t('step1Title')
   * 4. English dictionary fallback
   */
  const t = (key) => {
    if (!key) return '';
    const currentDict = translations[language] || translations.en;

    // Direct key match
    if (currentDict[key] !== undefined) return currentDict[key];

    // Dot-notation nested key match (e.g. 'timelineSteps.step1Title')
    if (key.includes('.')) {
      const parts = key.split('.');
      let val = currentDict;
      for (const p of parts) {
        if (val && typeof val === 'object' && val[p] !== undefined) {
          val = val[p];
        } else {
          val = undefined;
          break;
        }
      }
      if (val !== undefined && typeof val === 'string') return val;

      // Check in English dictionary as fallback
      let enVal = translations.en;
      for (const p of parts) {
        if (enVal && typeof enVal === 'object' && enVal[p] !== undefined) {
          enVal = enVal[p];
        } else {
          enVal = undefined;
          break;
        }
      }
      if (enVal !== undefined && typeof enVal === 'string') return enVal;
    }

    // Direct match in English dictionary
    if (translations.en[key] !== undefined) return translations.en[key];

    // Check if key exists inside timelineSteps sub-dictionary directly
    if (currentDict.timelineSteps && currentDict.timelineSteps[key] !== undefined) {
      return currentDict.timelineSteps[key];
    }
    if (translations.en.timelineSteps && translations.en.timelineSteps[key] !== undefined) {
      return translations.en.timelineSteps[key];
    }

    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        chooseLanguage,
        hasChosenLanguage,
        setHasChosenLanguage,
        isLanguageLoaded,
        t,
        toggleLanguage,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
