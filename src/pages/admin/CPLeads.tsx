import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Loader2,
  Phone,
  Mail,
  ExternalLink,
  StickyNote,
  Zap,
  ChevronRight,
  Filter,
  ArrowUpRight,
  User,
  Clock,
  Copy,
  CheckCircle2,
} from "lucide-react";
import apiClient from "../../api/axios";
import { format } from "date-fns";
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

const CPLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const statusQuery = statusFilter !== "ALL" ? `&status=${statusFilter}` : "";
      const { data } = await apiClient.get(
        `/leads/cp?page=1&limit=100${statusQuery}`,
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
      showToast(`Lead status updated to ${newStatus}`);
    } catch (err) {
      showToast("Failed to update lead status", 'error');
    }
  };

  const copyLeadDetails = (lead: Lead) => {
    const details = `Name: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email || 'N/A'}\nProperty: ${lead.property.title}`;
    navigator.clipboard.writeText(details);
    showToast("Lead details copied to clipboard!");
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

  // Sorting logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0;
  });

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
    <div className="animate-fade-in space-y-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <Zap size={18} />}
          <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Zap className="w-3 h-3" />
            Active Acquisitions
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Lead <span className="text-brand-neon neon-text">Intelligence</span>
          </h1>
          <p className="text-brand-secondary font-medium opacity-70 max-w-lg leading-relaxed">
            Real-time stream of incoming property inquiries. Use the interaction notes to track conversion progress.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 lg:min-w-[400px]">
           <StatCard label="Total" value={leads.length} color="text-white" />
           <StatCard label="New" value={leads.filter(l => l.status === 'NEW').length} color="text-brand-neon" />
           <StatCard label="Active" value={leads.filter(l => l.status === 'CONTACTED').length} color="text-brand-accent" />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon w-4 h-4 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, phone or property..."
            className="pl-11 pr-6 py-3 bg-brand-deep border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex bg-brand-deep rounded-2xl p-1 border border-white/5">
            {["ALL", "NEW", "CONTACTED", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s
                    ? "bg-brand-neon text-white shadow-glow"
                    : "text-brand-secondary hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-brand-deep border border-white/5 rounded-2xl px-4 py-2">
             <Filter size={14} className="text-brand-muted" />
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-transparent text-[10px] font-black text-white uppercase tracking-widest outline-none cursor-pointer"
             >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
             </select>
          </div>
        </div>
      </div>

      {/* Leads Grid/Table */}
      <div className="space-y-4">
        {sortedLeads.map((lead) => (
          <div
            key={lead.id}
            className="glass-card border-white/5 rounded-[2.5rem] p-8 hover:border-brand-neon/30 transition-all group relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8"
          >
            {/* Background Decorative Glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand-neon/5 rounded-full filter blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* User Profile Info */}
            <div className="flex items-center gap-6 min-w-[320px]">
              <div className="w-16 h-16 bg-brand-neon/10 border border-brand-neon/20 rounded-3xl flex items-center justify-center text-brand-neon font-black text-2xl group-hover:shadow-glow group-hover:rotate-3 transition-all duration-500">
                <User size={28} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-black text-xl tracking-tight leading-none">{lead.name}</h3>
                  {lead.status === "NEW" && (
                    <span className="bg-brand-neon/20 text-brand-neon px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-brand-neon/30 animate-pulse">
                      Fresh
                    </span>
                  )}
                  <button 
                    onClick={() => copyLeadDetails(lead)}
                    className="p-1.5 hover:bg-white/5 text-brand-secondary hover:text-white rounded-lg transition-all"
                    title="Copy Lead Details"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                   <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-[11px] font-bold text-brand-secondary hover:text-brand-neon transition-colors tracking-widest uppercase">
                     <Phone size={12} className="text-brand-neon/60" /> {lead.phone}
                   </a>
                   {lead.email && (
                     <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-[11px] font-bold text-brand-secondary hover:text-brand-accent transition-colors tracking-widest uppercase">
                       <Mail size={12} className="text-brand-accent/60" /> {lead.email}
                     </a>
                   )}
                </div>
              </div>
            </div>

            {/* Target Asset Information */}
            <div className="flex-1 lg:border-x border-white/5 lg:px-10 py-2">
               <div className="flex items-center gap-2 text-[9px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-2 opacity-60">
                 <ArrowUpRight size={12} /> Target Asset
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
                      {lead.property.location} • <span className="text-white">₹{(lead.property.price / 100000).toFixed(1)}L</span>
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

            {/* Actions & Meta */}
            <div className="flex items-center justify-between lg:justify-end gap-10 min-w-[340px]">
               <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-2 text-[9px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-2 opacity-60">
                    <Clock size={12} /> Received
                  </div>
                  <div className="text-white text-xs font-black uppercase tracking-widest">
                    {format(new Date(lead.createdAt), "MMM dd")} <span className="opacity-40 font-bold ml-1">{format(new Date(lead.createdAt), "HH:mm")}</span>
                  </div>
                  <div className="text-[8px] font-black text-brand-muted uppercase tracking-widest mt-1.5 opacity-40">
                    Source: {lead.source || 'Standard'}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button
                    onClick={() => openNotes(lead)}
                    className="p-4 bg-white/5 hover:bg-white/10 text-brand-secondary hover:text-white rounded-2xl transition-all border border-white/5 hover:border-white/20 relative"
                    title="Interaction Notes"
                  >
                    <StickyNote size={20} />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-brand-deep" />
                  </button>
                  
                  <div className="relative">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-[10px] font-black uppercase tracking-widest rounded-2xl px-5 py-4 border transition-all appearance-none cursor-pointer pr-12 ${
                        lead.status === "NEW"
                          ? "bg-brand-neon/10 border-brand-neon/30 text-brand-neon shadow-glow-sm"
                          : lead.status === "CONTACTED"
                            ? "bg-brand-accent/10 border-brand-accent/30 text-brand-accent shadow-glow-sm"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      }`}
                    >
                      <option value="NEW">New Inquiry</option>
                      <option value="CONTACTED">Active Case</option>
                      <option value="CLOSED">Closed Deal</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-current pointer-events-none opacity-60" />
                  </div>
               </div>
            </div>
          </div>
        ))}

        {sortedLeads.length === 0 && (
          <div className="py-32 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
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

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-white/5 border border-white/5 rounded-3xl p-5 text-center">
    <div className={`text-2xl font-black ${color} tracking-tighter`}>{value}</div>
    <div className="text-[9px] font-black text-brand-secondary uppercase tracking-widest mt-1 opacity-60">{label}</div>
  </div>
);

export default CPLeads;
