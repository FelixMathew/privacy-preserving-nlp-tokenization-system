import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Lock, Eye, Download, ShieldCheck, AlertTriangle, RefreshCw, XCircle } from "lucide-react";

const ICON_MAP: Record<string, typeof Upload> = {
  upload: Upload,
  scan: AlertTriangle,
  tokenize: Lock,
  detokenize: Eye,
  export: Download,
  verify: ShieldCheck,
  error: XCircle,
  info: ShieldCheck,
};

const ACCENT_MAP: Record<string, string> = {
  upload: "text-primary",
  scan: "text-warning",
  tokenize: "text-success",
  detokenize: "text-primary",
  export: "text-muted-foreground",
  verify: "text-success",
  error: "text-destructive",
  info: "text-muted-foreground",
};

interface LogEntry {
  time: string;
  action: string;
  detail: string;
  type: string;
}

const ActivityLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch {
      // Backend might not be running
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="surface-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Activity Log</h3>
        <button
          onClick={fetchLogs}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="space-y-1">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No activity yet. Upload and tokenize a file to see events here.
          </p>
        ) : (
          logs.map((entry, i) => {
            const Icon = ICON_MAP[entry.type] || ShieldCheck;
            const accent = ACCENT_MAP[entry.type] || "text-muted-foreground";
            return (
              <motion.div
                key={`${entry.time}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: "spring", duration: 0.4, bounce: 0 }}
                className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-muted/30 transition-colors"
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${accent}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{entry.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{entry.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono-data shrink-0">{entry.time}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
