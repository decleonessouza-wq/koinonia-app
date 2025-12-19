# CONTEXT.md — Projeto Koinonia

## 1. Visão Geral do Projeto

**Koinonia** é um aplicativo web para igrejas, com foco em:
- Comunhão
- Discipulado
- Gestão administrativa saudável e transparente

O sistema é **multi-igrejas (multi-tenant)** e baseado em:
- **Supabase** (Postgres + Auth + RLS + RPC)
- **React + TypeScript**
- **MUI (Material UI)**
- **Arquitetura orientada a Views e RPCs no backend**

O projeto prioriza:
- Segurança por igreja (`church_id`)
- Leitura via *views*
- Escrita via *RPCs ou inserts diretos controlados*
- Evolução incremental, sem quebrar funcionalidades já validadas

---

## 2. Stack Técnica

### Backend
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Views (`v_*`) como fonte principal de leitura
- RPCs (`public.*`) para lógica sensível
- Multi-tenant via `church_id`

### Frontend
- React + TypeScript
- Vite
- MUI (DataGrid, Dialogs, Forms)
- Supabase JS Client
- Organização modular por domínio

---

## 3. Princípios Fundamentais (NÃO QUEBRAR)

### 3.1 Multi-tenant por Igreja
- Todas as tabelas principais possuem `church_id`
- Todas as queries devem respeitar o `church_id`
- Nenhuma leitura deve expor dados de outra igreja

### 3.2 RLS
- RLS está **ativo** nas tabelas sensíveis
- Policies usam:
  - `current_church_id()`
  - `auth.uid()`
- **IMPORTANTE**:
  - No SQL Editor (`role = postgres`), essas funções retornam `NULL`
  - Seeds devem definir `church_id` manualmente

### 3.3 Fonte da Verdade
- **Views** são usadas para leitura no frontend
- **RPCs / inserts diretos** são usados para escrita
- `src/services/treasuryApi.ts` é a **fonte de verdade do frontend**
  - Não deve ser reestruturado sem extrema necessidade
  - Funções novas devem ser adicionadas, não quebrar as existentes

---

## 4. Estrutura de Domínios

### 4.1 Tesouraria (CONCLUÍDO E ESTÁVEL)
- Entradas (contributions)
- Saídas (expenses)
- Categorias de despesas
- Dashboard financeiro
- Relatórios por culto/evento

Views principais:
- `v_contributions_detailed`
- `v_expenses_detailed`
- `v_church_balance`
- `v_church_balance_monthly`
- `v_services_detailed`

Status: **Finalizado e validado**

---

### 4.2 Services (Cultos/Eventos) — CONCLUÍDO
- Cadastro de cultos/eventos
- Vínculo de entradas e saídas
- Relatório detalhado por culto

Tabela:
- `services`

Views:
- `v_services_detailed`

Frontend:
- `/tesouraria/services`
- Relatório modal por service

Status: **Finalizado e validado**

---

### 4.3 Módulo de Membros — EM ANDAMENTO (BACKEND OK)

Tabela:
- `members`

Campos principais:
- `id`
- `church_id`
- `full_name`
- `phone`
- `user_id` (vínculo com auth)
- `link_code` (vínculo manual)
- `created_at`
- `updated_at`

RPCs existentes:
- `bind_member_to_user(p_link_code)`
- `generate_member_link_code(...)`

Status:
- Backend: **funcional**
- Frontend: **em desenvolvimento**

---

### 4.4 Relatórios Avançados — EM ANDAMENTO

Funcionalidades:
- Resumo por período (datas)
- Top categorias
- Resultado por culto/evento no período
- Histórico financeiro por membro

RPCs / Queries:
- `getContributionsDetailedByPeriod`
- `getExpensesDetailedByPeriod`
- `getContributionsDetailedByMember`

Frontend:
- Tela `RelatoriosAvancados.tsx`
- UX em refinamento contínuo

Status:
- Backend: **ok**
- Frontend: **ativo**

---

## 5. Regras de Desenvolvimento (CRÍTICAS)

### 5.1 SQL / BACKEND
- Nunca duplicar tabelas, views ou funções
- Sempre numerar blocos SQL (ex: 2.1, 2.2…)
- Sempre comentar o propósito do SQL
- Sempre validar impacto no frontend antes de alterar algo
- Nunca depender de `current_church_id()` em seeds

### 5.2 FRONTEND
- Sempre pedir o **arquivo atual** antes de modificar
- Sempre devolver o **arquivo completo**
- Nunca remover fallback sem validação
- Nunca quebrar rotas existentes
- UX > complexidade técnica

---

## 6. Cronograma Geral do App

### Fase 1 — Tesouraria ✅
✔ Entradas  
✔ Saídas  
✔ Dashboard  
✔ Services  
✔ Relatórios por culto  

### Fase 2 — Membros (ATUAL)
⏳ Frontend do módulo  
⏳ Vínculo membro ↔ auth  
⏳ UX e validações  

### Fase 3 — Relatórios Avançados
⏳ Backend consolidado  
⏳ Frontend refinado  
⏳ Performance e UX  

### Fase 4 — App Geral
🔜 Relatórios globais  
🔜 Permissões / papéis  
🔜 Documentação geral  

### Fase 5 — Release
🔜 Versionamento  
🔜 Checklist de produção  
🔜 Preparação para deploy  

---

## 7. Objetivo do Codex

O Codex deve:
- Respeitar este contexto como **fonte absoluta**
- Nunca “reinventar” decisões já tomadas
- Evoluir o projeto **sem regressões**
- Atuar como **dev sênior guardião da arquitetura**

Qualquer dúvida → **perguntar antes de agir**.
