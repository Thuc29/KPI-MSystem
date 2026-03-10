import { vi } from './vi';
import { en } from './en';
import { ko } from './ko';

export const translations = {
  vi,
  en,
  ko,
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof vi;
