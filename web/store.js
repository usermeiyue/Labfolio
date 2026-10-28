let db;
export async function openDB(){db=await new Promise((resolve,reject)=>{const r=indexedDB.open('labfolio-v1',1);r.onupgradeneeded=()=>{r.result.createObjectStore('main');r.result.createObjectStore('files',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return db}
function tx(store,mode,fn){return new Promise((resolve,reject)=>{const t=db.transaction(store,mode),s=t.objectStore(store);let result;try{const req=fn(s);if(req)req.onsuccess=()=>result=req.result}catch(e){reject(e);return}t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Storage aborted'))})}
export const loadState=()=>tx('main','readonly',s=>s.get('state'));
export const saveState=state=>tx('main','readwrite',s=>s.put(structuredClone(state),'state'));
export const putFile=file=>tx('files','readwrite',s=>s.put(file));
export const getFile=id=>tx('files','readonly',s=>s.get(id));
export const allFiles=()=>tx('files','readonly',s=>s.getAll());
export async function restoreBackup(backup){return new Promise((resolve,reject)=>{const t=db.transaction(['main','files'],'readwrite');t.objectStore('main').put(backup.state,'state');const files=t.objectStore('files');files.clear();for(const f of backup.attachments)files.put(f);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)})}
