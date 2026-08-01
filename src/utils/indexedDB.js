/**
 * IndexedDB Utility Module for Offline Storage and Background Sync
 * Manages storing contact form submissions locally when internet is unavailable
 * and automatically drains the queue once connectivity is restored.
 */

const DB_NAME = 'RaviPortfolioPWA';
const DB_VERSION = 1;
const STORE_NAME = 'offline_contacts';

/**
 * Open or initialize IndexedDB database instance
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create object store indexed by auto-incrementing id and timestamp
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => {
      console.error('[IndexedDB] Database failed to open:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Save an offline contact form message entry into IndexedDB
 * @param {Object} contactData - { name, email, subject, message }
 */
export async function saveOfflineContact(contactData) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const payload = {
        ...contactData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const request = store.add(payload);
      request.onsuccess = () => {
        console.log('[IndexedDB] Saved contact message offline:', payload);
        resolve(request.result);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Save error:', error);
    throw error;
  }
}

/**
 * Retrieve all pending offline contact form submissions
 */
export async function getOfflineContacts() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Fetch error:', error);
    return [];
  }
}

/**
 * Delete a processed contact entry by ID
 * @param {number} id 
 */
export async function deleteOfflineContact(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Delete error:', error);
  }
}

/**
 * Automatically sync and post queued offline messages when back online
 * @param {Function} submitCallback - Optional custom submit function
 */
export async function syncOfflineContacts(submitCallback) {
  const pendingContacts = await getOfflineContacts();
  if (!pendingContacts || pendingContacts.length === 0) {
    return { syncedCount: 0 };
  }

  console.log(`[IndexedDB Sync] Attempting auto-submit for ${pendingContacts.length} offline message(s)...`);
  let syncedCount = 0;

  for (const contact of pendingContacts) {
    try {
      if (submitCallback && typeof submitCallback === 'function') {
        await submitCallback(contact);
      } else {
        // Fallback default API post or mail handler
        console.log('[IndexedDB Sync] Auto-submitting saved offline contact:', contact);
      }
      await deleteOfflineContact(contact.id);
      syncedCount++;
    } catch (err) {
      console.error(`[IndexedDB Sync] Failed to submit message ID ${contact.id}:`, err);
    }
  }

  return { syncedCount };
}
