# Deploy na Vercel

1. Importe `msgdo2007-code/NIVO` na Vercel.
2. Cadastre `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` e um `ANALYTICS_HASH_SECRET` aleatório com pelo menos 32 caracteres em Development, Preview e Production. Mantenha `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false` até configurar o Google no Supabase.
3. Em Production use `NEXT_PUBLIC_SITE_URL=https://nivo-gamma.vercel.app`. Em Development use `http://localhost:3000`. Preview deve usar uma URL estável autorizada no Supabase ou o domínio de produção até existir um fluxo próprio de previews.
4. No Supabase, configure Site URL e Redirect URLs para `/auth/callback` nos domínios usados.
5. No Discord Developer Portal, o único callback do provedor é `https://nryyzihihimsuamdzlex.supabase.co/auth/v1/callback`.
6. Faça um novo deploy depois de qualquer alteração de variável; deployments existentes não recebem valores retroativamente.

Nunca use o callback Next.js (`/auth/callback`) diretamente no Discord. Discord retorna ao Supabase; o Supabase retorna ao aplicativo.

## Cookies de autenticação

O Supabase SSR usa codificação `tokens-only` nos clientes de navegador, servidor e proxy para manter o header abaixo dos limites da borda da Vercel. Ao migrar uma sessão antiga que já retorna `494 REQUEST_HEADER_TOO_LARGE`, apague uma vez os cookies de `nivo-gamma.vercel.app` no navegador e entre novamente; a requisição bloqueada não chega ao aplicativo e, por isso, não pode ser limpa pelo servidor.
