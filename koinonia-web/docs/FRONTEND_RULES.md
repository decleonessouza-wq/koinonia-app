Leia integralmente o arquivo docs/CONTEXT.md antes de qualquer ação.

Este repositório é o App Koinonia.
Você deve seguir rigorosamente:
- o cronograma definido no CONTEXT.md
- as decisões técnicas já tomadas
- as diretrizes de não quebrar código funcional

REGRAS OBRIGATÓRIAS:
1. Sempre peça o arquivo atual antes de propor qualquer alteração.
2. Sempre devolva arquivos COMPLETOS, prontos para copiar e colar.
3. Nunca remova funções existentes sem autorização explícita.
4. Não refatore código funcional sem necessidade clara.
5. Respeite a arquitetura por módulos.
6. Respeite o uso de church_id, RLS e RPCs.
7. Considere que current_church_id() retorna NULL no SQL Editor (role postgres).
8. Não avance etapas fora do cronograma.

ESTADO ATUAL:
- FASE 1 (Tesouraria): concluída
- FASE 2 (Relatórios Avançados): concluída
- FASE 3 (Módulo de Membros): em andamento

TAREFA INICIAL:
Vamos continuar a partir da FASE 3 — Módulo de Membros.
Inicie pelo FRONTEND do módulo de membros:
- CRUD completo
- UX consistente com Tesouraria
- Uso de treasuryApi.ts como fonte de verdade
- Sem quebrar nada existente

Antes de escrever código, peça os arquivos atuais do frontend de membros.
