"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("common");

  const switchLanguage = (locale: string) => {
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPathname);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-seville-orange transition-colors">
        <span className="text-lg">{currentLocale === "es" ? "🇪🇸" : "🇬🇧"}</span>
        <span>{currentLocale === "es" ? "Español" : "English"}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
      >
        <button
          onClick={() => switchLanguage("es")}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 ${
            currentLocale === "es"
              ? "text-seville-orange bg-orange-50"
              : "text-gray-700"
          }`}
        >
          <span className="text-lg">🇪🇸</span>
          <div>
            <div className="font-medium">Español</div>
            <div className="text-xs text-gray-500">Spanish</div>
          </div>
          {currentLocale === "es" && (
            <svg
              className="w-4 h-4 text-seville-orange ml-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <button
          onClick={() => switchLanguage("en")}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 ${
            currentLocale === "en"
              ? "text-seville-orange bg-orange-50"
              : "text-gray-700"
          }`}
        >
          <span className="text-lg">🇬🇧</span>
          <div>
            <div className="font-medium">English</div>
            <div className="text-xs text-gray-500">Inglés</div>
          </div>
          {currentLocale === "en" && (
            <svg
              className="w-4 h-4 text-seville-orange ml-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </motion.div>
    </div>
  );
}
