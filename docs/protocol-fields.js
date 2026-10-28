// Migration only preserves recorded values. Culture medium is never an assay-medium default.
export function upgradeProtocolFields(state){
 for(const e of [...(state.experiments||[]),...(state.trash||[])])for(const p of e.plates||[]){
  const d=p.defaults;if(d){if(!Object.hasOwn(d,'seedingMedium'))d.seedingMedium=d.medium||'';d.assayMedium??='';d.collectionMethod??='';}
  for(const w of [...Object.values(p.wells||{}),...Object.values(p.actual||{}).map(x=>x.well)].filter(Boolean)){if(!Object.hasOwn(w,'seedingMedium'))w.seedingMedium=w.medium||'';w.assayMedium??='';w.collectionMethod??='';}
 }
 return state;
}
export function editableProtocolSteps(steps=[]){const result=structuredClone(steps);for(const s of result)if(s.stage&&s.status===undefined)s.status='used';for(const stage of ['pretreatment','stimulation'])if(!result.some(s=>s.stage===stage))result.push({stage,status:'',name:'',materialId:'',materialName:'',concentration:'',unit:'',duration:'',description:''});return result;}
export function committedProtocolSteps(steps=[]){return steps.filter(s=>!s.stage||s.status==='none'||(s.status!==''&&['name','materialId','materialName','concentration','duration','description','temperature','volume','totalVolume','start'].some(k=>String(s[k]||'').trim()))).map(s=>s.stage&&s.status==='none'?{stage:s.stage,status:'none',duration:s.duration||''}:structuredClone(s));}

export const protocolUnits=['','pg/mL','ng/mL','µg/mL','mg/mL','nM','µM','mM','M','U/mL','%','×','1:'];
export const hasRecordedStages=w=>(w?.steps||[]).some(s=>['pretreatment','stimulation'].includes(s.stage)&&(s.status==='none'||['name','materialName','concentration','duration'].some(k=>String(s[k]||'').trim())));
export function treatmentTiming(w,t=(_zh,en)=>en){
 const timed=['pretreatment','stimulation'].map(stage=>{const durations=[...new Set((w.steps||[]).filter(s=>s.stage===stage&&s.duration?.trim()).map(s=>s.duration.trim()))];return durations.length?t(stage==='pretreatment'?'预处理':'刺激',stage==='pretreatment'?'Pretreatment':'Stimulation')+' '+durations.join(' / '):''}).filter(Boolean);
 const manual=String(w.parentGroup||'').trim(),durationValues=(w.steps||[]).map(s=>String(s.duration||'').replace(/\s/g,'').toLowerCase());
 if(!timed.length)return manual;
 return [manual&&!/^\s*[\d.]+\s*(min(?:utes?)?|h(?:ours?)?|s(?:ec(?:onds?)?)?|小时|分钟|秒)\s*$/i.test(manual)&&!durationValues.includes(manual.replace(/\s/g,'').toLowerCase())?manual:'',timed.join(' + ')].filter(Boolean).join(' · ');
}
export function treatmentLines(w,t=(_zh,en)=>en,compact=false){
 if(!hasRecordedStages(w))return w.group?[w.group]:[];
 return ['pretreatment','stimulation'].map(stage=>{
  const steps=(w.steps||[]).filter(s=>s.stage===stage),label=t(stage==='pretreatment'?'预处理':'刺激',stage==='pretreatment'?'Pretreatment':'Stimulation');
  const values=steps.map(s=>s.status==='none'?t('无','none'):[s.name||s.materialName||'',s.concentration?[s.concentration,s.unit].filter(Boolean).join(' '):''].filter(Boolean).join(' ')).filter(Boolean);
  return (compact?'':label+': ')+(values.length?values.join(' + '):t('未记录','not recorded'));
 });
}
export const treatmentLabel=(w,t,compact=false)=>treatmentLines(w,t,compact).join(' · ');
// Batch edits touch only the changed stage fields; unrelated well-specific doses survive.
export function mergeProtocolEdits(existing,draft,edits=[],replaceStages=[],replaceLegacy=false){
 let result=structuredClone(existing||[]);
 if(replaceLegacy)result=[...structuredClone(draft.filter(s=>!s.stage)),...result.filter(s=>s.stage)];
 for(const stage of ['pretreatment','stimulation']){
  const sources=draft.filter(s=>s.stage===stage),changes=edits.filter(e=>e.stage===stage);
  if(!replaceStages.includes(stage)&&!changes.length)continue;
  let values=result.filter(s=>s.stage===stage);
  if(replaceStages.includes(stage))values=structuredClone(sources);
  else for(const change of changes){const source=sources[change.index];if(!source)continue;const value=values[change.index]||{stage,status:'used'};for(const key of change.fields)if(Object.hasOwn(source,key))value[key]=structuredClone(source[key]);values[change.index]=value;}
  const first=result.findIndex(s=>s.stage===stage),rest=result.filter(s=>s.stage!==stage);rest.splice(first<0?rest.length:first,0,...values.filter(Boolean));result=rest;
 }
 return committedProtocolSteps(result);
}
