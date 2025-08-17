# Desafio Node.js API

API de cursos usando Fastify + TypeScript + Drizzle ORM com PostgreSQL. Suporte a Docker multi-stage com auto-migrations.

## Tecnologias

- Fastify
- TypeScript + Zod
- Drizzle ORM + drizzle-kit
- PostgreSQL
- Swagger com Scalar UI/OpenAPI
- Vitest + Supertest
- Biome
- JWT RS256

## Requisitos

- Node.js 22+
- pnpm (recomendado)
- Docker + Docker Compose (para banco local)

## Configuração

1. Copie `.env.example` para `.env` e ajuste:

   ```bash
   cp .env.example .env
   ```

   Variáveis principais:

   - `DATABASE_URL`
     - Dev local (fora do container): `postgresql://docker:docker@localhost:5432/desafio`
     - Em container (via docker-compose): `postgresql://docker:docker@db:5432/desafio`
   - `NODE_ENV=development` para habilitar `/docs`.
   - `PORT` (ex.: `5555`)
   - Chaves JWT RS256: veja a seção "JWT (RS256) — Geração e Configuração" abaixo

2. Suba o banco de dados:

   ```bash
   docker compose up -d

   Observação: `docker/setup.sql` cria o banco `desafio_teste` (PostgreSQL) ao subir o container do Postgres.
   ```

3. Instale as dependências:

   ```bash
   pnpm install
   ```

4. Rode as migrações (Drizzle):

   ```bash
   pnpm db:migrate

   Observação: quando rodando via Docker Compose, as migrações são executadas automaticamente no start do container da API (com espera do Postgres via `pg_isready`).
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

- `pnpm dev`: inicia com watch e `--experimental-strip-types` usando `.env` (`scripts.dev` em `package.json`)
- `pnpm build`: compila TypeScript para `dist/` (usa `tsconfig.build.json`)
- `pnpm start`: inicia o servidor compilado (`dist/server.js`) carregando `.env` (via `dotenv-cli`)
- `pnpm db:generate`: gera migrations
- `pnpm db:migrate`: aplica migrations (usa `drizzle.config.ts`)
- `pnpm db:seed`: executa seed (TS direto com `--experimental-strip-types`)
- `pnpm db:studio`: abre o Drizzle Studio
- `pnpm test`: executa testes (Vitest) com `pretest` migrando no `.env.test`

## Endpoints

Base: `http://localhost:5555`

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

## Docker

- Compose levanta `db` (Postgres 17) e `api` (Node 22 slim) com `env_file: .env`.
- No container, a API roda TypeScript diretamente com `--experimental-strip-types`.
- Ao iniciar, o container:
  - Aguarda o Postgres (`pg_isready` com defaults `db:5432`, `desafio`, user `docker`).
  - Executa `pnpm db:migrate` automaticamente.
  - Faz `pnpm prune --prod` e inicia o servidor.

Comandos úteis:

```bash
docker compose build --no-cache
docker compose up -d
docker compose logs -f api
```

Notas:

- Garanta que no `.env` usado pelo Compose o `DATABASE_URL` aponte para `db` e não `localhost`.
- O arquivo `.dockerignore` impede que `.env` vaze para o build da imagem; somente `.env.example` é versionado.

## JWT (RS256) — Geração e Configuração

A aplicação carrega as chaves em `src/app.ts` direto de arquivos PEM em `certs/`:

- `certs/private_key.pem` (privada)
- `certs/public_key.pem` (pública)

Passo a passo para gerar e configurar:

1. Crie a pasta (se necessário):

   ```bash
   mkdir -p certs
   ```

2. Gere as chaves RSA (recomendado 4096 bits):

   ```bash
   # chave privada
   openssl genrsa -out certs/private_key.pem 4096

   # chave pública a partir da privada
   openssl rsa -in certs/private_key.pem -pubout -out certs/public_key.pem
   ```

3. Aplique permissões restritas (boa prática):
   ```bash
   chmod 600 certs/private_key.pem
   chmod 644 certs/public_key.pem
   ```

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
