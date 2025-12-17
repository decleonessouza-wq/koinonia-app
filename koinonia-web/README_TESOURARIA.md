# Koinonia · Tesouraria (README)

Este documento descreve o módulo **Tesouraria** do Koinonia (koinonia-web + Supabase), incluindo:
- Entradas (dízimos/ofertas)
- Saídas (despesas)
- Dashboard (saldo total + mensal)
- Cultos/Eventos (Services) + relatório por culto/evento
- RLS/políticas, views e decisões do projeto

> Observação importante (Supabase):
> No SQL Editor rodando como `postgres`, funções como `auth.uid()` e `current_church_id()` podem retornar `NULL`.
> Para testar seeds/queries no editor, use `church_id` explícito ou simule usuário autenticado.

---

## 1) Escopo do módulo

### 1.1 Entradas
- Listagem via view `v_contributions_detailed`
- Cadastro de entrada (tipo, valor, data/hora, obs)
- Associação opcional:
  - **Membro** (`member_id`)
  - **Culto/Evento** (`service_id`)
- Decisão atual: **`contributor_ref` não existe na tabela** `contributions`.
  - Se o usuário preencher “Referência do contribuidor”, ela é salva no campo **`note`**.

### 1.2 Saídas
- Listagem via view `v_expenses_detailed`
- Cadastro de saída (título, valor, data/hora, obs)
- Categoria obrigatória (`category_id`)
- Associação opcional com Culto/Evento (`service_id`)

### 1.3 Dashboard
- Resumo total: entradas / saídas / saldo
- Resumo mensal: entradas x saídas (barras) + saldo (linha)
- Consome:
  - `v_church_balance`
  - `v_church_balance_monthly`

### 1.4 Cultos/Eventos (Services)
- Cadastro de culto/evento: título, data, início/fim (opcional), notas
- Listagem com totalizadores (entradas/saídas/saldo)
- Relatório por culto/evento:
  - Aba Entradas (do culto)
  - Aba Saídas (do culto)
  - Totais e contagem de registros
  - Botão “Atualizar relatório”

---

## 2) Rotas e telas (Frontend)

Rotas principais (React Router):
- `/tesouraria` → Dashboard
- `/tesouraria/entradas` → Entradas
- `/tesouraria/saidas` → Saídas
- `/tesouraria/services` → Cultos/Eventos

Arquivos (padrão atual do projeto):
- `src/pages/tesouraria/Dashboard.tsx`
- `src/pages/tesouraria/Entradas.tsx`
- `src/pages/tesouraria/Saidas.tsx`
- `src/pages/tesouraria/Services.tsx`
- `src/services/treasuryApi.ts` (**fonte de verdade** para chamadas)

Menu/Layout:
- Item “Cultos/Eventos” aparece no menu lateral
- Logout usa `useAuth()` (Supabase)

---

## 3) Banco de Dados (Supabase)

### 3.1 Tabelas principais (Tesouraria)
- `expense_categories`
- `members`
- `contributions`
- `expenses`
- `services`

Campos relevantes:
- `members`: `id`, `church_id`, `full_name`, `phone`, ...
- `services`: `id`, `church_id`, `title`, `service_date`, `starts_at`, `ends_at`, `notes`, `created_at`
- `contributions`: `service_id` (opcional), `member_id` (opcional), `note` (opcional)
- `expenses`: `service_id` (opcional), `category_id` (obrigatório), `note` (opcional)

### 3.2 Views usadas no app
- `v_contributions_detailed`
- `v_expenses_detailed`
- `v_church_balance`
- `v_church_balance_monthly`
- `v_services_detailed`

`v_services_detailed` (conceito):
- lista services + somatórios:
  - `total_income`
  - `total_expense`
  - `balance`

---

## 4) RLS / Políticas (resumo)

Padrão adotado:
- Controle por `church_id` (multi-igrejas)
- Tabelas com `church_id` usando default `current_church_id()` quando aplicável
- Policies de SELECT/INSERT/UPDATE/DELETE permitindo somente registros do `church_id` atual

Ponto crítico:
- No SQL Editor como `postgres`, `current_church_id()` pode retornar NULL
  - Para seeds/testes no editor: informe `church_id` explicitamente.

---

## 5) Decisões atuais do app

### 5.1 contributor_ref
- Não existe coluna `contributor_ref` em `contributions`
- Se precisar salvar referência do contribuidor, usar `note`
  - Ex.: `Ref: 123ABC` + texto de observação

### 5.2 Service ID (fallback manual)
- Entradas/Saídas possuem select de Culto/Evento
- Existe (por enquanto) um campo “Service ID (UUID) — fallback manual”
- **Decisão atual:** manter fallback por segurança (remoção será feita depois com ajuste planejado)

---

## 6) Teste rápido (fluxo manual)

1) Crie um culto/evento em **Cultos/Eventos**
2) Crie uma **Entrada** vinculando o culto/evento
3) Crie uma **Saída** vinculando o culto/evento
4) Volte em **Cultos/Eventos** → “Ver relatório”
5) Confira se:
   - Entradas e Saídas aparecem
   - Totais e saldo batem com o banco

---

## 7) Seeds (opcional)

### 7.1 Categorias de saída (expense_categories)
```sql
insert into public.expense_categories (name, church_id)
values
  ('Materiais', 'SEU_CHURCH_ID'),
  ('Decoração', 'SEU_CHURCH_ID'),
  ('Limpeza', 'SEU_CHURCH_ID');
 