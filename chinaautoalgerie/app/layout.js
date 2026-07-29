import './globals.css';

export const metadata = {
  title: 'China Auto Algérie - Véhicules chinois neufs en Algérie',
  description: 'China Auto Algérie - Votre porte d\'entrée professionnelle pour les véhicules chinois neufs en Algérie. Import direct, prix transparents FOB, service local.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
