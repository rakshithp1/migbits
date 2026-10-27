"""Cache public reference artwork for the pinned free export; no font files or site scripts."""
import concurrent.futures, hashlib, json, re, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'catalog/motionsites-import-inventory.json'
MEDIA=ROOT/'resources/motionsites-imports/media'
LIMIT=23*1024*1024

def download(url):
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!='https' or parsed.username or parsed.password:
        return {'url':url,'status':'held','reason':'Not a plain HTTPS reference'}
    name=hashlib.sha256(url.encode()).hexdigest()[:24]
    cached=next(iter(MEDIA.glob(name+'.*')),None)
    if cached:
        data=cached.read_bytes();return {'url':url,'status':'cached','file':str(cached.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'kind':'video' if cached.suffix=='.mp4' else 'image'}
    try:
        request=urllib.request.Request(url,headers={'User-Agent':'MigBits-authorized-import/1.0'})
        with urllib.request.urlopen(request,timeout=40) as response:
            mime=response.headers.get('Content-Type','').split(';')[0]
            if int(response.headers.get('Content-Length','0'))>LIMIT:raise ValueError('Reference exceeds per-file delivery limit')
            if mime not in ['image/jpeg','image/png','image/webp','image/avif','video/mp4']:raise ValueError('Unsupported reference MIME '+mime)
            data=response.read(LIMIT+1)
            if len(data)>LIMIT:raise ValueError('Reference exceeds per-file delivery limit')
        ext={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/avif':'.avif','video/mp4':'.mp4'}[mime]
        file=MEDIA/(name+ext);file.write_bytes(data)
        return {'url':url,'status':'cached','file':str(file.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'kind':'video' if mime=='video/mp4' else 'image'}
    except Exception as error:return {'url':url,'status':'held','reason':str(error)[:200]}

if __name__=='__main__':
    MEDIA.mkdir(parents=True,exist_ok=True)
    manifest=json.loads(MANIFEST.read_text(encoding='utf-8'));urls=set()
    for record in manifest['records']:
        text=(ROOT/record['localPath']).read_text(encoding='utf-8')
        candidates=[u.rstrip('.,;') for u in re.findall(r'https://[^\s<>"\'`\)\]\}]+',text)]
        videos=[u.rstrip('.,;') for u in candidates if re.search(r'\.mp4(?:\?|$)',u,re.I)]
        images=[u.rstrip('.,;') for u in candidates if re.search(r'\.(?:png|jpg|jpeg|webp|avif)(?:\?|$)|images\.higgs\.ai',u,re.I)]
        reference=record.get('referenceImageUrl')
        if reference and not re.match(r'https://motionsites\.ai/',reference):images.insert(0,reference)
        record['referenceCandidates']={'image':list(dict.fromkeys(images))[:1],'video':list(dict.fromkeys(videos))[:1]}
        urls.update(record['referenceCandidates']['image']+record['referenceCandidates']['video'])
    outcomes={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        for outcome in executor.map(download,sorted(urls)):
            outcomes[outcome['url']]=outcome
    for record in manifest['records']:
        record['media']=[outcomes[url] for urls in record['referenceCandidates'].values() for url in urls]
        record['status']='media-cached' if any(m['status']=='cached' for m in record['media']) else 'source-imported-reference-held'
    manifest['mediaSummary']={'uniqueReferences':len(outcomes),'cached':sum(m['status']=='cached' for m in outcomes.values()),'held':sum(m['status']=='held' for m in outcomes.values()),'bytes':sum(m.get('bytes',0) for m in outcomes.values())}
    MANIFEST.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps(manifest['mediaSummary']))
