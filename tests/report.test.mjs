import test from 'node:test';
import assert from 'node:assert/strict';
import {makeExperiment,confirmWells} from '../web/core.js';
import {reportHtml} from '../web/report.js';
test('report shows plan map, Methods and results without detailed treatment, execution or materials sections',()=>{
 const e=makeExperiment('R848 with TPCA-1'),p=e.plates[0];p.defaults.cell='BMDM';p.defaults.count='100000';
 for(const [pos,sample] of [['A1','mouse-1'],['A2','mouse-2']])Object.assign(p.wells[pos],{used:true,sample,steps:[{stage:'stimulation',name:'R848',concentration:'1',unit:'µg/mL',duration:'15 min'}]});
 confirmWells(p,['A1']);p.defaults.count='200000';p.wells.A1.steps[0].duration='30 min';
 e.materialIds=['m'];e.materialSnapshots.m={name:'R848 original vendor',manufacturer:'Original'};
 e.methodHtml='<p>Accepted manuscript paragraph</p>';e.results.observations='Increased signal';e.results.analysis='Normalized to control';e.results.conclusion='Supports the hypothesis';e.results.next='Independent repeat';e.results.attachments=[{id:'photo',name:'Result image',type:'image/png',description:'Quantification'}];
 const before=JSON.stringify(e),html=reportHtml(e,[{id:'m',name:'Changed library entry'}],{sanitize:x=>x});
 for(const text of ['200000','15 min','30 min','Accepted manuscript paragraph','Increased signal','Normalized to control','Supports the hypothesis','Independent repeat','data-file="photo"'])assert.ok(html.includes(text),text);
 for(const text of ['id="report-actual"','id="report-materials"','href="#report-actual"','href="#report-materials"','Treatment &amp; duration','report-table','R848 original vendor','Changed library entry'])assert.ok(!html.includes(text),text);assert.ok(html.includes('report-plate-map'));assert.equal(JSON.stringify(e),before);
 assert.ok(html.indexOf('report-plan')<html.indexOf('report-methods'));
});
test('empty report has useful sections and escapes plain text without inventing results',()=>{const e=makeExperiment('<img onerror=alert(1)>');const html=reportHtml(e);assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img onerror'));for(const id of ['basic','plan','methods','results'])assert.ok(html.includes('id="report-'+id+'"'));assert.ok(html.includes('Not recorded yet'));assert.ok(!html.includes('wells have confirmed execution'));});
test('printable report retains all long content in reading order without bench sheets or editing controls',()=>{const e=makeExperiment('Full record');e.methodHtml='<p>Recorded method</p>';e.results.analysis='Analysis start\n'+'Complete paragraph.\n'.repeat(200)+'Analysis end';const html=reportHtml(e,[],{print:true,sanitize:x=>x});assert.ok(html.startsWith('<article class="experiment-report report-print">'));assert.ok(html.endsWith('</article>'));for(const text of ['Recorded method','Analysis start','Analysis end','report-plate-map'])assert.ok(html.includes(text));for(const text of ['data-action=','report-nav','one-page-sheet','sheet-inner','print-appendices'])assert.ok(!html.includes(text),text);const ids=['basic','plan','methods','results'].map(x=>html.indexOf('id="report-'+x+'"'));assert.deepEqual([...ids].sort((a,b)=>a-b),ids);});
