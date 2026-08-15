# OOLA site experiment

Vue 3 + ViteSSG + `@vanduo-oss/vd3@1.4.0` — future home of
[oola.vanduo.dev](https://oola.vanduo.dev/). Bottom glass dock;
single SPA shell with Home / Icons / About panels.

```bash
pnpm install
pnpm dev
```

From the repo root:

```bash
pnpm --dir oolasite dev
# or: npm run site:dev
```

Single `/` route (unknown paths reuse the same shell). Drafts load from `../drafts/oola-structured-phi/`.
