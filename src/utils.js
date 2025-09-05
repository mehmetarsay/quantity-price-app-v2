export function safeNum(v, def=0){
  if(v === '' || v === null || v === undefined) return def;
  const n = Number(String(v).replace(',','.'));
  return Number.isFinite(n) ? n : def;
}
export function fmt(n){
  const val = Number(n) || 0;
  return val.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2});
}
export function focusNext(fromEl){
  const tabbables = Array.from(document.querySelectorAll('input.cell:not([readonly]), button.remove'))
    .filter(el => el.tabIndex !== -1);
  const idx = tabbables.indexOf(fromEl);
  
  if(idx > -1 && idx < tabbables.length - 1){
    const nextEl = tabbables[idx + 1];
    
    // Eğer mevcut element fiyat alanındaysa (en sağdaki input) bir alt satıra in
    if (fromEl.dataset.field === 'fiyat') {
      // Mevcut satırı bul
      const currentRow = fromEl.closest('.row');
      if (currentRow) {
        // Bir alt satırı bul
        const nextRow = currentRow.nextElementSibling;
        if (nextRow) {
          // Alt satırın AD alanına odaklan
          const nextRowAd = nextRow.querySelector('[data-field="ad"]');
          if (nextRowAd) {
            nextRowAd.focus();
            return;
          }
        } else {
          // Alt satır yoksa yeni satır ekle
          if (window.addRow) {
            window.addRow();
            setTimeout(() => {
              const newRow = document.querySelector('#rows .row:last-child');
              if (newRow) {
                const firstInput = newRow.querySelector('[data-field="ad"]');
                if (firstInput) {
                  firstInput.focus();
                }
              }
            }, 0);
            return;
          }
        }
      }
    }
    
    // Normal durumda sağa geç
    nextEl.focus();
  } else if (idx > -1 && idx === tabbables.length - 1) {
    // Eğer son element ise yeni satır ekle
    if (window.addRow) {
      window.addRow();
      setTimeout(() => {
        const newRow = document.querySelector('#rows .row:last-child');
        if (newRow) {
          const firstInput = newRow.querySelector('[data-field="ad"]');
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 0);
    }
  }
}

export function focusPrevious(fromEl){
  const tabbables = Array.from(document.querySelectorAll('input.cell:not([readonly]), button.remove'))
    .filter(el => el.tabIndex !== -1);
  const idx = tabbables.indexOf(fromEl);
  
  if(idx > 0){
    const prevEl = tabbables[idx - 1];
    prevEl.focus();
  }
}

export function focusDown(fromEl){
  const tabbables = Array.from(document.querySelectorAll('input.cell:not([readonly]), button.remove'))
    .filter(el => el.tabIndex !== -1);
  const idx = tabbables.indexOf(fromEl);
  
  // Eğer tutar alanındaysak aşağı in (yeni satır ekle)
  if (fromEl.dataset.field === 'tutar' && window.addRow) {
    window.addRow();
    setTimeout(() => {
      const newRow = document.querySelector('#rows .row:last-child');
      if (newRow) {
        const firstInput = newRow.querySelector('[data-field="ad"]');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 0);
    return;
  }
  
  // Diğer durumlarda sağa geç
  focusNext(fromEl);
}

export function focusUp(fromEl){
  const tabbables = Array.from(document.querySelectorAll('input.cell:not([readonly]), button.remove'))
    .filter(el => el.tabIndex !== -1);
  const idx = tabbables.indexOf(fromEl);
  
  // Yukarı ok için sol tarafa geç
  focusPrevious(fromEl);
}

// Mobil cihaz kontrolü
export function isMobileDevice(){
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0);
}

// Mobil için özel navigasyon
export function mobileFocusNext(fromEl){
  const tabbables = Array.from(document.querySelectorAll('input.cell:not([readonly]), button.remove'))
    .filter(el => el.tabIndex !== -1);
  const idx = tabbables.indexOf(fromEl);
  
  if(idx > -1 && idx < tabbables.length - 1){
    const nextEl = tabbables[idx + 1];
    
    // Eğer mevcut element tutar alanındaysa yeni satır ekle
    if (fromEl.dataset.field === 'tutar' && nextEl && nextEl.classList.contains('remove')) {
      if (window.addRow) {
        window.addRow();
        setTimeout(() => {
          const newRow = document.querySelector('#rows .row:last-child');
          if (newRow) {
            const firstInput = newRow.querySelector('[data-field="ad"]');
            if (firstInput) {
              firstInput.focus();
            }
          }
        }, 0);
        return;
      }
    }
    
    // Normal durumda sağa geç
    nextEl.focus();
  } else if (idx > -1 && idx === tabbables.length - 1) {
    // Eğer son element ise ve tutar alanındaysak yeni satır ekle
    if (fromEl.dataset.field === 'tutar' && window.addRow) {
      window.addRow();
      setTimeout(() => {
        const newRow = document.querySelector('#rows .row:last-child');
        if (newRow) {
          const firstInput = newRow.querySelector('[data-field="ad"]');
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 0);
    }
  }
}
