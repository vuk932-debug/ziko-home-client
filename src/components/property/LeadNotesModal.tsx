import { useState, useEffect } from 'react';
import { X, Send, Loader2, Calendar, MessageSquare } from 'lucide-react';
import apiClient from '../../api/axios';
import { format } from 'date-fns';
import { useNotification } from '../../context/NotificationContext';

interface Note {
  id: string;
  note: string;
  createdAt: string;
}

interface LeadNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
}

const LeadNotesModal = ({ isOpen, onClose, leadId, leadName }: LeadNotesModalProps) => {
  const { showNotification } = useNotification();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchNotes();
  }, [isOpen, leadId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/leads/${leadId}/notes`);
      setNotes(data.data);
    } catch (err) {
      console.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setSubmitting(true);
    try {
      const { data } = await apiClient.post(`/leads/${leadId}/notes`, { note: newNote });
      setNotes([data.data, ...notes]);
      setNewNote('');
    } catch (err) {
      showNotification('error', 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-xl">
      <div className="bg-brand-deep border border-white/5 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-glow-lg animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight leading-none">Interaction <span className="text-brand-neon">Logs</span></h2>
            <p className="text-brand-secondary text-[10px] uppercase tracking-[0.2em] font-black opacity-60">{leadName}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-brand-secondary transition-all"><X size={20}/></button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand-neon w-10 h-10 shadow-glow" />
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest animate-pulse">Retrieving Logs...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                <MessageSquare className="w-8 h-8 text-brand-secondary" />
              </div>
              <p className="text-brand-secondary text-xs font-bold uppercase tracking-widest opacity-40 leading-relaxed">
                Zero entries in interaction stream.<br/>Add an update to begin tracking.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="relative pl-8 border-l border-white/10 group">
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-brand-deep border border-brand-neon/50 rounded-full shadow-glow-sm group-hover:bg-brand-neon transition-colors" />
                <div className="flex items-center gap-2 text-[9px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-3 opacity-60">
                   <Calendar size={12} className="text-brand-muted"/>
                   {format(new Date(note.createdAt), 'MMM dd, yyyy • hh:mm a')}
                </div>
                <div className="bg-white/5 rounded-2xl p-5 text-brand-secondary text-sm font-medium border border-white/5 leading-relaxed group-hover:border-brand-neon/20 transition-all">
                  {note.note}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Note Form */}
        <div className="p-8 border-t border-white/5 bg-white/5">
          <form onSubmit={handleAddNote} className="relative">
            <textarea 
              rows={2}
              required
              className="w-full bg-brand-deep border border-white/10 rounded-2xl pl-6 pr-16 py-5 text-white text-sm outline-none focus:border-brand-neon/50 focus:ring-1 focus:ring-brand-neon/20 transition-all resize-none font-medium placeholder:text-brand-muted/30"
              placeholder="Record interaction summary..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
            />
            <button 
              disabled={submitting || !newNote.trim()}
              type="submit"
              className="absolute right-3 bottom-3 p-4 bg-brand-neon hover:scale-105 disabled:bg-white/5 disabled:scale-100 disabled:text-brand-muted/20 text-white rounded-xl transition-all shadow-glow"
            >
              {submitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadNotesModal;
