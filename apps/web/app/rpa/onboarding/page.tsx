import { PageBody, PageHeader } from '@kit/ui/page';

import { OnboardingWizard } from './_components/onboarding-wizard';

export const metadata = {
  title: 'Configuration - RPA Portal',
};

export default function OnboardingPage() {
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
