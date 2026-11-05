/* ============================================
   db.js — IndexedDB Wrapper
   Sie Perlengkapan KIR | Camp Riset 2026
   ============================================ */

const DB_NAME = 'CampRisetDB';
const DB_VER  = 1;
let db;

/**
 * Membuka / meng-upgrade database IndexedDB.
 * @returns {Promise<IDBDatabase>}
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VER);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains('master')) {
        database.createObjectStore('master', { keyPath: 'code' });
      }
      if (!database.objectStoreNames.contains('loans')) {
        database.createObjectStore('loans', { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => { db = e.target.result; resolve(db); };
    request.onerror   = (e) => reject(e.target.error);
  });
}

/* ============================================
   DB HELPERS
   ============================================ */

/**
 * Menyimpan array item ke object store 'master'.
 * Validasi dasar dilakukan sebelum penyimpanan.
 * @param {Array<{code: string, name: string, limit: number|null}>} items
 */
async function dbPutMaster(items) {
  // Validasi — hanya simpan item yang memiliki code & name bertipe string
  const sanitized = items.filter(item =>
    typeof item.code === 'string' &&
    typeof item.name === 'string' &&
    item.code.length > 0 &&
    item.name.length > 0
  );

  const tx = db.transaction('master', 'readwrite');
  sanitized.forEach(item => tx.objectStore('master').put(item));
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}

/**
 * Mengambil satu item master berdasarkan kode barcode.
 * @param {string} code
 * @returns {Promise<Object|undefined>}
 */
async function dbGetMaster(code) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('master').objectStore('master').get(code);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/**
 * Mengambil semua data peminjaman.
 * @returns {Promise<Array>}
 */
async function dbGetAllLoans() {
  return new Promise((resolve, reject) => {
    const req = db.transaction('loans').objectStore('loans').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/**
 * Menyimpan atau memperbarui satu record peminjaman.
 * @param {Object} loan
 */
async function dbPutLoan(loan) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('loans', 'readwrite');
    tx.objectStore('loans').put(loan);
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}
