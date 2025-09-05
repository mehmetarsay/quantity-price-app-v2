import { safeNum, fmt, focusNext } from './utils.js';

const rowsEl = document.getElementById('rows');
const tmpl = document.getElementById('rowTemplate');
const grandTotalEl = document.getElementById('grandTotal');

function attachKeyNav(row){
  row.querySelectorAll('input.cell').forEach((el)=>{
    if(el.readOnly) return;
    
    el.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Enter'){
        ev.preventDefault();
        focusNext(el);
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
  });

  rowsEl.appendChild(node);
  const inserted = rowsEl.lastElementChild;
  attachKeyNav(inserted);
  if(initial) setInputs(inserted, initial);
  updateRowTotal(inserted);
  updateGrandTotal();

  const f = inserted.querySelector('[data-field="ad"]');
  f && f.focus();
  
  // Update sticky offsets after adding a row to ensure proper positioning
  setTimeout(() => {
    if (window.updateStickyOffsets) {
      window.updateStickyOffsets();
    }
  }, 0);
}

export function clearAll(){
  rowsEl.innerHTML = '';
  updateGrandTotal();
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
