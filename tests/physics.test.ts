import {describe,it,expect} from 'vitest';
import {G,projectile,trajectory,optimalAngle,dragTrajectory} from '../src/lib/physics';
describe('無抵抗の解析解と境界条件',()=>{
 it('20 m/s・45°・同じ高さの既知解',()=>{const r=projectile({speed:20,angle:45,height:0});expect(r.range).toBeCloseTo(400/9.81,10);expect(r.time).toBeCloseTo(20*Math.SQRT2/G,10);expect(r.peak).toBeCloseTo(100/G,10);});
 it('高さがある水平発射は自由落下時間と一致',()=>{const r=projectile({speed:10,angle:0,height:1.5});expect(r.time).toBeCloseTo(Math.sqrt(3/G),12);expect(r.range).toBeCloseTo(10*Math.sqrt(3/G),12);expect(r.peak).toBe(1.5);});
 it('真上発射の水平距離は厳密に0',()=>{expect(projectile({speed:25,angle:90,height:0}).range).toBe(0);});
 it('地面で静止・水平発射は即着地',()=>{expect(projectile({speed:0,angle:45,height:0}).time).toBe(0);expect(projectile({speed:25,angle:0,height:0}).range).toBe(0);});
 it('初速度0なら高さから自由落下',()=>{const a=projectile({speed:0,angle:45,height:2});expect(a.range).toBe(0);expect(a.time).toBeCloseTo(Math.sqrt(4/G),12);});
 it('30°と60°の飛距離は等しく最高点は異なる',()=>{const a=projectile({speed:25,angle:30,height:0}),b=projectile({speed:25,angle:60,height:0});expect(a.range).toBeCloseTo(b.range,10);expect(b.peak/a.peak).toBeCloseTo(3,10);});
 it('同じ高さの飛距離は速度の二乗に比例',()=>{const a=projectile({speed:20,angle:35,height:0}),b=projectile({speed:24,angle:35,height:0});expect(b.range/a.range).toBeCloseTo(1.44,12);});
 for(const height of [0,0.1,1,2]) for(const speed of [1,10,25,40]) for(const angle of [0,10,40,89,90]){
  it(`着地・エネルギー整合 ${speed}/${angle}/${height}`,()=>{
   const p={speed,angle,height},r=projectile(p),points=trajectory(p);
   const y=height+r.vy*r.time-G*r.time*r.time/2;
   expect(y).toBeCloseTo(0,9);expect(points.at(-1)!.x).toBeCloseTo(r.range,10);expect(points.at(-1)!.y).toBe(0);
   expect(r.vx*r.vx+(r.vy-G*r.time)**2).toBeCloseTo(speed*speed+2*G*height,8);
   expect(points.every(q=>Number.isFinite(q.x)&&q.y>=0)).toBe(true);
  });
 }
 it('高さを含む最適角は近傍より遠い',()=>{for(const h of [0,0.5,1,2]){const angle=optimalAngle(25,h),r=projectile({speed:25,angle,height:h}).range;for(const offset of [-1,-0.01,0.01,1])expect(r).toBeGreaterThan(projectile({speed:25,angle:angle+offset,height:h}).range);}expect(optimalAngle(25,1)).toBeLessThan(45);});
 it('不正値を受理しない',()=>{for(const p of [{speed:NaN,angle:40,height:0},{speed:-1,angle:40,height:0},{speed:25,angle:91,height:0},{speed:25,angle:40,height:-1},{speed:Infinity,angle:40,height:0}])expect(()=>projectile(p)).toThrow(RangeError);});
});
describe('抗力の教育用RK4計算',()=>{
 const p={speed:25,angle:40,height:0};
 it('係数0で解析解に戻る（着地線形補間の誤差を含む）',()=>{const d=dragTrajectory(p,0.001,0),a=projectile(p);expect(Math.abs(d.at(-1)!.x-a.range)).toBeLessThan(0.00001);expect(Math.abs(d.at(-1)!.t-a.time)).toBeLessThan(0.000001);});
 it('刻み半減による飛距離・時間の変化は許容内',()=>{const a=dragTrajectory(p,0.002),b=dragTrajectory(p,0.001);expect(Math.abs(a.at(-1)!.x-b.at(-1)!.x)).toBeLessThan(0.0001);expect(Math.abs(a.at(-1)!.t-b.at(-1)!.t)).toBeLessThan(0.00001);});
 it('例題の正の抗力で飛距離は小さくなり着地で止まる',()=>{const d=dragTrajectory(p);expect(d.at(-1)!.x).toBeLessThan(projectile(p).range);expect(d.at(-1)!.y).toBe(0);expect(d.every(q=>q.y>=0)).toBe(true);});
});
