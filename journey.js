/* Copa Hollywood: registro cumulativo de exploracao tecnica durante o projeto.
   NAO registra atividades por aula, nao observa o CapCut e nao avalia o video final.
   O historico e preenchido pelo aluno. */
(() => {
'use strict';
const SKILLS=[
 {id:'idea',category:'Ideia e história',icon:'💡',name:'Pensei na ideia ou no roteiro',xp:14,example:'Decidi como o vídeo vai começar e terminar.'},
 {id:'research',category:'Materiais',icon:'🔎',name:'Pesquisei cenas ou referências',xp:12,example:'Separei referências e arquivos que posso usar.'},
 {id:'drive',category:'Organização',icon:'📁',name:'Organizei meus arquivos no Drive',xp:14,example:'Criei pastas de cenas, áudios e versões.'},
 {id:'sequence',category:'Montagem',icon:'🎞️',name:'Montei ou reorganizei uma sequência',xp:18,example:'Organizei a entrevista para a resposta fazer sentido.'},
 {id:'cut',category:'Montagem',icon:'✂️',name:'Melhorei o tempo das cenas ou os cortes',xp:16,example:'Tirei partes longas e deixei a jogada mais clara.'},
 {id:'rhythm',category:'Ritmo',icon:'🥁',name:'Testei o ritmo da montagem',xp:18,example:'Sincronizei o momento forte com uma virada de música.'},
 {id:'transition',category:'Imagem e efeitos',icon:'🌪️',name:'Testei uma transição',xp:16,example:'Usei uma transição para mostrar a mudança de cena.'},
 {id:'speed',category:'Imagem e efeitos',icon:'⚡',name:'Experimentei velocidade ou câmera lenta',xp:18,example:'Acelerei a parte repetitiva e desacelerei o lance.'},
 {id:'visual',category:'Imagem e efeitos',icon:'✨',name:'Criei um efeito visual com intenção',xp:18,example:'Usei zoom para chamar atenção para um detalhe.'},
 {id:'color',category:'Imagem e efeitos',icon:'🎨',name:'Ajustei luz, contraste ou cor',xp:18,example:'Igualei a cor de dois trechos gravados em lugares diferentes.'},
 {id:'title',category:'Texto e legenda',icon:'🔠',name:'Criei títulos ou textos na tela',xp:16,example:'Criei o título de abertura e coloquei no momento certo.'},
 {id:'caption',category:'Texto e legenda',icon:'💬',name:'Criei ou revisei legendas',xp:18,example:'Corrigi as falas e sincronizei o texto.'},
 {id:'music',category:'Áudio',icon:'🎵',name:'Escolhi ou experimentei uma trilha',xp:16,example:'Testei duas músicas e escolhi a que combina.'},
 {id:'mix',category:'Áudio',icon:'🎛️',name:'Ajustei voz, volume ou efeitos sonoros',xp:20,example:'Baixei a música para ouvir a voz no talk show.'},
 {id:'story',category:'Ideia e história',icon:'🎭',name:'Mudei uma cena para contar melhor a história',xp:22,example:'Coloquei a reação depois do gol para criar emoção.'},
 {id:'tutorial',category:'Aprendizado',icon:'📖',name:'Aprendi e apliquei algo de um guia',xp:18,example:'Aprendi como fazer legendas e testei no CapCut.'},
 {id:'feedback',category:'Colaboração',icon:'👀',name:'Mostrei meu vídeo e usei uma opinião',xp:16,example:'Um colega disse que o início estava longo e eu mexi.'},
 {id:'help',category:'Colaboração',icon:'🤝',name:'Ajudei um colega com uma técnica',xp:16,example:'Ensinei uma amiga a ajustar o som.'},
 {id:'review',category:'Revisão',icon:'🔁',name:'Assisti, comparei e melhorei minha edição',xp:22,example:'Percebi um corte estranho e corrigi antes da prévia.'},
 {id:'preview',category:'Revisão',icon:'▶️',name:'Preparei uma versão para alguém assistir',xp:20,example:'Exporte uma prévia e conferi se o áudio funcionava.'},
 {id:'final',category:'Entrega',icon:'🏁',name:'Exporte meu vídeo final',xp:24,example:'Entreguei um MP4 que abre e toca do início ao fim.'}
];
const AWARDS=[
 {id:'comecou',icon:'🚀',name:'A primeira faísca',desc:'Registrou sua primeira conquista',test:m=>m.total>=1,progress:m=>[Math.min(m.total,1),1]},
 {id:'explorador3',icon:'🧭',name:'Curioso demais',desc:'Experimentou 3 tipos de técnica',test:m=>m.unique>=3,progress:m=>[Math.min(m.unique,3),3]},
 {id:'explorador7',icon:'🪄',name:'Coleção de truques',desc:'Experimentou 7 técnicas diferentes',test:m=>m.unique>=7,progress:m=>[Math.min(m.unique,7),7]},
 {id:'multitalentos',icon:'🌈',name:'Mil e uma ideias',desc:'Trabalhou em 5 áreas diferentes',test:m=>m.categories>=5,progress:m=>[Math.min(m.categories,5),5]},
 {id:'versatil',icon:'🏆',name:'Modo Hollywood',desc:'Trabalhou em 8 áreas diferentes',test:m=>m.categories>=8,progress:m=>[Math.min(m.categories,8),8]},
 {id:'historia',icon:'📽️',name:'Isso conta uma história!',desc:'Criou ou melhorou a narrativa',test:m=>m.ids.has('idea')||m.ids.has('story'),progress:m=>[Number(m.ids.has('idea')||m.ids.has('story')),1]},
 {id:'audio',icon:'🎧',name:'Ouvido de editor',desc:'Experimentou trilha ou mixagem',test:m=>m.ids.has('music')||m.ids.has('mix'),progress:m=>[Number(m.ids.has('music')||m.ids.has('mix')),1]},
 {id:'visual',icon:'✨',name:'Olho nos detalhes',desc:'Experimentou um recurso visual',test:m=>['color','visual','speed','transition'].some(x=>m.ids.has(x)),progress:m=>[Number(['color','visual','speed','transition'].some(x=>m.ids.has(x))),1]},
 {id:'texto',icon:'💬',name:'Fala, tela!',desc:'Trabalhou com títulos ou legendas',test:m=>m.ids.has('title')||m.ids.has('caption'),progress:m=>[Number(m.ids.has('title')||m.ids.has('caption')),1]},
 {id:'colaboracao',icon:'🤝',name:'Dupla dinâmica',desc:'Trocou ideias ou ensinou alguém',test:m=>m.ids.has('feedback')||m.ids.has('help'),progress:m=>[Number(m.ids.has('feedback')||m.ids.has('help')),1]},
 {id:'pesquisador',icon:'🔎',name:'Caçador de ideias',desc:'Pesquisou referências para o vídeo',test:m=>m.ids.has('research'),progress:m=>[Number(m.ids.has('research')),1]},
 {id:'organizado',icon:'📁',name:'Nada se perde',desc:'Organizou seus arquivos no Drive',test:m=>m.ids.has('drive'),progress:m=>[Number(m.ids.has('drive')),1]},
 {id:'aprendiz',icon:'📚',name:'Aprendi, testei!',desc:'Usou um tutorial na prática',test:m=>m.ids.has('tutorial'),progress:m=>[Number(m.ids.has('tutorial')),1]},
 {id:'revisor',icon:'🔁',name:'Versão melhorada',desc:'Revi ou testei uma prévia',test:m=>m.ids.has('review')||m.ids.has('preview'),progress:m=>[Number(m.ids.has('review')||m.ids.has('preview')),1]},
 {id:'criador12',icon:'🎬',name:'Não parei no primeiro',desc:'Fez 12 registros de trabalho pelo projeto',test:m=>m.total>=12,progress:m=>[Math.min(m.total,12),12]},
 {id:'curioso10',icon:'\ud83d\udd2e',name:'10 coisas novas!',desc:'Testou 10 habilidades diferentes',test:m=>m.unique>=10,progress:m=>[Math.min(m.unique,10),10]},
 {id:'cincoareas',icon:'\ud83d\ude80',name:'Espalhou as ideias',desc:'Experimentou em 6 áreas criativas',test:m=>m.categories>=6,progress:m=>[Math.min(m.categories,6),6]},
 {id:'mosaico',icon:'\ud83c\udfa8',name:'Editor de mil recursos',desc:'Experimentou 14 habilidades',test:m=>m.unique>=14,progress:m=>[Math.min(m.unique,14),14]},
 {id:'persistente',icon:'\ud83d\udcaa',name:'Não desisti',desc:'Registrou 20 melhorias ao longo da Copa',test:m=>m.total>=20,progress:m=>[Math.min(m.total,20),20]},
 {id:'experimentacao',icon:'\ud83e\uddea',name:'Testei de tudo',desc:'Aprendeu ritmo, áudio e efeito visual',test:m=>['rhythm','mix','visual'].every(id=>m.ids.has(id)),progress:m=>[['rhythm','mix','visual'].filter(id=>m.ids.has(id)).length,3]},
 {id:'aprendi2',icon:'\ud83d\udcda',name:'Mais uma habilidade',desc:'Aprendeu e aplicou tutoriais em duas tentativas',test:m=>(m.counts?.tutorial||0)>=2,progress:m=>[Math.min(m.counts?.tutorial||0,2),2]},
 {id:'pronto',icon:'🍿',name:'Tá na tela!',desc:'Exportou seu vídeo final',test:m=>m.ids.has('final'),progress:m=>[Number(m.ids.has('final')),1]}
];
function ensure(p){if(!p.journey||typeof p.journey!=='object')p.journey={};const j=p.journey;
 if(!Array.isArray(j.entries))j.entries=[];
 if(!j.counts||typeof j.counts!=='object')j.counts={};
 if(!j.unlocked||typeof j.unlocked!=='object')j.unlocked={};
 j.onboarded=j.onboarded===true;
 return j;}
function metrics(p){const j=ensure(p),ids=new Set(j.entries.map(e=>e.skill).filter(Boolean));return {total:j.entries.length,unique:ids.size,ids,counts:j.counts,categories:new Set(SKILLS.filter(s=>ids.has(s.id)).map(s=>s.category)).size};}
function awards(p){const j=ensure(p),m=metrics(p);return AWARDS.map(a=>{const [current,target]=a.progress(m);return {...a,done:Boolean(j.unlocked[a.id])||a.test(m),current,target};});}
function syncAwards(p){const j=ensure(p),was=new Set(Object.keys(j.unlocked).filter(x=>j.unlocked[x]));const newOnes=[];
 for(const a of AWARDS)if(!j.unlocked[a.id]&&a.test(metrics(p))){j.unlocked[a.id]=true;if(!was.has(a.id))newOnes.push(a);}
 return newOnes;}
function add(p,skill,detail,source='new'){
 const s=SKILLS.find(x=>x.id===skill);if(!s)return {ok:false,error:'Escolha o que você fez.'};
 const j=ensure(p),msg=String(detail||'').trim().slice(0,170);
 if(source==='new'&&msg.length<12)return {ok:false,error:'Conta o que você fez (pelo menos 12 caracteres).'};
 if(source==='new'&&j.entries.some(e=>e.skill===skill&&e.source==='new'&&e.detail.toLowerCase()===msg.toLowerCase()))return {ok:false,error:'Esse registro já está aqui. Conta uma melhoria nova.'};
 const count=Number(j.counts[skill]||0);
 // Primeiro registro pontua mais; segundo e terceiro dao bonus menor. Repeticoes seguem registradas, sem pontos extras.
 const xp=count===0?s.xp:count===1?Math.round(s.xp*.45):count===2?Math.round(s.xp*.2):0;
 j.entries.push({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),skill,detail:msg||'Já tinha feito antes de entrar na Copa.',source,at:new Date().toISOString(),xp});
 if(j.entries.length>180)j.entries.splice(0,j.entries.length-180);
 j.counts[skill]=count+1;
 p.xp=Math.min(99999,Math.max(0,Number(p.xp)||0)+xp);
 const unlocked=syncAwards(p);
 return {ok:true,xp,unlocked,skill:s};
}
function onboard(p,ids){const j=ensure(p);if(j.onboarded)return {ok:false,error:'Você já contou como começou.'};const chosen=new Set(Array.isArray(ids)?ids:[]);let xp=0;const unlocked=[];
 // O onboarding so marca habilidades, sem forcar uma etapa especifica do projeto.
 for(const s of SKILLS)if(chosen.has(s.id)){const r=add(p,s.id,'Já estava pronto quando comecei a usar a Copa.', 'antes');xp+=r.xp;unlocked.push(...r.unlocked);}
 j.onboarded=true;j.onboardedAt=new Date().toISOString();
 // Registros dos alunos de versoes anteriores permanecem intactos.
 return {ok:true,xp,unlocked};}
function recent(p,max=7){return ensure(p).entries.slice(-max).reverse().map(e=>({...e,skillData:SKILLS.find(x=>x.id===e.skill)}));}
function group(){return [...new Set(SKILLS.map(x=>x.category))].map(name=>({name,skills:SKILLS.filter(s=>s.category===name)}));}
function xpForNext(p,skill){const s=SKILLS.find(x=>x.id===skill),count=Number(ensure(p).counts[skill]||0);return !s?0:count===0?s.xp:count===1?Math.round(s.xp*.45):count===2?Math.round(s.xp*.2):0;}
window.CopaJourney={SKILLS,AWARDS,ensure,metrics,awards,add,onboard,recent,group,xpForNext};
})();
