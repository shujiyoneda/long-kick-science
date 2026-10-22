import {projectile,trajectory,optimalAngle, type Launch} from '../lib/physics';
import type PlotlyType from 'plotly.js';
const root=document.querySelector<HTMLElement>('[data-simulator]');
if(root){
 const form=root.querySelector<HTMLFormElement>('form')!;
 const plot=root.querySelector<HTMLDivElement>('#flight-plot')!;
 const keys=['speed','angle','height'] as const;
 const input=(key:string)=>root.querySelector<HTMLInputElement>(`#${key}`)!;
 let Plotly:typeof PlotlyType|undefined;
 let busy=false,dirty=false;
 let state:Launch={speed:25,angle:40,height:0};
 const draw=()=>{
  if(!Plotly)return;
  if(busy){dirty=true;return;}
  busy=true;
  const r=projectile(state),pts=trajectory(state);
  const maxX=Math.max(10,r.range*1.08),maxY=Math.max(5,r.peak*1.2);
  void Plotly.react(plot,[{x:pts.map(p=>p.x),y:pts.map(p=>p.y),mode:'lines',type:'scatter',line:{color:'#287365',width:3},name:'理想軌道',hovertemplate:'距離 %{x:.2f} m<br>高さ %{y:.2f} m<extra></extra>'},{x:[r.vx*r.apexTime],y:[r.peak],mode:'markers',type:'scatter',marker:{color:'#8a591e',size:9},name:'最高点',hovertemplate:'最高点 %{y:.2f} m<extra></extra>'}],{margin:{l:48,r:18,t:25,b:48},paper_bgcolor:'#fff',plot_bgcolor:'#fafbf8',font:{family:'sans-serif',color:'#294147'},showlegend:false,xaxis:{title:{text:'水平距離 / m'},range:[-maxX*.03,maxX],zerolinecolor:'#a4b4b0',gridcolor:'#e1e8e1',fixedrange:true},yaxis:{title:{text:'相対高さ / m'},range:[-maxY*.06,maxY],scaleanchor:'x',scaleratio:1,zerolinecolor:'#a4b4b0',gridcolor:'#e1e8e1',fixedrange:true}}, {responsive:true,displayModeBar:false,scrollZoom:false}).catch(()=>{root.querySelector('#plot-status')!.textContent='グラフを表示できません。数値と軌道データ表をご利用ください。';}).finally(()=>{document.getElementById('js-plotly-tester')?.setAttribute('aria-hidden','true');busy=false;if(dirty){dirty=false;draw();}});
 };
 const update=()=>{
  const p={speed:input('speed').valueAsNumber,angle:input('angle').valueAsNumber,height:input('height').valueAsNumber};
  if(!keys.every(k=>input(k).checkValidity())){root.querySelector('#input-error')!.textContent='各条件に表示範囲内の数値を入力してください。結果は直前の有効な条件です。';return;}
  root.querySelector('#input-error')!.textContent='';state=p;
  const r=projectile(p);
  for(const [id,v] of [['range',r.range],['peak',r.peak],['time',r.time]] as const) root.querySelector(`#${id}-value`)!.textContent=v.toFixed(2);
  root.querySelector('#plot-summary')!.textContent=`初速度 ${p.speed} m/s、角度 ${p.angle}°、相対高さ ${p.height} m。飛距離 ${r.range.toFixed(2)} m、最高点 ${r.peak.toFixed(2)} m、滞空時間 ${r.time.toFixed(2)} s。${p.speed>0?`同じ初速度・高さでの理論最適角は ${optimalAngle(p.speed,p.height).toFixed(2)}°。`:'初速度が0のとき角度に意味はありません。'}`;
  const body=root.querySelector('#trajectory-data')!;body.replaceChildren();
  for(const pt of trajectory(p,10)){const row=document.createElement('tr');for(const n of [pt.t,pt.x,pt.y]){const cell=document.createElement('td');cell.textContent=n.toFixed(2);row.append(cell);}body.append(row);}
  draw();
 };
 for(const k of keys){
  input(k).addEventListener('input',()=>{if(input(k).checkValidity())input(`${k}-slider`).value=input(k).value;update();});
  input(`${k}-slider`).addEventListener('input',()=>{input(k).value=input(`${k}-slider`).value;update();});
 }
 form.addEventListener('submit',e=>e.preventDefault());
 form.addEventListener('reset',e=>{e.preventDefault();for(const k of keys){input(k).value=input(k).defaultValue;input(`${k}-slider`).value=input(k).value;}update();});
 update();
 import('plotly.js-basic-dist-min').then(m=>{Plotly=m.default;draw();}).catch(()=>{root.querySelector('#plot-status')!.textContent='グラフを読み込めません。数値と軌道データ表をご利用ください。';});
}
