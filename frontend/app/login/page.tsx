import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getCurrentUserFromHeaders } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  const hdrs = await headers();
  const user = getCurrentUserFromHeaders(hdrs);
  if (user) {
    redirect('/');
  }

  return <LoginForm />;
}
