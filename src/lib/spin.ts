import {G, projectile, validateLaunch, type Launch} from './physics';

/** Educational SI model. CL is supplied, never inferred from rpm. */
export const BALL = {mass:0.43, radius:0.11, density:1.20, viscosity:1.8e-5} as const;
export type Vec3 = [number,number,number];
export interface AirModel {cd:number; cl:number; axis:Vec3; wind?:Vec3;}
export interface SpinPoint {t:number;x:number;y:number;z:number;vx:number;vy:number;vz:number;}
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function validateAir(p:AirModel){
  if(![p.cd,p.cl,...p.axis,...(p.wind??[0,0,0])].every(Number.isFinite)||p.cd<0||p.cd>2||p.cl<0||p.cl>1)throw new RangeError('空気力モデルの範囲外');
}
export function shellImpact(impulse:number,lever:number){
  if(![impulse,lever].every(Number.isFinite)||impulse<0||lever<0||lever>BALL.radius)throw new RangeError('力積または腕の範囲外');
  const inertia=2*BALL.mass*BALL.radius**2/3;
  const speed=impulse/BALL.mass,omega=lever*impulse/inertia;
  return {inertia,speed,omega,rps:omega/(2*Math.PI),translation:BALL.mass*speed**2/2,rotation:inertia*omega**2/2};
}
export function spinParameter(rps:number,speed:number){
  if(!Number.isFinite(rps)||!Number.isFinite(speed)||rps<0||speed<=0)throw new RangeError('回転・相対速度の範囲外');
  return 2*Math.PI*rps*BALL.radius/speed;
}
export function airForces(velocity:Vec3,p:AirModel){
  validateAir(p);
  if(!velocity.every(Number.isFinite))throw new RangeError('速度は有限値');
  const wind=p.wind??[0,0,0];
  const u=velocity.map((v,i)=>v-wind[i]) as Vec3;
  const speed=Math.hypot(...u),qA=0.5*BALL.density*Math.PI*BALL.radius**2*speed**2;
  // Normalize the axis first: its length is not a spin-rate input.
  const axisLength=Math.hypot(...p.axis);
  const axis=p.axis.map(v=>axisLength?v/axisLength:0) as Vec3;
  const normal=cross(axis,u),length=Math.hypot(...normal);
  const drag=u.map(v=>speed?-qA*p.cd*v/speed:0) as Vec3;
  const lift=normal.map(v=>length?qA*p.cl*v/length:0) as Vec3;
  return {u,speed,drag,lift};
}
/** Fixed spin axis; constant CD/CL; y=0 is the landing-centre plane. */
export function spinTrajectory(p:Launch,air:AirModel,dt=0.002):SpinPoint[]{
  validateLaunch(p);validateAir(air);
  if(!Number.isFinite(dt)||dt<=0||dt>0.05)throw new RangeError('時間刻みの範囲外');
  const initial=projectile(p);
  let s=[0,p.height,0,initial.vx,initial.vy,0],t=0;
  const point=(s:number[],t:number):SpinPoint=>({t,x:s[0],y:s[1],z:s[2],vx:s[3],vy:s[4],vz:s[5]});
  const points=[point(s,t)];
  if(initial.time===0)return points;
  const f=(s:number[])=>{
    const {drag,lift}=airForces([s[3],s[4],s[5]],air);
    return [s[3],s[4],s[5],(drag[0]+lift[0])/BALL.mass,(drag[1]+lift[1])/BALL.mass-G,(drag[2]+lift[2])/BALL.mass];
  };
  const add=(s:number[],d:number[],k:number)=>s.map((v,i)=>v+k*d[i]);
  for(let n=0;n<100000;n++){
    const a=f(s),b=f(add(s,a,dt/2)),c=f(add(s,b,dt/2)),d=f(add(s,c,dt));
    const next=s.map((v,i)=>v+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);
    if(next[1]<=0){const fraction=s[1]/(s[1]-next[1]);const landing=s.map((v,i)=>v+fraction*(next[i]-v));landing[1]=0;points.push(point(landing,t+fraction*dt));return points;}
    t+=dt;s=next;points.push(point(s,t));
  }
  throw new Error('着地イベント未検出');
}
export const FLIGHT_CASES=[
  {label:'A 抗力のみ',speed:25,cd:0.25,cl:0,color:'#287365',dash:'7 5'},
  {label:'B 揚力を追加',speed:25,cd:0.25,cl:0.10,color:'#6953a0',dash:'2 5'},
  {label:'C 揚力係数を変更',speed:25,cd:0.25,cl:0.20,color:'#9e4f23',dash:''},
  {label:'D 初速度も低下',speed:22.5,cd:0.25,cl:0.20,color:'#345a92',dash:'10 4 2 4'},
] as const;
export function flightComparison(dt=0.002){return FLIGHT_CASES.map(c=>{
  const points=spinTrajectory({speed:c.speed,angle:40,height:0},{cd:c.cd,cl:c.cl,axis:[0,0,1]},dt);
  return {...c,points,range:points.at(-1)!.x,time:points.at(-1)!.t,peak:Math.max(...points.map(p=>p.y))};
});}
