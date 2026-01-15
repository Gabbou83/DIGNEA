export default function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="rounded-lg border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold">Test Page</h1>
        <p className="mt-2 text-muted-foreground">
          Si vous voyez ceci, le serveur fonctionne!
        </p>
        <div className="mt-4 space-x-4">
          <a
            href="/auth/sign-in"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Se connecter
          </a>
          <a
            href="/rpa"
            className="rounded-md border px-4 py-2 hover:bg-accent"
          >
            RPA Portal
          </a>
        </div>
      </div>
    </div>
  );
}
