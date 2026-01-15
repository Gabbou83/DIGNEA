import { redirect } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { OnboardingWizard } from './_components/onboarding-wizard';

export const metadata = {
  title: 'Configuration - RPA Portal',
};

export default async function OnboardingPage() {
  // Verify authentication
  const client = getSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  // Redirect to auth page if not authenticated
  if (!user) {
    redirect('/auth/sign-in?redirect=/rpa/onboarding');
  }
  return (
    <>
      <PageHeader
        title={'Bienvenue sur DIGNEA'}
        description={'Configurez votre residence en quelques etapes simples'}
      />

      <PageBody>
        <div className="mx-auto max-w-3xl">
          <OnboardingWizard />
        </div>
      </PageBody>
    </>
  );
}
