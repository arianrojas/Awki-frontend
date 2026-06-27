const DB_NAME = 'awki_offline_db';
const STORE_NAME = 'mensajes_offline';
const DB_VERSION = 1;

export const indexedDbHelper = {
  inicializarDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Error abriendo IndexedDB:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  },

  guardarMensajeOffline(mensaje) {
    return this.inicializarDb().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(mensaje);

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
      });
    });
  },

  obtenerMensajesOffline() {
    return this.inicializarDb().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result || []);
        request.onerror = (event) => reject(event.target.error);
      });
    });
  },

  eliminarMensajeOffline(id) {
    return this.inicializarDb().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
      });
    });
  },

  limpiarMensajesOffline() {
    return this.inicializarDb().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
      });
    });
  }
};
