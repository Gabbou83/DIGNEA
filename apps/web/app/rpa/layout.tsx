export const metadata = {
  title: `RPA Portal - DIGNEA`,
};

export const dynamic = 'force-dynamic';

export default function RPALayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
