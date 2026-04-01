import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Database, Activity } from "lucide-react";

const stats = [
  { label: "Records Processed", value: "24,891", icon: Database, change: "+1,204 today" },
  { label: "Sensitive Fields", value: "142", icon: AlertTriangle, change: "14 types detected", accent: "warning" as const },
  { label: "Token Density", value: "98.7%", icon: ShieldCheck, change: "Fully secured", accent: "success" as const },
  { label: "Risk Score", value: "Low", icon: Activity, change: "Last scan: 2m ago", accent: "success" as const },
];

const accentMap = {
  warning: "text-warning",
  success: "text-success",
};

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: "spring", duration: 0.4, bounce: 0 }}
          className="surface-panel p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="label-uppercase">{stat.label}</p>
            <stat.icon className={`w-4 h-4 ${stat.accent ? accentMap[stat.accent] : "text-primary"}`} />
          </div>
          <p className="text-2xl font-semibold text-foreground font-mono-data tracking-tight">{stat.value}</p>
          <p className={`text-xs mt-1 ${stat.accent ? accentMap[stat.accent] : "text-muted-foreground"}`}>
            {stat.change}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
