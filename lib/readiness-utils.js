const toArray = (value) => (Array.isArray(value) ? value : []);

export const interpretReadiness = (input) => {
  if (typeof input === "number") {
    return {
      percent: input,
      ready: input >= 100,
      missing: [],
      requirements: [],
      summary: null,
    };
  }

  if (!input || typeof input !== "object") {
    return {
      percent: 0,
      ready: false,
      missing: [],
      requirements: [],
      summary: null,
    };
  }

  const requirements = toArray(input.requirements);
  const missing = toArray(input.missing);
  let percent = input.percent ?? input.score ?? input.value;

  if (typeof percent !== "number" && requirements.length) {
    const completed = requirements.length - missing.length;
    percent = Math.round((completed / requirements.length) * 100);
  }

  if (typeof percent !== "number") {
    percent = input.ready === true ? 100 : 0;
  }

  return {
    percent,
    ready: input.ready === true || percent >= 100,
    missing,
    requirements,
    summary: input.summary || input.description || null,
  };
};

export const describeMissing = (missing) =>
  toArray(missing).map((item, idx) => ({
    id: item?.key || item?.id || idx,
    label: item?.label || item?.description || String(item),
  }));
