import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import Link from 'next/link';
import { ShieldCheck, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { pageTitle, pageDescription, companyName, logo, logoDark } = appConfig;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </head>
      <body className="overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex">
            <div className="flex items-center gap-6">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://livekit.io"
                className="scale-100 transition-transform duration-300 hover:scale-110"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={`${companyName} Logo`} className="block size-6 dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoDark ?? logo}
                  alt={`${companyName} Logo`}
                  className="hidden size-6 dark:block"
                />
              </a>

              <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-3">
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-2 rounded-md bg-zinc-900/50 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-900/60"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/escalations"
                  className="inline-flex items-center gap-2 rounded-md bg-zinc-900/50 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-900/60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Human Help</span>
                </Link>
              </nav>
            </div>
          </header>

          {children}
          <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2">
            <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
