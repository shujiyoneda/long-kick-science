import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist');const base=(process.env.BASE_PATH||'/').replace(/\/$/,'');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]);}
const files=walk(root),pages=files.filter(p=>p.endsWith('.html'));const errors=[];
for(const file of pages){const html=fs.readFileSync(file,'utf8');if(html.includes('katex-error'))errors.push(`${file}: KaTeX error`);
 for(const [,raw]of html.matchAll(/(?:href|src)="([^"<>]+)"/g)){
  if(/^(https?:|data:|mailto:|tel:|javascript:|\/\/)/.test(raw))continue;
  const [pathname,hash]=raw.split('#');let target;
  if(!pathname)target=file;else if(pathname.startsWith('/')){if(base&&pathname!==base&&!pathname.startsWith(base+'/')){errors.push(`${file}: base prefix missing ${raw}`);continue;}target=path.join(root,decodeURIComponent(pathname.slice(base.length)));}else target=path.resolve(path.dirname(file),decodeURIComponent(pathname));
  target=target.split('?')[0];if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){errors.push(`${file}: missing ${raw}`);continue;}
  if(hash&&target.endsWith('.html')){const content=fs.readFileSync(target,'utf8');if(!content.includes(`id="${decodeURIComponent(hash)}"`))errors.push(`${file}: missing anchor ${raw}`);}
 }
}
const lessons=JSON.parse(fs.readFileSync('src/data/curriculum.json','utf8')).flatMap(c=>c.lessons);
const publishedIds=lessons.filter(l=>l.status==='published').map(l=>l.id);
const published=pages.filter(p=>publishedIds.some(id=>p.endsWith(`/learn/${id}/index.html`)));
if(pages.length!==38)errors.push(`Expected 38 pages, got ${pages.length}`);
if(published.length!==publishedIds.length)errors.push('Completed lesson count differs from curriculum');
for(const file of published){const html=fs.readFileSync(file,'utf8');if(!html.includes('data-status="published"')||html.includes('本文は未公開です'))errors.push(`${file}: completed body missing`);}
const planned=pages.filter(p=>p.includes('/learn/')&&!published.includes(p));
for(const file of planned)if(!fs.readFileSync(file,'utf8').includes('本文は未公開です'))errors.push(`${file}: publication state missing`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`${pages.length} pages: all local links, fragments, assets and publication states verified.`);
