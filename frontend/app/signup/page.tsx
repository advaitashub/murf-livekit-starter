import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getCurrentUserFromHeaders } from '@/lib/auth';
import { SignupForm } from '@/components/auth/signup-form';

export default async function SignupPage() {
  const hdrs = await headers();
  const user = getCurrentUserFromHeaders(hdrs);
  if (user) {
    redirect('/');
  }

  return <SignupForm />;
}
