# SopBank — Controle Financeiro

Aplicativo **desktop instalável** (Windows e macOS) para controle completo de finanças pessoais: entradas, saídas, contas, cartões de crédito e **compras parceladas**.

## Funcionalidades

- **Painel** com entradas, saídas, saldo em contas, gráficos e distribuição por categoria
- **Lançamentos** de entrada e saída (conta ou cartão à vista)
- **Cartões** com limite, fechamento/vencimento, uso mensal e **parcelas** (criação automática, marcar como pago, excluir compra)
- **Contas** bancárias, dinheiro e investimentos
- **Categorias** personalizáveis (com categorias padrão em português)
- Dados persistidos localmente em **SQLite** (no app desktop)
- Interface moderna em tema escuro (Plus Jakarta Sans)

## Requisitos para desenvolvimento

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install)
- Dependências de sistema do [Tauri 2](https://v2.tauri.app/start/prerequisites/) (WebView / toolchain)

## Instalação e execução

```bash
cd sopbank-app
npm install
npm run tauri:dev
```

Para gerar o instalador (.msi / .exe no Windows, .dmg / .app no macOS):

```bash
npm run tauri:build
```

Os instaladores ficam em `sopbank-app/src-tauri/target/release/bundle/`.

> **Nota:** O build nativo deve ser executado no sistema alvo (Windows ou macOS). No Linux é possível desenvolver a interface com `npm run dev` (dados em `localStorage` no navegador).

## Estrutura

| Pasta | Descrição |
|-------|-----------|
| `sopbank-app/src` | Interface React + TypeScript |
| `sopbank-app/src-tauri` | Shell Tauri, SQLite e instalador |
| `sopbank-app/src-tauri/migrations` | Schema do banco |

## Identificador do app

`com.sopbank.finance` — product name **SopBank**.

## Licença

MIT
