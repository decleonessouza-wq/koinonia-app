# CHANGELOG.md — Projeto Koinonia

Todos os **registros de mudanças relevantes** do projeto Koinonia serão documentados neste arquivo.

O formato segue:
- [Semantic Versioning](https://semver.org/)
- Boas práticas de projetos open-source
- Organização clara para leitura humana e por ferramentas (ex: Codex)

---

## [Unreleased]
### Planejado
- Finalização do vínculo Membro ↔ Usuário (Auth)
- Consolidação dos Relatórios Avançados
- Documentação geral do app
- Preparação para versão estável v1.0.0

---

## [0.3.0] — 2025-12-17
### Added
- Módulo **Services (Cultos/Eventos)**
- Cadastro de cultos/eventos
- Vinculação de entradas e saídas a cultos
- Relatório financeiro por culto/evento
- Totais por culto (entradas, saídas, saldo)
- Dashboard ajustado para múltiplos cultos

### Changed
- Layout do Dashboard da Tesouraria (remoção do Grid do MUI)
- Padronização de datas (MM/YYYY, pt-BR)
- Melhoria geral de UX nas telas de Tesouraria

### Fixed
- Erros de tipagem TypeScript
- Erros de RLS ao inserir services
- Problemas com `current_church_id()` no SQL Editor
- Erros de tela branca em Entradas e Saídas

---

## [0.2.0] — 2025-12-16
### Added
- Tesouraria completa:
  - Entradas (contributions)
  - Saídas (expenses)
  - Categorias de despesas
- Autocomplete de membros em Entradas
- Select de categorias em Saídas
- Dashboard financeiro com:
  - Saldo geral
  - Saldo mensal
- Views:
  - `v_contributions_detailed`
  - `v_expenses_detailed`
  - `v_church_balance`
  - `v_church_balance_monthly`

### Changed
- Centralização das chamadas no `treasuryApi.ts`
- Ajustes de layout e carregamento (loading/erro)

### Fixed
- RLS quebrando inserts
- Policies inconsistentes por `church_id`
- Erros de SELECT em categorias

---

## [0.1.0] — 2025-12-15
### Added
- Estrutura inicial do projeto Koinonia Web
- Integração com Supabase
- Autenticação com Supabase Auth
- Estrutura base de layout (AppLayout)
- Proteção de rotas (RequireAuth)

---

## [0.4.0] — Em desenvolvimento
### Added
- Módulo **Membros (Global)**
  - Cadastro de membros
  - Listagem de membros
  - Link_code para vínculo com usuários
- Backend com RLS para membros
- RPCs:
  - Geração de link_code
  - Vínculo membro ↔ auth
- Relatórios Avançados:
  - Resumo por período
  - Top categorias
  - Resultado por culto no período
  - Histórico financeiro por membro

### Changed
- Expansão do `treasuryApi.ts`
- Padronização dos relatórios
- Melhorias de UX (loading, validações, mensagens)

---

## Convenções utilizadas

### Tipos de mudança
- **Added** → Nova funcionalidade
- **Changed** → Alteração em funcionalidade existente
- **Fixed** → Correção de bug
- **Removed** → Funcionalidade removida
- **Security** → Correções de segurança

---

## Observações Importantes

- Nenhuma funcionalidade é removida sem registro
- Mudanças estruturais sempre geram nova versão MAJOR ou MINOR
- Ajustes de UX entram como PATCH quando isolados
- SQL e Frontend devem estar sempre sincronizados por versão

---

Documento oficial de histórico de mudanças  
Projeto **Koinonia**
