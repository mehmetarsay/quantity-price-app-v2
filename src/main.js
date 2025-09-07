import { toCSV, parseCSV } from './csv.js';
import { save, load } from './state.js';
import { addRow, addRowsBulk, clearAll, collectRows, updateGrandTotal, updateProductCount, updateRowNumbers, moveEmptyRowsToBottom } from './dom.js';

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

async function importCSV(e){
  const files = Array.from(e.target.files || []);
  if(!files.length) return;
  
  const loadingOverlay = document.getElementById('loadingOverlay');
  const fileCounter = document.getElementById('fileCounter');
  const currentFileName = document.getElementById('currentFileName');
  const progressFillLarge = document.getElementById('progressFillLarge');
  const progressTextLarge = document.getElementById('progressTextLarge');
  
  loadingOverlay.style.display = 'flex';
  
  let totalRows = 0;
  let processedRows = 0;
  let currentFileIndex = 0;
  
  try {
    // Tüm dosyaları sırayla oku; satırları topla
    const allRows = [];
    for(const file of files){
      const content = await readFileAsText(file);
      const rows = parseCSV(content);
      currentFileName.textContent = file.name;
      allRows.push(...rows);
      totalRows += rows.length;
      fileCounter.textContent = `${files.indexOf(file)+1}/${files.length}`;
    }
    
    if(totalRows === 0) {
      alert('CSV dosyaları boş veya hatalı.');
      loadingOverlay.style.display = 'none';
      return;
    }
    
    // Tek seferde hızlı ekle
    progressTextLarge.textContent = 'Satırlar ekleniyor...';
    addRowsBulk(allRows);
    processedRows = totalRows;
    const percentage = Math.round((processedRows / totalRows) * 100);
    progressFillLarge.style.width = `${percentage}%`;
    progressTextLarge.textContent = `${processedRows}/${totalRows} satır eklendi`;
    
    // Final güncellemeler
    persist();
    progressTextLarge.textContent = `${totalRows} satır başarıyla içe aktarıldı!`;
    currentFileName.textContent = 'Tamamlandı!';
    
    // 1 saniye sonra loading'i gizle
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
      progressFillLarge.style.width = '0%';
    }, 1000);
    
  } catch(err) {
    console.error(err);
    alert('CSV içe aktarımında hata: ' + err.message);
    loadingOverlay.style.display = 'none';
  }
  
  // File input'u temizle
  e.target.value = '';
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsText(file, 'utf-8');
  });
}

(function init(){
  // Her zaman başlangıçta 20 satırla başla
  clearAll();
  for(let i = 0; i < 20; i++){
    addRow();
  }
  updateGrandTotal();
  updateProductCount();
  updateRowNumbers();
  updateStickyOffsets();
})();
