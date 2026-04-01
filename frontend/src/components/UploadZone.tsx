import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, Loader2, Lock } from "lucide-react";

interface UploadZoneProps {
  onFileProcessed: (data: Record<string, string>[], sensitiveColumns: string[]) => void;
}

const UploadZone = ({ onFileProcessed }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scanPhase, setScanPhase] = useState("");
  const [error, setError] = useState("");

  const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

  const isAcceptedFile = (f: File) =>
    ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext));

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && isAcceptedFile(f)) {
      setFile(f);
      setError("");
    } else {
      setError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError("");
    }
  }, []);

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    setError("");

    setScanPhase("Uploading file to engine...");
    await new Promise((r) => setTimeout(r, 400));

    setScanPhase("Scanning for PII patterns...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }

      setScanPhase("Identifying sensitive columns...");
      await new Promise((r) => setTimeout(r, 500));

      const result = await response.json();

      setScanPhase("Generating secure tokens...");
      await new Promise((r) => setTimeout(r, 400));

      setScanPhase("Validating token integrity...");
      await new Promise((r) => setTimeout(r, 300));

      setProcessing(false);
      setScanPhase("");
      onFileProcessed(result.data, result.sensitive_columns);
    } catch (err: any) {
      setProcessing(false);
      setScanPhase("");
      setError(err.message || "Failed to process file. Make sure the backend is running.");
    }
  };

  return (
    <div className="surface-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Secure Ingestion Engine</h2>
          <p className="text-xs text-muted-foreground mt-1">AI-driven PII detection active. Drop a CSV or XLSX file to begin.</p>
        </div>
        {file && !processing && (
          <button
            onClick={processFile}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:brightness-110 transition-all active:scale-[0.98]"
            style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.2)" }}
          >
            <Lock className="w-4 h-4" />
            Tokenize Data
          </button>
        )}
      </div>

      {processing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm text-primary">{scanPhase}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent bg-[length:200%_100%] animate-shimmer rounded-full" />
          </div>
        </motion.div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
          {error}
        </div>
      )}

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm text-foreground font-medium">
            Drop CSV / XLSX file here or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Supports .csv, .xlsx, .xls files up to 50MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 surface-inset px-4 py-3">
          <FileText className="w-5 h-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          {!processing && (
            <button onClick={() => { setFile(null); setError(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadZone;