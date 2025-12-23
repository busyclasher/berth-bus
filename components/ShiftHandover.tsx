
import React, { useState } from 'react';
import { ShiftNote, Bus, Berth } from '../types';
import { MessageSquare, AlertTriangle, CheckCircle, Clock, User, X, Plus, Filter } from 'lucide-react';

interface ShiftHandoverProps {
  notes: ShiftNote[];
  buses: Bus[];
  berths: Berth[];
  onAddNote: (note: Omit<ShiftNote, 'id' | 'timestamp'>) => void;
  onResolveNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const ShiftHandover: React.FC<ShiftHandoverProps> = ({ 
  notes, 
  buses, 
  berths, 
  onAddNote, 
  onResolveNote,
  onDeleteNote 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'critical'>('all');
  const [filterResolved, setFilterResolved] = useState<boolean>(false);
  
  // New note form state
  const [newNote, setNewNote] = useState({
    busId: '',
    berthId: '',
    author: 'Current User',
    role: 'MANAGER' as const,
    message: '',
    priority: 'medium' as const,
  });

  const filteredNotes = notes.filter(note => {
    if (filterResolved && note.resolved) return false;
    if (filterPriority !== 'all' && note.priority !== filterPriority) return false;
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CAPTAIN': return 'bg-blue-100 text-blue-700';
      case 'TECHNICIAN': return 'bg-purple-100 text-purple-700';
      case 'MANAGER': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddNote = () => {
    if (newNote.message.trim()) {
      onAddNote({
        ...newNote,
        busId: newNote.busId || undefined,
        berthId: newNote.berthId || undefined,
        resolved: false,
      });
      setNewNote({
        busId: '',
        berthId: '',
        author: 'Current User',
        role: 'MANAGER',
        message: '',
        priority: 'medium',
      });
      setShowAddModal(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Shift Handover Notes</h2>
          <p className="text-gray-500 font-medium text-sm">
            Share critical information across shifts • {filteredNotes.length} active notes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-600 uppercase">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="text-sm font-bold text-gray-900 bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          onClick={() => setFilterResolved(!filterResolved)}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            filterResolved
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {filterResolved ? '✓ ' : ''}Hide Resolved
        </button>
        <div className="ml-auto text-xs font-bold text-gray-400 uppercase">
          {notes.filter(n => !n.resolved).length} unresolved
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-bold">No notes matching your filters</p>
            <p className="text-gray-400 text-sm mt-1">Add a new note to get started</p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const bus = note.busId ? buses.find(b => b.id === note.busId) : null;
            const berth = note.berthId ? berths.find(b => b.id === note.berthId) : null;

            return (
              <div
                key={note.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                  note.resolved ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Priority Badge */}
                    <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${getPriorityColor(note.priority)}`}>
                      {note.priority === 'critical' && <span className="mr-1">🔴</span>}
                      {note.priority}
                    </div>
                    
                    {/* Role Badge */}
                    <div className={`px-2 py-1 rounded-md text-xs font-bold ${getRoleColor(note.role)}`}>
                      {note.role}
                    </div>
                    
                    {/* Resolved Badge */}
                    {note.resolved && (
                      <div className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Resolved
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete note"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Message */}
                <p className="text-gray-900 font-medium mb-3 leading-relaxed">
                  {note.message}
                </p>

                {/* Related Items */}
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  {bus && (
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <div className="text-blue-600 font-black text-xs">🚌</div>
                      <div>
                        <div className="text-xs font-bold text-blue-900">{bus.plateNo}</div>
                        <div className="text-[10px] text-blue-600">Service {bus.serviceNo}</div>
                      </div>
                    </div>
                  )}
                  {berth && (
                    <div className="bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <div className="text-purple-600 font-black text-xs">📍</div>
                      <div className="text-xs font-bold text-purple-900">{berth.label}</div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1 font-medium">
                      <User size={12} />
                      {note.author}
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Clock size={12} />
                      {formatTime(note.timestamp)}
                    </div>
                  </div>
                  
                  {!note.resolved && (
                    <button
                      onClick={() => onResolveNote(note.id)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all flex items-center gap-1"
                    >
                      <CheckCircle size={12} />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Add Shift Note</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Priority Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'critical'].map(p => (
                    <button
                      key={p}
                      onClick={() => setNewNote({ ...newNote, priority: p as any })}
                      className={`px-4 py-3 rounded-xl font-bold text-sm capitalize transition-all ${
                        newNote.priority === p
                          ? getPriorityColor(p) + ' shadow-lg scale-105'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Your Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['CAPTAIN', 'TECHNICIAN', 'MANAGER'].map(r => (
                    <button
                      key={r}
                      onClick={() => setNewNote({ ...newNote, role: r as any })}
                      className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        newNote.role === r
                          ? getRoleColor(r) + ' shadow-lg scale-105'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bus Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Related Bus (Optional)
                </label>
                <select
                  value={newNote.busId}
                  onChange={(e) => setNewNote({ ...newNote, busId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                >
                  <option value="">None</option>
                  {buses.map(bus => (
                    <option key={bus.id} value={bus.id}>
                      {bus.plateNo} - Service {bus.serviceNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Berth Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Related Berth (Optional)
                </label>
                <select
                  value={newNote.berthId}
                  onChange={(e) => setNewNote({ ...newNote, berthId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                >
                  <option value="">None</option>
                  {berths.map(berth => (
                    <option key={berth.id} value={berth.id}>
                      {berth.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  value={newNote.message}
                  onChange={(e) => setNewNote({ ...newNote, message: e.target.value })}
                  placeholder="Describe the issue, observation, or action taken..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.message.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHandover;


