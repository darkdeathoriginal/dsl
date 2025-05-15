// components/PyodideProvider.tsx
'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getPyodideClient, PyodideInterface } from '@/lib/pyodide'; // Adjust path

interface PyodideContextType {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  error: Error | null;
}

const PyodideContext = createContext<PyodideContextType | undefined>(undefined);

export const PyodideProvider = ({ children }: { children: ReactNode }) => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const scriptId = "pyodide-script";

    // Check if script already exists
    if (document.getElementById(scriptId)) {
        loadPyodideInstance();
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = '/pyodide/pyodide.js'; // Path to pyodide.js in your public folder
    script.async = true;
    script.onload = () => {
      if (isMounted) {
        console.log("Pyodide.js script loaded successfully.");
        loadPyodideInstance();
      }
    };
    script.onerror = (e) => {
      if (isMounted) {
        console.error("Failed to load pyodide.js script:", e);
        setError(new Error("Failed to load pyodide.js script"));
        setIsLoading(false);
      }
    };
    document.body.appendChild(script);

    async function loadPyodideInstance() {
      try {
        // Ensure window.loadPyodide is available after script load
        if (typeof window.loadPyodide !== 'function') {
            await new Promise(resolve => setTimeout(resolve, 100)); // short delay for script to fully initialize
            if (typeof window.loadPyodide !== 'function') {
                throw new Error("window.loadPyodide is not available after script load.");
            }
        }
        const instance = await getPyodideClient(); // This will now use window.loadPyodide
        if (isMounted) {
          setPyodide(instance);
        }
      } catch (e) {
        if (isMounted) {
          setError(e as Error);
        }
        console.error("Failed to initialize Pyodide instance:", e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    return () => {
      isMounted = false;
      // Optional: remove script if component unmounts, though usually not necessary
      // const existingScript = document.getElementById(scriptId);
      // if (existingScript) {
      //   document.body.removeChild(existingScript);
      // }
    };
  }, []);

  return (
    <PyodideContext.Provider value={{ pyodide, isLoading, error }}>
      {children}
    </PyodideContext.Provider>
  );
};

export const usePyodide = () => {
  const context = useContext(PyodideContext);
  if (context === undefined) {
    throw new Error('usePyodide must be used within a PyodideProvider');
  }
  return context;
};