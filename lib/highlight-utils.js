const coerceDetail = (detail) => {
  if (detail === null || typeof detail === "undefined") {
    return { raw: null, safe: null };
  }
  if (typeof detail === "string" || typeof detail === "number") {
    return { raw: detail, safe: detail };
  }
  if (Array.isArray(detail)) {
    return { raw: detail, safe: JSON.stringify(detail) };
  }
  if (typeof detail === "object") {
    const readable =
      detail.summary || detail.description || JSON.stringify(detail);
    return { raw: detail, safe: readable };
  }
  return { raw: detail, safe: String(detail) };
};

export const sanitizeHighlightsPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;

  const sanitizeMoment = (moment) => {
    if (!moment) return moment;
    const { raw, safe } = coerceDetail(moment.detail);
    return {
      ...moment,
      detail: safe,
      detailMeta: raw,
    };
  };

  const sanitizeTalkingPoint = (point) => {
    if (point === null || typeof point === "undefined") return point;
    if (typeof point === "string") {
      const { raw, safe } = coerceDetail(point);
      return { text: safe, textMeta: raw };
    }
    const { raw, safe } = coerceDetail(point.text ?? point);
    const { raw: contextRaw, safe: contextSafe } = coerceDetail(point.context);
    return {
      ...point,
      text: safe,
      textMeta: raw,
      context: contextSafe,
      contextMeta: contextRaw,
    };
  };

  const moments = Array.isArray(payload.moments)
    ? payload.moments.map(sanitizeMoment)
    : [];
  const talkingPoints = Array.isArray(payload.talkingPoints)
    ? payload.talkingPoints.map(sanitizeTalkingPoint)
    : [];

  const { raw: momentumRaw, safe: momentumSafe } = coerceDetail(
    payload.momentum
  );

  return {
    ...payload,
    moments,
    talkingPoints,
    momentum: momentumSafe,
    momentumMeta: momentumRaw,
  };
};

export const getHighlightDetail = (item) => {
  if (!item) return null;
  if (Object.prototype.hasOwnProperty.call(item, "detailMeta")) {
    return item.detailMeta ?? item.detail ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(item, "textMeta")) {
    return item.textMeta ?? item.text ?? null;
  }
  return item.detail ?? item.text ?? null;
};

export const getHighlightContext = (item) => {
  if (!item) return null;
  return item.contextMeta ?? item.context ?? null;
};

export const getMomentumDetail = (payload) => {
  if (!payload) return null;
  return payload.momentumMeta ?? payload.momentum ?? null;
};
