const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://elderly-care-api-9rhg.onrender.com';
    }
  }

  return 'http://localhost:5000';
};

export const API_BASE = getApiBase();
