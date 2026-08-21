import { Settings } from '../types';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Detect Platform
export function getDeviceInfo() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome|crios|crmo/.test(userAgent);
  
  // Check if running as standalone PWA
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  return {
    isIOS,
    isAndroid,
    isMobile,
    isSafari,
    isStandalone,
    userAgent,
  };
}

// Update Dynamic Favicon, Apple Touch Icon & Web Manifest
export function updateDynamicPWABranding(settings: Settings | null) {
  try {
    const businessName = settings?.name || 'AL Studio Gestão';
    const businessLogo = settings?.logo;
    const themeColor = settings?.primaryColor || '#dc2626';

    // 1. Update Title and Theme Color
    document.title = businessName;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', themeColor);

    const metaAppleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (metaAppleTitle) metaAppleTitle.setAttribute('content', businessName);

    const metaAppName = document.querySelector('meta[name="application-name"]');
    if (metaAppName) metaAppName.setAttribute('content', businessName);

    // 2. Update Favicon and Apple Touch Icon
    const iconUrl = businessLogo || '/icon.svg';
    const favUrl = businessLogo || '/favicon.svg';

    let favLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!favLink) {
      favLink = document.createElement('link');
      favLink.rel = 'icon';
      document.head.appendChild(favLink);
    }
    favLink.href = favUrl;

    let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = iconUrl;

    // 3. Dynamic Web Manifest Blob (Updates app name and custom icon for PWA install)
    const customManifest = {
      name: businessName,
      short_name: businessName.length > 12 ? businessName.slice(0, 12) : businessName,
      description: `Sistema de gestão offline-first para ${businessName}`,
      id: `al-studio-${businessName.toLowerCase().replace(/\s+/g, '-')}`,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      orientation: 'any',
      background_color: '#0c0a09',
      theme_color: themeColor,
      categories: ['business', 'finance', 'productivity'],
      lang: 'pt-BR',
      icons: [
        {
          src: iconUrl,
          sizes: '192x192 512x512',
          type: businessLogo ? 'image/png' : 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: iconUrl,
          sizes: '192x192 512x512',
          type: businessLogo ? 'image/png' : 'image/svg+xml',
          purpose: 'maskable',
        },
        {
          src: favUrl,
          sizes: '64x64 32x32',
          type: businessLogo ? 'image/png' : 'image/svg+xml',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(customManifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    if (manifestLink) {
      manifestLink.href = manifestUrl;
    }
  } catch (err) {
    console.warn('[PWA] Could not dynamically update manifest:', err);
  }
}

// Request Persistent Storage
export async function requestPersistentStorage(): Promise<{
  isPersisted: boolean;
  quota?: number;
  usage?: number;
}> {
  let isPersisted = false;
  let quota: number | undefined;
  let usage: number | undefined;

  if (navigator.storage && navigator.storage.persist) {
    isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      isPersisted = await navigator.storage.persist();
    }
  }

  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    quota = estimate.quota;
    usage = estimate.usage;
  }

  return { isPersisted, quota, usage };
}
