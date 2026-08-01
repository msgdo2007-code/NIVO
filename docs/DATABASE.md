# Banco de dados — Fase 1

## Tabelas

- `profiles`: dados públicos e editáveis do perfil. O `id` é o mesmo de `auth.users`.
- `profile_settings`: preferências visuais iniciais, isoladas por usuário.
- `account_roles`: papéis internos. Não são misturados ao perfil público.
- `audit_logs`: trilha imutável para as futuras ações administrativas.
- `templates`: temas iniciais e a composição de blocos aplicada pelo onboarding.
- `profile_blocks`: blocos tipados, ordenados e programáveis de cada perfil.

O trigger `handle_new_user` cria perfil, configurações e papel padrão na mesma transação do cadastro. A função usa `SECURITY DEFINER`, `search_path` vazio e nomes de schema explícitos.

O bucket público `avatars` aceita JPEG, PNG, WebP e GIF de até 5 MB. Escritas são limitadas ao prefixo `{auth.uid()}/`.

`complete_onboarding` escolhe username, template, aparência e blocos em uma única transação. `reorder_profile_blocks` valida que a lista contém exatamente os blocos pertencentes ao usuário antes de persistir a ordem.

## Migrations

As migrations são cumulativas e ficam em `supabase/migrations`. Não edite uma migration já aplicada em produção; crie uma nova.
