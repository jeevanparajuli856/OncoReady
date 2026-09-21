# Frontend

Place project frontend code here.

The Codex frontend specialist owns frontend design and implementation. The frontend should communicate the product's real value clearly and feel intentional, distinctive, responsive, and complete around the hero journey, while respecting product, architecture, applicable interface, security, accessibility, performance, brand, and human constraints.

## Railway web service

Configure the Railway `web` service source root as `/frontend`. The root-local
`railway.json` uses the Dockerfile and sets its repository-root-relative watch
pattern to `/frontend/**`, so backend-only changes do not rebuild the web
service. Caddy serves the Vite build, answers `/health`, and falls back to
`index.html` for SPA routes such as `/privacy` and `/terms`.

Set `VITE_API_ORIGIN` to the public API origin (for example,
`https://api.example.com`) before the Railway build. It is the only frontend API
environment value and is intentionally public; do not add an operator token,
database URL, or other server credential to the web service.
