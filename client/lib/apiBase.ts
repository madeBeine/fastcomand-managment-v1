export async function detectApiBase(): Promise<string> {
  if (typeof window === 'undefined') return '/api';
  const w = window as any;
  if (w.__API_BASE__) return w.__API_BASE__;

  const tryPing = async (base: string) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${base}/ping`, { signal: controller.signal, credentials: 'same-origin' });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  };

  const candidates = ['/api', '/.netlify/functions/api'];
  for (const base of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await tryPing(base);
    if (ok) {
      w.__API_BASE__ = base;
      return base;
    }
  }
  w.__API_BASE__ = '/api';
  return '/api';
}

export async function ensureApiBase() {
  await detectApiBase();
}
