"""Persistent source-only discovery; fetched upstream code is never executed."""
import pathlib,json,subprocess,hashlib,datetime,concurrent.futures,urllib.request,urllib.parse,re
ROOT=pathlib.Path.cwd();CACHE=ROOT/'tmp/template-collections';CACHE.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'catalog/template-research/collection-sources.json'
REPOS=['mmrahmanbappi/100-free-html-templates','debgotwired/clean-and-personal','shellcat-com/formwork','micah-masuka/free-website-templates','Novpix/free-html-templates','ColorlibHQ/bootstrap-templates','uiuxlabz/uiuxlabz','dawidolko/Website-Templates']
def api(endpoint):
 r=subprocess.run(['gh','api',endpoint],capture_output=True,text=True,encoding='utf-8');
 if r.returncode:raise RuntimeError(r.stderr[:300])
 return json.loads(r.stdout)
def save(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
if '--owners' in __import__('sys').argv:
 for owner in ['uiuxlabz','shellcat-com','Novpix','mmrahmanbappi']:
  rows=[]
  for page in range(1,8):
   d=api(f'users/{owner}/repos?per_page=100&page={page}');rows+=d
   if len(d)<100:break
  save(CACHE/(owner+'-repos.json'),rows)
  REPOS += [r['full_name'] for r in rows if not r['fork'] and not r['archived'] and r.get('size',0)>0]
REPOS=list(dict.fromkeys(REPOS));previous={x['repository'].lower():x for x in json.loads(OUT.read_text())} if OUT.exists() else {}
def one(repo):
 key=repo.replace('/','--');metaPath=CACHE/(key+'-meta.json');treePath=CACHE/(key+'-tree.json')
 if not metaPath.exists():save(metaPath,api('repos/'+repo))
 meta=json.loads(metaPath.read_text());assert not meta['private'];branch=meta['default_branch']
 commitPath=CACHE/(key+'-commit.json')
 if not commitPath.exists():save(commitPath,api('repos/'+repo+'/commits/'+branch))
 sha=json.loads(commitPath.read_text())['sha']
 if not treePath.exists():save(treePath,api(f'repos/{repo}/git/trees/{sha}?recursive=1'))
 tree=json.loads(treePath.read_text());files=[f for f in tree['tree'] if f['type']=='blob'];paths=[f['path'] for f in files]
 licensePaths=[p for p in paths if re.search(r'(?:^|/)(?:LICENSE(?:\.md|\.txt)?|COPYING|CREDITS(?:\.txt|\.md)?)$',p,re.I)]
 html=[p for p in paths if p.lower().endswith('.html') and not re.search(r'(?:node_modules|vendor|bootstrap|_kit|\.github|guide)/',p,re.I)]
 evidence=[]
 for file in [p for p in licensePaths if '/' not in p]+[p for p in paths if re.fullmatch(r'README(?:\.md|\.txt)?',p,re.I)][:1]:
  dest=CACHE/key/file;dest.parent.mkdir(parents=True,exist_ok=True)
  if not dest.exists():
   url=f'https://raw.githubusercontent.com/{repo}/{sha}/'+urllib.parse.quote(file,safe='/');dest.write_bytes(urllib.request.urlopen(url,timeout=25).read())
  b=dest.read_bytes();s=b.decode('utf-8-sig',errors='replace')
  if file in licensePaths:evidence.append({'path':file,'url':f'https://github.com/{repo}/blob/{sha}/'+urllib.parse.quote(file,safe='/'),'sha256':hashlib.sha256(b).hexdigest(),'mitGrant':bool(re.search('Permission is hereby granted',s,re.I) and re.search(r'sell\s+copies|and/or sell',s,re.I)),'restrictions':bool(re.search(r'Commons Clause|non.?commercial|may not (?:sell|resell|redistribute)|not allowed to (?:sell|resell|redistribute)',s,re.I))})
 record={'repository':meta['full_name'],'url':meta['html_url'],'website':meta.get('homepage'),'revision':sha,'public':True,'treeTruncated':tree.get('truncated',False),'rootLicenseEvidence':evidence,'licensePaths':licensePaths,'htmlFiles':html,'files':len(files),'status':'DISCOVERED; per-template scope/assets/dependencies not approved','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 save(CACHE/(key+'-summary.json'),record);return record
results=list(previous.values())
for offset in range(0,len(REPOS),6):
 batch=REPOS[offset:offset+6]
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  futures={pool.submit(one,r):r for r in batch}
  for f in concurrent.futures.as_completed(futures):
   repo=futures[f]
   try:
    x=f.result();previous[x['repository'].lower()]=x;print(x['repository'],len(x['htmlFiles']),'HTML files, root licenses',len(x['rootLicenseEvidence']),flush=True)
   except Exception as e:previous[repo.lower()]={'repository':repo,'status':'BLOCKED_ACCESS','reason':str(e)};print('HELD',repo,str(e)[:160],flush=True)
 save(OUT,list(previous.values()))
print('Saved',len(previous),'source records')
