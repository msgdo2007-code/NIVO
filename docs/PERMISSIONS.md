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
| `storage.objects/avatars` | Pública | Apenas arquivos na pasta do próprio usuário |

O cliente nunca recebe `SUPABASE_SECRET_KEY`. Operações administrativas futuras devem validar a sessão, checar `is_admin()` e registrar o evento em `audit_logs` no servidor.
