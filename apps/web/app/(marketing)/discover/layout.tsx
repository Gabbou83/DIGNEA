import { ReactNode } from 'react';

interface DiscoverLayoutProps {
  children: ReactNode;
}

export default function DiscoverLayout({ children }: DiscoverLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">DIGNÉA</span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <a
              href="/discover"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Découvrir
            </a>
            <a
              href="/rpa"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Espace RPA
            </a>
            <a
              href="/auth/sign-in"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Se connecter
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">DIGNÉA</h3>
              <p className="text-sm text-muted-foreground">
                La dignité qu&apos;ils méritent
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">Pour les familles</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/discover" className="hover:text-primary">
                    Rechercher une résidence
                  </a>
                </li>
                <li>
                  <a href="/discover#how-it-works" className="hover:text-primary">
                    Comment ça marche
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">
                Pour les résidences
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/rpa" className="hover:text-primary">
                    Espace gestionnaire
                  </a>
                </li>
                <li>
                  <a href="/rpa/onboarding" className="hover:text-primary">
                    Inscription
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/privacy" className="hover:text-primary">
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-primary">
                    Conditions d&apos;utilisation
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} DIGNÉA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
