export default function SimpleRPAPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      color: '#000',
      padding: '20px'
    }}>
      <div style={{
        border: '2px solid #000',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
          Portail RPA - DIGNEA
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Le serveur fonctionne! ✅
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/auth/sign-in"
            style={{
              padding: '12px 24px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Se connecter
          </a>
          <a
            href="/auth/sign-up"
            style={{
              padding: '12px 24px',
              border: '2px solid #000',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Creer un compte
          </a>
        </div>
      </div>
    </div>
  );
}
