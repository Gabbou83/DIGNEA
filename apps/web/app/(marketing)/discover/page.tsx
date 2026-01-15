import { Button } from '@kit/ui/button';

export const metadata = {
  title: 'Découvrir - DIGNÉA',
  description:
    'Trouvez la résidence parfaite pour votre proche au Québec. La dignité qu\'ils méritent.',
};

export default function DiscoverPage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Trouvez la résidence parfaite pour votre proche
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Une conversation simple et empathique pour vous guider vers les
            meilleures options de résidence au Québec.
          </p>
          <p className="mb-10 text-lg italic text-primary">
            &quot;La dignité qu&apos;ils méritent&quot;
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="/discover/search">Commencer la recherche</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <a href="#how-it-works">Comment ça marche?</a>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Comment ça marche?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  1
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                Racontez-nous vos besoins
              </h3>
              <p className="text-muted-foreground">
                Discutez naturellement avec notre assistant. Pas de formulaire
                compliqué, juste une conversation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  2
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                Découvrez les meilleures options
              </h3>
              <p className="text-muted-foreground">
                Recevez des recommandations personnalisées basées sur le
                profil, le budget et la localisation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  3
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                Contactez directement
              </h3>
              <p className="text-muted-foreground">
                Envoyez votre demande à plusieurs résidences en un clic.
                Recevez des réponses rapidement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="bg-primary/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Notre impact au Québec
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <p className="mb-2 text-5xl font-bold text-primary">18,000</p>
              <p className="text-lg text-muted-foreground">
                Unités disponibles en résidences
              </p>
            </div>

            <div className="text-center">
              <p className="mb-2 text-5xl font-bold text-primary">2,524</p>
              <p className="text-lg text-muted-foreground">
                Patients hospitalisés en attente
              </p>
            </div>

            <div className="text-center">
              <p className="mb-2 text-5xl font-bold text-primary">31-82M$</p>
              <p className="text-lg text-muted-foreground">
                Économies annuelles potentielles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Ce que disent les familles
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Testimonial 1 */}
            <div className="rounded-lg border bg-card p-8">
              <p className="mb-4 italic text-muted-foreground">
                &quot;DIGNÉA m&apos;a aidé à trouver une résidence pour ma mère en
                moins de 48h. Le processus était simple et les résidences ont
                répondu rapidement.&quot;
              </p>
              <p className="font-semibold">— Marie-Claude, Gatineau</p>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-lg border bg-card p-8">
              <p className="mb-4 italic text-muted-foreground">
                &quot;Contrairement aux autres plateformes, DIGNÉA comprend
                vraiment nos besoins. Pas de formulaire sans fin, juste une
                conversation.&quot;
              </p>
              <p className="font-semibold">— Jean-François, Montréal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-b from-background to-primary/10 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-6 text-3xl font-bold">
            Prêt à commencer votre recherche?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Commencez une conversation avec notre assistant dès maintenant.
            Gratuit et sans engagement.
          </p>
          <Button size="lg" asChild>
            <a href="/discover/search">Commencer maintenant</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
