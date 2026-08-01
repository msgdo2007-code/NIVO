<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NIVO engineering rules

- Leia este arquivo, o README e as migrations antes de editar.
- Preserve funcionalidades existentes e nunca substitua dados persistidos por mocks.
- Use Server Components por padrão e Client Components apenas quando houver interação real.
- Nunca importe `SUPABASE_SECRET_KEY` em código acessível pelo navegador.
- Toda tabela acessível pelo cliente deve ter RLS e políticas mínimas explícitas.
- Toda mutation deve validar entrada e autorização no servidor.
- Antes de concluir uma fase, execute `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
- Não edite migrations já aplicadas; crie migrations incrementais.
