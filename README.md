# Desafio Node.js API

API de cursos usando Fastify + TypeScript + Drizzle ORM com PostgreSQL.

## Tecnologias

- Fastify
- TypeScript + Zod (`fastify-type-provider-zod`)
- Drizzle ORM + drizzle-kit
- PostgreSQL (via `docker-compose.yml`)
- Swagger com Scalar UI/OpenAPI (`@fastify/swagger` + `@scalar/fastify-api-reference`)
- Vitest + Supertest
- Biome

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

   - `DATABASE_URL` (ex.: `postgresql://docker:docker@localhost:5432/desafio`)
   - `NODE_ENV=development` para habilitar `/docs`.
   - `PORT` (ex.: `5555`)

2. Suba o banco de dados:

   ```bash
   docker compose up -d

   Observação: `docker/setup.sql` cria o banco `desafio_teste` (PostgreSQL) ao subir o container.
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

   - Healthcheck: `GET http://localhost:5555/health` (ou porta definida em `PORT`)
   - Docs (dev): `GET http://localhost:5555/docs`

6. Build (produção):
   ```bash
   pnpm build
   pnpm start
   ```
   - O `start` carrega variáveis do `.env` via `dotenv-cli` e executa `dist/server.js`.

## Scripts

- `pnpm dev`: inicia com watch e `--experimental-strip-types`
- `pnpm build`: compila TypeScript para `dist/`
- `pnpm start`: inicia o servidor compilado (`dist/server.js`) carregando `.env`
- `pnpm db:generate`: gera migrations
- `pnpm db:migrate`: aplica migrations
- `pnpm db:seed`: executa seed (usa `--experimental-strip-types` diretamente em `src/database/seed.ts`)
- `pnpm db:studio`: abre o Drizzle Studio
- `pnpm test`: executa testes (Vitest)

## Endpoints

Base: `http://localhost:3333`

- `GET /health` → "ok"
- `GET /courses` → `{ courses: [{ id, title }] }`
- `GET /courses/:id` → `200 { course: { id, title, description|null } }` ou `404 { message }`
- `POST /courses` → body `{ title: string>=5, description?: string }` retorna `201 { courseId }`

### Fluxo principal (Create Course)

Diagrama do fluxo do endpoint `POST /courses`:

```mermaid
sequenceDiagram
  autonumber
  participant C as Client
  participant F as Fastify (Route)
  participant V as Zod (Validator)
  participant D as Drizzle (DB)
  participant PG as PostgreSQL

  C->>F: POST /courses { title, description? }
  F->>V: valida body (z.object)
  V-->>F: ok | erro 400
  alt válido
    F->>D: insert into courses returning id
    D->>PG: SQL (INSERT ... RETURNING id)
    PG-->>D: { id }
    D-->>F: { id }
    F-->>C: 201 { courseId }
  else inválido
    F-->>C: 400 { message }
  end
```

## Modelo de Dados (Drizzle)

- `users(id uuid pk, name text, email text unique)`
- `courses(id uuid pk, title text unique, description text|null)`
- `enrollments(id uuid pk, course_id fk, user_id fk, created_at timestamptz default now, unique(course_id,user_id))`

## Execução

- Desenvolvimento: `pnpm dev`
- Produção: `pnpm build && pnpm start`

## Testes e Seed

- Testes (usa `.env.test`):
  ```bash
  pnpm test
  ```
- Seed (usa `.env`):
  ```bash
  pnpm db:seed
  ```

## Licença

ISC
