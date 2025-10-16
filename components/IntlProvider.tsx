"use client";

import { NextIntlClientProvider } from "next-intl";
import { useLocale } from "next-intl";

export function IntlProvider({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: Record<string, any>;
}) {
  const locale = useLocale();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
