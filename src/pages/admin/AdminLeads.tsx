import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Loader2,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  StickyNote,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";
import apiClient from "../../api/axios";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import LeadNotesModal from "../../components/property/LeadNotesModal";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: "NEW" | "CONTACTED" | "CLOSED";
  crmStatus?: "SUCCESS" | "FAILED" | "PENDING";
  createdAt: string;
  property: {
    title: string;
    location: string;
    price: number;
    slug: string;
    category: string;
  };
}

const CATEGORY_DISPLAY: Record<string, string> = {
  NEW_PROJECT: 'New Projects',
  READY_TO_MOVE: 'Ready to Move In',
  UNDER_CONSTRUCTION: 'Under Construction',
  RESALE: 'Secondary Property',
};

const AdminLeads = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const isCP = user?.role === "CP";

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const endpoint = isCP ? "/leads/cp" : "/admin/leads";
      const statusQuery =
        statusFilter !== "ALL" ? `&status=${statusFilter}` : "";
      const { data } = await apiClient.get(
        `${endpoint}?page=1&limit=50${statusQuery}`,
      );
      setLeads(data.leads);
    } catch (err) {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/leads/${leadId}/status`, { status: newStatus });
      setLeads(
        leads.map((l) =>
          l.id === leadId ? { ...l, status: newStatus as any } : l,
        ),
      );
    } catch (err) {
      showNotification("error", "Failed to update lead status");
    }
  };

  const openNotes = (lead: Lead) => {
    setSelectedLead(lead);
    setIsNotesModalOpen(true);
  };

  const filteredLeads = (leads || []).filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.property?.title?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
        <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">
          Syncing Lead Stream...
        </p>
      </div>
    );

  return (
    <div className="animate-fade-in space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Zap className="w-3 h-3" />
            Acquisition Protocol
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Lead <span className="text-brand-neon neon-text">Management</span>
          </h1>
          <p className="text-brand-secondary font-medium opacity-70">
            {isCP
              ? "Track and manage your property inquiries in real-time."
              : "Administrative oversight of platform-wide inquiries."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon w-4 h-4 transition-colors" />
            <input
              type="text"
              placeholder="Filter leads..."
              className="pl-11 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
            {["ALL", "NEW", "CONTACTED", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s
                    ? "bg-brand-neon text-white shadow-glow"
                    : "text-brand-secondary hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="glass-card border-white/5 rounded-[2.5rem] p-8 hover:border-brand-neon/30 transition-all group relative overflow-hidden"
          >
            {/* Background Decorative Glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand-neon/5 rounded-full filter blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              {/* User Info */}
              <div className="flex items-center gap-6 min-w-[300px]">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-neon to-brand-accent rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-glow transform group-hover:rotate-6 transition-transform">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-black text-xl flex items-center gap-3 tracking-tight">
                    {lead.name}
                    <div className="flex items-center gap-2">
                      {lead.status === "NEW" && (
                        <span className="flex items-center gap-1.5 bg-brand-neon/20 text-brand-neon px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-widest animate-pulse border border-brand-neon/30">
                          <Sparkles className="w-2.5 h-2.5" /> New Inquiry
                        </span>
                      )}
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] border ${
                        lead.crmStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        lead.crmStatus === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-white/5 text-brand-secondary border-white/10'
                      }`}>
                        CRM: {lead.crmStatus || 'PENDING'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-[11px] font-black text-white hover:text-brand-neon flex items-center gap-2 transition-colors uppercase tracking-widest"
                    >
                      <Phone size={14} className="text-brand-neon" />{" "}
                      {lead.phone}
                    </a>
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[11px] font-black text-white hover:text-brand-neon flex items-center gap-2 transition-colors border-l border-white/10 pl-4 uppercase tracking-widest"
                      >
                        <Mail size={14} className="text-brand-accent" />{" "}
                        {lead.email}
                      </a>
                    )}
                    <span className="text-[9px] font-black text-brand-secondary uppercase tracking-[0.2em] border-l border-white/10 pl-4">
                      Via: {lead.source || 'Direct'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="flex-1 lg:border-x border-white/5 lg:px-10">
                <div className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-2 opacity-60">
                  Target Asset
                </div>
                <div className="flex items-center justify-between group/prop">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-black text-lg tracking-tight group-hover/prop:text-brand-neon transition-colors line-clamp-1">
                        {lead.property.title}
                      </div>
                      {lead.property.category && (
                        <span className="bg-white/10 text-brand-secondary px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-white/5">
                          {CATEGORY_DISPLAY[lead.property.category] || lead.property.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest opacity-60">
                      {lead.property.location} • ₹
                      {(lead.property.price / 100000).toFixed(1)}L
                    </div>
                  </div>
                  <a
                    href={`/property/${lead.property.slug}`}
                    target="_blank"
                    className="p-3 bg-white/5 rounded-2xl text-brand-secondary hover:text-brand-neon hover:bg-brand-neon/10 transition-all border border-transparent hover:border-brand-neon/20"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              {/* Status & Control */}
              <div className="flex items-center justify-between lg:justify-end gap-10 min-w-[320px]">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-2 opacity-60 flex items-center justify-end gap-2">
                    <Calendar size={12} /> Time Received
                  </div>
                  <div className="text-white text-xs font-black uppercase tracking-widest">
                    {format(new Date(lead.createdAt), "MMM dd")}{" "}
                    <span className="text-brand-secondary opacity-40 ml-1">
                      at
                    </span>{" "}
                    {format(new Date(lead.createdAt), "HH:mm")}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openNotes(lead)}
                    className="p-3.5 bg-white/5 hover:bg-white/10 text-brand-secondary hover:text-white rounded-2xl transition-all border border-white/5 hover:border-white/20"
                    title="Interaction Notes"
                  >
                    <StickyNote size={20} />
                  </button>
                  <div className="relative">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead.id, e.target.value)
                      }
                      className={`text-[10px] font-black uppercase tracking-widest rounded-2xl px-5 py-3.5 border transition-all appearance-none cursor-pointer pr-10 ${
                        lead.status === "NEW"
                          ? "bg-brand-neon/20 border-brand-neon/50 text-brand-neon shadow-glow"
                          : lead.status === "CONTACTED"
                            ? "bg-brand-accent/20 border-brand-accent/50 text-brand-accent shadow-glow"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      }`}
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Active</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <ChevronRight
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-current pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <div className="py-32 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-brand-secondary opacity-20" />
            </div>
            <p className="text-brand-secondary font-black text-xs uppercase tracking-[0.3em] opacity-60">
              Zero inquiries detected in local stream.
            </p>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          leadId={selectedLead.id}
          leadName={selectedLead.name}
        />
      )}
    </div>
  );
};

export default AdminLeads;
