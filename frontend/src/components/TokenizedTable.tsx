import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Search, ShieldCheck, Copy, Check } from "lucide-react";

interface TokenizedTableProps {
  rawData: Record<string, string>[];
  sensitiveColumns?: string[];
  onNavigateToVault?: (token: string) => void;
}

const TokenizedTable = ({ rawData, sensitiveColumns = [], onNavigateToVault }: TokenizedTableProps) => {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [scrambling, setScrambling] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    setScrambling(true);
    const timer = setTimeout(() => {
      setData(rawData);
      setScrambling(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawData]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const filtered = data.filter((row) =>
    Object.values(row).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  const isSensitive = (col: string) =>
    sensitiveColumns.some((sc) => sc.toLowerCase() === col.toLowerCase());

  const handleTokenClick = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 1500);
      // Navigate to vault with the token pre-filled
      if (onNavigateToVault) {
        setTimeout(() => onNavigateToVault(token), 600);
      }
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const header = columns.join(",");
    const rows = filtered.map((row) => columns.map((c) => row[c]).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tokenized_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="surface-panel">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success" />
          <h3 className="text-sm font-semibold text-foreground">Tokenized Output</h3>
          <span className="text-xs text-muted-foreground font-mono-data">{filtered.length} records</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-48"
            />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-md text-sm font-medium hover:bg-success/15 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 backdrop-blur-md sticky top-0">
              {columns.map((col) => (
                <th key={col} className="text-left px-4 py-3 label-uppercase border-b border-border">
                  <span className="flex items-center gap-1.5">
                    {col}
                    {isSensitive(col) && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning" title="PII Detected" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03, type: "spring", duration: 0.4, bounce: 0 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3">
                    {isSensitive(col) ? (
                      <button
                        onClick={() => handleTokenClick(String(row[col]))}
                        className={`token-pill cursor-pointer hover:brightness-125 transition-all group relative ${scrambling ? "animate-scramble" : ""}`}
                        title="Click to copy & look up in Vault"
                      >
                        {copiedToken === String(row[col]) ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Copied!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {String(row[col])}
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        )}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">{String(row[col])}</span>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenizedTable;
