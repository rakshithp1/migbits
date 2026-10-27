"""Pinned publisher export only; never executes upstream scripts or uses private website APIs."""
import base64, concurrent.futures, hashlib, json, re, subprocess, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVISION = 'faa30d512e3973e58675c72101a7ef42ed37ae83'
REPOSITORY = 'Motionsites-AI/claude-skill'
PREFIX = 'plugins/motionsites-web-builder/skills/motionsites-web-builder/examples/'
DEST = ROOT / 'resources/motionsites-imports/original'
MANIFEST = ROOT / 'catalog/motionsites-import-inventory.json'

def api(endpoint):
    result = subprocess.run(['gh', 'api', endpoint], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(result.stdout)

def git_hash(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

def snapshot(entry):
    relative = entry['path'][len(PREFIX):] if entry['path'].startswith(PREFIX) else entry['path']
    target = DEST / ('examples/' + relative if entry['path'].startswith(PREFIX) else relative)
    if target.exists() and git_hash(target.read_bytes()) == entry['sha']:
        data = target.read_bytes()
    else:
        request = urllib.request.Request(f'https://raw.githubusercontent.com/{REPOSITORY}/{REVISION}/{entry["path"]}', headers={'User-Agent': 'MigBits-source-review/1.0'})
        data = urllib.request.urlopen(request, timeout=45).read()
        if git_hash(data) != entry['sha']:
            raise ValueError('Upstream blob mismatch: ' + entry['path'])
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    return {'path': entry['path'], 'localPath': str(target.relative_to(ROOT)).replace('\\', '/'), 'gitBlob': entry['sha'], 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

if __name__ == '__main__':
    tree = api(f'repos/{REPOSITORY}/git/trees/{REVISION}?recursive=1')
    if tree.get('truncated'):
        raise ValueError('Repository inventory incomplete')
    selected = [e for e in tree['tree'] if e['type'] == 'blob' and (e['path'].startswith(PREFIX) or e['path'] in ['LICENSE', 'README.md'])]
    files = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        for item in executor.map(snapshot, selected):
            files.append(item)
    records = []
    for item in files:
        if not item['path'].startswith(PREFIX) or item['path'].endswith('/INDEX.md'):
            continue
        text = (ROOT / item['localPath']).read_text(encoding='utf-8')
        header = re.search(r'<!--\s*(.*?)\s*[\u00b7]\s*(.*?)\s*[\u00b7]\s*.*?free MotionSites prompt\s*-->', text)
        source = re.search(r'Source:\s*(https://[^\s]+)', text)
        preview = re.search(r'<!-- Preview:\s*(https://[^\s]+)', text)
        slug = Path(item['path']).stem
        records.append({**item, 'id': 'motionsites-' + slug, 'slug': slug, 'title': header.group(1) if header else slug, 'upstreamCategory': header.group(2) if header else 'Design prompt', 'sourceUrl': source.group(1) if source else f'https://github.com/{REPOSITORY}/blob/{REVISION}/{item["path"]}', 'referenceImageUrl': preview.group(1) if preview else None, 'status': 'source-imported', 'license': 'LicenseRef-MotionSites-Distribution', 'freeEvidence': 'Publisher repository free-example header and INDEX.md', 'codeFences': len(re.findall(r'^```', text, re.M)) // 2, 'implementationStatus': 'Prompt and source excerpts; full application compilation not verified'})
    result = {'repository': REPOSITORY, 'revision': REVISION, 'snapshotFiles': files, 'records': records, 'coverage': 'All 40 prompts in the pinned publisher free sample. Not all free designs currently visible on the live website.', 'distribution': 'Additional distribution authorization handled separately; upstream notices retained. Public repository MIT does not cover example prompts/media.'}
    MANIFEST.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'freePromptRecords': len(records), 'files': len(files), 'recordsWithCodeExcerpts': sum(r['codeFences'] > 0 for r in records)}))
