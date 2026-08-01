# NIVO

Plataforma SaaS de páginas de links com identidade espacial, construída com Next.js, TypeScript, Tailwind CSS e Supabase.

## Estado atual

Fase 1 — Fundação:

- landing responsiva e layout inicial do dashboard;
- Supabase Auth por e-mail/senha e Discord; fluxo Google preparado atrás de uma flag;
- confirmação de e-mail, recuperação e atualização de senha;
- sessão SSR com cookies, callback PKCE e proteção de rotas privadas;
- migration inicial de perfis, configurações, papéis, auditoria e Storage;
- RLS em todas as tabelas acessíveis pelo cliente;
- testes unitários das validações e de redirect seguro.

## Desenvolvimento

Copie `.env.example` para `.env.local`, preencha somente com as credenciais de desenvolvimento e execute:

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Variáveis

- `NEXT_PUBLIC_SITE_URL`: origem pública sem barra final.
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave pública, permitida no navegador e protegida por RLS.
- `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`: use `true` somente depois de configurar o provedor Google no Supabase.
- `SUPABASE_SECRET_KEY`: chave exclusiva do servidor; nunca use prefixo `NEXT_PUBLIC_`.
- `CRON_SECRET` e `ADMIN_EMAILS`: reservadas para fases futuras.

O Client ID e o Client Secret do Discord são configurados no painel do Supabase Auth, não em variáveis do Next.js.

## Documentação

- [Banco de dados](docs/DATABASE.md)
- [Permissões e RLS](docs/PERMISSIONS.md)
- [Deploy](docs/DEPLOY.md)

## Próxima fase

Onboarding, escolha de username, templates iniciais, blocos do editor e perfil público.
