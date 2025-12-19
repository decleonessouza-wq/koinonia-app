Leia integralmente o arquivo docs/CONTEXT.md antes de qualquer ação.

Este repositório utiliza Supabase (Postgres + RLS + RPC).
Você está atuando APENAS na camada SQL / BACKEND.

REGRAS OBRIGATÓRIAS (SQL):
1. Nunca recrie tabelas, views ou funções que já existam sem confirmação explícita.
2. Nunca envie SQL duplicado ou com objetivos repetidos.
3. Sempre verifique se o SQL é compatível com:
   - role = postgres (SQL Editor)
   - role = authenticated (uso real no app)
4. Considere SEMPRE que:
   - current_church_id() retorna NULL no SQL Editor
   - auth.uid() retorna NULL no SQL Editor
5. Seeds devem ser:
   - explícitos
   - com church_id definido manualmente
   - sem dependência de funções de auth
6. Toda tabela nova deve conter:
   - church_id
   - RLS habilitado
   - policies claras de SELECT / INSERT / UPDATE / DELETE
7. Toda RPC deve:
   - ser idempotente
   - validar church_id
   - validar auth.uid() quando aplicável
8. Views devem ser usadas para leitura (SELECT) sempre que possível.
9. Nunca quebre compatibilidade com o frontend existente.

PADRÕES OBRIGATÓRIOS:
- snake_case em SQL
- funções em public.*
- comentários claros acima de cada bloco SQL
- SQL dividido em blocos numerados (ex: 1.1, 1.2, 2.1…)

ESTADO ATUAL DO BACKEND:
- Tesouraria: estável (contributions, expenses, services, views, RPCs)
- Relatórios avançados: RPCs criadas e funcionais
- Módulo de Membros: tabela, RLS e RPCs básicas já existentes

TAREFA INICIAL:
Vamos continuar o BACKEND do Módulo de Membros.
Comece validando:
- RLS final da tabela members
- RPCs de vínculo membro ↔ auth
- RPCs auxiliares (ex: geração de link_code)

Antes de escrever SQL:
1. Liste o que já existe
2. Liste o que falta
3. Explique brevemente o impacto no frontend
Só então escreva o SQL FINAL, sem erros.
