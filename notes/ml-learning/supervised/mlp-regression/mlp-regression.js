const featureNames = ["Audience affinity", "Awareness", "Tone match", "Release timing", "Runtime fit", "Social buzz"];
const initialFeatures = [0.76, 0.62, 0.7, 0.58, 0.66, 0.54];
const trainingData = [
  [[.82,.75,.76,.65,.62,.8],.88], [[.7,.45,.72,.52,.8,.38],.66], [[.3,.72,.42,.78,.55,.68],.59],
  [[.62,.25,.7,.34,.72,.3],.48], [[.9,.82,.52,.7,.4,.86],.84], [[.42,.38,.8,.45,.88,.26],.55],
  [[.22,.2,.48,.3,.62,.18],.27], [[.58,.68,.3,.82,.46,.72],.61], [[.76,.52,.86,.42,.78,.58],.74],
  [[.36,.86,.58,.62,.52,.9],.67], [[.68,.34,.62,.76,.7,.42],.63], [[.18,.52,.7,.48,.82,.36],.44],
];
const heldoutData = [
  [[.74,.7,.64,.58,.7,.66],.76], [[.28,.62,.5,.72,.48,.74],.53], [[.64,.3,.82,.38,.86,.3],.57], [[.46,.78,.34,.84,.5,.82],.63],
];
const state = { features:[...initialFeatures], target:.73, activation:"relu", hidden:4, rate:.03, epoch:0, selected:0, pulse:false, history:[] };
let w1, b1, w2, b2;
const ui = {
  svg:document.querySelector("#mlp-network"), features:document.querySelector("#mlp-features"),
  prediction:document.querySelector("#mlp-prediction"), target:document.querySelector("#mlp-target"),
  residual:document.querySelector("#mlp-residual"), loss:document.querySelector("#mlp-loss"), epoch:document.querySelector("#mlp-epoch"),
  neuronTitle:document.querySelector("#mlp-neuron-title"), z:document.querySelector("#mlp-z"), a:document.querySelector("#mlp-a"),
  strongest:document.querySelector("#mlp-strongest"), chart:document.querySelector("#mlp-loss-chart"),
  hidden:document.querySelector("#mlp-hidden-count"), hiddenOutput:document.querySelector("#mlp-hidden-output"),
  rate:document.querySelector("#mlp-rate"), rateOutput:document.querySelector("#mlp-rate-output"),
};

function seededWeight(i,j){ return Math.sin((i+1)*7.31+(j+1)*3.17)*.42; }
function resetWeights(){
  w1=Array.from({length:6},(_,i)=>Array.from({length:6},(_,j)=>seededWeight(i,j)));
  b1=Array.from({length:6},(_,j)=>.18+j*.02);
  w2=Array.from({length:6},(_,j)=>Math.cos((j+1)*2.23)*.38);
  b2=.46;
}
function activate(z){ return state.activation==="relu"?Math.max(0,z):z; }
function derivative(z){ return state.activation==="relu"?(z>0?1:0):1; }
function forward(features=state.features){
  const z=Array.from({length:state.hidden},(_,j)=>features.reduce((sum,x,i)=>sum+x*w1[i][j],b1[j]));
  const a=z.map(activate);
  const raw=a.reduce((sum,value,j)=>sum+value*w2[j],b2);
  return {z,a,prediction:Math.max(.02,Math.min(.98,raw))};
}
function mse(data){ return data.reduce((sum,[x,y])=>sum+(forward(x).prediction-y)**2,0)/data.length; }
function trainExample(features,target){
  const {z,a,prediction}=forward(features); const error=prediction-target; const outputGrad=2*error;
  const oldW2=[...w2];
  for(let j=0;j<state.hidden;j+=1) w2[j]-=state.rate*outputGrad*a[j];
  b2-=state.rate*outputGrad;
  for(let j=0;j<state.hidden;j+=1){
    const hiddenGrad=outputGrad*oldW2[j]*derivative(z[j]);
    for(let i=0;i<6;i+=1) w1[i][j]-=state.rate*hiddenGrad*features[i];
    b1[j]-=state.rate*hiddenGrad;
  }
}
function currentMetrics(){ const result=forward(); const residual=state.target-result.prediction; return {...result,residual,loss:residual**2}; }
function buildFeatureControls(){
  ui.features.innerHTML=featureNames.map((name,i)=>`<label><span>${name}</span><strong id="feature-value-${i}">${Math.round(state.features[i]*100)}</strong><input type="range" min="0" max="100" value="${Math.round(state.features[i]*100)}" data-feature="${i}" /></label>`).join("");
}
function renderNetwork(result){
  const inputX=105, hiddenX=405, outputX=675; const inputYs=[62,140,218,296,374,452];
  const hiddenYs=Array.from({length:state.hidden},(_,i)=>70+i*(380/Math.max(1,state.hidden-1)));
  let edges="";
  for(let i=0;i<6;i++) for(let j=0;j<state.hidden;j++){
    const weight=w1[i][j]; edges+=`<line class="mlp-edge ${weight>=0?"positive":"negative"} ${state.pulse?"is-pulsing":""}" x1="${inputX}" y1="${inputYs[i]}" x2="${hiddenX}" y2="${hiddenYs[j]}" style="--edge-delay:${(i+j)*22}ms;stroke-width:${1+Math.abs(weight)*6}" />`;
  }
  for(let j=0;j<state.hidden;j++){ const weight=w2[j]; edges+=`<line class="mlp-edge ${weight>=0?"positive":"negative"} ${state.pulse?"is-pulsing":""}" x1="${hiddenX}" y1="${hiddenYs[j]}" x2="${outputX}" y2="256" style="--edge-delay:${160+j*35}ms;stroke-width:${1+Math.abs(weight)*7}" />`; }
  const inputs=inputYs.map((y,i)=>`<g class="mlp-node input"><circle cx="${inputX}" cy="${y}" r="25"/><text x="${inputX}" y="${y+4}">${Math.round(state.features[i]*100)}</text><text class="node-label" x="12" y="${y+4}">${featureNames[i]}</text></g>`).join("");
  const hidden=hiddenYs.map((y,j)=>`<g class="mlp-node hidden ${j===state.selected?"is-selected":""}" data-neuron="${j}" role="button" tabindex="0"><circle cx="${hiddenX}" cy="${y}" r="31"/><text x="${hiddenX}" y="${y+4}">${result.a[j].toFixed(2)}</text><text class="node-label" x="${hiddenX}" y="${y+51}">H${j+1}</text></g>`).join("");
  ui.svg.innerHTML=`<text class="layer-label" x="${inputX}" y="20">INPUT FEATURES</text><text class="layer-label" x="${hiddenX}" y="20">HIDDEN · ${state.activation.toUpperCase()}</text><text class="layer-label" x="${outputX}" y="20">OUTPUT</text>${edges}${inputs}${hidden}<g class="mlp-node output"><circle cx="${outputX}" cy="256" r="42"/><text x="${outputX}" y="252">${Math.round(result.prediction*100)}%</text><text class="node-label" x="${outputX}" y="276">ŷ</text></g>`;
}
function renderChart(){
  const ctx=ui.chart.getContext("2d"), width=ui.chart.width, height=ui.chart.height; ctx.clearRect(0,0,width,height); ctx.fillStyle="#fbfaf6";ctx.fillRect(0,0,width,height);
  ctx.strokeStyle="rgba(18,24,43,.18)";ctx.beginPath();ctx.moveTo(36,18);ctx.lineTo(36,140);ctx.lineTo(414,140);ctx.stroke();
  const history=state.history.length?state.history:[{train:mse(trainingData),held:mse(heldoutData)}]; const max=Math.max(.02,...history.flatMap(d=>[d.train,d.held]));
  [["train","#3155f5"],["held","#ff755f"]].forEach(([key,color])=>{ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.beginPath();history.forEach((d,i)=>{const x=36+(i/Math.max(1,history.length-1))*378;const y=132-(d[key]/max)*102;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();if(history.length===1){const y=132-(history[0][key]/max)*102;ctx.beginPath();ctx.arc(36,y,4,0,Math.PI*2);ctx.fill();}});
  ctx.font="600 12px DM Sans";ctx.fillStyle="#3155f5";ctx.fillText("Training",42,16);ctx.fillStyle="#ff755f";ctx.fillText("Held-out",124,16);
}
function render(){
  const result=currentMetrics(); state.selected=Math.min(state.selected,state.hidden-1);
  ui.prediction.textContent=`${Math.round(result.prediction*100)}%`; ui.target.textContent=`${Math.round(state.target*100)}%`;
  ui.residual.textContent=`${result.residual>=0?"+":""}${(result.residual*100).toFixed(1)} pts`; ui.loss.textContent=result.loss.toFixed(4); ui.epoch.textContent=state.epoch;
  ui.neuronTitle.textContent=`H${state.selected+1}`; ui.z.textContent=result.z[state.selected].toFixed(3); ui.a.textContent=result.a[state.selected].toFixed(3);
  const strongest=w1.map((row,i)=>({i,value:Math.abs(row[state.selected])})).sort((a,b)=>b.value-a.value)[0]; ui.strongest.textContent=featureNames[strongest.i];
  ui.hiddenOutput.textContent=state.hidden; ui.rateOutput.textContent=state.rate.toFixed(2);
  ui.features.querySelectorAll("[data-feature]").forEach(input=>{document.querySelector(`#feature-value-${input.dataset.feature}`).textContent=input.value;});
  renderNetwork(result); renderChart();
}
ui.features.addEventListener("input",e=>{const input=e.target.closest("[data-feature]");if(!input)return;state.features[Number(input.dataset.feature)]=Number(input.value)/100;render();});
ui.svg.addEventListener("click",e=>{const node=e.target.closest("[data-neuron]");if(!node)return;state.selected=Number(node.dataset.neuron);render();});
document.querySelectorAll("[data-activation]").forEach(button=>button.addEventListener("click",()=>{state.activation=button.dataset.activation;document.querySelectorAll("[data-activation]").forEach(item=>item.classList.toggle("is-selected",item===button));render();}));
ui.hidden.addEventListener("input",()=>{state.hidden=Number(ui.hidden.value);render();});
ui.rate.addEventListener("input",()=>{state.rate=Number(ui.rate.value)/100;render();});
document.querySelector("#mlp-forward").addEventListener("click",()=>{state.pulse=true;render();setTimeout(()=>{state.pulse=false;render();},900);});
document.querySelector("#mlp-step").addEventListener("click",()=>{trainExample(state.features,state.target);state.history.push({train:mse(trainingData),held:mse(heldoutData)});render();});
document.querySelector("#mlp-epoch-button").addEventListener("click",()=>{trainingData.forEach(([x,y])=>trainExample(x,y));state.epoch+=1;state.history.push({train:mse(trainingData),held:mse(heldoutData)});render();});
document.querySelector("#mlp-reset").addEventListener("click",()=>{state.features=[...initialFeatures];state.activation="relu";state.hidden=4;state.rate=.03;state.epoch=0;state.selected=0;state.history=[];ui.hidden.value=4;ui.rate.value=3;document.querySelectorAll("[data-activation]").forEach(item=>item.classList.toggle("is-selected",item.dataset.activation==="relu"));resetWeights();buildFeatureControls();render();});
resetWeights();buildFeatureControls();render();
