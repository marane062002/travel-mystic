import { useState, useEffect } from "react";
import { Artisan, ArtisanCategory, ArtisanStatus, User } from '@/models/entities';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { artisanAPI, usersAPI } from '@/services/api';
import { Plus, Edit, Trash2, Package, Tag, DollarSign, Hash, X } from "lucide-react";

// Updated defaultForm to match mystig_db.sql columns and enums
const defaultForm: Partial<Artisan> = {
  name: "",
  description: "",
  category: ArtisanCategory.TEXTILES,
  status: ArtisanStatus.AVAILABLE,
  price: 0,
  currency: "MAD",
  inStock: true,
  materials: [],
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case ArtisanCategory.TEXTILES: return "bg-blue-100 text-blue-800";
    case ArtisanCategory.POTTERY: return "bg-green-100 text-green-800";
    case ArtisanCategory.WOODWORK: return "bg-yellow-100 text-yellow-800";
    case ArtisanCategory.METALWORK: return "bg-purple-100 text-purple-800";
    case ArtisanCategory.JEWELRY: return "bg-pink-100 text-pink-800";
    case ArtisanCategory.LEATHER: return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case ArtisanStatus.AVAILABLE: return "bg-green-100 text-green-800";
    case ArtisanStatus.UNAVAILABLE: return "bg-red-100 text-red-800";
    case ArtisanStatus.COMING_SOON: return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const ArtisanPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Artisan> | null>(null);
  const [form, setForm] = useState<Partial<Artisan>>(defaultForm);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user profile for ownerId
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await usersAPI.getProfile();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const fetchArtisans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await artisanAPI.getAll();
      // The API returns an object with an items property containing the array
      if (response && response.items && Array.isArray(response.items)) {
        setArtisans(response.items);
      } else if (Array.isArray(response)) {
        // Fallback: if the API returns array directly
        setArtisans(response);
      } else {
        setArtisans([]);
        setError("Received invalid data format from server");
      }
    } catch (err) {
      setError("Failed to fetch artisans");
      setArtisans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtisans(); }, []);

  const handleEdit = (artisan: Artisan) => {
    setEditing(artisan);
    setForm({
      ...artisan,
      materials: artisan.materials || [],
      price: artisan.price || 0,
      inStock: artisan.inStock ?? true,
      currency: artisan.currency || "MAD",
      name: artisan.name || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet artisan ?")) {
      try {
        await artisanAPI.delete(id);
        fetchArtisans();
      } catch (err) {
        setError("Failed to delete artisan");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, ownerId: user?.id };
      if (editing && editing.id) {
        await artisanAPI.update(editing.id, payload);
      } else {
        await artisanAPI.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm);
      fetchArtisans();
    } catch (err) {
      setError("Failed to save artisan");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Gestion des Produits Artisanaux
            </h1>
            <p className="text-muted-foreground">
              Ajoutez et gérez les produits artisanaux proposés
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un produit</span>
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
                {editing ? "Modifier le produit" : "Ajouter un produit"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Nom *</label>
                    <input
                      type="text"
                      value={form.name || ""}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Catégorie *</label>
                    <select
                      value={form.category || ArtisanCategory.TEXTILES}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value as ArtisanCategory }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      {Object.values(ArtisanCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
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
                    <label className="block mb-1 font-semibold">Statut *</label>
                    <select
                      value={form.status || ArtisanStatus.AVAILABLE}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as ArtisanStatus }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      {Object.values(ArtisanStatus).map(stat => (
                        <option key={stat} value={stat}>{stat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">En stock *</label>
                    <select
                      value={form.inStock ? "true" : "false"}
                      onChange={e => setForm(f => ({ ...f, inStock: e.target.value === "true" }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">Prix *</label>
                    <input
                      type="number"
                      value={form.price || 0}
                      onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border rounded"
                      min={0}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Devise *</label>
                    <select
                      value={form.currency || "MAD"}
                      onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="MAD">MAD</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Matériaux</label>
                  <input
                    type="text"
                    value={form.materials?.join(", ") || ""}
                    onChange={e => setForm(f => ({
                      ...f,
                      materials: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    }))}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Coton, Bois, Métal, etc."
                  />
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

        {/* Artisan List */}
        <div className="bg-background rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Liste des produits artisanaux</h2>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Chargement...</div>
            ) : artisans.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Aucun produit artisanal trouvé. Cliquez sur "Ajouter un produit" pour commencer.
              </div>
            ) : (
              artisans.map(artisan => (
                <div key={artisan.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{artisan.name}</h3>
                      <div className="text-muted-foreground text-sm mt-1">{artisan.description}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(artisan)}
                        className="flex items-center space-x-1 px-3 py-1 rounded bg-primary text-primary-foreground"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDelete(artisan.id)}
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(artisan.category)}`}>
                        {artisan.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Statut:</span> 
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(artisan.status)}`}>
                        {artisan.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>
                        <span className="font-semibold">Prix:</span> {artisan.price} {artisan.currency}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className={artisan.inStock ? "text-green-600" : "text-red-600"}>
                        {artisan.inStock ? "En stock" : "Rupture de stock"}
                      </span>
                    </div>
                  </div>
                  
                  {artisan.materials && artisan.materials.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 text-sm mb-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">Matériaux:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {artisan.materials.map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                            {material}
                          </span>
                        ))}
                      </div>
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

export default ArtisanPage;