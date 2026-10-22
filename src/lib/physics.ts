/** SI units throughout; launch centre relative to effective landing plane y=0. */
export const G = 9.81;
export interface Launch { speed: number; angle: number; height: number; }
export interface Point { t: number; x: number; y: number; }
export function validateLaunch(p: Launch) {
  if (![p.speed,p.angle,p.height].every(Number.isFinite) || p.speed<0 || p.speed>60 || p.angle<0 || p.angle>90 || p.height<0 || p.height>10) throw new RangeError('モデルの入力範囲外です');
}
export function projectile(p: Launch) {
  validateLaunch(p);
  const theta = p.angle * Math.PI / 180;
  const vx = p.angle===90 ? 0 : p.speed * Math.cos(theta);
  const vy = p.angle===0 ? 0 : p.speed * Math.sin(theta);
  const time = (vy + Math.sqrt(vy*vy + 2*G*p.height))/G;
  const range = vx * time;
  const peak = p.height + vy*vy/(2*G);
  const apexTime = vy/G;
  return {vx,vy,time,range,peak,apexTime};
}
export function trajectory(p: Launch, intervals=120): Point[] {
  if (!Number.isInteger(intervals) || intervals<1) throw new RangeError('分割数は正の整数');
  const r=projectile(p);
  return Array.from({length:intervals+1},(_,i)=>{
    const t=r.time*i/intervals;
    return {t,x:r.vx*t,y:i===intervals?0:Math.max(0,p.height+r.vy*t-G*t*t/2)};
  });
}
export function optimalAngle(speed:number,height:number) {
  validateLaunch({speed,angle:45,height});
  return speed===0 ? 0 : Math.atan(speed/Math.sqrt(speed*speed+2*G*height))*180/Math.PI;
}
/** Educational, still-air, constant-Cd model. Not a fitted football predictor. */
export function dragTrajectory(p:Launch, dt=0.002, cd=0.25): Point[] {
  validateLaunch(p);
  if (!Number.isFinite(dt) || dt<=0 || dt>0.1 || !Number.isFinite(cd) || cd<0 || cd>2) throw new RangeError('積分条件の範囲外');
  const r=projectile(p), k=0.5*1.20*cd*Math.PI*0.11**2/0.43;
  let state=[0,p.height,r.vx,r.vy], t=0;
  const points:Point[]=[{t,x:0,y:p.height}];
  if (r.time===0) return points;
  const f=(s:number[])=>{const v=Math.hypot(s[2],s[3]);return [s[2],s[3],-k*v*s[2],-G-k*v*s[3]];};
  const add=(s:number[],d:number[],a:number)=>s.map((v,i)=>v+a*d[i]);
  for(let n=0;n<100000;n++) {
    const a=f(state),b=f(add(state,a,dt/2)),c=f(add(state,b,dt/2)),d=f(add(state,c,dt));
    const next=state.map((v,i)=>v+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);
    if(next[1]<=0) {
      const q=state[1]/(state[1]-next[1]);
      points.push({t:t+q*dt,x:state[0]+q*(next[0]-state[0]),y:0});
      return points;
    }
    t+=dt; state=next; points.push({t,x:state[0],y:state[1]});
  }
  throw new Error('着地イベント未検出');
}
