import {describe,it,expect} from 'vitest';
import {BALL,shellImpact,spinParameter,airForces,spinTrajectory,flightComparison,type Vec3} from '../src/lib/spin';
import {projectile,dragTrajectory,G} from '../src/lib/physics';
const launch={speed:25,angle:40,height:0};
const air={cd:0.25,cl:0.2,axis:[0,0,1] as Vec3};
const dot=(a:Vec3,b:Vec3)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
describe('角力積・スピンパラメータ',()=>{
 it('独立に計算した1 cmの腕の例',()=>{const s=shellImpact(8.6,0.01);expect(s.inertia).toBeCloseTo(0.003468666666666667,12);expect(s.speed).toBe(20);expect(s.omega).toBeCloseTo(24.793388429752063,10);expect(s.rps).toBeCloseTo(3.945990324592446,10);expect(s.translation).toBe(86);expect(s.rotation).toBeCloseTo(1.0661157024793386,10);});
 it('中心を通る力積は回転0、同じ力積で腕2倍なら回転エネルギー4倍',()=>{expect(shellImpact(8.6,0).omega).toBe(0);expect(shellImpact(8.6,.02).rotation/shellImpact(8.6,.01).rotation).toBeCloseTo(4,12);});
 it('5回/s・25 m/sの無次元数',()=>expect(spinParameter(5,25)).toBeCloseTo(0.13823007675795088,12));
 it('非物理的な入力を拒否',()=>{expect(()=>shellImpact(1,.12)).toThrow(RangeError);expect(()=>shellImpact(-1,0)).toThrow(RangeError);expect(()=>spinParameter(1,0)).toThrow(RangeError);});
});
describe('空気力の大きさ・方向・仕事率',()=>{
 it('25 m/sの水平飛行の力と加速度',()=>{const f=airForces([25,0,0],air);expect(f.drag[0]).toBeCloseTo(-3.563744166415922,10);expect(f.lift[1]).toBeCloseTo(2.850995333132738,10);expect(f.lift[1]/BALL.mass-G).toBeCloseTo(-3.179778295040146,9);});
 for(const v of [[19,7,2],[-5,3,8],[0,-20,2]] as Vec3[])it(`3次元で揚力が相対速度に垂直、抗力の仕事率が非正 ${v}`,()=>{const f=airForces(v,{...air,axis:[1,2,3],wind:[2,0,-1]});expect(dot(f.lift,f.u)).toBeCloseTo(0,10);expect(dot(f.drag,f.u)).toBeLessThanOrEqual(0);});
 it('軸の反転と大きさの変更',()=>{const a=airForces([20,5,0],air),b=airForces([20,5,0],{...air,axis:[0,0,-7]});a.lift.forEach((v,i)=>expect(b.lift[i]).toBeCloseTo(-v,12));expect(b.drag).toEqual(a.drag);});
 it('無相対速度・軸0・平行軸でもNaNを生じない',()=>{const a=airForces([2,3,4],{...air,wind:[2,3,4]});expect(a.drag.every(v=>v===0)).toBe(true);expect(a.lift.every(v=>v===0)).toBe(true);expect(airForces([1,0,0],{...air,axis:[1,0,0]}).lift.every(v=>v===0)).toBe(true);expect(airForces([1,0,0],{...air,axis:[0,0,0]}).lift.every(v=>v===0)).toBe(true);});
 it('風は相対速度を通じて力へ反映',()=>{expect(airForces([25,0,0],{...air,wind:[5,0,0]}).drag).toEqual(airForces([20,0,0],air).drag);});
});
describe('回転飛行モデルの独立検証',()=>{
 it('空気力0が放物運動の解析解へ戻る',()=>{const points=spinTrajectory(launch,{...air,cd:0,cl:0}),p=points.at(-1)!,r=projectile(launch);expect(p.x).toBeCloseTo(r.range,5);expect(p.t).toBeCloseTo(r.time,5);for(const q of points.slice(0,-1)){expect(q.x).toBeCloseTo(r.vx*q.t,9);expect(q.y).toBeCloseTo(r.vy*q.t-G*q.t**2/2,9);expect(q.z).toBe(0);}});
 it('揚力0は既存の二次元抗力計算と一致',()=>{const a=spinTrajectory(launch,{...air,cl:0}),b=dragTrajectory(launch);expect(a.at(-1)!.x).toBeCloseTo(b.at(-1)!.x,10);expect(a.at(-1)!.t).toBeCloseTo(b.at(-1)!.t,10);});
 it('無抗力の揚力は並進の力学的エネルギーを保存',()=>{const p=spinTrajectory(launch,{...air,cd:0});const energy=(q:typeof p[number])=>BALL.mass*((q.vx**2+q.vy**2+q.vz**2)/2+G*q.y);const e=energy(p[0]);for(const q of p.slice(0,-1))expect(energy(q)).toBeCloseTo(e,7);expect(Math.abs(energy(p.at(-1)!)-e)).toBeLessThan(0.0001);});
 it('無風で抗力ありの力学的エネルギーは増加しない',()=>{const p=spinTrajectory(launch,air);const energy=(q:typeof p[number])=>(q.vx**2+q.vy**2+q.vz**2)/2+G*q.y;for(let i=1;i<p.length;i++)expect(energy(p[i])-energy(p[i-1])).toBeLessThanOrEqual(1e-8);});
 it('鉛直軸の左右対称性と三次元の横曲がり',()=>{const a=spinTrajectory(launch,{...air,axis:[0,1,0]}).at(-1)!,b=spinTrajectory(launch,{...air,axis:[0,-1,0]}).at(-1)!;expect(Math.abs(a.z)).toBeGreaterThan(1);expect(a.x).toBeCloseTo(b.x,10);expect(a.t).toBeCloseTo(b.t,10);expect(a.z).toBeCloseTo(-b.z,10);});
 it('記事の全比較で刻み半減により表示値が安定',()=>{const a=flightComparison(.002),b=flightComparison(.001);a.forEach((v,i)=>{expect(Math.abs(v.range-b[i].range)).toBeLessThan(1e-4);expect(Math.abs(v.time-b[i].time)).toBeLessThan(1e-5);expect(Math.abs(v.peak-b[i].peak)).toBeLessThan(1e-4);expect(v.range.toFixed(2)).toBe(b[i].range.toFixed(2));expect(v.time.toFixed(2)).toBe(b[i].time.toFixed(2));expect(v.peak.toFixed(2)).toBe(b[i].peak.toFixed(2));});});
 it('大きい揚力係数でも初速度低下で距離が逆転する比較',()=>{const [,b,,d]=flightComparison();expect(d.cl).toBeGreaterThan(b.cl);expect(d.range).toBeLessThan(b.range);});
 it('初期着地・不正な刻みと係数',()=>{expect(spinTrajectory({speed:0,angle:0,height:0},air)).toHaveLength(1);expect(()=>spinTrajectory(launch,air,0)).toThrow(RangeError);expect(()=>spinTrajectory(launch,{...air,cl:NaN})).toThrow(RangeError);expect(()=>airForces([Infinity,0,0],air)).toThrow(RangeError);});
});
