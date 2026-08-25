import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
export default function Page() {
  return (
    <AuthLayout mode="login">
      <header>
        <h1>Welcome Back</h1>
        <p>Masuk ke hub logistik agrikultur Anda.</p>
      </header>
      <form className="form">
        <button type="button" className="google">
          G　 Lanjutkan dengan Google
        </button>
        <div className="divider">ATAU</div>
        <label>
          Email atau Nomor HP
          <input placeholder="Masukkan email atau no HP" />
        </label>
        <label>
          Kata Sandi
          <input type="password" placeholder="••••••••" />
        </label>
        <div className="row">
          <label className="check">
            <input type="checkbox" /> Ingat Saya
          </label>
          <a>Lupa Kata Sandi?</a>
        </div>
        <Link className="button secondary full" href="/dashboard">
          Masuk Sekarang
        </Link>
      </form>
      <p className="auth-switch">
        Belum punya akun? <Link href="/register">Daftar Sekarang</Link>
      </p>
    </AuthLayout>
  );
}
