import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { hasSupabaseEnv } from '@/lib/env';

export default async function LoginLayout({ children }: PropsWithChildren) {
  if (!hasSupabaseEnv()) {
    // Without Supabase env vars, just render the login page without redirect logic
    return <>{children}</>;
  }

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/');
  }

  return <>{children}</>;
}
