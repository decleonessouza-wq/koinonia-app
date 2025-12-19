# Koinonia Web — Tesouraria (Status + Documentação)

Este README documenta o módulo **Tesouraria** do projeto **Koinonia Web**: Entradas, Saídas, Dashboard, Services (Cultos/Eventos) e Relatórios Avançados.

---

## 1. O que está pronto (Tesouraria)

### ✅ Dashboard
- Cards: Entradas (total), Saídas (total), Saldo.
- Gráficos mensais (Entradas x Saídas e Saldo).
- Tratamento de **loading** e **erro**.

**Fontes no banco**
- `v_church_balance`
- `v_church_balance_monthly`

---

### ✅ Entradas
- Listagem via view: `v_contributions_detailed`
- Cadastro de entrada (dízimo/oferta/outro)
- Select de membro (Autocomplete) via `members`
- Select de culto/evento (Autocomplete) via `services`
- **Fallback manual de Service ID** (mantido por enquanto)
- Validações e mensagens de UX

**Observação importante**
- A coluna `contributor_ref` **não existe** na tabela `contributions`.
- Quando necessário, a referência do contribuidor é salva dentro do `note`.

---

### ✅ Saídas
- Listagem via view: `v_expenses_detailed`
- Cadastro de saída
- Select de categoria via `expense_categories`
- Select de culto/evento (Autocomplete) via `services`
- **Fallback manual de Service ID** (mantido por enquanto)
- Validações e mensagens de UX

**Observação importante**
- As categorias precisam existir para a igreja (seed com `church_id`).
- Se não aparecer categoria no select, normalmente é seed/RLS (não é bug do componente).

---

### ✅ Services (Cultos/Eventos)
- Tela: cadastro e listagem
- Relatório por culto/evento:
  - Totais (entradas, saídas, saldo)
  - Abas com DataGrid (Entradas / Saídas)
  - Botão “Atualizar relatório”
  - Mensagens quando não há registros vinculados

**Fontes no banco**
- `services`
- `v_services_detailed`
- Views detalhadas:
  - `v_contributions_detailed`
  - `v_expenses_detailed`

---

### ✅ Relatórios Avançados (Frontend + Backend)
Tela: **Relatórios Avançados** com 3 abas:
1) **Resumo por Período**
   - Busca por período (datas)
   - Totais (entradas, saídas, saldo)
   - Top categorias (saídas)
   - Resultado por culto/evento no período (saldo)
2) **Por culto/evento**
   - Lista agregada (totais por service) via `v_services_detailed`
3) **Por membro**
   - Select de membro + histórico de entradas do membro

**Backend**
- Foram criadas RPCs para consultas:
  - `getContributionsDetailedByPeriod(startIso, endIso)`
  - `getExpensesDetailedByPeriod(startIso, endIso)`
  - `getContributionsDetailedByMember(memberId)`
- No frontend (`treasuryApi.ts`), as funções tentam chamar a **RPC primeiro** e têm **fallback** para queries em views (para evitar quebra por nome/assinatura).

---

## 2. Regras / Observações de RLS e SQL Editor
- No SQL Editor do Supabase rodando como `postgres`, é comum `current_church_id()` e `auth.uid()` retornarem **NULL**.
- Para seed e testes no SQL Editor:
  - prefira inserir informando `church_id` manualmente, ou
  - simular/rodar como usuário autenticado quando aplicável.

---

## 3. Estrutura de rotas (referência rápida)
Rotas já usadas no app:
- `/tesouraria` (Dashboard)
- `/tesouraria/entradas`
- `/tesouraria/saidas`
- `/tesouraria/services`
- `/tesouraria/relatorios` (relatórios avançados, se já estiver registrado no App.tsx)

---

## 4. Decisões técnicas atuais
- `src/services/treasuryApi.ts` é a fonte de verdade do frontend para Tesouraria.
- Mantemos o fallback manual de `service_id` em Entradas/Saídas por enquanto (decisão de estabilidade).

---

## 5. Próximos passos do cronograma (após Tesouraria)
1) **Módulo de Membros (global)**
   - CRUD + vínculo com auth (user_id)
   - Link code (geração e bind)
2) **Relatórios avançados (evolução)**
   - filtros adicionais, exportação, agrupamentos, gráficos
3) **Documentação geral do app**
4) **Release / versionamento**
