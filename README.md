# 🚀 Ravi Kumar | Portfolio 2026 (Offline-Capable PWA)

A high-performance, modern portfolio built with **React**, **Three.js / WebGL**, **GSAP**, **Tailwind CSS**, and converted into a **100% Offline-Capable Progressive Web App (PWA)**.

---

## ⚡ PWA Features & Architecture

### 1. Complete Offline Capabilities
After the first visit, the portfolio functions completely offline:
- **Homepage & Hero 3D Canvas**: Interactive Three.js planet model (`Planet.glb`) is precached and works offline.
- **About, Skills, Projects & Services**: All copy, typography, and section layouts remain functional offline.
- **Images & Icons**: Portfolio project screenshots and dev portraits load directly from Cache Storage.
- **Fonts & Styles**: Local and Google Fonts (`Inter`) are precached using Cache-First strategies.

### 2. Cache Caching Strategies (Cache Storage API)
| Asset Type | Strategy | Cache Storage Bucket |
| :--- | :--- | :--- |
| **HTML Navigation** | Network First with Offline Fallback (`offline.html`) | `static-folio-v1.0.0` |
| **JS / CSS Bundles** | Cache First (Stale-While-Revalidate) | `static-folio-v1.0.0` |
| **3D Models (`.glb`)** | Cache First | `models-folio-v1.0.0` |
| **Images (`.png`, `.jpg`, `.svg`)** | Cache First | `images-folio-v1.0.0` |
| **Fonts (Google / Local)** | Cache First | `fonts-folio-v1.0.0` |
| **Backend API Requests** | Network First with Offline Fallback | `apis-folio-v1.0.0` |

### 3. Background Sync & Offline Contact Form (IndexedDB)
If a user submits the Contact Form while offline:
1. The message payload is saved locally into **IndexedDB** (`RaviPortfolioPWA` -> `offline_contacts`).
2. The user is notified: *"You are offline. Message saved locally and will auto-submit when online!"*.
3. Background Sync listens for network recovery (`window.addEventListener('online', ...)` & Service Worker `sync-contact-form`).
4. As soon as connectivity returns, queued messages are automatically submitted to the backend server and cleared from IndexedDB.

### 4. Cross-Platform App Installation
Users can install the portfolio app natively on:
- 📱 **Android**
- 💻 **Windows**
- 🍎 **macOS**
- 🐧 **Linux**

A sleek, unobtrusive install prompt banner (`InstallPWA.jsx`) automatically appears when browser support is detected.

### 5. Deployment Update Detection & Cache Cleanup
- **Automatic Cache Versioning**: Old caches (`folio-v...`) are automatically deleted during the Service Worker `activate` event upon every new deployment.
- **Instant Update Prompt**: When a new version is deployed, a toast notification (`UpdateNotification.jsx`) displays:
  > **New version available** `[Update Now]`
  > Clicking **Update Now** triggers `skipWaiting()` and reloads the page with fresh assets.

### 6. Offline Fallback Page (`offline.html`)
If an uncached URL or page navigation occurs while offline, a custom dark-themed fallback screen is rendered:
> *"You're offline. Reconnect to load new content."*

---

## 🛠️ Development & Building

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Running Locally (Development Mode)
```bash
npm run dev
```

### Production Build & PWA Testing
To test Service Worker caching and PWA functionality:

```bash
# Build production bundle with minification and Rollup code splitting
npm run build

# Preview production build locally
npm run preview
```

### Testing Offline Mode in Chrome DevTools
1. Run `npm run build` followed by `npm run preview`.
2. Open `http://localhost:4173` (or Vite preview URL).
3. Open Chrome DevTools (`F12` or `Ctrl+Shift+I`).
4. Go to the **Application** tab:
   - Check **Manifest**: Verify icons, theme colors (`#000000`), standalone display.
   - Check **Service Workers**: Verify `/service-worker.js` status is `Activated and running`.
   - Check **Cache Storage**: Inspect precached static files, images, fonts, and 3D GLB model.
5. Go to the **Network** tab:
   - Check the **Offline** box.
   - Refresh the page to verify that the website, 3D Canvas, images, and animations work completely offline.
   - Submit the contact form while offline to verify IndexedDB queuing.
   - Uncheck **Offline** to test automatic submission when reconnected.

---

## 🎯 Target Lighthouse Performance Metrics
- **Performance**: > 95
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 95
- **PWA**: 100

