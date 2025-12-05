const unauthorizedListeners = new Set();

export const subscribeUnauthorized = (listener) => {
  if (typeof listener !== "function") return () => {};
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
};

export const emitUnauthorized = () => {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Unauthorized listener failed", err);
    }
  });
};
