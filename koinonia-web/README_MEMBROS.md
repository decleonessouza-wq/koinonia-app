# 📒 Módulo de Membros — Koinonia App

Este documento descreve o **Módulo de Membros** do Koinonia App, incluindo **estrutura de banco**, **regras de segurança (RLS)**, **funções auxiliares**, **fluxo de frontend** e **integração com outros módulos** (Tesouraria, Cultos/Eventos).

---

## 🎯 Objetivo do Módulo

Centralizar o cadastro e a gestão de **membros da igreja**, permitindo:

- Cadastro e edição de membros
- Associação futura de usuário autenticado (`user_id`)
- Geração de **link_code único por igreja**
- Vínculo de entradas (dízimos/ofertas) aos membros
- Base para relatórios e automações futuras

Este é um **módulo global**, não restrito à Tesouraria.

---

## 🗂️ Estrutura da Tabela `members`

```sql
create table public.members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null,
  full_name text not null,
  phone text,
  user_id uuid,
  link_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
