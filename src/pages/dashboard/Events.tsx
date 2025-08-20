import { useState, useEffect } from "react";
import { Event, EventType, EventStatus, User } from '@/models/entities';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { eventsAPI } from '@/services/api';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Tag, X } from 'lucide-react';

// Updated defaultForm to match mystig_db.sql columns and enums
const defaultForm: Partial<Event> = {
  title: "",
  description: "",
  type: EventType.FESTIVAL,
  category: "CEREMONY", // Default to one of the accepted categories
  dateRange: { start: "", end: "" },
  timeRange: { start: "", end: "" },
  venue: "",
  address: "",
  city: "",
  status: EventStatus.DRAFT,
  featured: false,
  tags: [],
};

const EVENT_CATEGORIES = [
  "CEREMONY",
  "BASKETBALL",
  "CONCERT",
  "WORKSHOP",
  "FOOTBALL",
  "EXHIBITION",
  "COMPETITION",
];

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Event> | null>(null);
  const [form, setForm] = useState<Partial<Event>>(defaultForm);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsAPI.getAll();
      // The API returns an object with a content property containing the array
      if (response && response.content && Array.isArray(response.content)) {
        setEvents(response.content);
      } else {
        setEvents([]);
        setError("Received invalid data format from server");
      }
    } catch (err) {
      setError("Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleEdit = (event: Event) => {
    setEditing(event);
    setForm({
      ...event,
      dateRange: event.dateRange || { start: "", end: "" },
      timeRange: event.timeRange || { start: "", end: "" },
      tags: event.tags || [],
      category: event.category || "CEREMONY",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      try {
        await eventsAPI.delete(id);
        fetchEvents();
      } catch (err) {
        setError("Failed to delete event");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing && editing.id) {
        await eventsAPI.update(editing.id, form);
      } else {
        await eventsAPI.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm);
      fetchEvents();
    } catch (err) {
      setError("Failed to save event");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Non spécifié";
    return timeString;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Gestion des Événements
            </h1>
            <p className="text-muted-foreground">
              Ajoutez et gérez les événements proposés
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un événement</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editing ? "Modifier l'événement" : "Ajouter un événement"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Titre *</label>
                    <input
                      type="text"
                      value={form.title || ""}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Type *</label>
                    <select
                      value={form.type || EventType.FESTIVAL}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      {Object.values(EventType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Description *</label>
                  <textarea
                    value={form.description || ""}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2 border rounded"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Catégorie *</label>
                    <select
                      value={form.category || "CEREMONY"}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      {EVENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Statut *</label>
                    <select
                      value={form.status || EventStatus.DRAFT}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as EventStatus }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      {Object.values(EventStatus).map(stat => (
                        <option key={stat} value={stat}>{stat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Date de début</label>
                    <input
                      type="date"
                      value={form.dateRange?.start || ""}
                      onChange={e => setForm(f => ({
                        ...f,
                        dateRange: { ...f.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Date de fin</label>
                    <input
                      type="date"
                      value={form.dateRange?.end || ""}
                      onChange={e => setForm(f => ({
                        ...f,
                        dateRange: { ...f.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Heure de début</label>
                    <input
                      type="time"
                      value={form.timeRange?.start || ""}
                      onChange={e => setForm(f => ({
                        ...f,
                        timeRange: { ...f.timeRange, start: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Heure de fin</label>
                    <input
                      type="time"
                      value={form.timeRange?.end || ""}
                      onChange={e => setForm(f => ({
                        ...f,
                        timeRange: { ...f.timeRange, end: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Lieu</label>
                    <input
                      type="text"
                      value={form.venue || ""}
                      onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Ville</label>
                    <input
                      type="text"
                      value={form.city || ""}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Adresse</label>
                  <input
                    type="text"
                    value={form.address || ""}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Mis en avant</label>
                    <select
                      value={form.featured ? "true" : "false"}
                      onChange={e => setForm(f => ({ ...f, featured: e.target.value === "true" }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Tags</label>
                    <input
                      type="text"
                      value={form.tags?.join(", ") || ""}
                      onChange={e => setForm(f => ({
                        ...f,
                        tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                      }))}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="Festival, Musique, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditing(null); setForm(defaultForm); }}
                    className="px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {editing ? "Enregistrer" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-background rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Liste des événements</h2>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Chargement...</div>
            ) : events.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Aucun événement trouvé. Cliquez sur "Ajouter un événement" pour commencer.
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <div className="text-muted-foreground text-sm mt-1">{event.description}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex items-center space-x-1 px-3 py-1 rounded bg-primary text-primary-foreground"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex items-center space-x-1 px-3 py-1 rounded bg-red-500 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>
                        <span className="font-semibold">Type:</span> {event.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Catégorie:</span> {event.category}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Statut:</span> 
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Mis en avant:</span> 
                      <span className={event.featured ? "text-green-600" : "text-muted-foreground"}>
                        {event.featured ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-semibold">Dates:</span> {formatDate(event.dateRange?.start)} - {formatDate(event.dateRange?.end)}
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-semibold">Heures:</span> {formatTime(event.timeRange?.start)} - {formatTime(event.timeRange?.end)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-semibold">Lieu:</span> {event.venue || "Non spécifié"} | {event.city || "Non spécifié"}
                      </div>
                    </div>
                    {event.address && (
                      <div className="ml-6 text-muted-foreground">
                        {event.address}
                      </div>
                    )}
                  </div>
                  
                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Events;