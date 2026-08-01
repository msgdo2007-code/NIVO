# Permissões e RLS

Todas as tabelas públicas da Fase 1 têm RLS habilitado.

| Recurso | Leitura | Escrita pelo cliente |
| --- | --- | --- |
| `profiles` | Pública | Apenas atualização do próprio registro |
| `profile_settings` | Somente o proprietário | Apenas atualização do próprio registro |
| `account_roles` | Próprio papel; admins podem consultar | Nenhuma |
| `audit_logs` | Apenas admins | Nenhuma |
| `storage.objects/avatars` | Pública | Apenas arquivos na pasta do próprio usuário |

O cliente nunca recebe `SUPABASE_SECRET_KEY`. Operações administrativas futuras devem validar a sessão, checar `is_admin()` e registrar o evento em `audit_logs` no servidor.
