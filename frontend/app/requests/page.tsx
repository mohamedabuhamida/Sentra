"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  ArrowRight,
  Shield,
  Cpu,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockRequests, GatewayRequest } from "@/lib/mockData";

export default function RequestsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<GatewayRequest | null>(
    mockRequests[0]
  );

  const filteredRequests = mockRequests.filter((req) => {
    const matchesStatus =
      filterStatus === "all" || req.status === filterStatus;
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.taskType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.promptSnippet.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AppShell
      title="Request Logs & Trace Explorer"
      subtitle="Comprehensive audit trail, end-to-end latency waterfalls, and model routing decisions."
    >
      <div className="space-y-6">
        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search request ID, prompt text, task domain..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl focus:outline-none focus:border-[#3382F6] focus:bg-white text-[#0F172A] placeholder:text-[#94A3B8] font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#64748B]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl text-xs font-medium text-[#0F172A] py-2 px-3 focus:outline-none focus:border-[#3382F6] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="blocked">Threat Blocked</option>
                <option value="cached">Semantic Cache</option>
                <option value="fallback">Fallback Triggered</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs text-[#64748B] font-mono">
              Showing {filteredRequests.length} of {mockRequests.length} traces
            </span>
            <button
              onClick={() => alert("Exporting request log archive (CSV/JSON)...")}
              className="px-3 py-2 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] hover:bg-white text-xs font-semibold text-[#0F172A] inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Master-Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Requests Table List (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E7EB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E4E7EB] bg-[#F8FAFC]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Inbound Request Feed
              </h3>
            </div>

            <div className="divide-y divide-[#E4E7EB] max-h-[720px] overflow-y-auto">
              {filteredRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`w-full text-left p-4 transition-colors flex items-start justify-between gap-4 ${
                      isSelected
                        ? "bg-blue-50/60 border-l-4 border-l-blue-600"
                        : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0F172A]">
                          {req.id}
                        </span>
                        <StatusBadge
                          status={
                            req.status === "success"
                              ? "success"
                              : req.status === "blocked"
                              ? "danger"
                              : req.status === "cached"
                              ? "info"
                              : "warning"
                          }
                          label={req.status.toUpperCase()}
                        />
                        <span className="text-[11px] text-[#94A3B8]">
                          {req.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-[#0F172A] font-medium truncate">
                        {req.promptSnippet}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                        <span className="font-mono text-slate-700 font-semibold">
                          {req.model}
                        </span>
                        <span>•</span>
                        <span>{req.taskType}</span>
                        <span>•</span>
                        <span className="font-mono">{req.latencyMs}ms</span>
                        <span>•</span>
                        <span className="font-mono">${req.costUsd.toFixed(4)}</span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#CBD5E1] shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trace Detail Inspector Drawer (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E7EB] shadow-xs p-6 sticky top-24">
            {selectedRequest ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                      Request Trace Inspector
                    </span>
                    <h3 className="font-mono text-base font-bold text-[#0F172A]">
                      {selectedRequest.id}
                    </h3>
                  </div>
                  <StatusBadge
                    status={
                      selectedRequest.status === "success"
                        ? "success"
                        : selectedRequest.status === "blocked"
                        ? "danger"
                        : selectedRequest.status === "cached"
                        ? "info"
                        : "warning"
                    }
                    label={selectedRequest.status.toUpperCase()}
                  />
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] text-center">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Latency</span>
                    <span className="font-mono text-sm font-bold text-[#0F172A]">
                      {selectedRequest.latencyMs}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Total Tokens</span>
                    <span className="font-mono text-sm font-bold text-[#0F172A]">
                      {selectedRequest.tokens.total}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Total Cost</span>
                    <span className="font-mono text-sm font-bold text-[#0F172A]">
                      ${selectedRequest.costUsd.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Prompt Preview */}
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] mb-1.5">
                    User Prompt
                  </h4>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] text-xs font-mono text-[#0F172A] leading-relaxed break-words">
                    {selectedRequest.promptSnippet}
                  </div>
                </div>

                {/* Security Evaluation */}
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    Security & Prompt Injection Check
                  </h4>
                  <div className="p-3 rounded-xl border border-[#E4E7EB] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Risk Score:</span>
                      <span
                        className={`font-mono font-bold ${
                          selectedRequest.riskScore > 0.5
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {(selectedRequest.riskScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Attack Classification:</span>
                      <span className="font-medium text-[#0F172A]">
                        {selectedRequest.attackType || "BENIGN (No threat detected)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Gate Action:</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {selectedRequest.action}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Routing & Execution Trace Waterfall */}
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    Lifecycle Execution Breakdown
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC]">
                      <span className="text-[#64748B]">Ingress & Security Scan</span>
                      <span className="font-mono text-[#0F172A]">4ms</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC]">
                      <span className="text-[#64748B]">Semantic Cache Lookup</span>
                      <span className="font-mono text-[#0F172A]">
                        {selectedRequest.cacheHit ? "HIT (6ms)" : "MISS (8ms)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC]">
                      <span className="text-[#64748B]">Model Router Execution</span>
                      <span className="font-mono text-[#0F172A]">3ms</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-200">
                      <span className="text-blue-900 font-medium">
                        Provider TTFT & Completion ({selectedRequest.model})
                      </span>
                      <span className="font-mono font-bold text-blue-900">
                        {selectedRequest.latencyMs > 20
                          ? `${selectedRequest.latencyMs - 15}ms`
                          : "0ms"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#94A3B8] text-xs">
                Select a request trace from the list to inspect detailed parameters.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
