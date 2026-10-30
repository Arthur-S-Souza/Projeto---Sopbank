# SopWallet (Sopbank)

Carteira virtual completa com **app Ionic/Angular** + **API REST Node.js** (Express, SQLite, JWT).

## Arquitetura

| Camada | Tecnologia | Pasta |
|--------|------------|-------|
| Frontend | Ionic 6 + Angular 13 | `src/` |
| Backend | Express + TypeScript + SQLite | `server/` |
| Auth | JWT Bearer + bcrypt | `server/src/services` |
| Dados | SQLite (`server/data/sopbank.sqlite`) | persistido localmente |

## Funcionalidades

- Cadastro e login com validação
- Carteira com saldo em tempo real
- Depósito, saque, transferência (CPF) e **Pix** (chave/e-mail/CPF)
- Chave Pix personalizável
- Extrato com filtros
- Resumo de entradas, saídas e total de movimentações
- UI renovada (tema roxo + menta, visual fintech)

## API (prefixo `/api`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status da API |
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Login (retorna JWT) |
| GET | `/auth/me` | Perfil autenticado |
| GET | `/wallet` | Carteira + resumo |
| POST | `/wallet/deposit` | Depósito |
| POST | `/wallet/withdraw` | Saque |
| POST | `/wallet/transfer` | Transferência por CPF |
| POST | `/wallet/pix` | Pix por chave |
| PUT | `/wallet/pix-key` | Atualizar chave Pix |
| GET | `/transactions?tipo=` | Extrato |

## Como executar (recomendado)

```bash
npm install --legacy-peer-deps
npm install --prefix server
npm run dev
```

- Frontend: http://localhost:4200 (proxy `/api` → `localhost:3333`)
- API: http://localhost:3333/api/health

### Separado

```bash
npm run start:api   # só backend
npm start           # só frontend (com proxy)
```

## Variáveis de ambiente

Copie `server/.env.example` para `server/.env` (opcional):

- `PORT` — porta da API (padrão 3333)
- `JWT_SECRET` — segredo do JWT
- `DATABASE_PATH` — caminho do SQLite
- `CORS_ORIGIN` — origem do app (padrão `http://localhost:4200`)

## Testes

```bash
npm test
npm run test:api
```

## Build produção

```bash
npm run build:api
npm run build
```

Serve a pasta `www/` atrás de um reverse proxy que encaminhe `/api` para a API Node.

## Observação de segurança

Projeto educacional/demonstrativo. Em produção use HTTPS, segredos fortes, rate limit, auditoria e banco gerenciado.
