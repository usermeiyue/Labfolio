import{hasRecordedStages,treatmentTiming,treatmentLines,treatmentLabel}from'./protocol-fields.js';
// Parent conditions are explicit user labels, never inferred from treatment timing.
export const hasLayers=p=>Object.values(p.wells||{}).some(w=>w.used&&(w.parentGroup||hasRecordedStages(w)));
export function layerRows(p,t=(_zh,en)=>en){
 return Array.from({length:p.rows},(_,r)=>{
  const row=String.fromCharCode(65+r),parents=[];
  for(let c=1;c<=p.cols;c++){
   const pos=row+c,w=p.wells[pos],label=w?.used?treatmentTiming(w,t):'',key=w?.used?'used:'+label:'unused';let segment=parents.at(-1);
   if(!segment||segment.key!==key){segment={key,label,start:c,positions:[],children:[]};parents.push(segment)}segment.positions.push(pos);
   const childKey=w?.used?JSON.stringify([treatmentLabel(w,t),w.color||'',w.cell||'',w.count||'',w.volume||'',w.seedingMedium||w.medium||'',w.assayMedium||'',w.collectionMethod||'',w.endpoint||'',w.notes||'',w.steps||[]]):'empty:'+pos;
   let child=segment.children.at(-1);if(!child||child.key!==childKey){child={key:childKey,well:w,positions:[]};segment.children.push(child)}child.positions.push(pos);
  }
  return{row,parents};
 });
}
export function layerTable(p,{t,esc,interactive=false,selected=new Set()}={}){
 const range=(positions,label,cl)=>interactive?'<button type="button" class="'+cl+(positions.some(x=>selected.has(x))?' is-selected':'')+'" data-action="layerRange" data-positions="'+positions.join(',')+'">'+label+'</button>':'<div class="'+cl+'">'+label+'</div>';
 const tint=c=>/^#[\da-f]{6}$/i.test(c||'')?c:'#f4f6ef';
 return '<div class="layers-order small">'+t('孔内上行：预处理；下行：刺激','Inside each well: pretreatment above, stimulation below')+'</div><table class="layers-map" aria-label="'+esc(t('双层孔板计划','Two-level plate plan'))+'"><colgroup><col style="width:24px">'+Array.from({length:p.cols},()=>'<col>').join('')+'</colgroup><thead><tr><th></th>'+Array.from({length:p.cols},(_,i)=>'<th>'+(i+1)+'</th>').join('')+'</tr></thead><tbody>'+layerRows(p,t).map(({row,parents})=>'<tr class="layers-parent-row"><th rowspan="2">'+row+'</th>'+parents.map(s=>'<td colspan="'+s.positions.length+'">'+range(s.positions,esc(s.label)||(interactive?t('设置共同条件','Set shared condition'):'—'),'layers-parent')+'</td>').join('')+'</tr><tr class="layers-child-row">'+parents.flatMap(s=>s.children).map(c=>'<td colspan="'+c.positions.length+'" style="--layer-color:'+tint(c.well?.color)+'">'+range(c.positions,(c.well?.used?(treatmentLines(c.well,t,true).map(esc).join('<br>')||t('未填写处理','Treatment not recorded')):'—')+(interactive?'<small>'+c.positions[0]+(c.positions.length>1?'–'+c.positions.at(-1):'')+'</small>':''),'layers-child')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
}
