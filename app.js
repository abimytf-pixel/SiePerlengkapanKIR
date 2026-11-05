/* ============================================
   app.js — Logika Utama Aplikasi
   Sie Perlengkapan KIR | Camp Riset 2026

   SECURITY NOTES (perbaikan dari versi monolitik):
   - [FIX] XSS: Semua data user/DB dirender via
     textContent atau escapeHTML(), bukan innerHTML.
   - [FIX] Regex Injection: Input autocomplete
     di-escape sebelum masuk RegExp.
   - [FIX] Import Excel: Validasi tipe & panjang
     field sebelum disimpan ke IndexedDB.
   ============================================ */

/* ============================================
   KONFIGURASI — Ganti sesuai data nyata
   ============================================ */
const STUDENT_NAMES = [
  "Akbar Bima Al Farobi", "Satrio Tirto", "Asfroh Nabila",
  "Siti Aisyah", "Budi Santoso", "Zahra Amalia"
];

/* ============================================
   STATE GLOBAL
   ============================================ */
let html5QrScanner   = null;
let currentScanCode  = null;
let pendingReturnLoanId = null;
let lastScan         = 0;
let isFlashOn        = false;   // Status flash (nyala/mati)
let activeVideoTrack = null;    // Referensi ke MediaStreamTrack kamera aktif

/* ============================================
   UTILITY: Security Helper
   ============================================ */

/**
 * Escape karakter HTML berbahaya untuk mencegah XSS.
 * Gunakan ini setiap kali menampilkan data dari DB / user ke DOM.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape karakter khusus RegExp agar input user tidak bisa
 * meng-inject pola regex berbahaya.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ============================================
   INISIALISASI
   ============================================ */
window.onload = async () => {
  await initDB();
  setupNetworkListeners();
  setupAutocomplete();
  renderLoans();
};

/* ============================================
   FITUR: QR / BARCODE SCANNER
   ============================================ */
function toggleCamera() {
  const box = document.getElementById('scannerBox');
  const btn = document.getElementById('camBtn');

  if (box.classList.contains('hidden')) {
    box.classList.remove('hidden');
    btn.textContent = 'Tutup Kamera';
    html5QrScanner  = new Html5Qrcode('reader');
    html5QrScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 120 } },
      (decodedText) => handleScanSuccess(decodedText)
    ).then(() => {
      // Ambil referensi video track setelah kamera aktif
      // agar kita bisa mengontrol flash (torch) lewat MediaStream API
      const videoEl = document.querySelector('#reader video');
      if (videoEl && videoEl.srcObject) {
        const tracks = videoEl.srcObject.getVideoTracks();
        if (tracks.length > 0) {
          activeVideoTrack = tracks[0];
        }
      }
    });
  } else {
    box.classList.add('hidden');
    btn.textContent = 'Buka Kamera';
    // Matikan flash sebelum menutup kamera
    if (isFlashOn) toggleFlash();
    activeVideoTrack = null;
    if (html5QrScanner) html5QrScanner.stop();
  }
}

/* ============================================
   FITUR: FLASH / TORCH KAMERA
   Menggunakan MediaStream Track Constraints API
   (torch). Didukung di Android Chrome, beberapa
   perangkat iOS mungkin tidak mendukung torch.
   ============================================ */
async function toggleFlash() {
  const icon = document.getElementById('flashIcon');
  const btn  = document.getElementById('flashBtn');

  // Jika referensi track belum ada, coba ambil ulang
  if (!activeVideoTrack) {
    const videoEl = document.querySelector('#reader video');
    if (videoEl && videoEl.srcObject) {
      const tracks = videoEl.srcObject.getVideoTracks();
      if (tracks.length > 0) activeVideoTrack = tracks[0];
    }
  }

  // Cek apakah perangkat mendukung fitur torch
  if (!activeVideoTrack) {
    showToast('Kamera belum aktif.', 'bg-slate-700');
    return;
  }

  const capabilities = activeVideoTrack.getCapabilities();
  if (!capabilities.torch) {
    showToast('Perangkat ini tidak mendukung flash kamera.', 'bg-slate-700');
    return;
  }

  try {
    isFlashOn = !isFlashOn;
    await activeVideoTrack.applyConstraints({ advanced: [{ torch: isFlashOn }] });

    // Update tampilan tombol
    if (isFlashOn) {
      icon.className = 'fa-solid fa-bolt text-sm';
      btn.classList.remove('text-yellow-400', 'border-slate-600');
      btn.classList.add('text-yellow-300', 'border-yellow-400', 'bg-yellow-500/20');
      showToast('Flash menyala 🔦', 'bg-yellow-600');
    } else {
      icon.className = 'fa-solid fa-bolt text-sm';
      btn.classList.remove('text-yellow-300', 'border-yellow-400', 'bg-yellow-500/20');
      btn.classList.add('text-yellow-400', 'border-slate-600');
      showToast('Flash mati', 'bg-slate-700');
    }
  } catch (err) {
    console.error('[toggleFlash]', err);
    showToast('Gagal mengontrol flash.', 'bg-rose-600');
    isFlashOn = !isFlashOn; // Rollback state
  }
}

async function handleScanSuccess(code) {
  // Debounce: abaikan scan dalam 2 detik terakhir
  if (Date.now() - lastScan < 2000) return;
  lastScan = Date.now();

  code = code.trim().toUpperCase();

  // Cek apakah kode terdaftar di Master Data
  const masterItem = await dbGetMaster(code);
  if (!masterItem) {
    showToast('Barcode asing. Kode tidak ada di Master Excel.', 'bg-slate-700');
    return;
  }

  // Cek status pinjam alat
  const loans      = await dbGetAllLoans();
  const activeLoan = loans.find(l => l.equipCode === code && l.status === 'Dipinjam');

  if (activeLoan) {
    // Alat sedang dipinjam → modal Pengembalian
    triggerHaptic(1);
    pendingReturnLoanId = activeLoan.id;

    // [FIX XSS] Gunakan textContent bukan innerHTML
    document.getElementById('retEquipName').textContent = masterItem.name;
    document.getElementById('retBorrower').textContent  = activeLoan.borrowerName;
    document.getElementById('returnModal').classList.remove('hidden');
  } else {
    // Alat tersedia → modal Peminjaman
    triggerHaptic(1);
    currentScanCode = code;

    // [FIX XSS] Gunakan textContent bukan innerHTML
    document.getElementById('coEquipName').textContent = masterItem.name;
    document.getElementById('coName').value  = '';
    document.getElementById('coGroup').value = '';
    document.getElementById('checkoutModal').classList.remove('hidden');
  }
}

/* ============================================
   FITUR: CHECKOUT (PEMINJAMAN)
   ============================================ */
async function submitCheckout(e) {
  e.preventDefault();

  const name  = document.getElementById('coName').value.trim();
  const group = document.getElementById('coGroup').value;
  if (!name || !group || !currentScanCode) return;

  const masterItem = await dbGetMaster(currentScanCode);
  const loans      = await dbGetAllLoans();

  // Hitung berapa kali alat ini dipinjam oleh grup yang sama
  const activeCountByGroup = loans.filter(l =>
    l.borrowerGroup === group &&
    l.equipCode     === currentScanCode &&
    l.status        === 'Dipinjam'
  ).length;

  // Validasi batas pinjam per kelompok
  if (masterItem.limit !== null && activeCountByGroup >= masterItem.limit) {
    closeModals();
    triggerErrorVisual('Batas Pinjam Terlampaui untuk kelompok ' + group + '!');
    return;
  }

  try {
    const newLoan = {
      id:            'LN-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      equipCode:     currentScanCode,
      equipName:     masterItem.name,
      borrowerName:  name,
      borrowerGroup: group,
      borrowTime:    getFormattedDate(),
      returnTime:    '-',
      status:        'Dipinjam',
      syncTime:      null
    };
    await dbPutLoan(newLoan);
    closeModals();
    showToast('Berhasil dipinjam!', 'bg-emerald-600');
    renderLoans();
  } catch (err) {
    console.error('[submitCheckout]', err);
    triggerErrorVisual('Gagal menyimpan ke database lokal!');
  }
}

/* ============================================
   FITUR: PENGEMBALIAN (RETURN)
   ============================================ */
async function processReturn() {
  if (!pendingReturnLoanId) return;
  try {
    const loans = await dbGetAllLoans();
    const loan  = loans.find(l => l.id === pendingReturnLoanId);
    if (loan) {
      loan.status     = 'Selesai';
      loan.returnTime = getFormattedDate();
      loan.syncTime   = null; // Tandai untuk disinkronisasi
      await dbPutLoan(loan);
      closeModals();
      showToast('Alat berhasil dikembalikan', 'bg-emerald-600');
      renderLoans();
    }
  } catch (err) {
    console.error('[processReturn]', err);
    triggerErrorVisual('Gagal update data pengembalian!');
  }
}

/* ============================================
   FITUR: AUTOCOMPLETE FUZZY SEARCH
   ============================================ */
function setupAutocomplete() {
  const inp  = document.getElementById('coName');
  const list = document.getElementById('autocompleteList');

  inp.addEventListener('input', function () {
    const val = this.value.toLowerCase().trim();
    list.innerHTML = '';
    if (!val) { list.classList.add('hidden'); return; }

    // [FIX Regex Injection] Escape input sebelum dipakai di RegExp
    const safeVal = escapeRegex(val);
    const matches = STUDENT_NAMES.filter(n => n.toLowerCase().includes(val));

    if (matches.length > 0) {
      list.classList.remove('hidden');
      matches.forEach(match => {
        const div   = document.createElement('div');
        const regex = new RegExp(`(${safeVal})`, 'gi');

        // [FIX XSS] Escape nama sebelum inject HTML bold
        const safeName = escapeHTML(match);
        div.innerHTML  = safeName.replace(regex, '<strong>$1</strong>');

        div.addEventListener('click', () => {
          inp.value = match;
          list.classList.add('hidden');
        });
        list.appendChild(div);
      });
    } else {
      list.classList.add('hidden');
    }
  });

  // Tutup dropdown jika klik di luar input
  document.addEventListener('click', (e) => {
    if (e.target !== inp) list.classList.add('hidden');
  });
}

/* ============================================
   FITUR: IMPORT MASTER DATA (EXCEL)
   ============================================ */

/** Panjang maksimum yang diizinkan untuk field string dari Excel */
const MAX_FIELD_LENGTH = 200;

function handleImportExcel(e) {
  const file = e.target.files[0];
  if (!file) return;

  // [VALIDASI] Hanya terima file .xlsx atau .xls
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
    triggerErrorVisual('File harus berformat Excel (.xlsx atau .xls)');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const data     = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      const json     = XLSX.utils.sheet_to_json(sheet);

      let imported   = 0;
      let masterItems = [];

      json.forEach(row => {
        // Asumsi Header: "Kode Barcode", "Nama Alat", "Batas Pinjam"
        const rawCode = row['Kode Barcode'];
        const rawName = row['Nama Alat'];
        const limitRaw = row['Batas Pinjam'];

        if (!rawCode || !rawName) return;

        // [FIX] Sanitasi & validasi panjang field
        const code = String(rawCode).trim().toUpperCase().slice(0, MAX_FIELD_LENGTH);
        const name = String(rawName).trim().slice(0, MAX_FIELD_LENGTH);

        if (!code || !name) return;

        // Parse limit: null = tanpa batas, angka positif = ada batas
        let limit = null;
        if (limitRaw && limitRaw !== '-' && !isNaN(parseInt(limitRaw))) {
          limit = Math.max(1, parseInt(limitRaw)); // Minimal 1
        }

        masterItems.push({ code, name, limit });
        imported++;
      });

      await dbPutMaster(masterItems);
      showToast(`Berhasil import ${imported} Master Alat!`, 'bg-emerald-600');
    } catch (err) {
      console.error('[handleImportExcel]', err);
      triggerErrorVisual('Format Excel salah atau gagal dibaca.');
    }
  };

  reader.readAsArrayBuffer(file);
  e.target.value = ''; // Reset input agar file yang sama bisa dipilih lagi
}

/* ============================================
   FITUR: EXPORT LAPORAN (EXCEL)
   ============================================ */
async function exportToExcel() {
  const loans = await dbGetAllLoans();
  if (loans.length === 0) {
    showToast('Belum ada data untuk di-export', 'bg-slate-700');
    return;
  }

  // Sort: berdasarkan kode alat, lalu waktu ID
  loans.sort((a, b) => {
    if (a.equipCode < b.equipCode) return -1;
    if (a.equipCode > b.equipCode) return  1;
    return a.id.localeCompare(b.id);
  });

  // Format baris: nomor & kode alat hanya muncul pada baris pertama per alat
  let exportData   = [];
  let currentEquip = null;
  let alatCounter  = 0;

  loans.forEach(loan => {
    const isFirst = (loan.equipCode !== currentEquip);
    if (isFirst) {
      currentEquip = loan.equipCode;
      alatCounter++;
    }

    exportData.push({
      'No':            isFirst ? alatCounter : '',
      'Kode Alat':     isFirst ? loan.equipCode : '',
      'Nama Alat':     isFirst ? loan.equipName : '',
      'Nama Peminjam': loan.borrowerName,
      'Nama Kelompok': loan.borrowerGroup,
      'Waktu Pinjam':  loan.borrowTime,
      'Waktu Kembali': loan.returnTime,
      'Status':        loan.status
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat_Alat');
  XLSX.writeFile(workbook, 'Laporan_Perlengkapan_KIR.xlsx');
}

/* ============================================
   UTILITIES
   ============================================ */

/**
 * Render daftar peminjaman ke dalam #loansList.
 * [FIX XSS] Semua data dirender via escapeHTML().
 */
async function renderLoans() {
  const list  = document.getElementById('loansList');
  const loans = await dbGetAllLoans();

  // Tampilkan dari yang terbaru
  loans.reverse();

  if (loans.length === 0) {
    list.innerHTML = '<p class="text-center text-slate-500 text-xs py-4">Belum ada data peminjaman.</p>';
    return;
  }

  list.innerHTML = loans.map(l => `
    <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
      <div>
        <p class="font-bold text-xs text-white">${escapeHTML(l.equipName)}</p>
        <p class="text-[10px] text-amber-300 mt-0.5">
          <i class="fa-solid fa-user mr-1"></i>
          ${escapeHTML(l.borrowerName)} (${escapeHTML(l.borrowerGroup)})
        </p>
        <p class="text-[9px] text-slate-400 mt-1">
          <i class="fa-regular fa-clock"></i> Pinjam: ${escapeHTML(l.borrowTime)}
        </p>
      </div>
      <div class="text-right">
        ${l.status === 'Dipinjam'
          ? '<span class="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded">Dipinjam</span>'
          : '<span class="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">Selesai</span>'
        }
      </div>
    </div>
  `).join('');
}

function triggerHaptic(type) {
  if (!navigator.vibrate) return;
  if (type === 1) navigator.vibrate(200);           // 1 getaran — scan normal
  if (type === 2) navigator.vibrate([300, 100, 300]); // 2 getaran — error
}

function triggerErrorVisual(msg) {
  triggerHaptic(2);
  const body = document.getElementById('appBody');
  body.classList.add('error-flash');
  showToast(msg, 'bg-rose-600');
  setTimeout(() => body.classList.remove('error-flash'), 500);
}

function closeModals() {
  document.getElementById('checkoutModal').classList.add('hidden');
  document.getElementById('returnModal').classList.add('hidden');
  currentScanCode     = null;
  pendingReturnLoanId = null;
}

function getFormattedDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ` +
         `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function showToast(msg, colorClass = 'bg-cyan-600') {
  const toast = document.getElementById('toast');
  toast.className = `fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ` +
                    `transform px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl ` +
                    `flex items-center gap-2 ${colorClass}`;

  // [FIX XSS] Pesan toast di-escape sebelum ditampilkan
  const icon    = document.createElement('i');
  icon.className = 'fa-solid fa-circle-info';
  const text    = document.createTextNode(' ' + msg);
  toast.innerHTML = '';
  toast.appendChild(icon);
  toast.appendChild(text);

  requestAnimationFrame(() => toast.classList.remove('translate-y-4', 'opacity-0'));
  setTimeout(() => toast.classList.add('translate-y-4', 'opacity-0'), 3000);
}

/* ============================================
   NETWORK LISTENER
   (Firebase sync dipanggil dari firebase-sync.js)
   ============================================ */
function setupNetworkListeners() {
  const updateNet = () => {
    const isOnline = navigator.onLine;
    const badge    = document.getElementById('netStatus');
    const text     = document.getElementById('netText');

    badge.className = `flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ` +
      (isOnline
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : 'bg-rose-500/10 border-rose-500/20 text-rose-400');

    text.textContent = isOnline ? 'Online' : 'Offline';

    // Auto-sync saat koneksi kembali
    if (isOnline) syncData();
  };

  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();
}
