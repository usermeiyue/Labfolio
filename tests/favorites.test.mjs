import test from 'node:test';
import assert from 'node:assert/strict';
import {makeExperiment,confirmWells,effectiveWell,methodPayload,validateBackup} from '../web/core.js';
import {favoriteChoices,saveFavorite,savedFavorites,archiveFavorite,favoritePicker} from '../web/favorites.js';
test('media recipes and cells are reusable plain-text snapshots, not live links',()=>{
 const e=makeExperiment(),state={experiments:[e],materials:[]},m=saveFavorite(state,{kind:'medium',name:'My complete medium',value:'DMEM + recorded supplements'});e.plates[0].defaults.medium=m.value;e.plates[0].wells.A1.used=true;confirmWells(e.plates[0],['A1']);saveFavorite(state,{id:m.id,kind:'medium',name:m.name,value:'Revised recipe'});assert.equal(effectiveWell(e.plates[0],e.plates[0].wells.A1).medium,'DMEM + recorded supplements');e.methodMode='actual';assert.equal(methodPayload(e,[]).plates[0].wells[0].medium,'DMEM + recorded supplements');assert.equal(favoriteChoices(state,'medium')[0].value,'Revised recipe');archiveFavorite(state,m.id);assert.equal(savedFavorites(state,'medium').length,0);archiveFavorite(state,m.id,false);assert.equal(savedFavorites(state,'medium').length,1);
});
test('saved entries take priority over deduplicated record values and name shortcuts',()=>{
 const e=makeExperiment(),state={experiments:[e]};e.plates[0].defaults.cell='HEK293T';saveFavorite(state,{kind:'cell',name:'My HEK293T',value:'HEK293T'});assert.equal(favoriteChoices(state,'cell').filter(x=>x.value==='HEK293T').length,1);assert.equal(favoriteChoices(state,'cell')[0].source,'saved');assert.throws(()=>saveFavorite(state,{kind:'cell',name:'my hek293t',value:'Other'}));assert.throws(()=>saveFavorite(state,{kind:'unknown',name:'bad'}));assert.equal(e.plates[0].defaults.medium,'');
});
test('full backups retain reusable lists and legacy backups remain accepted',()=>{
 const state={experiments:[makeExperiment()],materials:[]},backup={format:'labfolio-backup',version:1,state,attachments:[]};assert.equal(validateBackup(backup).state,state);saveFavorite(state,{kind:'medium',name:'Custom medium',value:'Recorded composition'});const restored=validateBackup(JSON.parse(JSON.stringify(backup)));assert.equal(restored.state.favorites[0].value,'Recorded composition');state.favorites={bad:true};assert.throws(()=>validateBackup(backup));
});
test('picker escapes recipe HTML and shows complete selectable text without applying defaults',()=>{
 const state={};saveFavorite(state,{kind:'medium',name:'A < B',value:'Recipe "X" <script>'});const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');const html=favoritePicker(state,'medium','plate.defaults.medium','',{esc,t:(_zh,en)=>en,btn:label=>label});assert.ok(html.includes('Recipe &quot;X&quot; &lt;script>'));assert.ok(html.includes('A &lt; B'));assert.equal(html.includes(' selected'),false);
});
