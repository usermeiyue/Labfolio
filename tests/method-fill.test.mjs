import test from 'node:test';
import assert from 'node:assert/strict';
import {makeExperiment,duplicateExperiment} from '../web/core.js';
import {guidePayload} from '../web/method-guide.js';
import {applyFillTemplate,fillState,editFill,confirmFilledLines,fillFacts,skipFillLine,renderLineText,saveFillTemplate,loadFillTemplate,searchContext,fillHtml} from '../web/method-fill.js';
const template={heading:'Immunoblotting',methodType:'western',sources:[{title:'Official protocol',url:'https://www.cellsignal.com/learn-and-support/protocols/protocol-western'}],fields:[{id:'cell',label:'细胞',recordKey:'cell',unit:'',referenceValue:'Reference cells'},{id:'amount',label:'上样量',unit:'µg',referenceValue:'20'},{id:'membrane',label:'膜',unit:'',options:['PVDF','NC']}],lines:[{id:'sample',label:'样本',parts:[{field:'cell'},{text:' cells were used.'}]},{id:'loading',label:'上样',parts:[{text:'Protein loading: '},{field:'amount'}]},{id:'transfer',label:'转膜',parts:[{text:'Membrane: '},{field:'membrane'}]}]};
test('reference values never auto-fill actual conditions, only unique record values are carried',()=>{
 const e=makeExperiment();applyFillTemplate(e,template,{cell:'Actual cells'});const f=fillState(e);assert.equal(f.fields[0].value,'Actual cells');assert.equal(f.fields[1].value,'');assert.equal(fillFacts(e).sentences.length,0);assert.equal(guidePayload(e,[],{}).guide.fill.sentences.length,0);
});
test('only complete explicitly confirmed sentences become facts, with correct units',()=>{
 const e=makeExperiment();applyFillTemplate(e,template,{cell:'Actual cells'});editFill(e,'amount','10');const facts=confirmFilledLines(e);assert.equal(facts.sentences.length,2);assert.equal(facts.sentences[1].text,'Protein loading: 10 µg');assert.equal(facts.missing.length,1);editFill(e,'amount','12 µg');assert.equal(fillFacts(e).sentences.length,1);confirmFilledLines(e);assert.equal(renderLineText(fillState(e),fillState(e).lines[1]),'Protein loading: 12 µg');
});
test('not used and unknown steps cannot enter manuscript facts',()=>{
 const e=makeExperiment();applyFillTemplate(e,template,{cell:'Actual cells'});editFill(e,'amount','20');skipFillLine(e,'loading','not_used');skipFillLine(e,'transfer','unknown');const facts=confirmFilledLines(e);assert.equal(facts.sentences.length,1);assert.deepEqual(facts.notUsed,['上样']);assert.equal(facts.missing[0].id,'transfer');
});
test('templates and duplicate experiments require fresh confirmation and preserve snapshots',()=>{
 const e=makeExperiment(),state={};applyFillTemplate(e,template,{cell:'Old cells'});confirmFilledLines(e);const t=saveFillTemplate(state,e,'My template');const n=makeExperiment();loadFillTemplate(n,t,{cell:'New cells'});assert.equal(fillState(n).fields[0].value,'New cells');assert.equal(fillFacts(n).sentences.length,0);t.fill.fields[0].value='Edited';assert.equal(fillState(n).fields[0].value,'New cells');assert.equal(fillFacts(duplicateExperiment(e)).sentences.length,0);
});
test('search context does not include research aims, results or clone labels in provider payload context',()=>{
 const e=makeExperiment();e.purpose='Private aim';e.results.analysis='Private result';const p=e.plates[0];p.wells.A1.used=true;p.wells.A1.group='Clone label';p.defaults.cell='Cell X';const c=searchContext(e,[]);assert.equal(c.cell,'Cell X');assert.equal(c.purpose,undefined);assert.equal(c.results,undefined);
});
test('UI renders sentence blanks, visible sources and an unselected reference hint',()=>{
 const e=makeExperiment();applyFillTemplate(e,template,{cell:'Actual cells'});const html=fillHtml(e,{},[],{esc:x=>String(x??'').replaceAll('<','&lt;'),t:(zh,en)=>zh,btn:(label,a)=>'<button data-action="'+a+'">'+label+'</button>'});assert.ok(html.includes('data-fill-field="amount" value=""'));assert.ok(html.includes('参考：20'));assert.ok(html.includes('fill-source-inline'));assert.ok(!html.includes('检测前怎样准备'));
});
test('fixed-only reference descriptions remain outside facts and failure sources are visible',async()=>{
 const {failedSearchHtml}=await import('../web/method-fill.js');const e=makeExperiment();applyFillTemplate(e,{...template,excludedLines:[{label:'Incubation',text:'Reference condition only',optional:false}]},{cell:'Actual cells'});const facts=confirmFilledLines(e);assert.ok(facts.missing.some(x=>x.label.includes('Incubation')));assert.ok(!JSON.stringify(facts.sentences).includes('Reference condition only'));const html=failedSearchHtml({error:'Template error',failedSearch:{sources:[{title:'Verified source',url:'https://www.agilent.com/example'}]}},{esc:x=>String(x),t:(a,b)=>a});assert.ok(html.includes('Verified source'));assert.ok(html.includes('模板未生成成功'));assert.ok(html.includes('href="https://www.agilent.com/example"'));
});
test('switching interface language preserves saved sentence answers and discloses their original language',()=>{
 const e=makeExperiment('保留我的实验');applyFillTemplate(e,{...template,language:'zh'},{cell:'My cells'});editFill(e,'amount','15');const before=structuredClone(e.methodFill);const html=fillHtml(e,{lang:'en',methodTemplates:[]},[],{esc:s=>String(s??''),t:(_zh,en)=>en,btn:label=>label});assert.ok(html.includes('The saved form keeps its original language and answers'));assert.deepEqual(e.methodFill,before);assert.equal(e.title,'保留我的实验');
});
