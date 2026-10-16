## v1.2.0 — Seu próximo passo (2026-10-16)

- Planejamento automático do projeto inteiro a partir de gênero, materiais e habilidades. Serve do zero à exportação.
- Onboarding retroativo inclui gênero, estágio real dos materiais e escolha de 12 avatares, sem resetar trabalhos antigos.
- Avatares também podem ser alterados depois. Preferência salva no estado do aluno na nuvem.
- Painel do Tio Zé com busca, filtros, leitura de registros e destaques de uso (não qualidade).
- Avaliação e prêmios do vídeo FINAL, separados do XP e protegidos na base privada.
- Lista de guias recomendados conforme o próximo passo, favoritos, roleta que guarda ideias e geração de trilha contextual.
- Migração idempotente no Supabase, com oito alunos preservados.

# Historico da Copa Hollywood

## v1.1.0 - A Copa inteira conta (2026-10-16)

- Redesenho vermelho e preto com menos elementos concorrendo na primeira tela.
- Onboarding retroativo apenas no primeiro acesso, organizado em quatro grupos. Perfis existentes e estado salvos no banco sao preservados.
- Registro de **21 habilidades/atividades** (nao contagem de cortes), com descricao do que foi realmente testado; XP decrescente para repeticoes e limites.
- **22 conquistas** por metas de exploracao e aprendizado, acumuladas ate o fim da Copa, nunca por aula.
- Concluir desafio agora leva a um registro de tecnica; apenas clicar no desafio nao gera XP.
- Qualidade e premiação do video final ficam fora do XP da plataforma.
- CineMentor ampliado com ensino contextual de humor, suspense, emocao, audio, narrativa, ritmo, efeitos, drive, download e problemas de exportacao, com alternativas apos "nao deu" e especificidades de projetos (talk show, gameplay, futebol, anime e trailers).
- Link especifico VidsSave https://vidssave.com/pt/home nos atalhos e tutorial detalhado de como conseguir MP4 para edicao com permissao; tutorial completo de envio ao Drive.
- Painel do professor passou a exibir os registros realizados por cada aluno.
- Interface responsiva: botao de onboarding deixou de cobrir as opcoes no celular.
- Testes E2E locais desktop/celular com Supabase simulado; consulta do banco real apenas para diagnostico sem alterar alunos.

## v1.0.0 - Central audiovisual (2026-10-16)

- Projeto Audiovisual - Programa Integral & Bilingue; aulas do Tio Ze.
- Oito perfis iniciais na base privada; nao inclusos no codigo publico.
- Area do aluno com video, ideias, guias de CapCut, biblioteca, gamificacao, quizzes e CineMentor local.
- Area do professor com autenticacao por codigo no Supabase, acompanhamento, recados e criacao/arquivamento de perfis.
- Supabase para salvar o andamento entre equipamentos e Vercel para hospedagem.
