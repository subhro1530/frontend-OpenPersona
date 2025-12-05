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
