import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { hasSupabaseEnv } from '@/lib/env';

export default async function FilesLayout({ children }: PropsWithChildren) {
  if (!hasSupabaseEnv()) {
    // In demo mode without Supabase env vars, treat user as logged-out
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
