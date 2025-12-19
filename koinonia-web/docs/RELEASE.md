# RELEASE.md — Projeto Koinonia

## Visão Geral

Este documento define o **processo oficial de versionamento, validação e release** do aplicativo **Koinonia**.

Ele existe para garantir que:
- O desenvolvimento siga uma linha clara e previsível
- Nenhuma funcionalidade validada seja quebrada
- O histórico de evolução seja rastreável
- O projeto esteja sempre pronto para produção quando necessário
- Ferramentas como Codex consigam entender o estado, regras e fluxo do app

---

## Estratégia de Versionamento (Semantic Versioning)

O projeto Koinonia utiliza **Semantic Versioning (SemVer)**:

# RELEASE.md — Projeto Koinonia

## Visão Geral

Este documento define o **processo oficial de versionamento, validação e release** do aplicativo **Koinonia**.

Ele existe para garantir que:
- O desenvolvimento siga uma linha clara e previsível
- Nenhuma funcionalidade validada seja quebrada
- O histórico de evolução seja rastreável
- O projeto esteja sempre pronto para produção quando necessário
- Ferramentas como Codex consigam entender o estado, regras e fluxo do app

---

## Estratégia de Versionamento (Semantic Versioning)

O projeto Koinonia utiliza **Semantic Versioning (SemVer)**:

# RELEASE.md — Projeto Koinonia

## Visão Geral

Este documento define o **processo oficial de versionamento, validação e release** do aplicativo **Koinonia**.

Ele existe para garantir que:
- O desenvolvimento siga uma linha clara e previsível
- Nenhuma funcionalidade validada seja quebrada
- O histórico de evolução seja rastreável
- O projeto esteja sempre pronto para produção quando necessário
- Ferramentas como Codex consigam entender o estado, regras e fluxo do app

---

## Estratégia de Versionamento (Semantic Versioning)

O projeto Koinonia utiliza **Semantic Versioning (SemVer)**:

MAJOR.MINOR.PATCH

### Definição

- **MAJOR**
  - Mudanças incompatíveis
  - Refatorações estruturais
  - Alterações de arquitetura
  - Quebra de contratos (API, banco, auth)

- **MINOR**
  - Novos módulos
  - Novas funcionalidades compatíveis
  - Expansões significativas do sistema

- **PATCH**
  - Correções de bugs
  - Ajustes de UX/UI
  - Melhorias internas sem impacto funcional

---

## Versão Atual

```text
v0.3.0

Inclui

Tesouraria completa (Entradas, Saídas, Dashboard)

Services (Cultos/Eventos)

Relatórios por culto/evento

Relatórios avançados (em consolidação)

Backend estruturado com RLS e Views

Início do módulo de Membros

Roadmap de Versões
v0.4.0 → Módulo de Membros completo
v0.5.0 → Relatórios Avançados consolidados
v0.6.0 → Vínculo Membro ↔ Usuário (auth)
v0.7.0 → Relatórios financeiros globais
v1.0.0 → Release estável para produção

Estratégia de Branches (Git)
Branches principais

main

Sempre estável

Somente recebe código validado

Representa versões prontas para release

feature/

Desenvolvimento ativo

Cada módulo em sua própria branch
Padrão de nomenclatura

feature/tesouraria
feature/services
feature/membros
feature/relatorios-avancados

Checklist Obrigatório de Release
Backend (Supabase / SQL)

Antes de qualquer release:

 * Todas as tabelas possuem church_id

 * Todas as tabelas sensíveis têm RLS ativo

 * Policies testadas com usuário autenticado

 * Views (v_*) validadas manualmente

 * RPCs documentadas e funcionando

 * Seeds não dependem de current_church_id() no SQL Editor

 * Nenhuma função SQL duplicada

 * SQL rodou sem erro no ambiente correto

Frontend (React / TypeScript)

 * npm run build sem erros

 * Nenhum erro TypeScript

 * Nenhuma tela branca

 * Estados de loading tratados

 * Estados vazios tratados

 * Mensagens de erro amigáveis

 * Fallbacks preservados quando necessários

 * UX validada manualmente no navegador

Checklist Funcional por Módulo
Tesouraria

 * Dashboard carrega corretamente

 * Entradas cadastrando

 * Saídas cadastrando

 * Categorias funcionando

 * Services vinculando corretamente

 * Relatórios por culto/evento corretos

 * Totais conferem com o banco

Módulo de Membros

 * Cadastro de membros

 * Listagem funcionando

 * Link_code gerado corretamente

 * RPC de vínculo membro ↔ auth funcionando

 * RLS impede acesso cruzado

 * Histórico financeiro do membro correto

Relatórios Avançados

 * Resumo por período

 * Validação de datas (início não pode ser maior que fim)

 * Top categorias

 * Resultado por culto no período

 * Histórico financeiro por membro

 * Totais conferem com SQL

 * Performance aceitável

Processo Oficial de Release
Antes do Commit
git status
git pull


Condições obrigatórias:

* Working tree limpa

* Branch correta

* Testes manuais concluídos

* Commit de Release

* Padrão obrigatório:

* git commit -m "release(vX.Y.Z): descrição clara"


Exemplo:

git commit -m "release(v0.4.0): modulo de membros completo"

Tag de Versão
git tag vX.Y.Z
git push origin vX.Y.Z

Merge para main
git checkout main
git pull
git merge feature/<nome>
git push

Critérios para v1.0.0 (Produção)

O app só pode ser considerado estável para produção quando:

 * Tesouraria 100% estável

 * Módulo de membros completo

 * Relatórios avançados consolidados

 * Auth e vínculo com membros funcionando

 * Documentação completa

 * Nenhum workaround crítico

 * UX consistente em todo o app

Princípios do Projeto

* Estabilidade acima de velocidade

* Clareza acima de complexidade

* Código previsível e legível

* Backend seguro por padrão

* UX simples e objetiva

Nunca avançar quebrando algo que já funciona.