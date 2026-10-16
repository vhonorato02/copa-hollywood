import json
from pathlib import Path
import re
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
ROOT='about:blank'
PROJECT_DIR=Path(__file__).resolve().parents[1]
OUT=PROJECT_DIR/'tests';OUT.mkdir(exist_ok=True)
BASE='https://drive.google.com/drive/folders/1X6IyCzQTcAPaeWdkiV6MuTjuqVLFQSew'
NAMES=['Antonella','Chalita','Elis','Filipi','Leozão','Leozin','Rafão','Santi']
roster={n.lower().replace('ã','a').replace('ão','ao'):{'id':n.lower().replace('ã','a').replace('ão','ao'),'name':n,'avatar':i,'drive_url':BASE,'teacher_message':'Boa! Quero ver sua abertura.' if n=='Antonella' else '', 'state':{},'review':{},'active':True,'updated_at':'2026-10-16T15:00:00Z'} for i,n in enumerate(NAMES)}
# Correct slug convention for profiles known from seed
roster['leozao']=roster.pop('leozao');roster['rafao']=roster.pop('rafao')
notes={}

def supa_mock(route):
    req=route.request; parsed=urlparse(req.url)
    if '/rpc/copa_teacher' in parsed.path:
        data=req.post_data_json or {}
        if data.get('p_pass')!='TEST-TEACHER-CODE':route.fulfill(status=403,body='{"message":"Access denied"}',content_type='application/json');return
        act=data.get('p_action'); payload=data.get('p_payload') or {}
        if act=='list':ans={'ok':True,'students':[{**row, 'note':notes.get(k,'')} for k,row in roster.items()]}
        elif act=='create':
            id=payload['id'];roster[id]={'id':id,'name':payload['name'],'avatar':int(payload.get('avatar',0)),'drive_url':payload.get('drive_url') or BASE,'teacher_message':'','state':{},'review':{},'active':True,'updated_at':'2026-10-16T15:05:00Z'};ans={'ok':True,'id':id}
        elif act=='update':
            id=payload['id'];roster[id].update({k:v for k,v in payload.items() if k in ['name','avatar','drive_url','teacher_message','active']});notes[id]=payload.get('note','');ans={'ok':True,'id':id}
        elif act=='review':
            id=payload['id'];roster[id]['review']=payload.get('review',{});ans={'ok':True,'id':id}
        else:ans={'ok':False}
        route.fulfill(status=200,body=json.dumps(ans,ensure_ascii=False),content_type='application/json');return
    params=parse_qs(parsed.query);rows=list(roster.values());rows=[r for r in rows if r['active']]
    if 'id' in params:
        val=params['id'][0].replace('eq.','');rows=[r for r in rows if r['id']==val]
    if req.method=='PATCH':
        payload=req.post_data_json or {};sid=params['id'][0].replace('eq.','');roster[sid]['state']=payload.get('state',{});rows=[{'id':sid}]
    else:
        select=params.get('select',[''])[0].split(',')
        rows=[{k:v for k,v in r.items() if k in select} for r in rows]
    route.fulfill(status=200,body=json.dumps(rows,ensure_ascii=False),content_type='application/json')


def mount(page, teacher=False):
    base=PROJECT_DIR
    html=(base/('professor.html' if teacher else 'index.html')).read_text()
    html=re.sub(r'<script\s+defer\s+src="[^"]+"\s*></script>', '', html)
    html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+">', '', html)
    css=(base/('professor.css' if teacher else 'styles.css')).read_text()
    html=html.replace('</head>','<style>'+css+'</style></head>')
    page.set_content(html, wait_until='domcontentloaded')
    scripts=['config.js','professor.js'] if teacher else ['config.js','guides.js','mentor.js','mentor-plus.js','journey.js','roadmap.js','app.js']
    for file in scripts: page.add_script_tag(content=(base/file).read_text())

def checked(page,msg):
    if msg not in page.content():raise AssertionError('MISSING: '+msg)

def test_page(browser,mobile=False):
    for row in roster.values():row['state']={}
    context=browser.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 980},device_scale_factor=1)
    context.route('**/rest/v1/**',supa_mock)
    page=context.new_page();page.set_default_timeout(4000);issues=[]
    page.on('pageerror',lambda ex:issues.append(str(ex)))
    mount(page);page.locator('[data-act="enter-profile"]').first.wait_for()
    assert page.locator('[data-act="enter-profile"]').count()==8
    page.screenshot(path=str(OUT/('gate-mobile.png' if mobile else 'gate-desktop.png')),full_page=True)
    page.locator('[data-act="enter-profile"][data-id="antonella"]').click()
    page.locator('#onboardForm').wait_for()
    assert 'O que você' in page.locator('#content').inner_text()
    page.screenshot(path=str(OUT/('onboard-mobile.png' if mobile else 'onboard-desktop.png')),full_page=True)
    # A aluna ja pesquisou, montou uma sequencia e mexeu no som.
    page.locator('#onboardCategory').select_option('futebol');page.locator('#onboardMaterial').select_option('ready');page.locator('#onboardForm [data-avatar="3"]').click()
    page.locator('#onboardForm input[value="research"]').check()
    page.locator('#onboardForm input[value="sequence"]').check()
    page.locator('#onboardForm input[value="mix"]').check()
    page.locator('#onboardForm button[type="submit"]').click()
    page.locator('.home-progress-red').wait_for()
    page.wait_for_timeout(1250)
    assert roster['antonella']['state']['journey']['onboarded'] is True
    assert roster['antonella']['state']['category']=='futebol'
    assert roster['antonella']['state']['avatarChoice']==3
    assert roster['antonella']['state']['project']['materialStatus']=='ready'
    assert len(roster['antonella']['state']['journey']['entries']) == 3
    assert roster['antonella']['state']['xp'] > 0
    # Acumula no projeto: mais uma tecnica, sem reiniciar por aula.
    page.locator('.home-progress-red [data-nav="journey"]').click()
    page.locator('#activitySkill').select_option('caption')
    page.locator('#activityDetail').fill('Revisei cada linha de legenda e sincronizei as falas.')
    page.locator('#activityForm button[type="submit"]').click()
    page.wait_for_timeout(1200)
    assert len(roster['antonella']['state']['journey']['entries']) == 4
    page.screenshot(path=str(OUT/('journey-mobile.png' if mobile else 'journey-desktop.png')),full_page=True)
    # Mission alone should NOT generate XP. It must lead to a logged applied technique.
    before_xp=roster['antonella']['state']['xp']
    page.locator('.mobile-nav [data-nav="explore"]' if mobile else '.sidebar [data-nav="explore"]').click()
    page.locator('[data-nav="missions"]').last.click()
    page.locator('[data-act="open-mission"]').first.click()
    page.locator('[data-act="finish-mission"]').first.click()
    assert page.locator('#activityForm').count()==1
    assert roster['antonella']['state']['xp']==before_xp
    page.locator('#activitySkill').select_option('rhythm')
    page.locator('#activityDetail').fill('Testei um silencio e comparei o ritmo das cenas com meu colega.')
    page.locator('#activityForm button[type="submit"]').click()
    page.wait_for_timeout(1100)
    assert roster['antonella']['state']['xp']>before_xp

    assert roster['antonella']['state']['journey']['counts']['caption'] == 1
    assert len(roster['antonella']['state']['journey']['unlocked']) >= 1
    # Registros repetidos iguais nao devem pontuar ou duplicar.
    page.locator('#activitySkill').select_option('caption')
    page.locator('#activityDetail').fill('Revisei cada linha de legenda e sincronizei as falas.')
    page.locator('#activityForm button[type="submit"]').click()
    assert len(roster['antonella']['state']['journey']['entries']) == 5
    page.locator('.sidebar .nav-link[data-nav="home"]' if not mobile else '.mobile-nav [data-nav="home"]').click()
    page.locator('#content h1').first.wait_for();page.wait_for_timeout(500)

    assert 'Boa! Quero ver sua abertura.' in page.locator('#content').inner_text()
    assert page.locator('.home-personal-plan .plan-item').count()>0
    page.screenshot(path=str(OUT/('home-mobile.png' if mobile else 'home-desktop.png')),full_page=True)
    if mobile:
        overflow=page.evaluate('document.documentElement.scrollWidth - window.innerWidth')
        assert overflow<6, 'mobile overflow '+str(overflow)
    # Click project, use value patch and confirm cloud save
    page.locator('.mobile-nav [data-nav="project"]' if mobile else '.sidebar [data-nav="project"]').click();page.locator('#filmTitle').fill('Neymar de outro jeito');page.locator('#filmLogline').fill('As jogadas que ninguém acreditava que iam funcionar');page.wait_for_timeout(1200)
    assert roster['antonella']['state']['project']['title']=='Neymar de outro jeito','PATCH to remote missing'
    # roundtrip reload
    page.close();page=context.new_page();page.set_default_timeout(4000);page.on('pageerror',lambda ex:issues.append(str(ex)));mount(page);page.locator('[data-act="enter-profile"][data-id="antonella"]').click();page.locator('.mobile-nav [data-nav="project"]' if mobile else '.sidebar [data-nav="project"]').click()
    assert page.locator('#filmTitle').input_value()=='Neymar de outro jeito'
    page.locator('.sidebar [data-nav="journey"]' if not mobile else '.mobile-nav [data-nav="journey"]').click()
    assert page.locator('.log-record').count() == 5
    assert page.locator('.journey-achievement.achieved').count() >= 2

    # mentor memory
    page.locator('.mobile-nav [data-nav="mentor"]' if mobile else '.sidebar [data-nav="mentor"]').click();page.locator('#mentorInput').fill('Meu edit do Neymar está muito parado. O que eu corto?');page.locator('#chatForm').locator('button[type="submit"]').click();page.wait_for_timeout(200)
    text=page.locator('#chatMessages').inner_text();assert 'TESTA NO SEU V' in text,text[:550]
    page.locator('#mentorInput').fill('Tentei e não deu');page.locator('#chatForm').locator('button[type="submit"]').click();page.wait_for_timeout(200)
    assert 'por outro caminho' in page.locator('#chatMessages').inner_text()
    # Student-like open-ended questions: humor has to be actionable and genre-aware.
    page.locator('#mentorInput').fill('Como deixar mais engraçado meu gameplay?')
    page.locator('#chatForm button[type="submit"]').click()
    msg=page.locator('#chatMessages').inner_text()
    assert 'Para seu gameplay:' in msg, msg[-1000:]
    assert 'Split' in msg and 'surpresa' in msg, msg[-1000:]
    page.locator('#mentorInput').fill('Me dá outro jeito')
    page.locator('#chatForm button[type="submit"]').click()
    assert 'OUTRA EXPERI' in page.locator('#chatMessages').inner_text()
    page.locator('#mentorInput').fill('Como baixar do YouTube no VidsSave?')
    page.locator('#chatForm button[type="submit"]').click()
    assert 'VidsSave' in page.locator('#chatMessages').inner_text()
    page.locator('#mentorInput').fill('Como deixar um talk show mais engraçado?')
    page.locator('#chatForm button[type="submit"]').click()
    assert 'Para seu talk show:' in page.locator('#chatMessages').inner_text()
    page.locator('#mentorInput').fill('Quero que meu trailer de anime seja mais emocionante')
    page.locator('#chatForm button[type="submit"]').click()
    assert 'Como fazer o p' in page.locator('#chatMessages').inner_text() or 'Emo' in page.locator('#chatMessages').inner_text()
    page.screenshot(path=str(OUT/('mentor-mobile.png' if mobile else 'mentor-desktop.png')),full_page=True)
    # Guide details
    page.locator('.mobile-nav [data-nav="explore"]' if mobile else '.sidebar [data-nav="explore"]').click();page.locator('[data-nav="library"]').last.click()
    page.locator('[data-act="open-guide"][data-id="youtube-download"]').first.click()
    assert 'PASSO A PASSO' in page.locator('#modalBody').inner_text()
    assert page.locator('.guide-steps li').count()>=8
    assert 'VidsSave' in page.locator('#modalBody').inner_text()
    assert 'SE DER RUIM' in page.locator('#modalBody').inner_text();assert 'vidssave.com/pt/home' in page.locator('#modalBody').inner_text()
    page.screenshot(path=str(OUT/('guide-mobile.png' if mobile else 'guide-desktop.png')),full_page=True)
    assert not issues,issues
    print('PASS STUDENT', 'mobile' if mobile else 'desktop', '8 profiles','onboarding retroativo','registro cumulativo','cloud roundtrip','mentor','youtube guide')
    context.close()

def test_teacher(browser):
    ctx=browser.new_context(viewport={'width':1440,'height':980});ctx.route('**/rest/v1/**',supa_mock);page=ctx.new_page();page.set_default_timeout(4000);issues=[];page.on('pageerror',lambda ex:issues.append(str(ex)))
    mount(page,teacher=True);page.locator('#secret').fill('wrong');page.locator('#loginForm button').click();page.wait_for_timeout(130);assert not page.locator('#dashboard').is_visible()
    page.locator('#secret').fill('TEST-TEACHER-CODE');page.locator('#loginForm button').click();page.locator('#students .student').first.wait_for()
    assert page.locator('.student').count()==8
    page.screenshot(path=str(OUT/'teacher-desktop.png'),full_page=True)
    page.locator('#addProfile').click();page.locator('#editName').fill('Aluna Teste');page.locator('#editForm button[type="submit"]').click();page.locator('.student').nth(8).wait_for()
    assert any(x['name']=='Aluna Teste' for x in roster.values())
    # New teacher-created profiles must appear in the student's name picker without a redeploy.
    student_page=ctx.new_page();mount(student_page)
    student_page.locator('[data-act="enter-profile"][data-id="aluna-teste"]').wait_for()
    student_page.close()
    page.locator('[data-edit="antonella"]').click();page.locator('#editMessage').fill('Seu corte ficou ótimo');page.locator('#editNote').fill('Verificar volume');page.locator('#editForm button[type="submit"]').click();page.wait_for_timeout(250)
    assert roster['antonella']['teacher_message']=='Seu corte ficou ótimo';assert notes['antonella']=='Verificar volume'
    page.locator('[data-review="antonella"]').click()
    page.locator('#grade-narrative').select_option('4');page.locator('#grade-editing').select_option('5');page.locator('#grade-sound').select_option('3');page.locator('#grade-creativity').select_option('5');page.locator('#grade-finish').select_option('4')
    page.locator('#reviewAward').select_option('Maior evolução');page.locator('#reviewVerified').check();page.locator('#reviewForm button[type="submit"]').click()
    assert roster['antonella']['review']['award']=='Maior evolução'
    assert roster['antonella']['review']['verified'] is True
    assert not issues,issues
    print('PASS TEACHER login denied, login works, roster, create, update')
    ctx.close()

if __name__=="__main__":
 with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    test_page(browser,False);test_page(browser,True);test_teacher(browser)
    browser.close()
