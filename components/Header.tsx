import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  const t = useTranslations('Header');

  return (
    <header className="border-b">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent sm:text-2xl">
          {t('title')}
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <nav className="grid grid-cols-3 gap-1 sm:flex sm:gap-4">
            <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "px-2 text-sm sm:px-4")}>
              {t('home')}
            </Link>
            <Link href="/about" className={cn(buttonVariants({ variant: "ghost" }), "px-2 text-sm sm:px-4")}>
              {t('about')}
            </Link>
            <Link href="/api" className={cn(buttonVariants({ variant: "ghost" }), "px-2 text-sm sm:px-4")}>
              {t('api')}
            </Link>
          </nav>
          <div className="self-start sm:self-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
