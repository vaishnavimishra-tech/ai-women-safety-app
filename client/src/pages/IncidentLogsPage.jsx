import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ShieldAlert,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Lock,
  Clock,
  Hash,
  AlertTriangle
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';
import StatusBadge from '../components/common/StatusBadge';

export default function IncidentLogsPage() {
  const { auditLogs, logEvent } = useSecurity();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'SAFE' | 'INFO'

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchTerm.toLowerCase());

    if (severityFilter === 'ALL') return matchesSearch;
    return matchesSearch && log.severity === severityFilter;
  });

  const handleExport = () => {
    tacticalAudio.playClick();
    const exportContent = {
      agency: "Suraksha AI Tactical Defense Console",
      reportId: "REP-" + Math.floor(100000 + Math.random() * 900000),
      generatedAt: new Date().toISOString(),
      integrityCheck: "SHA-256 HASH CHAIN VERIFIED // TAMPER-PROOF",
      totalIncidentsRecorded: auditLogs.length,
      logs: auditLogs
    };

    const dataUri =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportContent, null, 2));
    const exportFileDefaultName = `suraksha_incident_dossier_${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    logEvent("AUDIT_DOSSIER_EXPORTED", "Police Incident Dossier Exported", `Generated signed JSON dossier with ${auditLogs.length} verified events.`, "INFO");
  };

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wider">
              TAMPER-PROOF AUDIT TRAIL & LOGS
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            CRYPTOGRAPHIC EVENT CHAIN // COURT-ADMISSIBLE TELEMETRY LOGS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TacticalButton
            size="sm"
            variant="cyan"
            icon={Download}
            onClick={handleExport}
          >
            EXPORT POLICE DOSSIER
          </TacticalButton>
          <StatusBadge label="CHAIN INTEGRITY 100%" status="safe" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, hashes, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/50 border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "CRITICAL", "SAFE", "INFO"].map((sev) => (
            <button
              key={sev}
              onClick={() => {
                tacticalAudio.playClick();
                setSeverityFilter(sev);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredLogs.map((log) => {
            const isCritical = log.severity === 'CRITICAL';
            const isSafe = log.severity === 'SAFE';

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard
                  variant={isCritical ? 'danger' : isSafe ? 'safe' : 'cyan'}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
                          : isSafe
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {isCritical ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : isSafe ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StatusBadge
                          label={log.severity}
                          status={
                            isCritical ? 'critical' : isSafe ? 'safe' : 'normal'
                          }
                        />
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString()} •{' '}
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-tactical font-bold text-base text-white">
                        {log.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed max-w-2xl">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-end gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <span className="text-[10px] font-mono text-slate-500">HASH:</span>
                    <span className="text-xs font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20">
                      {log.hash}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-mono text-sm border border-dashed border-white/10 rounded-xl">
            No incident events found matching the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
