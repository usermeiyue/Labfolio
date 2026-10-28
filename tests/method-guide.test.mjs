import test from 'node:test';
import assert from 'node:assert/strict';
import {makeExperiment,duplicateExperiment,confirmWells} from '../web/core.js';
import {ensureGuide,setFact,confirmFact,inheritedFacts,guidePayload,saveTemplate,useTemplate,projectKey,recordAnswers,sourceSignature,guideHtml} from '../web/method-guide.js';

test('older records gain a guide without losing existing methods or results',()=>{
 const e=makeExperiment();e.methodHtml='<p>Keep original</p>';e.results.analysis='original data';ensureGuide(e);assert.equal(e.methodHtml,'<p>Keep original</p>');assert.equal(e.results.analysis,'original data');assert.equal(e.methodGuide.type,'general');
});
test('only verified answers and material metadata become facts, editing revokes confirmation',()=>{
 const e=makeExperiment(),state={lang:'zh'},m={id:'m1',name:'Reagent',manufacturer:'Unverified vendor',confirmed:false};e.materialIds=['m1'];const w=e.plates[0].wells.A1;w.used=true;w.steps=[{materialId:'m1',name:'Reagent'}];
 setFact(e,'treatment','10 µM for 2 h');let r=guidePayload(e,[m],state);assert.equal(r.guide.facts.length,0);assert.equal(r.materials.length,0);assert.equal(r.plates[0].wells[0].steps[0].material,null);
 confirmFact(e,'treatment',true);r=guidePayload(e,[m],state);assert.equal(r.guide.facts[0].text,'10 µM for 2 h');const previous=sourceSignature(r);
 setFact(e,'treatment','20 µM for 2 h');assert.equal(guidePayload(e,[m],state).guide.facts.length,0);assert.notEqual(sourceSignature(guidePayload(e,[m],state)),previous);
});
test('actual mode inherits actual snapshots and preserves clone differences',()=>{
 const e=makeExperiment();const p=e.plates[0];p.defaults.cell='Cells';p.defaults.count='100';for(const pos of ['A1','A2']){p.wells[pos].used=true;p.wells[pos].group=pos==='A1'?'KO clone 1':'KO clone 2';}confirmWells(p,['A1','A2']);p.defaults.count='999';e.methodMode='actual';const facts=inheritedFacts(e,[]);assert.ok(facts.samples.includes('KO clone 1'));assert.ok(facts.samples.includes('KO clone 2'));assert.ok(facts.preparation.includes('100 cells/well'));assert.ok(!facts.preparation.includes('999'));
});
test('templates are snapshots requiring confirmation and duplication clears execution confirmations',()=>{
 const e=makeExperiment(),state={};setFact(e,'measurement','Instrument X');confirmFact(e,'measurement',true);const template=saveTemplate(state,e,'Reusable');const other=makeExperiment();useTemplate(other,template);template.facts.measurement.text='Later edit';assert.equal(other.methodGuide.facts.measurement.text,'Instrument X');assert.equal(other.methodGuide.facts.measurement.confirmed,false);assert.equal(other.methodGuide.template.facts.measurement.text,'Instrument X');const copy=duplicateExperiment(e);assert.equal(copy.methodGuide.facts.measurement.confirmed,false);
});
test('shared project records are explicit and only verified records are included',()=>{
 const a=makeExperiment(),b=makeExperiment();a.project=b.project='Project';const state={methodProjects:{[projectKey(a)]:{culture:'Shared conditions',confirmed:false}}};assert.equal(guidePayload(a,[],state).guide.shared,null);state.methodProjects[projectKey(a)].confirmed=true;assert.equal(guidePayload(b,[],state).guide.shared.culture,'Shared conditions');b.project='Another';assert.equal(guidePayload(b,[],state).guide.shared,null);
});
test('follow-up answers preserve their question and empty replies do not invent facts',()=>{
 const e=makeExperiment();recordAnswers(e,[{question:'How long?',fieldId:'treatment'},{question:'Instrument?'}],['24 h','']);assert.equal(e.methodGuide.answers.length,1);assert.equal(e.methodGuide.answers[0].question,'How long?');assert.equal(guidePayload(e,[],{}).guide.answers[0].answer,'24 h');
});
test('default form has three main questions and keeps advanced questions collapsed',()=>{
 const e=makeExperiment();const html=guideHtml(e,{},[],{esc:s=>String(s??'').replaceAll('<','&lt;'),t:(a,b)=>a,btn:(label,action)=>'<button data-action="'+action+'">'+label+'</button>'});
 const main=html.split('<div class="guide-main">')[1].split('</div><details class="guide-optional">')[0];assert.equal((main.match(/class="guide-question"/g)||[]).length,3);assert.ok(html.includes('数据处理与重复（可后续补充）'));assert.equal(/<details[^>]*open/.test(html),false);
});
