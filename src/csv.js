export function toCSV(rows){
  const header = ['AD','Adet','Koli','Gr/L','Fiyat','Tutar'];
  const escape = (s) => /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  const lines = [header.join(',')];
  for(const r of rows){
    lines.push([r.ad, r.adet, r.koli, r.grl, r.fiyat, r.tutar].map(v => escape(String(v ?? ''))).join(','));
  }
  return lines.join('\n');
}
export function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(Boolean);
  if(!lines.length) return [];
  const out = [];
  for(let i=1;i<lines.length;i++){
    const row = [];
    let cur = '', inQ = false, line = lines[i];
    for(let j=0;j<line.length;j++){
      const ch = line[j];
      if(ch === '"'){
        if(inQ && line[j+1] === '"'){ cur += '"'; j++; }
        else inQ = !inQ;
      }else if(ch === ',' && !inQ){
        row.push(cur); cur='';
      }else cur += ch;
    }
    row.push(cur);
    const [ad, adet, koli, grl, fiyat] = row;
    out.push({ ad: ad||'', adet: adet||'', koli: koli||'1', grl: grl||'', fiyat: fiyat||'' });
  }
  return out;
}
