/** Package the root-path static build as one self-contained review file. */
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist'),assets=path.join(root,'_astro');
const pages={};
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(p.endsWith('.html')){const rel=path.relative(root,p).replaceAll(path.sep,'/');pages['/'+rel.replace(/index\.html$/,'')]=fs.readFileSync(p,'utf8');}}}walk(root);
const cssName=fs.readdirSync(assets).find(f=>f.endsWith('.css'));
let css=fs.readFileSync(path.join(assets,cssName),'utf8');
css=css.replace(/url\(([^)]+)\)/g,(all,value)=>{const filename=value.replaceAll(/['"]/g,'').split('/').pop();const p=path.join(assets,filename);if(!fs.existsSync(p))return all;const ext=path.extname(filename).slice(1);return `url(data:font/${ext};base64,${fs.readFileSync(p).toString('base64')})`;});
const modules={};
const plotlySrc='data:application/javascript;base64,'+fs.readFileSync('node_modules/plotly.js-basic-dist-min/plotly-basic.min.js').toString('base64');
for(const filename of fs.readdirSync(assets).filter(f=>f.endsWith('.js')&&!f.startsWith('plotly-'))){let code=fs.readFileSync(path.join(assets,filename),'utf8');code=code.replace(/import\(`\.\/([^`]+)`\)/g,()=>`Promise.resolve({default:window.Plotly})`);modules[filename]='data:text/javascript;base64,'+Buffer.from(code).toString('base64');}
const data=JSON.stringify({pages,css,modules,plotlySrc}).replaceAll('<','\\u003c');
const script=`const {pages,css,modules,plotlySrc}=${data};
const frame=document.querySelector('iframe');
function show(){let requested=decodeURIComponent(location.hash.slice(1)||'/');const [route,anchor]=requested.split('#');let html=pages[route]||pages['/404.html'];html=html.replace(/<link[^>]*rel="stylesheet"[^>]*>/g,()=>'<style>'+css+'</style>').replace(/<link[^>]*rel="icon"[^>]*>/g,'');if(html.includes('/_astro/Simulator'))html=html.replace('</head>','<script src="'+plotlySrc+'"></script></head>');html=html.replace(/src="\\/_astro\\/([^" ]+\\.js)"/g,(all,file)=>'src="'+modules[file]+'"');frame.onload=()=>{const doc=frame.contentDocument;document.title=doc.title;doc.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(href.startsWith('#')){e.preventDefault();doc.getElementById(href.slice(1))?.scrollIntoView();}else if(href.startsWith('/')){e.preventDefault();location.hash=encodeURIComponent(href);}else if(href.startsWith('http')){a.target='_blank';a.rel='noopener';}});if(anchor)doc.getElementById(anchor)?.scrollIntoView();};frame.srcdoc=html;}
addEventListener('hashchange',show);show();`;
fs.writeFileSync('long-kick-preview.html','<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ロングキックを科学する</title><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><iframe title="ロングキックを科学する サイトプレビュー"></iframe><script>'+script.replaceAll('</script','<\\/script')+'</script></body></html>');
console.log('long-kick-preview.html: '+Object.keys(pages).length+' routes, embedded styles/fonts/Plotly, no external publication.');
