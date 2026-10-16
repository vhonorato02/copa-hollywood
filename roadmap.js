/* Copa Hollywood — roteiro personalizado do projeto inteiro, sem tarefas por aula. */
(() => {
'use strict';
const kinds = {
  talk: {name:'talk show',focus:'a conversa mais divertida',first:'Pense em 4 perguntas que façam a outra pessoa contar algo inesperado.',material:'Grave as respostas e separe as reações mais interessantes.',edit:'Monte pergunta, resposta e reação; deixe de fora as pausas sem graça.',finish:'Garanta que as vozes sejam ouvidas acima da trilha.',mentor:'Como deixar uma entrevista divertida sem ficar forçado?'},
  gameplay: {name:'gameplay',focus:'a jogada que vale assistir',first:'Escolha se o vídeo vai ser engraçado, impressionante ou uma história de superação.',material:'Separe 3 a 6 momentos do jogo, com reação ou surpresa.',edit:'Monte os melhores momentos em uma ordem que dê vontade de continuar.',finish:'Equilibre o som do jogo, voz e efeitos; evite sustos de volume.',mentor:'Como escolher os melhores momentos de um gameplay?'},
  futebol: {name:'edit de jogador',focus:'o melhor momento do jogador',first:'Decida qual jogador e qual sensação quer passar: habilidade, humor ou emoção.',material:'Ache lances e planos diferentes do jogador com autorização de uso.',edit:'Misture construção e clímax: evite colocar todos os golaços no começo.',finish:'Use a música para fortalecer os momentos, sem esconder o som importante.',mentor:'Como montar um edit de futebol que tenha história?'},
  anime: {name:'edit ou trailer de anime',focus:'a cena com mais impacto',first:'Escolha um personagem, conflito ou emoção — não precisa resumir toda a temporada.',material:'Separe cenas curtas que mostrem uma transformação ou uma tensão.',edit:'Monte o começo intrigante, a escalada e um final forte sem revelar tudo.',finish:'Revise textos, sincronismo de música e clareza dos efeitos.',mentor:'Como fazer um trailer de anime emocionante sem spoiler?'},
  trailer: {name:'trailer de jogo',focus:'a promessa do trailer',first:'Escolha o que vai despertar curiosidade: mistério, desafio, humor ou emoção.',material:'Separe cenas que apresentem o universo sem entregar o final.',edit:'Monte a progressão: apresentação, tensão, virada e uma última imagem.',finish:'Ajuste os efeitos sonoros das viradas e deixe o texto legível.',mentor:'Como fazer um trailer de jogo que pareça profissional?'},
  edit: {name:'edit criativo',focus:'uma ideia de montagem',first:'Defina a sensação principal que quer causar em quem assiste.',material:'Separe imagens que combinem ou se contrastem de um jeito interessante.',edit:'Monte uma sequência de 15 segundos com começo, virada e final.',finish:'Compare duas versões e mantenha o efeito que realmente ajuda.',mentor:'Como escolher uma ideia original para meu edit?'},
  outro: {name:'vídeo',focus:'sua ideia',first:'Veja referências e escolha qual história você quer contar.',material:'Separe três exemplos do estilo que mais gostou.',edit:'Comece com 10 a 15 segundos e descubra o ritmo.',finish:'Mostre a versão para um colega e veja o que ele entendeu.',mentor:'Ainda não escolhi o que fazer, pode me ajudar?'}
};
function build(p){
 const kind=kinds[p?.category]||kinds.outro;
 const project=p?.project||{};
 const entries=Array.isArray(p?.journey?.entries)?p.journey.entries:[];
 const seen=new Set(entries.map(e=>e.skill));
 const steps=project.steps||{};
 const material=project.materialStatus||'none';
 const chosen=p?.category&&p.category!=='outro';
 const idea=seen.has('idea')||Boolean(String(project.logline||'').trim());
 const hasFiles=['ready','imported'].includes(material)||Boolean(steps[1]);
 const imported=material==='imported'||Boolean(steps[2])||seen.has('sequence');
 const arranged=Boolean(steps[3])||seen.has('sequence');
 const designed=seen.has('rhythm')||seen.has('mix')||seen.has('color')||seen.has('visual')||seen.has('caption');
 const revised=seen.has('review')||seen.has('feedback')||Boolean(steps[5]);
 const exported=seen.has('final')||Boolean(steps[6]);
 const all=[
  {id:'choice',phase:'COMEÇAR',icon:'🎬',name:'Escolher o estilo do vídeo',desc:chosen?`Você escolheu ${kind.name}.`:'Talk show, gameplay, anime, edit de futebol, trailer ou outra ideia. Qual combina com você?',guide:'start',action:'category',cta:'Escolher estilo',done:!!chosen},
  {id:'idea',phase:'COMEÇAR',icon:'💡',name:'Decidir a história',desc:kind.first,guide:'story',action:'idea',cta:'Gerar uma ideia',done:!!idea},
  {id:'references',phase:'MATERIAIS',icon:'🔎',name:'Garimpar cenas e referências',desc:kind.material,guide:'youtube-download',action:'research',cta:'Ver onde buscar',done:seen.has('research')||hasFiles},
  {id:'material',phase:'MATERIAIS',icon:'📁',name:'Separar o material que vai usar',desc:'Quando tiver os arquivos, marque “Tenho os materiais” em Meu vídeo. Não precisa estar editando ainda.',guide:'youtube-download',action:'material',cta:'Ver como baixar',done:hasFiles},
  {id:'drive',phase:'MATERIAIS',icon:'☁️',name:'Organizar a pasta no Drive',desc:'Coloque os arquivos no Drive da Copa para encontrá-los de novo.',guide:'drive-upload',action:'drive',cta:'Aprender o upload',done:seen.has('drive')||Boolean(steps[1])},
  {id:'import',phase:'EDITAR',icon:'✂️',name:'Abrir o CapCut e importar cenas',desc:'Crie seu projeto de edição e leve os arquivos para a timeline.',guide:'import',action:'capcut',cta:'Começar a editar',done:imported},
  {id:'assembly',phase:'EDITAR',icon:'🎞️',name:'Montar uma primeira sequência',desc:kind.edit,guide:'import',action:'assembly',cta:'Como montar?',done:arranged},
  {id:'technique',phase:'EXPERIMENTAR',icon:'⚡',name:'Experimentar uma técnica nova',desc:'Pode ser som, texto, ritmo, cor, velocidade, humor ou efeitos. Escolha o que faz sentido para seu vídeo.',guide:'trans',action:'technique',cta:'Escolher uma técnica',done:designed},
  {id:'feedback',phase:'MELHORAR',icon:'👀',name:'Mostrar e melhorar',desc:'Peça para um colega assistir e dizer o que sentiu, entendeu ou achou confuso.',guide:'story',action:'feedback',cta:'Pedir ideias ao Mentor',done:revised},
  {id:'export',phase:'ESTREIA',icon:'🍿',name:'Exportar e mandar pro Drive',desc:kind.finish+' Depois confira o MP4 e envie a versão final.',guide:'export',action:'export',cta:'Ver como entregar',done:exported}
 ];
 const undone=all.filter(s=>!s.done);
 const near=undone.slice(0,3);
 const phase=near[0]?.phase||'ESTREIA';
 return {kind,items:all,next:near,phase,completed:all.length-undone.length,total:all.length,first:near[0]||{name:'Seu vídeo está pronto!',desc:'Se quiser, revise e experimente mais uma ideia.',action:'feedback',cta:'Explorar mais'}};
}
const AVATARS=[
 {icon:'🎬',name:'Claquete',tone:'#ef4156'}, {icon:'🎮',name:'Controle',tone:'#8767ef'},
 {icon:'🎤',name:'Microfone',tone:'#f58a55'}, {icon:'⚽',name:'Bola',tone:'#52b980'},
 {icon:'🍿',name:'Pipoca',tone:'#f4c258'}, {icon:'🎨',name:'Arte',tone:'#56b6e2'},
 {icon:'🎧',name:'Fone',tone:'#dd69cb'}, {icon:'🚀',name:'Foguete',tone:'#7bc8a7'},
 {icon:'🐯',name:'Tigre',tone:'#f29961'}, {icon:'👾',name:'Arcade',tone:'#a2a0f3'},
 {icon:'🪄',name:'Magia',tone:'#ec86c1'}, {icon:'⭐',name:'Estrela',tone:'#ffc953'}
];
function avatar(profile){const index=Number(profile?.avatarChoice??profile?.avatar??0);return AVATARS[((index%AVATARS.length)+AVATARS.length)%AVATARS.length];}
window.CopaPlanner={build,kinds,AVATARS,avatar};
})();
