// lib/pyodide.ts

// Add type declaration for the global loadPyodide if not automatically picked up
declare global {
    interface Window {
      loadPyodide: (options?: { indexURL?: string }) => Promise<PyodideInterface>;
    }
  }
  
  export interface PyodideInterface {
    loadPackage: (packages: string | string[], messageCallback?: (message: string) => void, errorCallback?: (error: string) => void) => Promise<void>;
    runPythonAsync: (code: string) => Promise<any>;
    pyimport: (module: string) => any;
    setStdout: (options: { batched: (msg: string) => void }) => void;
    setStderr: (options: { batched: (msg: string) => void }) => void;
    [key: string]: any;
  }
  
  
  let pyodideInstance: PyodideInterface | null = null;
  
  export async function getPyodideClient() {
    if (pyodideInstance) {
      return pyodideInstance;
    }
    console.log("Loading Pyodide from public directory...");
  
    if (typeof window.loadPyodide === 'undefined') {
      console.error("window.loadPyodide is not defined. Ensure pyodide.js is loaded by PyodideProvider.");
      throw new Error("Pyodide script not loaded.");
    }
  
    pyodideInstance = await window.loadPyodide({
      indexURL: "/pyodide/", // Points to your public/pyodide/ directory
    });
    console.log("Pyodide core loaded from public.");
  
    // --- START OF FIX ---
    console.log("Explicitly loading micropip package...");
    try {
      await pyodideInstance.loadPackage("micropip"); // <--- ADD THIS LINE
      console.log("Micropip package loaded successfully via loadPackage.");
    } catch (e) {
      console.error("Error loading micropip via loadPackage:", e);
      // Optionally, re-throw or handle this error if micropip is absolutely critical
      // For now, we'll let it proceed to pyimport to see if it somehow self-resolved
    }
    // --- END OF FIX ---
  
  
    console.log("Importing micropip into Python environment...");
    await pyodideInstance.loadPackage("micropip");
const micropip = pyodideInstance.pyimport("micropip");

    console.log("Micropip Python module imported. Installing other packages...");
  
    // Define a simple message callback for package loading
    const packageLoadMsgCallback = (msg: string) => {
      console.log("Package loading (micropip):", msg);
    };
  
    await micropip.install(['numpy', 'pandas', 'matplotlib', 'seaborn'], { successCallback: packageLoadMsgCallback, errorCallback: packageLoadMsgCallback });
    console.log("Core DS packages installed via micropip.");
    return pyodideInstance;
  }