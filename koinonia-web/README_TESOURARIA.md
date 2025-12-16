# Koinonia · Tesouraria (README)

Este documento descreve o módulo **Tesouraria** do Koinonia (koinonia-web + Supabase), incluindo:
- Funcionalidades já concluídas (Entradas/Saídas/Dashboard)
- Estrutura de banco (tabelas, views)
- Regras de RLS/políticas
- Seeds e observações importantes de desenvolvimento

---

## 1) Escopo do módulo Tesouraria

### Objetivo
Controlar **Entradas (dízimos/ofertas)** e **Saídas (despesas)** da igreja, com:
- Listagem detalhada por registros
- Cadastro de novos registros
- Dashboard com somatórios e agregação mensal
- Preparação para vincular registros a **Cultos/Eventos (services)**

### Regra de visão
- O **membro** poderá ver o próprio histórico (planejado quando tivermos área do membro/portal).
- A **igreja** controla por pessoa e também total por culto/evento.

---

## 2) Status do cronograma (ordem oficial)

✅ 1️⃣ Implementar Select de Categorias (Saídas)  
✅ 2️⃣ Implementar Select de Membros (Entradas)  
✅ 3️⃣ Ajustar Dashboard financeiro  
⬜ 4️⃣ Revisar services / cultos / eventos

**Progresso atual:** estamos com **1, 2 e 3 concluídos** (funcionando) e prontos para avançar para o item 4.

---

## 3) Funcionalidades prontas

### 3.1 Saídas (Despesas)
- ✅ Listagem via view `v_expenses_detailed`
- ✅ Cadastro de saída em `expenses`
- ✅ Select de categorias via `expense_categories` (filtrado por igreja)
- ✅ Validações básicas (título, valor > 0, data/hora, categoria obrigatória)
- ✅ Feedback com Snackbar (sucesso/erro)

**Tela:** `src/pages/tesouraria/Saidas.tsx`

---

### 3.2 Entradas (Contribuições)
- ✅ Listagem via view `v_contributions_detailed`
- ✅ Cadastro de entrada em `contributions`
- ✅ Select/Autocomplete de membros via `members`
- ✅ Member opcional (entrada pode existir sem membro associado)
- ✅ Observação: `contributor_ref` NÃO existe em `contributions`
  - quando necessário, gravamos referência dentro do campo `note`

**Tela:** `src/pages/tesouraria/Entradas.tsx`

---

### 3.3 Dashboard Tesouraria
- ✅ Cards: total de entradas, total de saídas, saldo
- ✅ Gráfico mensal Entradas x Saídas
- ✅ Gráfico mensal Saldo
- ✅ Ajuste de render/layout para evitar erros de tipagem (MUI Grid incompatível)
- ✅ Dashboard renderizando sem erros

**Tela:** `src/pages/tesouraria/Dashboard.tsx`  
**Dados:** `v_church_balance` e `v_church_balance_monthly`

---

## 4) Banco de dados (Supabase)

### 4.1 Tabelas principais
- `contributions` (entradas)
- `expenses` (saídas)
- `expense_categories` (categorias de despesa por igreja)
- `members` (membros)
- `services` (cultos/eventos) *(usaremos no passo 4)*

#### members (colunas confirmadas)
- `id` (uuid)
- `church_id` (uuid, default `current_church_id()`)
- `full_name` (text)
- `phone` (text, nullable)
- `user_id` (uuid, nullable)
- `link_code` (text, nullable)
- `created_at`, `updated_at`

⚠️ Importante: a coluna é `full_name` (não `name`).

---

### 4.2 Views usadas pelo frontend
- `v_contributions_detailed`
- `v_expenses_detailed`
- `v_church_balance`
- `v_church_balance_monthly`

---

## 5) RLS / Políticas (conceito e cuidado)

### 5.1 Conceito
Todas as tabelas do módulo devem ser filtradas por `church_id` do usuário autenticado.

### 5.2 Ponto crítico no SQL Editor
Ao rodar queries no Supabase SQL Editor com role `postgres`, funções como:
- `current_church_id()`
- `auth.uid()`

podem retornar `NULL`.

✅ Para **seed/teste no SQL Editor**, informe `church_id` explicitamente ao inserir dados.

---

## 6) Seeds (teste rápido)

### 6.1 Seed de categorias (Saídas)
Insira categorias com `church_id` explícito:

```sql
insert into public.expense_categories (name, church_id)
values
  ('Materiais', 'SEU_CHURCH_ID'),
  ('Decoração', 'SEU_CHURCH_ID'),
  ('Limpeza', 'SEU_CHURCH_ID');
