# Desafio Node.js API

API minimalista usando Fastify + TypeScript + Drizzle ORM com PostgreSQL.

## Tecnologias

- Fastify
- TypeScript + Zod (`fastify-type-provider-zod`)
- Drizzle ORM + drizzle-kit
- PostgreSQL (via `docker-compose.yml`)
- Swagger UI/OpenAPI (`@fastify/swagger` + `@scalar/fastify-api-reference`)
- Vitest + Supertest

## Requisitos

- Node.js 20+
- pnpm (recomendado)
- Docker + Docker Compose (para banco local)

## Configuração

1. Copie `.env.example` para `.env` e ajuste:
   ```bash
   cp .env.example .env
   ```
   Variáveis principais:
   - `DATABASE_URL` (ex.: `postgres://docker:docker@localhost:5432/desafio`)
   - `NODE_ENV=development` para habilitar `/docs`.

2. Suba o banco de dados:
   ```bash
   docker compose up -d
   ```

3. Instale as dependências:
   ```bash
   pnpm install
   ```

4. Rode as migrações (Drizzle):
   ```bash
   pnpm db:migrate
   ```

5. Inicie em desenvolvimento:
   ```bash
   pnpm dev
   ```
   - Healthcheck: `GET http://localhost:3333/health`
   - Docs (dev): `GET http://localhost:3333/docs`

## Scripts

- `pnpm dev`: inicia com watch e `--experimental-strip-types`
- `pnpm start`: inicia sem build (veja Nota de Produção)
- `pnpm db:generate`: gera migrations
- `pnpm db:migrate`: aplica migrations
- `pnpm db:seed`: executa seed (se configurado)
- `pnpm db:studio`: abre o Drizzle Studio
- `pnpm test`: executa testes (Vitest)

## Endpoints

Base: `http://localhost:3333`

- `GET /health` → "ok"
- `GET /courses` → `{ courses: [{ id, title }] }`
- `GET /courses/:id` → `200 { course: { id, title, description|null } }` ou `404 { message }`
- `POST /courses` → body `{ title: string>=5, description?: string }` retorna `201 { courseId }`

## Modelo de Dados (Drizzle)

- `users(id uuid pk, name text, email text unique)`
- `courses(id uuid pk, title text unique, description text|null)`
- `enrollments(id uuid pk, course_id fk, user_id fk, created_at timestamptz default now, unique(course_id,user_id))`

## Nota de Produção

O script `start` atual não compila TypeScript. Opções:

- Ajustar `start` para usar `--experimental-strip-types`.
- Ou adicionar etapa de build (`tsc` emitindo JS) e apontar `main`/`start` para `dist/`.

## Licença

ISC
