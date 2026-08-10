import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { App } from '@/components/app/app';
import { getAppConfig } from '@/lib/utils';
import { getCurrentUserFromHeaders } from '@/lib/auth';

export default async function Page() {
  const hdrs = await headers();
  const user = getCurrentUserFromHeaders(hdrs);
  if (!user) {
    redirect('/login');
  }

  const appConfig = await getAppConfig(hdrs);

  return <App appConfig={appConfig} />;
}
