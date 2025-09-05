import { toCSV, parseCSV } from './csv.js';
import { save, load } from './state.js';
import { addRow, clearAll, collectRows, updateGrandTotal } from './dom.js';

const addRowBtn = document.getElementById('addRowBtn');
const add10Btn = document.getElementById('add10Btn');
const clearBtn = document.getElementById('clearBtn');
const addRowBottom = document.getElementById('addRowBottom');
const downloadBtn = document.getElementById('downloadBtn');
const fileInput = document.getElementById('csvFile');
const appHeader = document.getElementById('appHeader');
const tableHead = document.getElementById('tableHead');

function updateStickyOffsets(){
  const headH = appHeader.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--sticky-top', `${headH + 6}px`);

  // table head height -> rows padding-top
  // Use actual rendered height so first data row never hides beneath it
  const thH = tableHead.getBoundingClientRect().height;
  // Add extra padding to ensure first row is clearly visible
  document.documentElement.style.setProperty('--head-h', `${thH + 16}px`);
}

// Make updateStickyOffsets and addRow globally accessible
window.updateStickyOffsets = updateStickyOffsets;
window.addRow = addRow;
window.addEventListener('resize', updateStickyOffsets);
window.addEventListener('orientationchange', updateStickyOffsets);
document.addEventListener('visibilitychange', updateStickyOffsets);
new ResizeObserver(updateStickyOffsets).observe(appHeader);
new ResizeObserver(updateStickyOffsets).observe(tableHead);
updateStickyOffsets();

addRowBtn.addEventListener('click', ()=> { addRow(); persist(); });
addRowBottom.addEventListener('click', ()=> { addRow(); persist(); });
add10Btn.addEventListener('click', ()=> { for(let i=0;i<10;i++) addRow(); persist(); });
clearBtn.addEventListener('click', ()=> { clearAll(); persist(); });
downloadBtn.addEventListener('click', ()=> downloadCSV());
fileInput.addEventListener('change', importCSV);

// Auto-save on changes
const observer = new MutationObserver(()=> persist());
observer.observe(document.getElementById('rows'), { childList:true, subtree:true });

function persist(){
  save(collectRows());
}

function downloadCSV(){
  const csv = toCSV(collectRows());
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `urunler_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCSV(e){
  const file = e.target.files?.[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const rows = parseCSV(String(reader.result||''));
      if(!rows.length){ alert('CSV boş veya hatalı.'); return; }
      clearAll();
      rows.forEach(r => addRow(r));
      persist();
      updateGrandTotal();
      updateStickyOffsets();
    }catch(err){
      console.error(err);
      alert('CSV içe aktarımında hata.');
    }
  };
  reader.readAsText(file, 'utf-8');
}

(function init(){
  // Her zaman başlangıçta 20 satırla başla
  clearAll();
  for(let i = 0; i < 20; i++){
    addRow();
  }
  updateGrandTotal();
  updateStickyOffsets();
})();
