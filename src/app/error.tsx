"use client";
import { Button } from "@/components/ui/Button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error">
      <h1>Terjadi kesalahan</h1>
      <p>Data tidak dapat dimuat.</p>
      <Button onClick={reset}>Coba lagi</Button>
    </main>
  );
}
