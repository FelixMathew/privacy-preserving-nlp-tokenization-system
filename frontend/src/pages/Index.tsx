import { useState } from "react";
import CipherSidebar from "@/components/CipherSidebar";
import StatsCards from "@/components/StatsCards";
import UploadZone from "@/components/UploadZone";
import TokenizedTable from "@/components/TokenizedTable";
import DetokenizePanel from "@/components/DetokenizePanel";
import ActivityLog from "@/components/ActivityLog";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tokenizedData, setTokenizedData] = useState<Record<string, string>[]>([]);
  const [sensitiveColumns, setSensitiveColumns] = useState<string[]>([]);
  const [vaultToken, setVaultToken] = useState("");

  const handleFileProcessed = (data: Record<string, string>[], sensitiveCols: string[]) => {
    setTokenizedData(data);
    setSensitiveColumns(sensitiveCols);
    setActiveTab("data");
  };

  const handleNavigateToVault = (token: string) => {
    setVaultToken(token);
    setActiveTab("detokenize");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CipherSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground capitalize">{activeTab}</h2>
            <p className="text-xs text-muted-foreground">
              {activeTab === "dashboard" && "System overview and health metrics"}
              {activeTab === "upload" && "Ingest and tokenize sensitive data"}
              {activeTab === "data" && "Review tokenized records"}
              {activeTab === "detokenize" && "Authorized value retrieval"}
              {activeTab === "logs" && "Complete audit trail"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="status-dot-success" />
              <span className="text-xs text-muted-foreground">AI Engine Active</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === "dashboard" && (
            <>
              <StatsCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <UploadZone onFileProcessed={handleFileProcessed} />
                </div>
                <ActivityLog />
              </div>
              {tokenizedData.length > 0 && (
                <TokenizedTable
                  rawData={tokenizedData}
                  sensitiveColumns={sensitiveColumns}
                  onNavigateToVault={handleNavigateToVault}
                />
              )}
            </>
          )}

          {activeTab === "upload" && (
            <UploadZone onFileProcessed={handleFileProcessed} />
          )}

          {activeTab === "data" && (
            tokenizedData.length > 0 ? (
              <TokenizedTable
                rawData={tokenizedData}
                sensitiveColumns={sensitiveColumns}
                onNavigateToVault={handleNavigateToVault}
              />
            ) : (
              <div className="surface-panel p-12 text-center">
                <p className="text-muted-foreground text-sm">No tokenized data available. Upload and process a file first.</p>
              </div>
            )
          )}

          {activeTab === "detokenize" && (
            <div className="max-w-lg">
              <DetokenizePanel prefillToken={vaultToken} />
            </div>
          )}

          {activeTab === "logs" && <ActivityLog />}
        </div>
      </main>
    </div>
  );
};

export default Index;
