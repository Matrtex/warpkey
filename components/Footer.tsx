import { BookOpen, Github, Globe2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const repositoryUrl = 'https://github.com/Matrtex/warpkey';
const wikiUrl = 'https://github.com/Matrtex/warpkey/wiki';
const authorUrl = 'https://www.wanghaoyu.com.cn';

export function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/api', label: t('api') },
  ] as const;

  const resourceLinks = [
    { href: repositoryUrl, label: t('source'), icon: Github },
    { href: wikiUrl, label: t('wiki'), icon: BookOpen },
    { href: authorUrl, label: t('blog'), icon: Globe2 },
  ] as const;

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
            >
              {t('brand')}
            </Link>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {t('description')}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('mode')}
            </p>
          </div>

          <nav aria-label={t('navigation')} className="space-y-3">
            <h2 className="text-sm font-semibold">{t('navigation')}</h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label={t('resources')} className="space-y-3">
            <h2 className="text-sm font-semibold">{t('resources')}</h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {resourceLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{t('copyright', { year })}</span>
          <span>{t('license')}</span>
        </div>
      </div>
    </footer>
  );
}
