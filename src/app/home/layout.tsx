
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
} 