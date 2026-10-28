import test from 'node:test';import assert from 'node:assert/strict';
import {makeExperiment,confirmWells,methodPayload,effectiveWell} from '../web/core.js';
import {upgradeProtocolFields,editableProtocolSteps,committedProtocolSteps} from '../web/protocol-fields.js';
import {saveFavorite,favoritePicker} from '../web/favorites.js';
import {sheetHtml,groupedTreatments} from '../web/print.js';
const t=(_zh,en)=>en,esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
test('legacy medium migrates only to seeding medium; confirmed snapshots never borrow new defaults',()=>{
 const e=makeExperiment(),p=e.plates[0];delete p.defaults.seedingMedium;p.defaults.medium='Old culture medium';p.actual.A1={well:{...p.wells.A1,used:true,medium:'Confirmed culture medium'}};delete p.actual.A1.well.seedingMedium;
 const state={experiments:[e]};upgradeProtocolFields(state);assert.equal(p.defaults.seedingMedium,'Old culture medium');assert.equal(p.defaults.assayMedium,'');assert.equal(p.actual.A1.well.seedingMedium,'Confirmed culture medium');p.defaults.assayMedium='Later assay medium';p.defaults.collectionMethod='Later collection';e.methodMode='actual';const w=methodPayload(e,[]).plates[0].wells[0];assert.equal(w.assayMedium,'');assert.equal(w.collectionMethod,'');const before=JSON.stringify(state);upgradeProtocolFields(state);assert.equal(JSON.stringify(state),before);
});
test('seeding, assay and collection remain separate through plan overrides and execution snapshots',()=>{
 const e=makeExperiment(),p=e.plates[0];Object.assign(p.defaults,{seedingMedium:'Culture recipe',assayMedium:'Assay recipe',collectionMethod:'Recorded harvesting'});p.wells.A1.used=true;p.wells.A1.assayMedium='Well-specific assay recipe';confirmWells(p,['A1']);p.defaults.collectionMethod='Changed collection';e.methodMode='actual';const w=methodPayload(e,[]).plates[0].wells[0];assert.equal(w.seedingMedium,'Culture recipe');assert.equal(w.assayMedium,'Well-specific assay recipe');assert.equal(w.collectionMethod,'Recorded harvesting');assert.equal(effectiveWell(p,p.wells.A1).collectionMethod,'Changed collection');
});
test('empty stage controls do not become facts, and doses and times remain attached to the recorded stage',()=>{
 const legacy={name:'Legacy operation',description:'Unclassified'};const editable=editableProtocolSteps([legacy]);assert.deepEqual(committedProtocolSteps(editable),[legacy]);editable.find(s=>s.stage==='pretreatment').status='used';editable.find(s=>s.stage==='pretreatment').name='Drug X';editable.find(s=>s.stage==='pretreatment').concentration='2';editable.find(s=>s.stage==='pretreatment').unit='µM';editable.find(s=>s.stage==='pretreatment').duration='30 min';editable.find(s=>s.stage==='stimulation').status='used';editable.find(s=>s.stage==='stimulation').name='Stimulus Y';editable.find(s=>s.stage==='stimulation').concentration='10';editable.find(s=>s.stage==='stimulation').duration='1 h';const steps=committedProtocolSteps(editable);assert.equal(steps.length,3);assert.equal(steps[1].stage,'pretreatment');assert.equal(steps[1].duration,'30 min');assert.equal(steps[2].stage,'stimulation');assert.equal(steps[2].concentration,'10');assert.equal(steps[0].stage,undefined);
});
test('sample treatment picker includes saved group, cell and treatment entries and retains its selected value',()=>{
 const state={};saveFavorite(state,{kind:'treatment',name:'My stimulus',value:'Recorded stimulus'});saveFavorite(state,{kind:'cell',name:'My clone',value:'Cell X clone A'});saveFavorite(state,{kind:'group',name:'My group',value:'Group B'});const e=makeExperiment();e.plates[0].wells.A1.group='Recorded stimulus';state.experiments=[e];const html=favoritePicker(state,'group','well:group','Recorded stimulus',{t,esc,btn:label=>label});for(const text of ['My stimulus','My clone','My group'])assert.ok(html.includes(text));assert.ok(html.includes('value="Recorded stimulus" selected'));assert.ok(html.includes('optgroup label="Treatments"'));
});
test('collection methods are reusable, and print distinguishes media with shared details printed once',()=>{
 const e=makeExperiment(),p=e.plates[0],state={experiments:[e]};const item=saveFavorite(state,{kind:'collection',name:'My harvest',value:'Recorded harvest procedure'});Object.assign(p.defaults,{seedingMedium:'Seeding-only recipe',assayMedium:'Assay-only recipe',collectionMethod:item.value});p.wells.A1.used=true;const html=sheetHtml(e,e.plates,{},[],t);for(const value of ['Seeding-only recipe','Assay-only recipe','Recorded harvest procedure'])assert.equal(html.split(value).length-1,1);p.wells.A2.used=true;p.wells.A2.assayMedium='Other assay recipe';assert.equal(groupedTreatments(p).length,2);
});
test('explicit untreated stages discard inactive doses and retain only a matched interval',async()=>{
 const {treatmentTiming,treatmentLines}=await import('../web/protocol-fields.js');
 const steps=committedProtocolSteps([{stage:'pretreatment',status:'none',name:'Inactive drug',concentration:'99',unit:'µM',duration:'1 h'},{stage:'stimulation',status:'used',name:'Stimulus Y',concentration:'10',unit:'ng/mL',duration:'15 min'}]);assert.equal(steps[0].name,undefined);assert.equal(steps[0].concentration,undefined);assert.equal(treatmentTiming({steps,parentGroup:'15min'},t),'Pretreatment 1 h + Stimulation 15 min');assert.deepEqual(treatmentLines({steps},t),['Pretreatment: none','Stimulation: Stimulus Y 10 ng/mL']);
});
test('batch duration changes preserve each well-specific treatment and the other stage',async()=>{
 const {mergeProtocolEdits}=await import('../web/protocol-fields.js');
 const original=[{stage:'pretreatment',status:'used',name:'Drug B',concentration:'5',unit:'µM',duration:'1 h'},{stage:'stimulation',status:'none',duration:'15 min'}];
 const draft=[{stage:'pretreatment',status:'used',name:'Drug A',concentration:'2',unit:'µM',duration:'2 h'},{stage:'stimulation',status:'used',name:'Stimulus Y',concentration:'10',unit:'ng/mL',duration:'30 min'}];
 let merged=mergeProtocolEdits(original,draft,[{stage:'pretreatment',index:0,fields:['duration']}]);assert.equal(merged[0].name,'Drug B');assert.equal(merged[0].concentration,'5');assert.equal(merged[0].duration,'2 h');assert.equal(merged[1].status,'none');assert.equal(merged[1].duration,'15 min');
 merged=mergeProtocolEdits(original,draft,[],['stimulation']);assert.equal(merged[0].name,'Drug B');assert.equal(merged[1].name,'Stimulus Y');assert.equal(merged[1].duration,'30 min');
});
test('batch no-treatment selection clears only the active drug without overwriting matched waiting time',async()=>{
 const {mergeProtocolEdits}=await import('../web/protocol-fields.js');const original=[{stage:'pretreatment',status:'used',name:'Drug B',concentration:'5',unit:'µM',duration:'2 h'}];const draft=[{stage:'pretreatment',status:'none',duration:'1 h'}];const merged=mergeProtocolEdits(original,draft,[{stage:'pretreatment',index:0,fields:['status']}]);assert.deepEqual(merged,[{stage:'pretreatment',status:'none',duration:'2 h'}]);
});
