# Copa Hollywood — estado seguro para aula (16/10/2026)

## PUBLICADO E PRONTO PARA USO
- Site alunos: https://copa-hollywood.vercel.app/
- Painel Tio Zé: https://copa-hollywood.vercel.app/professor
- Vercel production READY: deployment dpl_FxRvw1Sdpv1eNFk7NrituQMrLzat (build baseado no commit 709e4402ac2dce053930fd8dea2311ca9cbb401d)
- Testes HTTP em ambos os endereços: 200.
- Supabase: 9 perfis ativos no momento da verificação (inclui contas criadas durante as aulas). NÃO apagar, reiniciar ou substituir states.
- Código estável: branch main, versão anterior ao "Modo Jogo", v1.2.0.

## QUE JA FUNCIONA
- Seleção de perfil, onboarding retroativo e escolha de avatar simples.
- Progresso individual em nuvem (Supabase), registro de técnicas, XP e conquistas existentes.
- Roteiro personalizado conforme estilo de vídeo e estágio de produção.
- CineMentor, guias, links de CapCut/Drive/VidsSave, ferramentas criativas.
- Painel do Tio Zé com perfis, acompanhamento, registros, comentários e avaliação privada dos vídeos para premiação.
- Pontuação do projeto acumulada durante TODA a Copa, não por aula; vídeo final avaliado separadamente.

## NOVO "MODO JOGO" — EM DESENVOLVIMENTO LOCAL, NAO PUBLICADO
Quatro recursos solicitados:
1. Álbum de conquistas (coleção com raridade e progresso);
2. Cartas surpresa (três opções, escolha e conclusão após aplicar técnica no vídeo);
3. Árvore de habilidades por especialidade, sem privilegiar contagem de cortes;
4. Avatar evolutivo (molduras cosméticas por marcos de técnicas exploradas).

Código parcialmente construído no diretório local `/mnt/data/app-hollywood`:
- `game.js`: implementação inicial das quatro interfaces, conquistas e lógica dos desafios;
- `app.js`: integração de navegação, salvamento e registro de técnica;
- `index.html`: navegação do Modo Jogo;
- `VERSION`: marcado 1.3.0 somente local.
NÃO DEPLOYAR O WIP: faltam CSS responsivo, adicionar `game.js` ao teste UI, testar clique -> Supabase -> perfil -> retorno, revisar lógica de preservação do progresso e regenerar documentação/changelog.
O histórico anterior dos alunos continua preservado e a publicação de produção NÃO foi alterada por esse WIP.

## PROXIMA EXECUCAO
1. Concluir as regras de XP: recompensa apenas por técnica/experiência aplicada e registrada; desafio aceito, troca de carta e cosmético NÃO dão XP.
2. Definir verificação das conquistas para premiação: autodeclaração separada de validação do professor.
3. Escrever CSS para jogo e telas de smartphone/Chromebook, verificar acessibilidade e não poluir a tela inicial.
4. Atualizar testes automatizados (incluindo dados anteriores sem chave `game` no Supabase) e validar projeto.
5. Depois de passar tudo, commitar para `main`, publicar em produção e verificar resposta HTTP e fluxos reais; jamais trocar a versão em aula com deploy incompleto.

## CUIDADOS
- Não revelar código do professor no GitHub nem em JS de navegador.
- Evitar comandos de limpeza/migração que alterem os states dos alunos.
- Repo do GitHub está PUBLICO na última verificação; não enviar segredos nem dados identificáveis adicionais.
