const featureNames = ["Audience–title affinity", "Title awareness", "Tone preference match"];
const featureLabelLines = [["Audience–title", "affinity"], ["Title awareness"], ["Tone preference", "match"]];
const state = {
  stage: 1,
  features: [.78, .64, .56],
  weights: [.6, -.35, .42],
  bias: -.55,
  activation: "relu",
  width: 3,
  pulse: false,
};
const hiddenProfiles = [
  { weights:[.6,-.35,.42], bias:-.55 },
  { weights:[-.25,.72,.3], bias:-.28 },
  { weights:[.38,.24,-.58], bias:-.12 },
  { weights:[.18,-.42,.76], bias:-.3 },
];
const outputWeights = [.62, .46, -.3, .38];
const ui = {
  svg:document.querySelector("#builder-network"), title:document.querySelector("#builder-stage-title"),
  number:document.querySelector("#builder-stage-number"), copy:document.querySelector("#builder-stage-copy"),
  scalar:document.querySelector("#builder-scalar"), scalarCopy:document.querySelector("#builder-scalar-copy"),
  matrix:document.querySelector("#builder-matrix"), matrixCopy:document.querySelector("#builder-matrix-copy"),
  output:document.querySelector("#builder-output"), outputCopy:document.querySelector("#builder-output-copy"),
  notice:document.querySelector("#builder-notice"),
  features:document.querySelector("#builder-features"), weights:document.querySelector("#builder-weights"),
  bias:document.querySelector("#builder-bias"), biasValue:document.querySelector("#builder-bias-value"),
  activationCopy:document.querySelector("#builder-activation-copy"), width:document.querySelector("#builder-width"),
  widthValue:document.querySelector("#builder-width-value"),
  explainerQuestion:document.querySelector("#builder-explainer-question"),
  what:document.querySelector("#builder-what"), how:document.querySelector("#builder-how"),
  why:document.querySelector("#builder-why"),
  termCheck:document.querySelector("#builder-term-check"),
  controls:document.querySelector(".builder-controls"),
  controlInstruction:document.querySelector("#builder-control-instruction"),
};
const stageContent = {
  1:["Features become a vector.","The model does not see a title, a genre, or an audience. It sees an ordered list of numbers. The order is what gives each number its meaning."],
  2:["One neuron weighs the evidence.","Now the numbers meet the model. Each connection has a weight: a learned setting that decides how loudly one feature should speak."],
  3:["Bias shifts the starting point.","Bias is the neuron’s learned starting opinion. It raises or lowers the total before activation gets a say."],
  4:["Activation shapes the signal.","Activation decides what leaves the neuron. The weighted total is still there, but the outgoing signal may be clipped, bent, or squeezed."],
  5:["One calculation becomes a layer.","A hidden layer repeats the same little ritual several times. Same inputs, different weights, different intermediate signals."],
  6:["The network feeds forward.","The network now has a path from input vector to prediction. Nothing learns yet; the machine is only answering with the parameters it already has."],
};
const controlInstructions = {
  1:"Move a feature and watch its number change in the diagram, the individual calculation, and the feature vector.",
  2:"Move a feature or weight. The line thickens or thins, and the neuron recalculates the evidence it receives.",
  3:"Adjust bias. The neuron’s total moves even when the feature values and weights stay fixed.",
  4:"Switch Linear, ReLU, and Sigmoid. The same pre-activation value becomes three different outgoing signals.",
  5:"Add or remove hidden neurons. Each node runs the same recipe with its own weights and bias.",
  6:"Run the feedforward pass and watch signals travel left to right. The network predicts; it does not train."
};
const stageNotices = {
  1:"The same three numbers appear in the diagram and in the vector. Their position is part of the meaning.",
  2:"A weight belongs to a position in the vector. If the order changes, the model listens to the wrong evidence.",
  3:"Bias is not attached to any one feature. It is the neuron’s baseline, added after all weighted evidence is counted.",
  4:"Activation is the first bend in the system. Linear preserves the total; ReLU and sigmoid reshape it.",
  5:"The hidden layer’s output is another vector. The network has transformed the original evidence into new internal evidence.",
  6:"Feedforward is evaluation. The network produces a prediction, but none of its parameters learn yet."
};
const explainers = {
  1:{
    question:"Where do features come from?",
    what:"Features are measurable facts used to describe one example. Here, the example is one title paired with one audience cohort.",
    how:"Raw user behavior, campaign exposure, and title information are processed upstream into audience–title affinity, title awareness, and tone preference match. Every title–cohort pair uses the same order and scale.",
    why:"Features translate messy real-world evidence into a consistent language the model can compare. Better features give the model more useful evidence from which to learn.",
    check:"A feature is input data. The model receives it; this small network does not learn the feature itself. Later, embeddings will show how networks can learn representations."
  },
  2:{
    question:"What is a neuron actually doing?",
    what:"A neuron is a tiny scoring machine. It takes several numbers in and produces one number out.",
    how:"Each input is multiplied by a weight, then the weighted pieces are added. Positive weights amplify evidence; negative weights push against it.",
    why:"A neuron lets the model turn several raw clues into one reusable signal, such as “strong fit, even if awareness is weak.”",
    check:"Feature values describe this title. Weights describe the model. Moving a feature changes the example; moving a weight changes how the model judges every example."
  },
  3:{
    question:"Why does the neuron need bias?",
    what:"Bias is a learned offset: one extra number added after the weighted inputs.",
    how:"The neuron counts the weighted evidence, then adds b. Positive bias lifts the total; negative bias drags it down.",
    why:"Without bias, every neuron is chained to the origin, as if zero input must always mean zero signal. Bias gives the neuron room to set its own threshold.",
    check:"Model bias b is not social bias, dataset bias, or the bias in the bias-variance tradeoff. Same word, different machinery."
  },
  4:{
    question:"Why not just send the total onward?",
    what:"Activation is the outgoing signal after the neuron has counted its weighted evidence and bias.",
    how:"The pre-activation value is z. The activation function turns z into a. Linear passes it through, ReLU blocks negatives, and sigmoid squeezes the result between 0 and 1.",
    why:"Activation gives the network bends and thresholds. Without a nonlinear activation, many layers collapse back into one linear calculation.",
    check:"The activation function is chosen by the builder. The activation value a is temporary; it is recalculated for each example."
  },
  5:{
    question:"Hidden layer—hidden from whom?",
    what:"A hidden layer is a group of neurons between the original input vector and the final prediction.",
    how:"Each hidden neuron sees the same input vector, but each uses its own weights and bias. Their activations become a new vector.",
    why:"The layer lets the network invent intermediate signals. Later parts of the model can combine those signals instead of starting from raw features every time.",
    check:"Hidden does not mean unknowable. We can inspect every value here. It only means the layer is neither supplied as input nor observed as the target."
  },
  6:{
    question:"What does feedforward mean?",
    what:"Feedforward is the network answering a question with its current settings.",
    how:"The input vector moves left to right through weights, biases, and activations until the output appears. There are no loops, and no parameters change.",
    why:"This is how a trained network makes a prediction. During training, the same pass also creates the guess that loss will judge.",
    check:"Feedforward predicts. Training is separate: loss measures the miss, backpropagation assigns responsibility, and gradient descent updates parameters."
  },
};
function format(n){ return `${n<0?"−":""}${Math.abs(n).toFixed(2)}`; }
function activate(z){
  if(state.activation==="relu") return Math.max(0,z);
  if(state.activation==="sigmoid") return 1/(1+Math.exp(-z));
  return z;
}
function activationLabel(){
  return state.activation==="relu"?"ReLU":state.activation==="sigmoid"?"Sigmoid":"Linear";
}
function neuron(profile=hiddenProfiles[0]){
  const contributions=state.features.map((x,i)=>x*profile.weights[i]);
  const z=contributions.reduce((a,b)=>a+b,profile.bias);
  return {contributions,z,a:activate(z)};
}
function firstNeuronProfile(){ return {weights:state.weights,bias:state.stage>=3?state.bias:0}; }
function network(){
  const hidden=hiddenProfiles.slice(0,state.width).map(neuron);
  const raw=hidden.reduce((sum,n,j)=>sum+n.a*outputWeights[j],-.08);
  return {hidden,raw,prediction:1/(1+Math.exp(-raw))};
}
function buildControls(){
  ui.features.innerHTML=featureNames.map((name,i)=>`<label><span>${name}</span><strong id="builder-feature-value-${i}">${state.features[i].toFixed(2)}</strong><input type="range" min="0" max="100" value="${state.features[i]*100}" data-builder-feature="${i}" /></label>`).join("");
  ui.weights.innerHTML=featureNames.map((name,i)=>`<label><span>${name} weight</span><strong id="builder-weight-value-${i}">${format(state.weights[i])}</strong><input type="range" min="-100" max="100" value="${state.weights[i]*100}" data-builder-weight="${i}" /></label>`).join("");
}
function renderMath(){
  const one=neuron(firstNeuronProfile()), net=network();
  const products=state.features.map((x,i)=>`${x.toFixed(2)} × (${state.weights[i].toFixed(2)})`);
  if(state.stage===1){
    ui.scalar.textContent=`x₁ = ${state.features[0].toFixed(2)}`;
    ui.scalarCopy.textContent=`“Audience–title affinity” has become the numeric feature x₁ (“x sub one”).`;
    ui.matrix.textContent=`x = [${state.features.map(v=>v.toFixed(2)).join(", ")}]`;
    ui.matrixCopy.textContent="x is the feature vector: an ordered list describing one title–audience pair.";
    ui.output.textContent="<undefined>"; ui.outputCopy.textContent="No neuron exists yet.";
  } else if(state.stage<=4){
    const biasTerm=state.stage>=3?` + (${state.bias.toFixed(2)})`:"";
    ui.scalar.textContent=`z = ${products.join(" + ")}${biasTerm} = ${one.z.toFixed(3)}`;
    ui.scalarCopy.textContent=state.stage>=3?"Each feature is multiplied by its weight; bias is added after the weighted evidence.":"Each feature is multiplied by its weight, then the weighted pieces are added.";
    ui.matrix.textContent=state.stage>=3?`z = w · x + b`:`z = w · x`;
    ui.matrixCopy.textContent=`w = [${state.weights.map(v=>v.toFixed(2)).join(", ")}], x = [${state.features.map(v=>v.toFixed(2)).join(", ")}]${state.stage>=3?`, b = ${state.bias.toFixed(2)}`:""}`;
    ui.output.textContent=state.stage<4?one.z.toFixed(3):one.a.toFixed(3);
    ui.outputCopy.textContent=state.stage<4?"The neuron is showing z: the total before activation.":`${activationLabel()} transforms z into activation a.`;
  } else {
    const matrixRows=hiddenProfiles.slice(0,state.width).map(p=>`[${p.weights.map(v=>v.toFixed(2)).join(", ")}]`).join(" ");
    ui.scalar.textContent=`a₁ = f(${net.hidden[0].z.toFixed(3)}) = ${net.hidden[0].a.toFixed(3)}`;
    ui.scalarCopy.textContent="Each hidden neuron runs the same operation with its own parameters.";
    ui.matrix.textContent=`a = f(Wx + b)`;
    ui.matrixCopy.textContent=`W has ${state.width} rows, one for each hidden neuron: ${matrixRows}`;
    ui.output.textContent=state.stage===6?`${Math.round(net.prediction*100)}%`:`[${net.hidden.map(n=>n.a.toFixed(2)).join(", ")}]`;
    ui.outputCopy.textContent=state.stage===6?"The output neuron converts hidden signals into a completion prediction.":"The hidden layer has produced a new vector of activations.";
  }
}
function renderNetwork(){
  const net=network(), inputX=145, hiddenX=475, outputX=735, ys=[135,265,395];
  const hiddenYs=Array.from({length:state.width},(_,i)=>95+i*(340/Math.max(1,state.width-1)));
  const showNeuron=state.stage>=2, showLayer=state.stage>=5, showOutput=state.stage>=6;
  let edges="", nodes="";
  ys.forEach((y,i)=>{
    const label=featureLabelLines[i].map((line,j)=>`<tspan x="18" dy="${j===0?(featureLabelLines[i].length===1?0:-6):12}">${line}</tspan>`).join("");
    nodes+=`<g class="builder-node input"><circle cx="${inputX}" cy="${y}" r="35"/><text x="${inputX}" y="${y+5}">${state.features[i].toFixed(2)}</text><text class="builder-node-label" x="18" y="${y+5}">${label}</text></g>`;
  });
  if(showNeuron){
    const count=showLayer?state.width:1;
    for(let j=0;j<count;j++){
      const profile=j===0?firstNeuronProfile():hiddenProfiles[j];
      const result=j===0?neuron(profile):net.hidden[j];
      const hy=showLayer?hiddenYs[j]:265;
      for(let i=0;i<3;i++){
        const weight=profile.weights[i];
        edges+=`<line class="builder-edge ${weight>=0?"positive":"negative"} ${state.pulse?"is-pulsing":""}" x1="${inputX+35}" y1="${ys[i]}" x2="${hiddenX-38}" y2="${hy}" style="stroke-width:${1+Math.abs(weight)*7};--edge-delay:${(i+j)*50}ms"/>`;
      }
      nodes+=`<g class="builder-node hidden"><circle cx="${hiddenX}" cy="${hy}" r="38"/><text x="${hiddenX}" y="${hy+5}">${(state.stage>=4?result.a:result.z).toFixed(2)}</text><text class="builder-node-label center" x="${hiddenX}" y="${hy+58}">H${j+1}</text></g>`;
      if(showOutput){
        const ow=outputWeights[j];
        edges+=`<line class="builder-edge ${ow>=0?"positive":"negative"} ${state.pulse?"is-pulsing":""}" x1="${hiddenX+38}" y1="${hy}" x2="${outputX-48}" y2="265" style="stroke-width:${1+Math.abs(ow)*7};--edge-delay:${260+j*60}ms"/>`;
      }
    }
  }
  if(showOutput) nodes+=`<g class="builder-node output"><circle cx="${outputX}" cy="265" r="48"/><text x="${outputX}" y="260">${Math.round(net.prediction*100)}%</text><text class="builder-node-label center" x="${outputX}" y="283">prediction</text></g>`;
  const vectorBracket=state.stage===1?`<path class="builder-bracket" d="M205 92h18v346h-18M258 92h-18v346h18"/><text class="builder-vector-label" x="232" y="470">x</text>`:"";
  ui.svg.innerHTML=`<text class="builder-layer-label" x="${inputX}" y="45">FEATURE VALUES</text>${showNeuron?`<text class="builder-layer-label" x="${hiddenX}" y="45">${showLayer?"HIDDEN LAYER":"ONE NEURON"}</text>`:""}${showOutput?`<text class="builder-layer-label" x="${outputX}" y="45">OUTPUT</text>`:""}${edges}${nodes}${vectorBracket}`;
}
function renderVisibility(){
  document.querySelector("#builder-weights-panel").hidden=state.stage<2;
  document.querySelector("#builder-bias-panel").hidden=state.stage<3;
  document.querySelector("#builder-activation-panel").hidden=state.stage<4;
  document.querySelector("#builder-width-panel").hidden=state.stage<5;
  document.querySelector("#builder-forward-panel").hidden=state.stage<6;
}
function render(){
  const content=stageContent[state.stage];
  const explainer=explainers[state.stage];
  ui.title.textContent=content[0];ui.copy.textContent=content[1];ui.number.textContent=`0${state.stage} / 06`;
  ui.explainerQuestion.textContent=explainer.question;
  ui.what.textContent=explainer.what;
  ui.how.textContent=explainer.how;
  ui.why.textContent=explainer.why;
  ui.termCheck.textContent=explainer.check;
  ui.controlInstruction.textContent=controlInstructions[state.stage];
  ui.notice.textContent=stageNotices[state.stage];
  ui.controls.classList.toggle("is-feature-only",state.stage===1);
  ui.biasValue.textContent=format(state.bias);ui.widthValue.textContent=state.width;
  ui.activationCopy.textContent=state.activation==="relu"?"ReLU keeps positive signals and suppresses negative ones.":state.activation==="sigmoid"?"Sigmoid squeezes any value into the range from 0 to 1.":"Linear passes the weighted sum through unchanged.";
  ui.features.querySelectorAll("[data-builder-feature]").forEach((input,i)=>document.querySelector(`#builder-feature-value-${i}`).textContent=state.features[i].toFixed(2));
  ui.weights.querySelectorAll("[data-builder-weight]").forEach((input,i)=>document.querySelector(`#builder-weight-value-${i}`).textContent=format(state.weights[i]));
  renderVisibility();renderNetwork();renderMath();
}
document.querySelectorAll("[data-build-stage]").forEach(button=>button.addEventListener("click",()=>{state.stage=Number(button.dataset.buildStage);document.querySelectorAll("[data-build-stage]").forEach(item=>item.classList.toggle("is-selected",item===button));render();}));
ui.features.addEventListener("input",e=>{const input=e.target.closest("[data-builder-feature]");if(!input)return;state.features[Number(input.dataset.builderFeature)]=Number(input.value)/100;render();});
ui.weights.addEventListener("input",e=>{const input=e.target.closest("[data-builder-weight]");if(!input)return;state.weights[Number(input.dataset.builderWeight)]=Number(input.value)/100;hiddenProfiles[0].weights=[...state.weights];render();});
ui.bias.addEventListener("input",()=>{state.bias=Number(ui.bias.value)/100;hiddenProfiles[0].bias=state.bias;render();});
document.querySelectorAll("[data-builder-activation]").forEach(button=>button.addEventListener("click",()=>{state.activation=button.dataset.builderActivation;document.querySelectorAll("[data-builder-activation]").forEach(item=>item.classList.toggle("is-selected",item===button));render();}));
ui.width.addEventListener("input",()=>{state.width=Number(ui.width.value);render();});
document.querySelector("#builder-forward").addEventListener("click",()=>{state.pulse=true;render();setTimeout(()=>{state.pulse=false;render();},1100);});
buildControls();render();
