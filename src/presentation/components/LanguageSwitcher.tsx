import { Select } from 'antd';
import { Globe } from 'lucide-react';
import { useTranslation, Language } from '../../infrastructure/i18n';

const languages = [
  { value: 'vi' as Language, label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en' as Language, label: 'English', flag: '🇺🇸' },
  { value: 'ko' as Language, label: '한국어', flag: '🇰🇷' },
];

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <Select
      value={language}
      onChange={setLanguage}
      className="w-32"
      suffixIcon={<Globe size={16} className="text-gray-400" />}
      options={languages.map((lang) => ({
        value: lang.value,
        label: (
          <div className="flex items-center gap-1">
            <span>{lang.flag}</span>
            <span className="text-sm">{lang.label}</span>
          </div>
        ),
      }))}
    />
  );
};
