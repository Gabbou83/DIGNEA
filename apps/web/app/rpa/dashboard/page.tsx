import Link from 'next/link';

export const metadata = {
  title: 'Tableau de bord - RPA Portal',
};

export default function RPADashboardPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Portail RPA - DIGNEA</h1>
        <p className="mt-2 text-muted-foreground">
          Gerez vos disponibilites et consultez vos demandes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Disponibilites</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Mettez a jour le nombre d'unites disponibles
          </p>
          <Link
            href="/rpa/availability"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Mettre a jour
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Demandes</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Consultez les demandes de contact
          </p>
          <Link
            href="/rpa/inquiries"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Voir les demandes
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Configuration</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Configurez votre residence
          </p>
          <Link
            href="/rpa/onboarding"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Configurer
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-muted p-6">
        <h3 className="mb-2 font-semibold">Note</h3>
        <p className="text-sm text-muted-foreground">
          Cette version simplifiee du portail RPA vous permet de tester les fonctionnalites de base.
          Les donnees en temps reel seront disponibles apres authentification.
        </p>
      </div>
    </div>
  );
}
