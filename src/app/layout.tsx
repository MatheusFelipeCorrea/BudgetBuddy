import './globals.css';

export const metadata = {
  title: 'BudgetBuddy',
  description: 'Controle suas finanças de forma simples e eficiente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}