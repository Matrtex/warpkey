import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import "../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

function isValidLocale(locale: string): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export const metadata = {
  title: 'Warp Key Automatic Collection Tool',
  description: 'Automated tool for collecting and verifying Cloudflare Warp+ keys.',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // 确保传入的 locale 是受支持的语言。
  if (!isValidLocale(locale)) {
    notFound();
  }

  // 将当前语言文案提供给客户端组件使用。
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
