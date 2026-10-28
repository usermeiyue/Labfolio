import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const source='https://www.cellsignal.com/learn-and-support/protocols/protocol-western';
const result={heading:'Immunoblotting',methodType:'western',note:'Official protocol structure',sources:[{title:'CST protocol',url:source,reason:'Official source'}],fields:[{id:'load',label:'上样量',unit:'µg',referenceValue:'20',recordKey:''}],lines:[{id:'loading',label:'上样',parts:[{text:'上样 '},{field:'load'},{text:'。'}],optional:false}]};
const request=(body)=>new Request('https://example.test/api/method-template',{method:'POST',headers:{'content-type':'application/json','oai-authenticated-user-id':'test-user'},body:JSON.stringify(body)});
const env={OPENAI_API_KEY:'fake-key',SITES_AUTH_ENABLED:'1'};
const response=(data,search=true)=>new Response(JSON.stringify({output:[...(search?[{type:'web_search_call',status:'completed',action:{sources:[{url:source,title:'CST protocol'}]}}]:[]),{type:'message',content:[{type:'output_text',text:JSON.stringify(data)}]}]}));
test('automatic reference search requires web search and verifies returned source URLs',async()=>{
 const old=globalThis.fetch;let sent;globalThis.fetch=async(_url,opts)=>{sent=JSON.parse(opts.body);return response(result);};
 try{const r=await worker.fetch(request({name:'Western blot',mode:'search',context:{cell:'Cell X',groups:'Private clone',purpose:'Private aim',materials:[{name:'Antibody',catalog:'Private stock'}]}}),env);const d=await r.json();assert.equal(r.status,200);assert.equal(sent.tools[0].type,'web_search');assert.equal(sent.tool_choice,'required');assert.deepEqual(sent.include,['web_search_call.action.sources']);assert.equal(sent.input.includes('Private'),false);assert.equal(d.sources[0].url,source);assert.equal(d.fields[0].value,undefined);assert.equal(d.fields[0].referenceValue,'20');}finally{globalThis.fetch=old;}
});
test('a template with invented or unsearched sources is rejected rather than labelled searched',async()=>{
 const old=globalThis.fetch;
 try{globalThis.fetch=async()=>response({...result,sources:[{title:'Fabrication',url:'https://www.nature.com/fake-protocol'}]});let r=await worker.fetch(request({name:'Western blot'}),env);assert.equal(r.status,502);globalThis.fetch=async()=>response(result,false);r=await worker.fetch(request({name:'Western blot'}),env);assert.equal(r.status,502);}finally{globalThis.fetch=old;}
});
test('pasted text and screenshot import uses vision without web search or false citations',async()=>{
 const old=globalThis.fetch;let sent;globalThis.fetch=async(_url,opts)=>{sent=JSON.parse(opts.body);return response(result,false);};
 try{const r=await worker.fetch(request({name:'Western blot',mode:'reference',referenceText:'User-provided reference',images:['data:image/png;base64,dGVzdA==']}),env);const d=await r.json();assert.equal(r.status,200);assert.equal(sent.tools,undefined);assert.equal(sent.input[0].content[1].type,'input_image');assert.equal(d.sources[0].url,'');assert.equal(d.sources[0].title,'用户提供的方法范例');}finally{globalThis.fetch=old;}
});
test('empty reference imports and malformed field relationships fail safely',async()=>{
 const old=globalThis.fetch;
 try{let calls=0;globalThis.fetch=async()=>{calls++;return response(result);};let r=await worker.fetch(request({name:'WB',mode:'reference'}),env);assert.equal(r.status,400);assert.equal(calls,0);globalThis.fetch=async()=>response({...result,lines:[{id:'line',label:'Broken',parts:[{field:'missing'}]}]});r=await worker.fetch(request({name:'WB'}),env);assert.equal(r.status,502);}finally{globalThis.fetch=old;}
});
test('template guards reject culture-to-lysis mapping, ambiguous reference hints and duplicated units',async()=>{
 const old=globalThis.fetch;
 globalThis.fetch=async()=>response({...result,fields:[{id:'lysis_volume',label:'每孔裂解体积',recordKey:'volume',unit:'µL',referenceValue:'通常 100 或 200'},{id:'time',label:'孵育时间',unit:'h',referenceValue:'1'}],lines:[{id:'lysis',label:'裂解',parts:[{text:'体积 '},{field:'lysis_volume'}]},{id:'incubation',label:'孵育',parts:[{text:'孵育 '},{field:'time'},{text:' h。'}]}]});
 try{const r=await worker.fetch(request({name:'Western blot'}),env);const d=await r.json();assert.equal(r.status,200);assert.equal(d.fields[0].recordKey,'');assert.equal(d.fields[0].referenceValue,'');assert.equal(d.fields[1].unit,'h');assert.equal(d.lines[1].parts[2].text,'。');}finally{globalThis.fetch=old;}
});
test('one fixed reference sentence no longer rejects the editable template or becomes an experiment fact',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>response({...result,fields:[...result.fields,{id:'unused',label:'Unused'}],lines:[...result.lines,{id:'fixed',label:'平衡步骤',parts:[{text:'Reference-only incubation statement.'}],optional:false}]});
 try{const r=await worker.fetch(request({name:'glycolytic stress test in HEK293T cells'}),env),d=await r.json();assert.equal(r.status,200);assert.equal(d.lines.length,1);assert.equal(d.fields.length,1);assert.equal(d.excludedLines[0].label,'平衡步骤');assert.equal(d.sources[0].url,source);}finally{globalThis.fetch=old;}
});
test('failed template formatting still returns verified search sources',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>response({...result,lines:[{id:'fixed',label:'Fixed',parts:[{text:'Not an editable sentence.'}]}]});
 try{const r=await worker.fetch(request({name:'Glycolytic stress test'}),env),d=await r.json();assert.equal(r.status,502);assert.equal(d.searchCompleted,true);assert.equal(d.sources[0].url,source);assert.ok(d.error.includes('没有生成可填写'));}finally{globalThis.fetch=old;}
});
test('a reusable variable can appear in multiple sentences',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>response({...result,lines:[...result.lines,{id:'again',label:'Repeat',parts:[{text:'The same recorded value: '},{field:'load'}]}]});
 try{const r=await worker.fetch(request({name:'WB'}),env),d=await r.json();assert.equal(r.status,200);assert.equal(d.lines.length,2);}finally{globalThis.fetch=old;}
});
test('selected interface language reaches text and image templates and localizes reference attribution',async()=>{
 const old=globalThis.fetch;let sent;globalThis.fetch=async(_url,opts)=>{sent=JSON.parse(opts.body);return response(result,false);};
 try{for(const language of ['en','zh']){for(const images of [[],['data:image/png;base64,dGVzdA==']]){const r=await worker.fetch(request({name:'Western blot',mode:'reference',referenceText:'Example method',images,reviewLanguage:language}),env),d=await r.json();assert.equal(r.status,200);const input=typeof sent.input==='string'?JSON.parse(sent.input):JSON.parse(sent.input[0].content[0].text);assert.equal(input.reviewLanguage,language);assert.equal(d.sources[0].title,language==='en'?'User-provided method reference':'用户提供的方法范例');assert.equal(sent.tools,undefined);}}}finally{globalThis.fetch=old;}
});
