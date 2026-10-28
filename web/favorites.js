import {uid} from './core.js';
export const favoriteKinds={
 medium:{zh:'培养基与配方',en:'Media & recipes',examples:['DMEM','RPMI 1640','DMEM/F-12','IMDM','MEM','Opti-MEM']},
 cell:{zh:'细胞系与样本',en:'Cells & samples',examples:['HEK293T','HeLa','THP-1','RAW 264.7','A549','Jurkat','BMDM','hMDM','iPSC-MDM']},
 group:{zh:'分组与基因型',en:'Groups & genotypes',examples:['Control','Vehicle','WT','KO']},
 treatment:{zh:'处理名称',en:'Treatments',examples:['LPS','TNF-α','IFN-γ','Doxycycline']},
 endpoint:{zh:'检测终点',en:'Readouts',examples:['ECAR','OCR','IL-1β secretion','Protein expression','Gene expression','Cell viability']},
 method:{zh:'检测方法',en:'Methods',examples:['Glycolytic stress test','Western blot','qPCR','ELISA','Flow cytometry','Immunofluorescence']},
 collection:{zh:'收样方法',en:'Collection methods',examples:['Cell lysis','Supernatant collection','Cell harvesting','RNA extraction']},
 project:{zh:'所属项目',en:'Projects',examples:[]}
};
export const savedFavorites=(state,kind,archived=false)=>(Array.isArray(state.favorites)?state.favorites:[]).filter(x=>x.kind===kind&&!!x.archived===archived);
export function saveFavorite(state,{id,kind,name,value}){
 if(!Object.hasOwn(favoriteKinds,kind))throw Error('Unknown list');
 name=String(name||'').trim();value=String(value||'').trim()||name;
 if(!name||name.length>160||!value||value.length>6000)throw Error('Enter a name (up to 160 characters) and text (up to 6000 characters).');
 state.favorites??=[];
 if(state.favorites.some(x=>x.id!==id&&x.kind===kind&&!x.archived&&x.name.toLowerCase()===name.toLowerCase()))throw Error('A saved entry already has this name. Edit that entry or choose another name.');
 const existing=id?state.favorites.find(x=>x.id===id):null;
 if(id&&!existing)throw Error('Saved entry not found');
 const item={id:existing?.id||uid(),kind,name,value,archived:false,updatedAt:new Date().toISOString()};
 if(existing)Object.assign(existing,item);else state.favorites.push(item);
 return item;
}
export function archiveFavorite(state,id,archived=true){const item=state.favorites?.find(x=>x.id===id);if(item){if(!archived&&state.favorites.some(x=>x.id!==id&&x.kind===item.kind&&!x.archived&&x.name.toLowerCase()===item.name.toLowerCase()))throw Error('An active entry already has this name. Rename it before restoring.');item.archived=archived;}}
export function favoriteChoices(state,kind){
 if(!Object.hasOwn(favoriteKinds,kind))return[];
 const recent=[];for(const e of state.experiments||[]){if(kind==='project')recent.push(e.project);if(kind==='method')recent.push(e.methodFill?.name);for(const p of e.plates||[]){if(kind==='cell')recent.push(p.defaults?.cell);if(kind==='medium')recent.push(p.defaults?.seedingMedium,p.defaults?.assayMedium,p.defaults?.medium);if(kind==='collection')recent.push(p.defaults?.collectionMethod);for(const w of [...Object.values(p.wells||{}),...Object.values(p.actual||{}).map(x=>x.well)].filter(Boolean)){if(['cell','group','endpoint'].includes(kind))recent.push(w[kind]);if(kind==='medium')recent.push(w.seedingMedium,w.assayMedium,w.medium);if(kind==='collection')recent.push(w.collectionMethod);if(kind==='treatment')recent.push(...(w.steps||[]).map(s=>s.name||s.materialName));}}}
 const options=[...savedFavorites(state,kind).map(x=>({value:x.value,label:x.name,source:'saved'})),...recent.filter(x=>typeof x==='string'&&x.trim()).map(x=>({value:x.trim(),label:x.trim(),source:'record'})),...favoriteKinds[kind].examples.map(x=>({value:x,label:x,source:'example'}))];
 const seen=new Set();return options.filter(x=>{const key=x.value.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).slice(0,150);
}
export function favoritePicker(state,kind,target,current,{esc,t,btn}){
 const kinds=target==='well:group'?['group','cell','treatment']:[kind],seen=new Set();
 const merged=kinds.flatMap(k=>favoriteChoices(state,k).map(x=>({...x,kind:k}))).sort((a,b)=>(a.source==='saved'?0:1)-(b.source==='saved'?0:1)).filter(x=>{const key=x.value.toLowerCase();if(seen.has(key))return false;seen.add(key);return true});
 const sections=kinds.map(k=>({kind:k,options:merged.filter(x=>x.kind===k)}));
 const label=t('选择常用'+favoriteKinds[kind].zh,'Choose '+favoriteKinds[kind].en.toLowerCase());
 const opts=options=>options.map(x=>'<option value="'+esc(x.value)+'" '+(current&&x.value===current?'selected':'')+'>'+esc(x.label)+(x.source==='saved'?' ★':x.source==='record'?' ↶':'')+'</option>').join('');
 return '<span class="favorite-picker"><select data-favorite-kind="'+kind+'" data-favorite-target="'+esc(target)+'" aria-label="'+esc(label)+'"><option value="">'+t('从常用列表选择…','Choose from a list…')+'</option>'+sections.map(x=>kinds.length>1?'<optgroup label="'+esc(t(favoriteKinds[x.kind].zh,favoriteKinds[x.kind].en))+'">'+opts(x.options)+'</optgroup>':opts(x.options)).join('')+'</select>'+btn(t('存为常用','Save entry'),'favoriteNew','quiet',`data-kind="${kind}" data-favorite-current="${esc(target)}" data-value="${esc(current||'')}"`)+btn(t('管理','Manage'),'favoriteManage','quiet',`data-kind="${kind}"`)+'</span>';
}
