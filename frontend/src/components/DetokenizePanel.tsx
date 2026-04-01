import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle2, Info } from "lucide-react";

interface DetokenizePanelProps {
  prefillToken?: string;
}

const DetokenizePanel = ({ prefillToken }: DetokenizePanelProps) => {
  const [token, setToken] = useState("");
  const [revealed, setRevealed] = useState<{ original: string; column: string; row: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillToken) {
      setToken(prefillToken);
      setRevealed(null);
      setVisible(false);
      setError("");
    }
  }, [prefillToken]);

  const handleDetokenize = async () => {
    if (!token.trim()) {
      setError("Please enter a token ID.");
      return;
    }
    if (!token.startsWith("TKN_")) {
      setError("Invalid token format. Expected TKN_ prefix.");
      return;
    }

    setError("");
    setRevealed(null);
    setVisible(false);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/detokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Detokenization failed.");
        setLoading(false);
        return;
      }

      setRevealed(data);
    } catch {
      setError("Failed to reach the backend. Make sure the server is running.");
    }

    setLoading(false);
  };

  return (
    <div className="surface-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Detokenization Vault</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        Enter a token ID to retrieve the original value. All lookups are recorded in the audit trail.
      </p>

      <div className="space-y-4">
        <div>
          <label className="label-uppercase mb-1.5 block">Token ID</label>
          <input
            type="text"
            placeholder="TKN_8f2a_991z"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDetokenize()}
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono-data text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        <button
          onClick={handleDetokenize}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm font-medium hover:bg-primary/15 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Decrypting...
            </span>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Reveal Original Value
            </>
          )}
        </button>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="surface-inset p-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs text-success font-medium">Value Retrieved</span>
                  </div>
                  <button onClick={() => setVisible(!visible)} className="text-muted-foreground hover:text-foreground">
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-mono-data text-sm text-foreground">
                  {visible ? revealed.original : "••••••••••••••••"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Info className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[0.65rem] text-muted-foreground">
                    Column: <span className="text-foreground">{revealed.column}</span> • Row: <span className="text-foreground">{revealed.row + 1}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DetokenizePanel;
