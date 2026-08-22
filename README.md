# PanenLink Next.js

Migrasi Vite ke Next.js App Router dengan Clean Architecture, TypeScript strict, Repository Pattern, use case OOP, reusable UI component, dan localStorage adapter.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Arsitektur

- `app`: composition root dan route App Router
- `features/panenlink/domain`: entity/type dan repository contract
- `features/panenlink/application`: use case serta DTO
- `features/panenlink/infrastructure`: localStorage repository dan seed
- `features/panenlink/presentation`: controller hook dan views
- `components/ui`: komponen reusable

`LocalPanenLinkRepository` hanya dipakai pada client boundary karena memakai browser API. Untuk backend nyata, buat `HttpPanenLinkRepository` yang memenuhi kontrak yang sama, lalu ganti dependency pada `PanenLinkApp`.
