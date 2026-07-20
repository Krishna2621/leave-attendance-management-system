const listeners = new Set();

export const subscribeToAuthEvents = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const emitAuthEvent = (event) => listeners.forEach((listener) => listener(event));
