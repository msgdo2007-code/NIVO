# Banco de dados — Fases 1 a 3

## Tabelas

- `profiles`: dados públicos e editáveis do perfil. O `id` é o mesmo de `auth.users`.
- `profile_settings`: preferências visuais iniciais, isoladas por usuário.
- `account_roles`: papéis internos. Não são misturados ao perfil público.
- `audit_logs`: trilha imutável para as futuras ações administrativas.
- `templates`: temas iniciais e a composição de blocos aplicada pelo onboarding.
- `profile_blocks`: blocos tipados, ordenados e programáveis de cada perfil.
- `analytics_events`: eventos válidos internos; armazena somente hashes HMAC diários, nunca IP bruto.
- `analytics_daily_visitors`: conjunto interno usado para contar um visitante apenas uma vez por dia.
- `daily_analytics`: contadores diários consultáveis pelo proprietário.

O trigger `handle_new_user` cria perfil, configurações e papel padrão na mesma transação do cadastro. A função usa `SECURITY DEFINER`, `search_path` vazio e nomes de schema explícitos.

O bucket público `avatars` aceita JPEG, PNG, WebP e GIF de até 5 MB. Escritas são limitadas ao prefixo `{auth.uid()}/`.

`complete_onboarding` escolhe username, template, aparência e blocos em uma única transação. `reorder_profile_blocks` valida que a lista contém exatamente os blocos pertencentes ao usuário antes de persistir a ordem.

`record_analytics_event` é exclusiva de `service_role`: valida perfil/bloco publicado, limita volume por hash de rede, deduplica o evento e atualiza os agregados atomicamente. `get_analytics_summary` devolve ao usuário autenticado apenas um DTO agregado e atividade sanitizada; hashes de visitante não saem do banco.

## Migrations

As migrations são cumulativas e ficam em `supabase/migrations`. Não edite uma migration já aplicada em produção; crie uma nova.
