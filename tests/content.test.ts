import {describe,it,expect} from 'vitest';import fs from 'node:fs';import katex from 'katex';
import {chapters,lessons,sectionIds} from '../src/data/curriculum';
describe('制作範囲・数式・記事の構造',()=>{
 it('8章24講座、本文公開3・未公開21',()=>{expect(chapters).toHaveLength(8);expect(lessons).toHaveLength(24);expect(lessons.filter(l=>l.status==='published').map(l=>l.id)).toEqual(['06-1','06-2','06-3']);expect(lessons.filter(l=>l.status==='planned')).toHaveLength(21);});
 it('全講座の学習目標と8セクションの個別アウトライン',()=>{for(const l of lessons){expect(l.goal.length).toBeGreaterThan(10);expect(l.outline).toHaveLength(8);expect(l.outline.every(s=>s.length>20)).toBe(true);}});
 for(const id of ['06-1','06-2','06-3'])it(`${id}の8セクションとKaTeX・注記`,()=>{const s=fs.readFileSync(`src/content/lessons/${id}.mdx`,'utf8');for(const name of sectionIds)expect(s).toContain(`id="${name}"`);expect((s.match(/<h2 /g)||[])).toHaveLength(8);const eq=[...s.matchAll(/<Equation tex=\{String.raw`([^`]+)`\} symbols="([^"]+)"/g)];expect(eq.length).toBeGreaterThan(4);for(const [,tex,symbols]of eq){expect(()=>katex.renderToString(tex,{throwOnError:true})).not.toThrow();expect(symbols).toMatch(/\[.+\]/);}expect(s).toContain('参考文献');expect(s).toContain('https://');});
});
