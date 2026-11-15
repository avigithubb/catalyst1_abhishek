const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let trimmed = envUrl.trim().replace(/\/+$/, '');
    
    // If it doesn't start with http:// or https://
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      // If it's a bare service name from Render without domain (e.g. "elderly-care-api-9rhg" or "elderly-care-api-ob1n")
      if (!trimmed.includes('.')) {
        trimmed = `${trimmed}.onrender.com`;
      }
      trimmed = `https://${trimmed}`;
    } else {
      // If it already has http/https but the hostname has no dot
      try {
        const parsed = new URL(trimmed);
        if (!parsed.hostname.includes('.') && parsed.hostname.startsWith('elderly-care-api')) {
          trimmed = `${parsed.protocol}//${parsed.hostname}.onrender.com`;
        }
      } catch {}
    }
    return trimmed;
  }

  // Automatic browser-side matching for Render static deployments
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com')) {
      // If deployed as elderly-care-web-XXXX.onrender.com, match elderly-care-api-XXXX.onrender.com
      const match = hostname.match(/elderly-care-web-([a-z0-9]+)\.onrender\.com/i);
      if (match && match[1]) {
        return `https://elderly-care-api-${match[1]}.onrender.com`;
      }
      return 'https://elderly-care-api-9rhg.onrender.com';
    }
  }

  return 'http://localhost:5000';
};

export const API_BASE = getApiBase();

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '842528733087-bsioqsusspm1k8sbve7houv0n328chvr.apps.googleusercontent.com';

