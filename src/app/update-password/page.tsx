"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/shared/lib/supabase/client";

export default function Page() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    handled.current = true;

    const updatePassword = async () => {
      const password = window.prompt(
        "Masukkan kata sandi baru minimal 8 karakter.",
      );

      if (!password) {
        router.replace("/login");
        return;
      }

      if (password.length < 8) {
        window.alert("Kata sandi harus memiliki minimal 8 karakter.");

        router.replace("/login");
        return;
      }

      const confirmPassword = window.prompt(
        "Masukkan kembali kata sandi baru.",
      );

      if (password !== confirmPassword) {
        window.alert("Konfirmasi kata sandi tidak sama.");

        router.replace("/login");
        return;
      }

      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        window.alert(
          "Kata sandi gagal diperbarui. Tautan mungkin sudah kedaluwarsa.",
        );

        router.replace("/login");
        return;
      }

      await supabase.auth.signOut();

      window.alert("Kata sandi berhasil diperbarui. Silakan masuk kembali.");

      router.replace("/login");
      router.refresh();
    };

    void updatePassword();
  }, [router]);

  return null;
}
