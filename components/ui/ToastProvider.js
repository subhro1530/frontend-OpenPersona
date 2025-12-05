"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext({ notify: () => {} });

export const ToastProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const notify = useCallback((payload) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, ...payload }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[999] flex flex-col gap-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-auto glass rounded-2xl border border-white/10 px-5 py-4"
            >
              <p className="text-sm font-semibold text-white">{item.title}</p>
              {item.message && (
                <p className="text-xs text-white/70">{item.message}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
