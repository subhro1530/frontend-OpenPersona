export const normalizeDashboardsPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.dashboards && Array.isArray(payload.dashboards)) {
    return payload.dashboards;
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload?.items && Array.isArray(payload.items)) {
    return payload.items;
  }

  if (payload && typeof payload === "object") {
    return Object.values(payload).filter(
      (item) => item && typeof item === "object"
    );
  }

  return [];
};

export const normalizeResumesPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.resumes && Array.isArray(payload.resumes)) {
    return payload.resumes;
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload?.items && Array.isArray(payload.items)) {
    return payload.items;
  }

  if (payload && typeof payload === "object") {
    return Object.values(payload).filter(
      (item) => item && typeof item === "object"
    );
  }

  return [];
};

export const normalizeArrayPayload = (payload, key = null) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (key && payload?.[key] && Array.isArray(payload[key])) {
    return payload[key];
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload?.items && Array.isArray(payload.items)) {
    return payload.items;
  }

  if (payload && typeof payload === "object") {
    return Object.values(payload).filter(
      (item) => item && typeof item === "object"
    );
  }

  return [];
};

export const getFrontendUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
};
