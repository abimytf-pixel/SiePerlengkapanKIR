/* ============================================
   firebase-sync.js — Sinkronisasi Cloud
   Sie Perlengkapan KIR | Camp Riset 2026

   CARA MENGAKTIFKAN:
   1. Buat project di https://console.firebase.google.com
   2. Aktifkan Firestore Database
   3. Salin konfigurasi ke objek firebaseConfig di bawah
   4. Set Firestore Security Rules (lihat komentar bawah)

   SECURITY NOTE:
   - Jangan pernah commit file ini ke GitHub jika
     firebaseConfig berisi data nyata!
   - Gunakan environment variable atau GitHub Secrets
     untuk menyimpan API Key saat production.
   ============================================ */

/* ============================================
   KONFIGURASI FIREBASE
   ⚠️ Ganti nilai-nilai di bawah dengan konfigurasi
   project Firebase Anda sendiri.
   ============================================ */
const firebaseConfig = {
  apiKey: "AIzaSyD2hT2D0ql7J4c09mZbV28z5e0U_bLdtS4",
  authDomain: "perlengkapan-kir.firebaseapp.com",
  projectId: "perlengkapan-kir",
  storageBucket: "perlengkapan-kir.firebasestorage.app",
  messagingSenderId: "755484285372",
  appId: "1:755484285372:web:03a56f00a78e941dcb73b9"
};

/* ============================================
   INISIALISASI FIREBASE
   ============================================ */
let firestoreDB = null;

function initFirebase() {
  try {
    // Cek apakah config sudah diisi (bukan placeholder)
    if (firebaseConfig.apiKey.startsWith('GANTI_')) {
      console.warn('[Firebase] Config belum diisi. Sinkronisasi cloud dinonaktifkan.');
      return false;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    firestoreDB = firebase.firestore();
    console.log('[Firebase] Berhasil terhubung ke Firestore.');
    return true;
  } catch (err) {
    console.error('[Firebase] Gagal inisialisasi:', err);
    return false;
  }
}

// Jalankan inisialisasi saat script dimuat
const isFirebaseReady = initFirebase();

/* ============================================
   FUNGSI SINKRONISASI
   Dipanggil dari app.js → setupNetworkListeners()
   & tombol sync di header.
   ============================================ */

/**
 * Sinkronisasi semua loan lokal yang belum disync
 * (syncTime === null) ke Firestore.
 */
async function syncData() {
  if (!navigator.onLine) {
    showToast('Tidak ada koneksi internet', 'bg-rose-600');
    return;
  }

  if (!isFirebaseReady || !firestoreDB) {
    // Firebase belum dikonfigurasi — tampilkan info, jangan error
    showToast('Firebase belum dikonfigurasi. Data hanya tersimpan lokal.', 'bg-slate-600');
    return;
  }

  try {
    showToast('Menyinkronkan ke cloud...', 'bg-cyan-600');

    const loans     = await dbGetAllLoans();
    const unsynced  = loans.filter(l => l.syncTime === null);

    if (unsynced.length === 0) {
      showToast('Semua data sudah tersinkronisasi ✓', 'bg-emerald-600');
      return;
    }

    const batch = firestoreDB.batch();
    const col   = firestoreDB.collection('loans');

    unsynced.forEach(loan => {
      const docRef = col.doc(loan.id);
      batch.set(docRef, loan);
    });

    await batch.commit();

    // Tandai semua record yang sudah disync
    const syncedAt = new Date().toISOString();
    for (const loan of unsynced) {
      loan.syncTime = syncedAt;
      await dbPutLoan(loan);
    }

    showToast(`${unsynced.length} data berhasil disinkronkan!`, 'bg-emerald-600');
  } catch (err) {
    console.error('[syncData]', err);
    showToast('Gagal sinkronisasi. Coba lagi nanti.', 'bg-rose-600');
  }
}

/* ============================================
   CATATAN FIRESTORE SECURITY RULES
   Salin rules ini ke Firebase Console >
   Firestore Database > Rules:

   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Hanya izinkan baca/tulis ke koleksi loans
       // Tambahkan autentikasi jika diperlukan
       match /loans/{loanId} {
         allow read, write: if true; // Ubah sesuai kebutuhan
       }

       // Blokir akses ke koleksi lain
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ============================================ */
