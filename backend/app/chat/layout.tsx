import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { hasSupabaseEnv } from '@/lib/env';

export default async function ChatLayout({ children }: PropsWithChildren) {
  if (!hasSupabaseEnv()) {
    // In demo mode without Supabase, redirect to login as there is no auth context
    return redirect('/login');
  }

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return <>{children}</>;
}
