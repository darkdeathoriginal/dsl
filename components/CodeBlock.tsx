// components/CodeBlock.tsx
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { usePyodide } from './PyodideProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Editor from '@monaco-editor/react';

// Helper to dedent strings (if you're using it)
function dedent(str: string): string {
    const lines = str.split('\n');
    if (lines.length === 0) return '';
    const firstLineTrimmed = lines[0].trimStart();
    if (lines.length === 1 && lines[0] === firstLineTrimmed) return lines[0]; // single line, no leading indent

    let minIndent: number | null = null;
    for (const line of lines) {
        if (line.trim() === '') continue;
        const match = line.match(/^(\s*)/);
        if (match) {
            const indentLength = match[0].length;
            if (minIndent === null || indentLength < minIndent) {
                minIndent = indentLength;
            }
        }
    }
    if (minIndent === null || minIndent === 0) {
        return str.trim();
    }
    return lines.map(line => {
        if (line.trim() === '') return ''; // Keep empty lines as they are, or remove common indent if they have it
        return line.length >= minIndent! ? line.substring(minIndent!) : line;
    }).join('\n').trim();
}


interface CodeBlockProps {
  initialCode: string;
  showOutput?: boolean;
  isPlot?: boolean;
}

// Store original handlers outside component to preserve them across instances
let originalStdout: any = null;
let originalStderr: any = null;
let pyodideInstanceRefForStdHandles: any = null; // To ensure we only get originals once

export const CodeBlock: React.FC<CodeBlockProps> = ({
  initialCode,
  showOutput = true,
  isPlot = false,
}) => {
  const { pyodide, isLoading: pyodideLoading, error: pyodideError } = usePyodide();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>('');
  const outputPlotRef = useRef<HTMLImageElement>(null);

  // Get original stdout/stderr handlers once when Pyodide is available
  useEffect(() => {
    if (pyodide && !originalStdout && pyodide !== pyodideInstanceRefForStdHandles) {
      // This is a bit of a hack to get the "default" console stdout/stderr
      // if Pyodide has them. Otherwise, they might be null or undefined.
      // A more robust way would be if Pyodide exposed its default handlers.
      // For now, we assume they might be console.log or a Pyodide internal.
      // We capture them to restore later.
      console.log("Capturing original Pyodide stdout/stderr handlers (if any).");
      originalStdout = pyodide._module.print || console.log; // Pyodide's internal or fallback
      originalStderr = pyodide._module.printErr || console.error;
      pyodideInstanceRefForStdHandles = pyodide;
    }
  }, [pyodide]);

  const runCode = useCallback(async () => { // useCallback to memoize if passed down
    if (!pyodide || pyodideLoading || pyodideError) {
      setError("Pyodide is not ready or failed to load.");
      return;
    }
    setIsRunning(true);
    setOutput(''); // Clear previous output for this specific block
    setError('');   // Clear previous error for this specific block
    if(outputPlotRef.current) outputPlotRef.current.src = "";

    // Store current stdout/stderr to restore them
    // These might be console.log/error if originalStdout/Stderr were not set by Pyodide yet
    const prevStdout = pyodide._module.print;
    const prevStderr = pyodide._module.printErr;

    // Redirect stdout/stderr for this execution
    pyodide.setStdout({ batched: (msg) => setOutput((prev) => prev + msg + '\n') });
    pyodide.setStderr({ batched: (msg) => setError((prev) => prev + msg + '\n') });

    try {
      const processedCode = dedent(code);
      if (isPlot) {
        const finalPythonScriptForPlot = `
import matplotlib.pyplot as plt
import base64
from io import BytesIO
plt.clf()
plt.cla()
plt.close('all')
${processedCode}
buf = BytesIO()
plt.savefig(buf, format="png")
buf.seek(0)
img_str = base64.b64encode(buf.read()).decode('utf-8')
buf.close()
img_str
`;
        // console.log("--- Plot Script --- \n", finalPythonScriptForPlot, "\n--- End Plot Script ---");
        const img_str_result = await pyodide.runPythonAsync(finalPythonScriptForPlot);
        if (outputPlotRef.current && typeof img_str_result === 'string') {
          outputPlotRef.current.src = `data:image/png;base64,${img_str_result}`;
        }
      } else {
        // console.log("--- Regular Script --- \n", processedCode, "\n--- End Regular Script ---");
        const result = await pyodide.runPythonAsync(processedCode);
        if (result !== undefined && result !== null) { // Avoid printing 'None' or 'undefined'
            // setOutput((prev) => prev + String(result) + '\n'); // Pyodide's runPythonAsync often prints result itself if it's the last expr
        }
      }
    } catch (e: any) {
      console.error("Python execution error:", e);
      // setError is already called by the redirected stderr, but we can add more info
      setError((prevErr) => prevErr + (e.message || String(e)) + (e.name === "PythonError" && e.stack ? `\n${e.stack}`: ''));
    } finally {
      // Restore previous stdout/stderr handlers
      // This is important so other blocks or default logging works correctly
      if (prevStdout) pyodide.setStdout({ batched: prevStdout });
      else if (originalStdout) pyodide.setStdout({ batched: originalStdout }); // Fallback to originally captured
      else pyodide.setStdout({
          batched: function (): void {
              throw new Error('Function not implemented.');
          }
      }); // Or set to no-op / default if nothing was captured

      if (prevStderr) pyodide.setStderr({ batched: prevStderr });
      else if (originalStderr) pyodide.setStderr({ batched: originalStderr }); // Fallback
      else pyodide.setStderr({
          batched: function (): void {
              throw new Error('Function not implemented.');
          }
      });

      setIsRunning(false);
    }
  }, [pyodide, pyodideLoading, pyodideError, code, isPlot]); // Dependencies for useCallback

  // Loading and error states for Pyodide itself
  if (pyodideLoading) {
    return <Card><CardContent><p className="p-4 text-sm">Loading Python environment...</p></CardContent></Card>;
  }
  if (pyodideError) {
    return (
      <Alert variant="destructive" className="my-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Pyodide Global Error</AlertTitle>
        <AlertDescription>Could not load Python environment: {pyodideError.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Interactive Python Code</CardTitle>
      </CardHeader>
      <CardContent>
        
        {/* <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={Math.max(5, initialCode.split('\n').length + 1)} // Min 5 rows
          className="font-mono text-sm p-2 border rounded-md bg-background w-full"
          placeholder="Enter Python code here..."
        /> */}
         <Editor
         height={Math.max(200, initialCode.split('\n').length * 20)} // Adjust height based on lines
      defaultLanguage="python"
      defaultValue={initialCode}
      onChange={(value) =>{setCode(value as string)}}
          theme='vs-dark'
    />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <Button onClick={runCode} disabled={isRunning || !pyodide}>
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>
        {showOutput && (
          <>
            {error && (
               <Alert variant="destructive" className="w-full mt-2">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Execution Error</AlertTitle>
                <AlertDescription>
                    <pre className="whitespace-pre-wrap text-xs font-mono">{error}</pre>
                </AlertDescription>
              </Alert>
            )}
            {output && !isPlot && (
                <div className="w-full mt-2 p-3 border rounded-md bg-muted">
                    <p className="text-xs font-semibold mb-1">Output:</p>
                    <pre className="whitespace-pre-wrap text-xs font-mono">{output}</pre>
                </div>
            )}
            {isPlot && ( /* Only show img if isPlot, error for plots will be in 'error' state */
                <div className="w-full mt-2 p-3 border rounded-md bg-muted">
                     <p className="text-xs font-semibold mb-1">Plot Output:</p>
                    <img ref={outputPlotRef} alt="Matplotlib Plot Output" className="max-w-full h-auto bg-white" />
                </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};