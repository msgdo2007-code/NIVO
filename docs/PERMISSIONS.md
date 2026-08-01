# Permissões e RLS

Todas as tabelas públicas da Fase 1 têm RLS habilitado.

| Recurso | Leitura | Escrita pelo cliente |
| --- | --- | --- |
| `profiles` | Público apenas quando publicado; proprietário sempre lê | Apenas atualização do próprio registro |
| `profile_settings` | Proprietário ou perfil publicado | Apenas atualização do próprio registro |
| `account_roles` | Próprio papel; admins podem consultar | Nenhuma |
| `audit_logs` | Apenas admins | Nenhuma |
| `templates` | Templates ativos são públicos | Nenhuma pelo cliente |
| `profile_blocks` | Proprietário; visitantes veem somente blocos publicados e visíveis | CRUD apenas dos próprios blocos |
| `analytics_events` | Nenhuma leitura pelo cliente; somente resumo sanitizado via RPC | Somente função chamada com `service_role` pelo servidor |
| `analytics_daily_visitors` | Nenhuma | Somente função interna |
| `daily_analytics` | Apenas o proprietário ou admin | Somente função interna |
| `storage.objects/avatars` | Pública | Apenas arquivos na pasta do próprio usuário |

O cliente nunca recebe `SUPABASE_SECRET_KEY` nem `ANALYTICS_HASH_SECRET`. A coleta aceita apenas requisições de mesma origem; IP e User-Agent são usados transitoriamente para gerar hashes HMAC diários e não são persistidos em texto puro.
