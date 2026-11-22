const configuredPatientAppUrl = import.meta.env.VITE_PATIENT_APP_URL?.trim().replace(/\/+$/, '');

export function patientAccessUrl(token: string) {
  const baseUrl = configuredPatientAppUrl || window.location.origin;
  return `${baseUrl}/p/${encodeURIComponent(token)}`;
}

export function isLocalOnlyPatientUrl() {
  return !configuredPatientAppUrl && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}
