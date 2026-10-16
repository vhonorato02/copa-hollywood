/* Copa Hollywood — painel do Tio Zé. Avaliação do vídeo é independente do XP.
   Nenhuma senha ou nota fica guardada no navegador. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cloud=window.COPA_CLOUD||{},url=String(cloud.url||'').replace(/\/$/,''),key=String(cloud.publishableKey||'');
const root='https://drive.google.com/drive/folders/1X6IyCzQTcAPaeWdkiV6MuTjuqVLFQSew';
const avatars=['🎬','🎮','🎤','⚽','🍿','🎨','🎧','🚀','🐯','👾','🪄','⭐'];
const rubric=[['narrative','História'],['editing','Edição'],['sound','Som'],['creativity','Criatividade'],['finish','Acabamento']];
let access='',students=[],selected=null,selectedReview=null;
const states=s=>s&&s.state&&typeof s.state==='object'?s.state:{};
const project=s=>states(s).project||{};
const journey=s=>states(s).journey||{};
const entries=s=>Array.isArray(journey(s).entries)?journey(s).entries:[];
const xp=s=>Math.max(0,Number(states(s).xp)||0);
const unique=s=>new Set(entries(s).map(e=>e.skill).filter(Boolean)).size;
const trophies=s=>Object.values(journey(s).unlocked||{}).filter(Boolean).length;
const stages=s=>Object.values(project(s).steps||{}).filter(Boolean).length;
const reviewed=s=>Object.values(s.review||{}).filter(Boolean).length>0;
const score=s=>rubric.map(([k])=>s.review?.[k]).every(v=>v!==null&&v!==undefined&&v!=='')?rubric.reduce((sum,[k])=>sum+Number(s.review?.[k]||0),0):null;
const safeUrl=v=>{try{let u=new URL(String(v));return u.protocol==='https:'?u.href:null}catch{return null}};
function status(s){let p=project(s),j=journey(s);if(!j.onboarded)return {key:'beginning',label:'Aguardando primeiro acesso'};if(entries(s).some(e=>e.skill==='final')||p.steps?.[6])return {key:'final',label:'Exportado'};if(p.materialStatus==='imported'||entries(s).some(e=>e.skill==='sequence')||p.steps?.[3])return {key:'editing',label:'Editando'};if(p.materialStatus==='ready'||p.steps?.[1])return {key:'editing',label:'Organizando material'};if(p.materialStatus==='searching')return {key:'beginning',label:'Escolhendo cenas'};return {key:'beginning',label:'Começando'};}
function dateOf(v){if(!v)return 'Sem registro';try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(v))}catch{return 'Sem registro'}}
function toast(s){let el=$('toast');el.textContent=s;el.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.add('hidden'),3000)}
async function call(action,payload={}){if(!access)throw Error('Digite o código primeiro.');const r=await fetch(url+'/rest/v1/rpc/copa_teacher',{method:'POST',headers:{apikey:key,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({p_pass:access,p_action:action,p_payload:payload}),cache:'no-store',credentials:'omit'});const data=await r.json().catch(()=>null);if(!r.ok||!data?.ok)throw Error('Não consegui validar ou salvar. Confira o código e a conexão.');return data;}
async function load(){const data=await call('list');students=Array.isArray(data.students)?data.students:[];render();}
function useScore(s){return unique(s)*3+Math.min(entries(s).length,25)+trophies(s)*2+(journey(s).onboarded?2:0)}
function makeHighlights(){let active=students.filter(s=>s.active),newcomers=active.filter(s=>!journey(s).onboarded).length,ready=active.filter(s=>status(s).key==='final').length,award=active.filter(s=>s.review?.award).length;
 const most=active.filter(s=>journey(s).onboarded).sort((a,b)=>useScore(b)-useScore(a)).slice(0,3);
 $('highlights').innerHTML=`<div class="highlights-title"><span>OLHO NO ANDAMENTO</span><h2>Quem precisa do quê?</h2><p>O uso da plataforma é só um retrato do que eles registraram. As notas são da avaliação do vídeo.</p></div><div class="highlight-row"><div><b>${newcomers}</b><span>Ainda não fizeram o primeiro acesso</span></div><div><b>${ready}</b><span>Registraram o vídeo final</span></div><div><b>${award}</b><span>Prêmios já indicados</span></div></div>${most.length?`<details class="top-usage"><summary>Quem mais explorou técnicas na central? ↗</summary><div>${most.map(s=>`<span>${safe(s.name)} · ${unique(s)} técnicas / ${trophies(s)} conquistas</span>`).join('')}</div><small>Não é ranking de qualidade. Você decide os prêmios depois de ver os vídeos.</small></details>`:''}`;}
function studentCard(s){const st=status(s),p=project(s),j=journey(s),icon=avatars[Number(states(s).avatarChoice??s.avatar??0)%avatars.length]||'🎬',scr=score(s),link=safeUrl(s.review?.video_url),drive=safeUrl(s.drive_url)||root;
 const logs=entries(s).slice(-15).reverse();
 return `<article class="student ${s.active?'':'archived'}"><div class="student-head"><div class="student-name"><span class="avatar">${icon}</span><b>${safe(s.name)}</b></div><span class="stage stage-${st.key}">${safe(st.label)}</span></div><h3>${safe(p.title||'Vídeo sem título')}</h3><div class="student-type">${safe({talk:'Talk show',gameplay:'Gameplay',futebol:'Edit de futebol',anime:'Anime',trailer:'Trailer',edit:'Edit criativo',outro:'Ainda decidindo'}[states(s).category]||'Vídeo')}</div>
 <div class="card-pulse"><div><strong>${xp(s)}</strong><small>XP</small></div><div><strong>${unique(s)}</strong><small>técnicas</small></div><div><strong>${trophies(s)}</strong><small>conquistas</small></div><div><strong>${scr===null?'–':scr+'/25'}</strong><small>vídeo final</small></div></div>
 <p class="muted">${safe(p.nextStep?'Próximo passo: '+p.nextStep:st.label)} · Atualizado ${safe(dateOf(s.updated_at))}</p>${s.review?.award?`<div class="award-highlight">🏅 ${safe(s.review.award)}</div>`:''}
 <details class="teacher-log"><summary>O que ${safe(s.name)} fez? (${logs.length} recentes) ↓</summary><div class="teacher-log-inner">${logs.length?logs.map(e=>`<div class="teacher-log-row"><span>${safe(e.detail||e.skill||'Atividade')}</span><small>${safe(e.skill)} · ${e.source==='antes'?'ANTES DA CENTRAL · ':''}${safe(dateOf(e.at))}${e.xp?' · +'+Number(e.xp)+' XP':''}</small></div>`).join(''):'<p class="muted">Nenhuma atividade registrada ainda.</p>'}</div></details>
 <div class="student-actions"><a href="${safe(drive)}" target="_blank" rel="noopener noreferrer">Drive ↗</a>${link?`<a href="${safe(link)}" target="_blank" rel="noopener noreferrer">Assistir ↗</a>`:''}<button class="ghost" data-edit="${safe(s.id)}">Perfil / recado</button><button class="primary mini" data-review="${safe(s.id)}">Avaliar / premiar ⭐</button></div></article>`;}
function render(){ $('login').classList.add('hidden');$('dashboard').classList.remove('hidden');let active=students.filter(s=>s.active);
 const stats=[['ALUNOS ATIVOS',active.length],['JÁ ENTRARAM',active.filter(s=>journey(s).onboarded).length],['EXPERIÊNCIAS',active.reduce((sum,s)=>sum+entries(s).length,0)],['VÍDEOS AVALIADOS',active.filter(s=>score(s)!==null).length]];
 $('stats').innerHTML=stats.map(([k,v])=>`<div class="stat"><strong>${v}</strong><small>${k}</small></div>`).join('');makeHighlights();
 const search=$('studentSearch').value.trim().toLowerCase();const filter=$('studentFilter').value,archived=$('showArchived').checked;
 const visible=students.filter(s=>archived||s.active).filter(s=>!search||(s.name+' '+project(s).title).toLowerCase().includes(search)).filter(s=>filter==='all'||(filter==='inactive'?!journey(s).onboarded:filter==='award'?Boolean(s.review?.award):status(s).key===filter)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 $('students').innerHTML=visible.length?visible.map(studentCard).join(''):'<div class="empty-filter">Ninguém com esse filtro. Tente outro.</div>';
}
function openModal(s){selected=s||null;$('modalTitle').textContent=s?'Editar '+s.name:'Novo aluno';$('editId').value=s?.id||'';$('editName').value=s?.name||'';$('editAvatar').value=String(Number(states(s||{}).avatarChoice??s?.avatar??0));$('editDrive').value=s?.drive_url||root;$('editMessage').value=s?.teacher_message||'';$('editNote').value=s?.note||'';$('editActive').checked=s?s.active:true;$('archiveWrap').classList.toggle('hidden',!s);$('modalError').textContent='';$('editModal').classList.remove('hidden');$('editName').focus()}
function closeModal(){$('editModal').classList.add('hidden')}
function slug(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,32)||'aluno'}
async function save(e){e.preventDefault();$('saveProfile').disabled=true;$('modalError').textContent='';const name=$('editName').value.trim(),drive_url=$('editDrive').value.trim()||root;
 if(name.length<2){$('modalError').textContent='Preencha o nome.';$('saveProfile').disabled=false;return;}
 if(!drive_url.startsWith('https://drive.google.com/drive/folders/')){$('modalError').textContent='Cole o endereço da pasta do Drive.';$('saveProfile').disabled=false;return;}
 let payload={name,avatar:Number($('editAvatar').value),drive_url,teacher_message:$('editMessage').value.trim(),note:$('editNote').value.trim()};
 try{if(selected){payload.id=selected.id;payload.active=$('editActive').checked;await call('update',payload);}else{let id=slug(name),n=2;while(students.some(s=>s.id===id))id=slug(name)+'-'+n++;payload.id=id;await call('create',payload);if(payload.note||payload.teacher_message)await call('update',payload)}await load();closeModal();toast(selected?'Perfil atualizado!':'Aluno cadastrado!')}
 catch(err){$('modalError').textContent=err.message||'Falha ao salvar.'}finally{$('saveProfile').disabled=false}
}
function openReview(s){selectedReview=s;const r=s.review||{};$('reviewTitle').textContent='Avaliar '+s.name;rubric.forEach(([k])=>{$('grade-'+k).value=r[k]==null?'':String(r[k])});$('reviewAward').value=r.award||'';$('reviewComment').value=r.comment||'';$('reviewVerified').checked=Boolean(r.verified);$('reviewVideo').value=r.video_url||'';$('reviewError').textContent='';$('reviewModal').classList.remove('hidden');drawScore()}
function closeReview(){$('reviewModal').classList.add('hidden');selectedReview=null}
function drawScore(){const scores=rubric.map(([k])=>$('grade-'+k).value),ok=scores.every(x=>x!=='');$('reviewSummary').textContent=ok?`Nota total: ${scores.reduce((a,b)=>a+Number(b),0)} de 25 pontos · Separada do XP`:'Nota total: preencha os 5 critérios quando assistir ao vídeo';}
async function saveReview(e){e.preventDefault();if(!selectedReview)return;let review={};for(let [k] of rubric)review[k]=$('grade-'+k).value||null;review.award=$('reviewAward').value;review.verified=$('reviewVerified').checked;review.comment=$('reviewComment').value.trim();review.video_url=$('reviewVideo').value.trim();if(review.video_url&&!safeUrl(review.video_url)){$('reviewError').textContent='Use um link HTTPS válido.';return;}$('saveReview').disabled=true;try{await call('review',{id:selectedReview.id,review});await load();closeReview();toast('Avaliação salva!')}catch(err){$('reviewError').textContent=err.message}finally{$('saveReview').disabled=false}}
function exportCSV(){const head=['Aluno','Ativo','Tipo de vídeo','Título','Etapa do projeto','XP plataforma','Técnicas diferentes','Experiências registradas','Conquistas','Primeiro acesso','Verificado Tio Zé','Nota vídeo (0-25)','Premiação','Narrativa','Montagem','Som','Criatividade','Acabamento','Próximo passo','Última alteração','Link vídeo'];const data=students.map(s=>[s.name,s.active?'sim':'não',states(s).category||'',project(s).title||'',status(s).label,xp(s),unique(s),entries(s).length,trophies(s),journey(s).onboarded?'sim':'não',s.review?.verified?'sim':'não',score(s)??'',s.review?.award||'',...rubric.map(([k])=>s.review?.[k]??''),project(s).nextStep||'',dateOf(s.updated_at),s.review?.video_url||'']);const bom='\ufeff';const csv=bom+[head,...data].map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');const obj=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=obj;a.download='copa-hollywood-turma.csv';a.click();setTimeout(()=>URL.revokeObjectURL(obj),2000)}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;$('loginError').textContent='';access=$('secret').value.trim();try{await load();$('secret').value=''}catch(err){access='';$('loginError').textContent='Código incorreto ou banco indisponível.'}finally{b.disabled=false}});
$('refresh').addEventListener('click',()=>load().then(()=>toast('Atualizado!')).catch(()=>toast('Não consegui atualizar.')));
$('logout').addEventListener('click',()=>{access='';students=[];$('dashboard').classList.add('hidden');$('login').classList.remove('hidden')});
$('export').addEventListener('click',exportCSV);$('addProfile').addEventListener('click',()=>openModal(null));
$('studentSearch').addEventListener('input',render);$('studentFilter').addEventListener('change',render);$('showArchived').addEventListener('change',render);
$('students').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),review=e.target.closest('[data-review]');if(edit){const s=students.find(x=>x.id===edit.dataset.edit);if(s)openModal(s)}else if(review){const s=students.find(x=>x.id===review.dataset.review);if(s)openReview(s)}});
$('editForm').addEventListener('submit',save);$('closeModal').addEventListener('click',closeModal);$('cancelModal').addEventListener('click',closeModal);$('modalBackdrop').addEventListener('click',closeModal);
$('reviewForm').addEventListener('submit',saveReview);for(const [k] of rubric)$('grade-'+k).addEventListener('change',drawScore);$('cancelReview').addEventListener('click',closeReview);$('closeReview').addEventListener('click',closeReview);$('reviewBackdrop').addEventListener('click',closeReview);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeReview()}});
})();
