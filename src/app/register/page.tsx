import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
export default function Page() {
  return (
    <AuthLayout mode="register">
      <header>
        <h1>Buat Akun Pemilik Panen</h1>
        <p>Mulai publikasikan hasil panen dan temukan armada balik terdekat.</p>
      </header>
      <form className="form">
        <label>
          Nama Lengkap / Username
          <input placeholder="Masukkan nama lengkap" />
        </label>
        <label>
          Email atau WhatsApp
          <input placeholder="08123456789 atau email@domain.com" />
        </label>
        <label>
          Kata Sandi
          <input type="password" placeholder="Minimal 8 karakter" />
        </label>
        <label>
          Konfirmasi Kata Sandi
          <input type="password" placeholder="Ulangi kata sandi" />
        </label>
        <label className="check">
          <input type="checkbox" /> Saya menyetujui Syarat & Ketentuan.
        </label>
        <Link className="button secondary full" href="/dashboard">
          Daftar Akun Pemilik Panen
        </Link>
      </form>
      <p className="auth-switch">
        Sudah punya akun? <Link href="/login">Masuk di sini</Link>
      </p>
    </AuthLayout>
  );
}
