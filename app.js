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
   DATA PESERTA CAMP RISET 2026
   Format: { name, class, group }
   Group menggunakan format: MST_01 s.d MST_27
   ============================================ */
const STUDENT_DATA = [
  {
    "name": "Yurie Kurniawan Sahputra",
    "class": "XI-E",
    "team": "MST_01"
  },
  {
    "name": "Satrio Tirto Prodjo",
    "class": "XI-E",
    "team": "MST_01"
  },
  {
    "name": "Aprillia Indah Setyarini",
    "class": "XI-E",
    "team": "MST_02"
  },
  {
    "name": "Naila Eiliyah Syafa",
    "class": "XI-E",
    "team": "MST_02"
  },
  {
    "name": "Zahiratun Najwa",
    "class": "X-G",
    "team": "MST_03"
  },
  {
    "name": "Fatikhah Ainun Rizki",
    "class": "X-C",
    "team": "MST_03"
  },
  {
    "name": "Nayara Syauqillah Hanafi",
    "class": "XI-J",
    "team": "MST_04"
  },
  {
    "name": "Nabila Ilmi Aulia",
    "class": "XI-F",
    "team": "MST_04"
  },
  {
    "name": "Rayina Nailah Kamil",
    "class": "X-D",
    "team": "MST_05"
  },
  {
    "name": "Eva Nur Laily Maulidyah",
    "class": "X-D",
    "team": "MST_05"
  },
  {
    "name": "Aqliyah Mezaluna Shofroh",
    "class": "X-D",
    "team": "MST_06"
  },
  {
    "name": "Najda In Fatma",
    "class": "X-H",
    "team": "MST_06"
  },
  {
    "name": "Dylita Ayu Marta Sari",
    "class": "XI-G",
    "team": "MST_07"
  },
  {
    "name": "Keyla Nazihah Ramadhani",
    "class": "XI-G",
    "team": "MST_07"
  },
  {
    "name": "Kharira Istigfareina",
    "class": "X-F",
    "team": "MST_08"
  },
  {
    "name": "Ainindya Zahrotus Syifa",
    "class": "X-F",
    "team": "MST_08"
  },
  {
    "name": "Khansarifda Almira Gusnia",
    "class": "X-E",
    "team": "MST_09"
  },
  {
    "name": "Adelia Bernesyha Dafina",
    "class": "X-E",
    "team": "MST_09"
  },
  {
    "name": "Muhammad Andre Fakhriyanto",
    "class": "X-I",
    "team": "MST_10"
  },
  {
    "name": "Muhammad Hatta Rajasa",
    "class": "X-I",
    "team": "MST_10"
  },
  {
    "name": "Helen Agnidiantika",
    "class": "X-E",
    "team": "MST_11"
  },
  {
    "name": "Lylla Putri Agnifirstly",
    "class": "X-J",
    "team": "MST_11"
  },
  {
    "name": "Shasyura Queen Andaresta",
    "class": "X-G",
    "team": "MST_12"
  },
  {
    "name": "Mainova Anggraini",
    "class": "X-C",
    "team": "MST_12"
  },
  {
    "name": "Dewantara Alif Nauwarah Wahyudi",
    "class": "X-D",
    "team": "MST_13"
  },
  {
    "name": "Zaky Al Faruq",
    "class": "X-E",
    "team": "MST_13"
  },
  {
    "name": "Muhammad Thoriq Akbar",
    "class": "X-F",
    "team": "MST_14"
  },
  {
    "name": "Nisrina Azizah",
    "class": "X-F",
    "team": "MST_14"
  },
  {
    "name": "Raihan Dimas Rizkinanta",
    "class": "X-D",
    "team": "MST_15"
  },
  {
    "name": "Mochamad Dafa Taufiqi",
    "class": "X-L",
    "team": "MST_15"
  },
  {
    "name": "Anindita Azaria K.W",
    "class": "X-D",
    "team": "MST_16"
  },
  {
    "name": "Niswa Nuha Naira",
    "class": "X-D",
    "team": "MST_16"
  },
  {
    "name": "Risydatul Azizah R.",
    "class": "X-D",
    "team": "MST_16"
  },
  {
    "name": "Anugrah Rafaat Julianto",
    "class": "X-E",
    "team": "MST_17"
  },
  {
    "name": "Muhammad Amir Assadillah Mumtaz",
    "class": "X-E",
    "team": "MST_17"
  },
  {
    "name": "Naufal Arif Fikri",
    "class": "X-E",
    "team": "MST_17"
  },
  {
    "name": "Angel Erca Viviana",
    "class": "X-E",
    "team": "MST_18"
  },
  {
    "name": "Qonitah Nuryn Najah",
    "class": "X-E",
    "team": "MST_18"
  },
  {
    "name": "Zaimatur Rahmah Wahyuningtyas",
    "class": "X-E",
    "team": "MST_18"
  },
  {
    "name": "Adinda Putri Aulia",
    "class": "X-E",
    "team": "MST_19"
  },
  {
    "name": "Kamila Dzakiya Mumtazah",
    "class": "X-E",
    "team": "MST_19"
  },
  {
    "name": "Nadine Nur Aulia",
    "class": "X-E",
    "team": "MST_19"
  },
  {
    "name": "Andien Wildani Alifia",
    "class": "X-E",
    "team": "MST_20"
  },
  {
    "name": "Istina Nuril Umah",
    "class": "X-E",
    "team": "MST_20"
  },
  {
    "name": "Khalishah Aristawati Khosyi",
    "class": "X-E",
    "team": "MST_20"
  },
  {
    "name": "Kirana Ailsa Hernani",
    "class": "X-E",
    "team": "MST_21"
  },
  {
    "name": "Nabillah Lovelia Vanissa",
    "class": "X-E",
    "team": "MST_21"
  },
  {
    "name": "Tasya Aulia",
    "class": "X-E",
    "team": "MST_21"
  },
  {
    "name": "Aafizhah Zahida Nagari",
    "class": "X-E",
    "team": "MST_22"
  },
  {
    "name": "Syahla Hilayatul Auliya",
    "class": "X-E",
    "team": "MST_22"
  },
  {
    "name": "Achmad Jabar Jalidin Batin",
    "class": "X-E",
    "team": "MST_22"
  },
  {
    "name": "Muhammad Fakhri Falihudin",
    "class": "X-E",
    "team": "MST_23"
  },
  {
    "name": "Muhammad Alif Akma Farras Fakhrullah",
    "class": "X-E",
    "team": "MST_23"
  },
  {
    "name": "Alif Fauzan Hadrianto",
    "class": "X-F",
    "team": "MST_24"
  },
  {
    "name": "Itmamus Tsiqotu Qolbiyah",
    "class": "X-F",
    "team": "MST_24"
  },
  {
    "name": "Anindynata Rahma Setiani",
    "class": "X-F",
    "team": "MST_24"
  },
  {
    "name": "Erina Faiza",
    "class": "X-F",
    "team": "MST_25"
  },
  {
    "name": "Safina Annajah Niswa",
    "class": "X-F",
    "team": "MST_25"
  },
  {
    "name": "Fian Amanullah",
    "class": "X-F",
    "team": "MST_26"
  },
  {
    "name": "Sultan Asher Setiaji",
    "class": "X-F",
    "team": "MST_26"
  },
  {
    "name": "M. Arsya Rastra Sulistyono",
    "class": "X-F",
    "team": "MST_26"
  },
  {
    "name": "Almira Channadya Najichah",
    "class": "X-F",
    "team": "MST_27"
  },
  {
    "name": "Axelia Shafa Alvina Setiyawan",
    "class": "X-F",
    "team": "MST_27"
  },
  {
    "name": "Tita Amelia",
    "class": "X-O",
    "team": "ISH_01"
  },
  {
    "name": "Azelya Althafanisa",
    "class": "X-F",
    "team": "ISH_01"
  },
  {
    "name": "Bima Maulana Muhlisin",
    "class": "X-C",
    "team": "ISH_02"
  },
  {
    "name": "Khoirul Anam",
    "class": "X-C",
    "team": "ISH_02"
  },
  {
    "name": "Zahro Failasuffa Addina",
    "class": "XI-G",
    "team": "ISH_03"
  },
  {
    "name": "Qosthalani Imaniar Witanto",
    "class": "XI-O",
    "team": "ISH_03"
  },
  {
    "name": "Nisa'ur Rizqi Fauziyyah",
    "class": "X-M",
    "team": "ISH_04"
  },
  {
    "name": "Safira Amiratuzzahira",
    "class": "X-H",
    "team": "ISH_04"
  },
  {
    "name": "Asyifa Nur Madina",
    "class": "X-G",
    "team": "ISH_05"
  },
  {
    "name": "Natasya Sufa Arumeilah",
    "class": "X-G",
    "team": "ISH_05"
  },
  {
    "name": "Syakilla Noura Azzahra",
    "class": "X-J",
    "team": "ISH_06"
  },
  {
    "name": "Vannessa Angelina Putri Hermawan",
    "class": "X-J",
    "team": "ISH_06"
  },
  {
    "name": "Alena Ziza Rahmawati",
    "class": "X-G",
    "team": "ISH_07"
  },
  {
    "name": "Anisaul Muzayyadah",
    "class": "X-H",
    "team": "ISH_07"
  },
  {
    "name": "Alya Zakiyah",
    "class": "X-O",
    "team": "ISH_08"
  },
  {
    "name": "Naina Tsabita Salam",
    "class": "X-F",
    "team": "ISH_08"
  },
  {
    "name": "Arzaqina Kahfi Azzahrani",
    "class": "X-J",
    "team": "ISH_09"
  },
  {
    "name": "Herrawati Aisyah Az-Zahra",
    "class": "X-G",
    "team": "ISH_09"
  },
  {
    "name": "Quinsa Adelia Herwin",
    "class": "X-J",
    "team": "ISH_09"
  },
  {
    "name": "Naura Cheryl Aisyah Rahma",
    "class": "X-F",
    "team": "ISH_10"
  },
  {
    "name": "Athaya Khansa Kirana Saputro",
    "class": "X-F",
    "team": "ISH_10"
  },
  {
    "name": "Salwa Mufidatun Nuzula",
    "class": "X-I",
    "team": "ISH_11"
  },
  {
    "name": "Lailatul Zayyana Nur Ramadhani",
    "class": "X-I",
    "team": "ISH_11"
  },
  {
    "name": "Naila Syarifatul A.",
    "class": "X-D",
    "team": "ISH_12"
  },
  {
    "name": "Nessya Hemalia",
    "class": "X-D",
    "team": "ISH_12"
  },
  {
    "name": "Alifah Nur Faizah",
    "class": "X-D",
    "team": "ISH_12"
  },
  {
    "name": "Moch. Zio Raditia P.",
    "class": "X-D",
    "team": "ISH_13"
  },
  {
    "name": "M. Hafiizh Addin",
    "class": "X-D",
    "team": "ISH_13"
  },
  {
    "name": "Athfan Hafidz H.",
    "class": "X-D",
    "team": "ISH_13"
  },
  {
    "name": "Alila Niko Firmansyah",
    "class": "X-D",
    "team": "ISH_14"
  },
  {
    "name": "M. Brian Abyakta",
    "class": "X-D",
    "team": "ISH_14"
  },
  {
    "name": "Norman Priyanto P.",
    "class": "X-D",
    "team": "ISH_14"
  },
  {
    "name": "Karisma Windah N.",
    "class": "X-D",
    "team": "ISH_15"
  },
  {
    "name": "Silkhiyatul Khusna",
    "class": "X-D",
    "team": "ISH_15"
  },
  {
    "name": "Indah Rizky S.",
    "class": "X-D",
    "team": "ISH_15"
  },
  {
    "name": "Imelda Khumairoh",
    "class": "X-D",
    "team": "ISH_16"
  },
  {
    "name": "Naura Bilqis Alamsyah",
    "class": "X-D",
    "team": "ISH_16"
  },
  {
    "name": "Frisca Nafratilova",
    "class": "X-D",
    "team": "ISH_16"
  },
  {
    "name": "Oktavia Delia P.",
    "class": "X-D",
    "team": "ISH_17"
  },
  {
    "name": "Mona Medieratama",
    "class": "X-D",
    "team": "ISH_17"
  },
  {
    "name": "Erlangga Syahputra",
    "class": "X-E",
    "team": "ISH_18"
  },
  {
    "name": "Husein Abdul Aziz",
    "class": "X-E",
    "team": "ISH_18"
  },
  {
    "name": "Mizan Asrori",
    "class": "X-E",
    "team": "ISH_18"
  },
  {
    "name": "Aulia Syawala Oktavia",
    "class": "X-F",
    "team": "ISH_19"
  },
  {
    "name": "Indi Rafidhah Qoulan Tsakila",
    "class": "X-F",
    "team": "ISH_19"
  },
  {
    "name": "Raudina Zata Lini",
    "class": "X-F",
    "team": "ISH_19"
  },
  {
    "name": "Kalila Hanum Alamsyah",
    "class": "X-F",
    "team": "ISH_20"
  },
  {
    "name": "Ayashofya Mykha Aqeela",
    "class": "X-F",
    "team": "ISH_20"
  },
  {
    "name": "Jihan Alma Falisha",
    "class": "X-F",
    "team": "ISH_20"
  },
  {
    "name": "Faizah Nur Istiqomah",
    "class": "X-F",
    "team": "ISH_21"
  },
  {
    "name": "Robyatus Sholikhah",
    "class": "X-F",
    "team": "ISH_21"
  },
  {
    "name": "Nayla Khiswa Shofatus Safa",
    "class": "X-F",
    "team": "ISH_21"
  },
  {
    "name": "Adinda Melatin Khanifah",
    "class": "X-F",
    "team": "ISH_22"
  },
  {
    "name": "Naila Nur Salsabila",
    "class": "X-F",
    "team": "ISH_22"
  },
  {
    "name": "Muhammad Mahardika Ardiansyah",
    "class": "X-I",
    "team": "FTR_01"
  },
  {
    "name": "Muhammad Anwar Mubarok",
    "class": "X-I",
    "team": "FTR_01"
  },
  {
    "name": "Salma Agustien Romadhiana",
    "class": "X-F",
    "team": "FTR_02"
  },
  {
    "name": "Anisa Husnul Habibah",
    "class": "X-M",
    "team": "FTR_02"
  },
  {
    "name": "Nadia Safarani",
    "class": "X-D",
    "team": "FTR_02"
  },
  {
    "name": "Akbar Bima Al Farobi",
    "class": "XI-D",
    "team": "FTR_03"
  },
  {
    "name": "Bramantio Prakoso",
    "class": "X-D",
    "team": "FTR_04"
  },
  {
    "name": "Randy Achmad A.",
    "class": "X-D",
    "team": "FTR_04"
  },
  {
    "name": "M. Ciko Rizkya A.",
    "class": "X-D",
    "team": "FTR_04"
  },
  {
    "name": "Daffaturrizky Fachrizal Ernawan",
    "class": "X-E",
    "team": "FTR_05"
  },
  {
    "name": "Faraz Fakhry Tejatama",
    "class": "X-E",
    "team": "FTR_05"
  },
  {
    "name": "Muhammad Rehan Aprianto",
    "class": "X-E",
    "team": "FTR_05"
  },
  {
    "name": "Virgiawan Rizky Ash Sifa",
    "class": "X-F",
    "team": "FTR_06"
  },
  {
    "name": "Muhammad Irfan Hibatullah",
    "class": "X-F",
    "team": "FTR_06"
  }
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