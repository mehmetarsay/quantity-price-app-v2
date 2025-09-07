import { safeNum, fmt, focusNext } from './utils.js';

const rowsEl = document.getElementById('rows');
const tmpl = document.getElementById('rowTemplate');
const grandTotalEl = document.getElementById('grandTotal');
const productCountEl = document.getElementById('productCount');

function attachKeyNav(row){
  row.querySelectorAll('input.cell').forEach((el)=>{
    if(el.readOnly) return;
    
    el.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Enter' || ev.key === 'Tab'){
        ev.preventDefault();
        focusNext(el);
      }
    });
    
    // 0 değeri olan alanlara tıklandığında tüm metni seç
    el.addEventListener('focus', (ev)=>{
      if(el.value === '0' || el.value === '0.00'){
        setTimeout(() => {
          el.select();
        }, 0);
      }
    });
  });
}

export function addRow(initial){
  const node = tmpl.content.cloneNode(true);
  const row = node.querySelector('.row');

  row.addEventListener('input', (e)=> {
    const f = e.target.dataset.field;
    if(f === 'adet' || f === 'koli' || f === 'fiyat'){
      updateRowTotal(row);
      updateGrandTotal();
    }
  });

  row.querySelector('.remove').addEventListener('click', ()=>{
    row.remove();
    updateGrandTotal();
    updateProductCount();
    moveEmptyRowsToBottom();
  });

  rowsEl.appendChild(node);
  const inserted = rowsEl.lastElementChild;
  attachKeyNav(inserted);
  if(initial) setInputs(inserted, initial);
  updateRowTotal(inserted);
  updateGrandTotal();
  updateProductCount();
  // Eğer yeni eklenen satır dolu ise boş satırları en aşağıya taşı
  if(initial && (initial.ad || initial.adet || initial.koli || initial.grl || initial.fiyat)) {
    moveEmptyRowsToBottom();
  }

  const f = inserted.querySelector('[data-field="ad"]');
  f && f.focus();
  
  // Update sticky offsets after adding a row to ensure proper positioning
  setTimeout(() => {
    if (window.updateStickyOffsets) {
      window.updateStickyOffsets();
    }
  }, 0);
}

// Birden fazla satırı tek seferde ve hızlı şekilde ekler
export function addRowsBulk(initialRows){
  if(!Array.isArray(initialRows) || initialRows.length === 0){
    return;
  }

  const frag = document.createDocumentFragment();

  initialRows.forEach((data)=>{
    const node = tmpl.content.cloneNode(true);
    const row = node.querySelector('.row');

    row.addEventListener('input', (e)=> {
      const f = e.target.dataset.field;
      if(f === 'adet' || f === 'koli' || f === 'fiyat'){
        updateRowTotal(row);
        updateGrandTotal();
      }
    });

    row.querySelector('.remove').addEventListener('click', ()=>{
      row.remove();
      updateGrandTotal();
      updateProductCount();
      moveEmptyRowsToBottom();
    });

    frag.appendChild(node);
    const inserted = (frag.lastElementChild || rowsEl.lastElementChild);
    attachKeyNav(inserted);
    setInputs(inserted, data);
    updateRowTotal(inserted);
  });

  rowsEl.appendChild(frag);
  updateGrandTotal();
  updateProductCount();
  moveEmptyRowsToBottom();
  updateRowNumbers();

  // Sticky offsets güncelle
  setTimeout(()=>{
    if(window.updateStickyOffsets){
      window.updateStickyOffsets();
    }
  }, 0);
}

export function clearAll(){
  rowsEl.innerHTML = '';
  updateGrandTotal();
  updateProductCount();
  updateRowNumbers();
}

export function getInputs(row){
  return {
    ad:    row.querySelector('[data-field="ad"]'),
    adet:  row.querySelector('[data-field="adet"]'),
    koli:  row.querySelector('[data-field="koli"]'),
    grl:   row.querySelector('[data-field="grl"]'),
    fiyat: row.querySelector('[data-field="fiyat"]'),
    tutar: row.querySelector('[data-field="tutar"]'),
  };
}

export function setInputs(row, data){
  const i = getInputs(row);
  if('ad' in data) i.ad.value = data.ad ?? '';
  if('adet' in data) i.adet.value = data.adet ?? '';
  if('koli' in data) i.koli.value = data.koli ?? '';
  if('grl' in data) i.grl.value = data.grl ?? '';
  if('fiyat' in data) i.fiyat.value = data.fiyat ?? '';
  updateRowTotal(row);
}

export function updateRowTotal(row){
  const i = getInputs(row);
  const adet = safeNum(i.adet.value);
  const koli = safeNum(i.koli.value, 1);
  const fiyat = safeNum(i.fiyat.value);
  const tutar = fiyat * koli * adet;
  i.tutar.value = fmt(tutar);
}

export function collectRows(){
  const data = [];
  rowsEl.querySelectorAll('.row').forEach(row => {
    const i = getInputs(row);
    const adet = safeNum(i.adet.value);
    const koli = safeNum(i.koli.value, 1);
    const fiyat = safeNum(i.fiyat.value);
    const tutar = fiyat * koli * adet;
    data.push({
      ad: i.ad.value.trim(),
      adet, koli,
      grl: i.grl.value.trim(),
      fiyat,
      tutar: Number.isFinite(tutar) ? tutar : 0
    });
  });
  return data;
}

export function updateGrandTotal(){
  const sum = collectRows().reduce((acc,r)=> acc + (r.tutar||0), 0);
  grandTotalEl.textContent = fmt(sum);
}

export function updateProductCount(){
  // Sadece dolu satırları say (en az bir alanı dolu olan)
  const rows = rowsEl.querySelectorAll('.row');
  let count = 0;
  rows.forEach(row => {
    const inputs = getInputs(row);
    const hasData = inputs.ad.value.trim() || 
                   inputs.adet.value.trim() || 
                   inputs.koli.value.trim() || 
                   inputs.grl.value.trim() || 
                   inputs.fiyat.value.trim();
    if (hasData) count++;
  });
  productCountEl.textContent = count;
}

export function updateRowNumbers(){
  const rows = rowsEl.querySelectorAll('.row');
  rows.forEach((row, index) => {
    const numberCell = row.querySelector('.row-number');
    if (numberCell) {
      numberCell.textContent = index + 1;
    }
  });
}

export function moveEmptyRowsToBottom(){
  const rows = Array.from(rowsEl.querySelectorAll('.row'));
  const filledRows = [];
  const emptyRows = [];
  
  rows.forEach(row => {
    const inputs = getInputs(row);
    const hasData = inputs.ad.value.trim() || 
                   inputs.adet.value.trim() || 
                   inputs.koli.value.trim() || 
                   inputs.grl.value.trim() || 
                   inputs.fiyat.value.trim();
    
    if (hasData) {
      filledRows.push(row);
    } else {
      emptyRows.push(row);
    }
  });
  
  // Önce dolu satırları, sonra boş satırları ekle
  rowsEl.innerHTML = '';
  filledRows.forEach(row => rowsEl.appendChild(row));
  emptyRows.forEach(row => rowsEl.appendChild(row));
  
  // Satır numaralarını güncelle
  updateRowNumbers();
}
