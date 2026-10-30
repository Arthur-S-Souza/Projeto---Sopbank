# Sopbank

Aplicativo bancário demo (Ionic + Angular) com cadastro, login, saldo, depósitos, saques, transferências entre contas e extrato.

## Funcionalidades

- Tela inicial com atalhos para login e cadastro
- Cadastro com validação de CPF, e-mail e senha
- Login com sessão persistida no navegador (`localStorage`)
- Painel da conta com saldo e operações financeiras
- Transferências entre usuários cadastrados (por CPF)
- Extrato filtrável por tipo de movimentação
- Rotas protegidas para área logada

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm 8+

## Como executar

```bash
npm install --legacy-peer-deps
npm start
```

Abra [http://localhost:4200](http://localhost:4200) no navegador.

## Build de produção

```bash
npm run build
```

Os arquivos ficam em `www/`.

## Observações

- Os dados ficam apenas no navegador (sem backend). Limpar o storage apaga contas e transações.
- Senhas são armazenadas com hash simples apenas para demonstração — não use em produção.

## Estrutura

- `src/app/services` — autenticação e operações de conta
- `src/app/guards` — proteção de rotas autenticadas
- `src/app/principal` — dashboard da conta
- `src/app/relatorio` — extrato de transações
