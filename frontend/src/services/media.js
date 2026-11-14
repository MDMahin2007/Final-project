const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export const getMediaUrl = (relativeUrl) => {
  if (!relativeUrl) return "";
  if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return `${apiBaseUrl.replace(/\/api\/?$/, "")}${relativeUrl}`;
  }

  return relativeUrl;
};

export const getInitial = (name) => name?.trim()?.charAt(0)?.toUpperCase() || "S";
