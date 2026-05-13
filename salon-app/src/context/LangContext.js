import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../i18n/en';
import hi from '../i18n/hi';

const translations = { en, hi };
const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('lang').then(val => {
      if (val === 'hi' || val === 'en') setLang(val);
    });
  }, []);

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem('lang', newLang);
  };

  const t = (key) => translations[lang][key] ?? translations['en'][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLanguage = () => useContext(LangContext);
