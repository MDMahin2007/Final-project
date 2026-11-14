const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const legacyNetlifyApiUrl = /^https?:\/\/smart-campus-clearance\.netlify\.app(?:\/api)?\/?$/i

export const apiBaseUrl = configuredApiUrl
  ? legacyNetlifyApiUrl.test(configuredApiUrl)
    ? 'https://final-project-733w.onrender.com/api'
    : configuredApiUrl
  : '/api'
