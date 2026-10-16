/* CineMentor: ajuda contextual sem dependencia de IA remota.
 * Mantem o assunto entre perguntas, usa o projeto do aluno e sugere testes reais.
 * Nao envia perguntas de menores para APIs de terceiros nem persiste conversas. */
(() => {
  'use strict';
  const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&[^;]+;/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const first=s=>String(s||'').split(/[.!?]/).find(x=>x.trim())?.trim()||'';
  const map={
    futebol:['football','beat','sound','hook'], gameplay:['game','split','pacing','sound'],
    trailer:['trailer','story','sound','color'],talk:['talkshow','captions','voice','reactions'],
    edit:['beat','hook','story','split'],outro:['start','story','hook','capcut']
  };
  const contexts={
    error:/erro|trava|travou|bug|congela|nao abre|sem imagem|sem som|falhou|exporta|carrega|lento|ficou preto/,
    idea:/ideia|invent|criativ|nao sei|nao consigo pensar|travado|nada pra|comecar do zero|o que faco/,
    pace:/chato|entedian|parad|sem graca|arrastad|nao flui|ritmo|dinamic/,
    capcut:/capcut|linha do tempo|timeline|como colocar|onde clic|como import|como cort|dividir|tesoura/,
    sounds:/som|trilha|musica|audio|volume|voz|barulho|beat|batida|efeito sonoro/,
    duration:/tres minutos|3 minutos|muito longo|dura|tempo/,
    feedback:/colega|opini|revis|teste com|mostr|avali/,
    materials:/download|baixar|youtube|clipes|material|video da internet|pexels|mixkit|pinterest/
  };
  const guideMap={error:['bug','export','chromebook','import'], idea:['block','start','story','hook'],pace:['pacing','beat','split','story'], capcut:['capcut','split','import','captions'],sounds:['sound','voice','beat','suno'],duration:['length','story','export'],feedback:['peer','reactions','finish'],materials:['youtube','stock','youtubeown','license']};
  const ignore=new Set('eu quero meu minha seu sua voce como fazer de do da pra para por onde e nao sim eh ajuda agora ja tentar fazer'.split(' '));
  const guideExtra=id=>window.COPA_GUIDE_DETAILS?.[id]||null;
  function chooseGuide(q,p,guides,history){
    const norm=clean(q),words=norm.split(' ').filter(x=>x.length>2&&!ignore.has(x));
    const last=[...history].reverse().find(x=>x.who==='bot'&&x.topic);
    const follow=/^(sim|nao|ainda|tentei|fiz|nao deu|outro jeito|e se|mas|ta|isso|entendi|continua)/.test(norm)||(/(mas|tentei|nao funcionou|ainda)/.test(norm)&&words.length<7);
    const candidates=map[p.category]||map.outro;
    const kind=Object.entries(contexts).find(([k,reg])=>reg.test(norm))?.[0];
    const ranked=guides.map(g=>{
      const title=clean(g.title),cat=clean(g.category),tags=clean(g.tags.join(' '));let score=0;
      for(const w of words){if(title.includes(w))score+=6;if(tags.includes(w))score+=5;if(cat.includes(w))score+=2;if(w.length>4&&g.id.includes(w))score+=5}
      if(kind&&guideMap[kind]?.includes(g.id))score+=5;
      if(candidates.includes(g.id))score+=2;
      if(follow&&last?.topic===g.id)score+=30;
      if(g.id==='safety'&&kind!=='materials')score-=3;
      return {g,score};
    }).sort((a,b)=>b.score-a.score);
    return {guide:ranked[0]?.g,other:ranked.slice(1,3).map(x=>x.g),kind,follow,score:ranked[0]?.score||0};
  }
  function nextQuestion(kind,p,id){
    if(kind==='error'||id==='bug')return 'O que aparece na tela quando trava: uma mensagem, tela preta ou o carregamento parado?';
    if(kind==='materials'||id==='youtube')return 'Voce precisa de qual cena exatamente? Gol, torcida, paisagem, personagem...?';
    if(id==='talkshow')return 'Qual vai ser o assunto do talk show? Posso te dar perguntas diferentes.';
    if(id==='football')return 'Qual e a melhor jogada que voce ja separou?';
    if(id==='game')return 'O que acontece no final do gameplay: ganha, perde ou da tudo errado?';
    if(id==='trailer')return 'Que jogo e qual clima voce quer: suspense, emocao ou acao?';
    if(kind==='sounds'||id==='sound')return 'Tem alguem falando nesse trecho ou e so musica e imagens?';
    if(id==='beat')return 'Sua musica e mais rapida ou calma? Qual e o ponto forte dela?';
    if(id==='export')return 'Em que momento da exportacao para: antes de comecar ou numa porcentagem?';
    if(kind==='idea'||id==='start')return 'O que voce ja tem: cenas separadas, uma ideia na cabeca ou ainda nada?';
    return 'Qual e o trecho que voce quer melhorar primeiro? Me conta como ele esta agora.';
  }
  function buildAnswer(q,p,guides,history){
    const {guide:g,other,kind,follow,score}=chooseGuide(q,p,guides,history);
    const detail=guideExtra(g?.id);
    const project=p.project||{};
    const hasTitle=project.title&& !/^meu (video|filme)/i.test(clean(project.title));
    const label=hasTitle?`no <b>${esc(project.title)}</b>`:'no seu v&iacute;deo';
    const short=clean(q);
    const previous=[...history].reverse().find(x=>x.who==='bot'&&x.topic);
    if(follow&&/nao deu|nao funcionou|ainda|travou|tentei/.test(short)&&previous){
      const prev=guides.find(x=>x.id===previous.topic)||g;
      const more=guideExtra(prev?.id);
      const errs=(more?.mistakes||[]);
      return {topic:prev?.id||'bug',html:`<p>Ok, ent&atilde;o a primeira tentativa n&atilde;o resolveu. Vamos descobrir <b>onde</b> ficou preso em vez de repetir tudo.</p><ol><li>${esc(errs[0]||'Confira se o projeto foi salvo antes de mexer de novo.')}</li><li>${esc(errs[1]||'Teste com um clipe menor e veja se o problema se repete.')}</li><li>Se aparecer erro, copie as palavras exatas da tela. Isso muda a solu&ccedil;&atilde;o.</li></ol><p class="mentor-reason">Me diz: ${esc(nextQuestion('error',p,prev?.id))}</p><p class="mentor-escalate">Se estiver travando de verdade, mostra para um colega ou chama o Tio Z&eacute;.</p>`};
    }
    if(kind==='idea'&&/nao sei|sem ideia|invent|me da uma ideia|me de uma ideia/.test(short)){
      const list=map[p.category]||map.outro;
      const themes={futebol:['Comece mostrando uma reacao, depois revele o lance.','Monte um antes e depois do mesmo jogador.','Mostre o quase gol e segure o verdadeiro gol para o final.'],gameplay:['Tres tentativas que ficam cada vez piores.','Comece no ultimo segundo da partida e volte no tempo.','Mostre uma jogada absurda, depois revele como chegou la.'],trailer:['Um mundo bonito que esconde um problema.','Uma fala misteriosa, silencio, depois uma explosao visual.','Uma escolha do personagem que muda tudo.'],talk:['Uma pergunta que a convidada nao esperava.','Rodada "responda em tres segundos".','Uma entrevista que vira desafio no meio.'],edit:['Um objeto que muda de significado no final.','Ritmo rapido que para num silencio.','A mesma cena com dois climas diferentes.']};
      const suggestions=themes[p.category]||themes.edit;
      return {topic:list[0],html:`<p>Bora destravar ${label}. Escolhe <b>uma</b> dessas e testa so 10 segundos:</p><ol>${suggestions.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="mentor-reason">Qual dessas voce consegue fazer com os clipes que ja tem? Se disser o que tem na pasta, eu monto uma sequencia com voce.</p>`};
    }
    if(!g||score<2){
      return {topic:'start',html:`<p>Me explica um pouquinho mais que eu consigo ajudar melhor.</p><p>Voce esta tentando <b>cortar uma cena</b>, <b>melhorar o som</b>, <b>inventar a historia</b> ou <b>resolver um erro</b>?</p><p class="mentor-reason">Pode falar do seu jeito, tipo: "tenho tres clipes de futebol e nao sei a ordem".</p>`};
    }
    const steps=(detail?.steps?.length?detail.steps:g.steps);
    const tailored=kind==='pace'?`Quando o v&iacute;deo parece parado, quase sempre nao e falta de efeito: pode ser a ordem das cenas. `:'';
    const actionSteps=steps.slice(0,4);
    const focus=!follow?`<p class="mentor-context">${tailored}Vamos testar ${label} sem mexer em tudo ao mesmo tempo.</p>`:`<p>Boa, agora vamos para o proximo peda&ccedil;o.</p>`;
    const followups=other.filter(Boolean).slice(0,2).map(x=>`<button class="mentor-followup" data-act="ask-chip" data-question="${esc(x.title)}">${x.title} &#8599;</button>`).join('');
    const link=g.link?`<a href="${esc(window.COPA_MENTOR_TOOLS?.[g.link]||'#')}" target="_blank" rel="noopener noreferrer">Abrir ferramenta &#8599;</a>`:'';
    return {topic:g.id,html:`${focus}<p><b>${g.title}</b>${detail?.why?`<br><span class="muted">${esc(detail.why)}</span>`:''}</p><div class="mentor-steps-title">TESTA ISSO AGORA</div><ol>${actionSteps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p><b>Como saber se melhorou?</b> ${esc(detail?.test||g.tip)}</p><p class="mentor-reason">${esc(nextQuestion(kind,p,g.id))}</p><div class="mentor-actions"><button class="mentor-followup" data-act="open-guide" data-id="${esc(g.id)}">Ver o guia completo &#8599;</button>${followups}</div>${link?`<p class="mentor-tool">${link}</p>`:''}<p class="mentor-escalate">Se der ruim, pergunta de novo com o que apareceu na tela. Ou chama um colega ou o Tio Z&eacute;.</p>`};
  }
  window.CopaMentor={answer:buildAnswer};
})();
