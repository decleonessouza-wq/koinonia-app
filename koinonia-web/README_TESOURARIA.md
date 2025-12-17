# 📊 Módulo Tesouraria — Koinonia Web

Este documento descreve a **arquitetura, regras de negócio, fluxo de dados e estado atual** do módulo **Tesouraria** do app **Koinonia**.

O módulo Tesouraria é responsável pelo **controle financeiro da igreja**, incluindo **entradas, saídas, dashboard financeiro e relatórios por culto/evento**, com segurança baseada em igreja (RLS).

---

## 🎯 Objetivo do Módulo

- Registrar **entradas financeiras** (dízimos, ofertas e outros)
- Registrar **saídas financeiras**
- Consolidar **saldo geral da igreja**
- Permitir **análise financeira por culto/evento**
- Garantir **isolamento de dados por igreja (RLS)**
- Manter dados **auditáveis, consistentes e rastreáveis**

---

## 🧱 Arquitetura Geral

- **Frontend:** React + MUI + DataGrid
- **Backend:** Supabase (PostgreSQL + Row Level Security)
- **Lógica de negócio:** concentrada em **views SQL**
- **Frontend:** apenas consumo, validação e UX
- **Fonte de verdade do código:**  
  `src/services/treasuryApi.ts`

---

## 🗂️ Entidades Principais

### 🔹 contributions (Entradas)

Registra receitas financeiras da igreja.

Campos principais:
- `id`
- `church_id`
- `kind` → `dizimo | oferta | outro`
- `amount`
- `received_at`
- `note`
- `member_id` (opcional)
- `service_id` (opcional)

⚠️ **Observação importante**  
A coluna `contributor_ref` **não existe** na tabela.  
Quando necessário, a referência do contribuidor é salva **dentro do campo `note`**.

---

### 🔹 expenses (Saídas)

Registra despesas da igreja.

Campos principais:
- `id`
- `church_id`
- `title`
- `amount`
- `spent_at`
- `note`
- `category_id`
- `service_id` (opcional)

---

### 🔹 expense_categories

Categorias de despesas (ex: Aluguel, Energia, Água).

- Associadas por `church_id`
- **Seed obrigatório**
- Utilizadas como **select no frontend**

---

### 🔹 members

Cadastro de membros da igreja.

Campos relevantes para Tesouraria:
- `id`
- `full_name`
- `phone`
- `church_id`

Atualmente utilizado apenas como **select/autocomplete** no cadastro de entradas.

---

### 🔹 services (Cultos / Eventos)

Representa cultos, eventos e reuniões.

Campos:
- `id`
- `church_id`
- `title`
- `service_date`
- `starts_at` (opcional)
- `ends_at` (opcional)
- `notes`

---

## 👁️ Views SQL (Base do Sistema)

### 📌 v_contributions_detailed
Entradas com dados enriquecidos:
- Nome do membro
- Telefone
- Culto/Event associado

---

### 📌 v_expenses_detailed
Saídas com:
- Nome da categoria
- Culto/Event associado

---

### 📌 v_church_balance
Resumo financeiro geral:
- Total de entradas
- Total de saídas
- Saldo

---

### 📌 v_church_balance_monthly
Resumo mensal:
- Entradas por mês
- Saídas por mês
- Saldo mensal

---

### 📌 v_services_detailed
Resumo financeiro por culto/evento:
- Total de entradas
- Total de saídas
- Saldo por culto/evento

---

## 🖥️ Telas do Frontend

### 📥 Entradas
- Listagem via `v_contributions_detailed`
- Cadastro com:
  - Tipo
  - Valor
  - Data/hora
  - Observação
  - **Select de membro**
  - **Select de culto/evento**
  - Fallback manual de `service_id` (mantido propositalmente)

---

### 📤 Saídas
- Listagem via `v_expenses_detailed`
- Cadastro com:
  - Título
  - Valor
  - Data/hora
  - Categoria (select)
  - Culto/Event (select)
  - Fallback manual de `service_id`

---

### 📊 Dashboard
- Cards de resumo:
  - Entradas (Total)
  - Saídas (Total)
  - Saldo
- Gráficos:
  - Entradas x Saídas (mensal)
  - Saldo mensal

---

### 🕊️ Cultos / Eventos (Services)
- Cadastro de cultos/eventos
- Listagem com totais financeiros
- **Relatório por culto/evento**
  - Aba Entradas
  - Aba Saídas
  - Totais recalculados
  - Validação cruzada com banco

---

## 🔐 Segurança (Row Level Security)

Todas as tabelas seguem a regra:

```sql
church_id = current_church_id()
