# Copa Hollywood - Projeto Audiovisual

**Projeto Audiovisual - Programa Integral & Bilingue. Aulas do Tio Ze.**

Copa Hollywood e uma central permanente para os alunos produzirem e terminarem seus videos: ideias, tecnicas, guias, CineMentor, gamificacao e acompanhamento no Supabase.

- **Alunos:** https://copa-hollywood.vercel.app/
- **Tio Ze (area reservada):** https://copa-hollywood.vercel.app/professor
- **Drive da Copa:** https://drive.google.com/drive/folders/1X6IyCzQTcAPaeWdkiV6MuTjuqVLFQSew
- **GitHub oficial:** `vhonorato02/copa-hollywood`

## Como a Copa funciona

1. O aluno escolhe seu perfil pronto (nao cria login nem passa por formulario).
2. Na primeira visita, escolhe em um checklist **o que ja fez**; recebe conquistas retroativas. O checklist so aparece uma vez.
3. Em todas as visitas seguintes, encontra o seu video e **registra as tecnicas, experiencias e melhorias que aplicou**. A pontuacao e do projeto inteiro, nunca por aula.
4. Os registros incluem narrativa, pesquisas, arquivos, ritmo, transicoes, som, efeitos, cor, texto, colaboracao, revisao e entrega. **O numero de cortes nao gera pontuacao.** A primeira vez que uma tecnica e registrada vale mais XP; repeticoes tem rendimento decrescente e depois zero, mantendo o historico.
5. Conquistas oferecem objetivos claros: explorar varias areas, aplicar recursos diferentes e colaborar. Os registros sao **autodeclarados**. O site nao observa o CapCut.
6. A qualidade do video final e avaliada pelo Tio Ze **separadamente** da gamificacao desta central.
7. O CineMentor usa conhecimento local e historico apenas da conversa ativa para sugerir solucoes especificas por projeto (talk show, gameplay, edit de futebol, anime e trailer). **Nao e um chatbot de IA generativa.**
8. Os guias mostram passos completos, erros frequentes, teste final e links: CapCut Web, Suno, Drive e o **VidsSave** `https://vidssave.com/pt/home` indicado pelo professor. Baixe apenas materiais de uso autorizado. O VidsSave e externo a escola; nunca instale extensoes nem permita notificacoes por engano.

## Tecnologia e privacidade

HTML + CSS + JS estaticos, sem build e sem dependencias externas; publicado na Vercel. Supabase Postgres para sincronizar perfis e projeto entre computadores.

A conta `service_role` e secrets nunca devem ir para o cliente nem o repositorio. `config.js` so contem a chave publicavel do Supabase. O CineMentor nao envia mensagens a terceiros nem persiste historico. O painel do professor requer codigo de acesso verificado no banco e permite ver registros, criar/arquivar perfis, enviar recados e exportar CSV. O codigo do professor **nao fica no repositorio**.

**Limite conhecido:** por nao haver login individual, escolher um apelido permite abrir e alterar o progresso desse apelido; nao guardar informacoes sensiveis. O sistema identifica registros feitos na plataforma, mas nao comprova quais edicoes realmente ocorreram no CapCut.

## Arquivos

`index.html`, `styles.css`, `config.js`, `app.js`, `roadmap.js`, `journey.js`, `guides.js`, `mentor.js`, `mentor-plus.js`, `professor.html`, `professor.css`, `professor.js`, `vercel.json`.

`supabase/migrations/`: historico de estrutura do banco, sem segredos, credenciais ou hashes de acesso. Nunca commitar senha ativa.

## Testes

`python tests/test_ui.py` - Playwright + Chromium, desktop e celular, com **Supabase simulado**, sem alterar alunos reais. Verifica onboarding retroativo, XP por tecnica e nao por missao clicada, recuperacao de estado apos fechar, CineMentor de perguntas variadas, guias e painel do professor.

`node --check app.js`, `node --check journey.js`, `node --check mentor-plus.js`, `node --check guides.js`, `node --check professor.js`.

Validar tambem Vercel HTTP, API e politicas Supabase antes de cada release. Testar o acesso a partir de um Chromebook da escola quando possivel.

## Versionamento

Fonte oficial: GitHub `vhonorato02/copa-hollywood`, branch `main`. O repositorio e atualmente publico: nao incluir nomes de alunos, dados reais de perfis ou segredos. Releases versionadas por tag. Antes de dar acesso de escrita a terceiros, reveja permissoes e branch protection.
