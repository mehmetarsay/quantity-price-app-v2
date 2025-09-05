const LS_KEY = 'qty_price_rows_v4';
export function save(rows){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(rows)); }catch(_){}
}
export function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch(_){ return []; }
}
