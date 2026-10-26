"""Explicit read-only, pinned snapshots. Never executes downloaded hooks or install scripts."""
import concurrent.futures, hashlib, json, pathlib, subprocess, urllib.request

ROOT = pathlib.Path.cwd()
CACHE = ROOT / 'tmp/motion-layers-nexus'
OUT = ROOT / 'resources/partner-imports'
REPOS = ['motiondivision/motion', 'textura-agency/next16-claude-starter', 'textura-agency/ai-design-vault', 'motiondivision/ai-kit']

def api(endpoint):
    p = subprocess.run(['gh', 'api', endpoint], capture_output=True, text=True, encoding='utf-8')
    if p.returncode: raise RuntimeError(p.stderr[:500])
    return json.loads(p.stdout)

def digest(data): return hashlib.sha256(data).hexdigest()

for repo in REPOS:
    key = repo.replace('/', '--')
    destination = OUT / key
    if (destination / 'snapshot.json').exists():
        print('Retaining pinned snapshot', repo, flush=True)
        continue
    meta = api('repos/' + repo)
    revision = api('repos/' + repo + '/commits/' + meta['default_branch'])['sha']
    tree = api(f'repos/{repo}/git/trees/{revision}?recursive=1')
    if tree.get('truncated'): raise RuntimeError('Truncated tree: ' + repo)
    all_files = [x['path'] for x in tree['tree'] if x['type'] == 'blob']
    if repo == 'motiondivision/motion':
        selected = [p for p in all_files if p.startswith('dev/react/src/examples/') and p.endswith(('.tsx', '.ts', '.css')) or p in ['LICENSE.md', 'README.md', 'packages/motion/package.json']]
    else:
        selected = [p for p in all_files if not p.startswith('public/') and (pathlib.PurePosixPath(p).suffix in ['.md', '.json', '.ts', '.tsx', '.js', '.mjs', '.css', '.sh', '.tmpl', '.txt', '.yml', '.yaml', '.lock'] or p in ['LICENSE', 'COPYING', '.cursorrules', '.gitignore', '.nvmrc', '.env.example'])]
    def fetch(file):
        if '..' in pathlib.PurePosixPath(file).parts: raise RuntimeError('Unsafe path')
        cached = CACHE / key / file
        cached.parent.mkdir(parents=True, exist_ok=True)
        # Cache is keyed by exact revision, avoiding a moving HEAD.
        cached = CACHE / 'pinned' / revision / file
        cached.parent.mkdir(parents=True, exist_ok=True)
        if not cached.exists():
            url = f'https://raw.githubusercontent.com/{repo}/{revision}/{file}'
            cached.write_bytes(urllib.request.urlopen(url, timeout=45).read())
        return file, cached.read_text(encoding='utf-8')
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        files = dict(pool.map(fetch, selected))
    license_text = files.get('LICENSE.md', files.get('LICENSE', ''))
    if not ('Permission is hereby granted' in license_text and 'and/or sell' in license_text or 'free and unencumbered software released into the public domain' in license_text):
        holds_path = ROOT / 'catalog/partner-imports/source-holds.json'
        holds_path.parent.mkdir(parents=True, exist_ok=True)
        holds = json.loads(holds_path.read_text()) if holds_path.exists() else []
        holds = [h for h in holds if h['repository'] != repo]
        holds.append({'repository': repo, 'revision': revision, 'status': 'UNVERIFIED', 'reason': 'No actual primary LICENSE grant found in the pinned tree. Website MIT label alone does not approve redistribution.', 'treeEvidence': f'https://github.com/{repo}/tree/{revision}'})
        holds_path.write_text(json.dumps(holds, indent=2) + '\n')
        print('Held without importing:', repo, flush=True)
        continue
    destination.mkdir(parents=True, exist_ok=True)
    # Upstream AGENTS.md, skills and hooks are inert JSON strings, not active project instructions.
    payload = json.dumps(files, ensure_ascii=False, indent=2) + '\n'
    (destination / 'source-files.json').write_text(payload, encoding='utf-8', newline='\n')
    license_file = 'LICENSE.md' if 'LICENSE.md' in files else 'LICENSE'
    manifest = {'repository': repo, 'revision': revision, 'license': 'MIT' if 'Permission is hereby granted' in license_text else 'Unlicense', 'licenseFile': license_file, 'licenseEvidence': f'https://github.com/{repo}/blob/{revision}/{license_file}', 'sourceArchiveSha256': digest(payload.encode()), 'checksums': {p: digest(t.encode()) for p, t in files.items()}, 'excludedFiles': [p for p in all_files if p not in selected], 'status': 'LICENSE_VERIFIED; item/dependency/runtime review required', 'execution': 'No upstream script, hook, instruction file or build tool has been executed or installed.'}
    (destination / 'snapshot.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(repo, revision, len(files), 'text source files; binaries omitted', flush=True)
