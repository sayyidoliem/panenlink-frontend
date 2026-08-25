import Link from "next/link";
import { Sprout } from "lucide-react";
export function AuthLayout({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <main className="auth">
      <section className={`auth-visual ${mode}`}>
        <div>
          <h2>
            {mode === "login"
              ? "“Menghubungkan setiap jengkal sawah dengan rantai pasok terpercaya.”"
              : "Distribusi Hasil Panen Tanpa Perantara."}
          </h2>
          <span>Efisiensi Logistik Agrikultur</span>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-tools">ID / EN　☾</div>
        <div className="auth-box">
          <Link href="/" className="auth-brand">
            <Sprout />
            PanenLink
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
