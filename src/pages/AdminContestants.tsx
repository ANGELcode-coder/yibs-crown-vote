import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Crown, Users, Loader2, X, Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contestant {
  id: string;
  name: string;
  photo_url: string | null;
  category: "miss" | "master";
  bio: string | null;
  tagline: string | null;
}

const AdminContestants = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contestant | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "miss" as "miss" | "master",
    bio: "",
    tagline: "",
    photo_url: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contestants")
      .select("*")
      .order("category")
      .order("name");
    if (data) setContestants(data as Contestant[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", category: "miss", bio: "", tagline: "", photo_url: "" });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(true);
  };

  const openEdit = (c: Contestant) => {
    setEditing(c);
    setForm({
      name: c.name,
      category: c.category,
      bio: c.bio || "",
      tagline: c.tagline || "",
      photo_url: c.photo_url || "",
    });
    setPhotoFile(null);
    setPhotoPreview(c.photo_url || null);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `contestants/${fileName}`;

    setUploading(true);
    const { error } = await supabase.storage.from("photos").upload(filePath, file);
    setUploading(false);

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    setSaving(true);

    // Upload photo if a file was selected
    let photoUrl = form.photo_url.trim() || null;
    if (photoFile) {
      const uploaded = await uploadPhoto(photoFile);
      if (!uploaded) {
        setSaving(false);
        return;
      }
      photoUrl = uploaded;
    }

    if (editing) {
      const { error } = await supabase
        .from("contestants")
        .update({
          name: form.name.trim(),
          category: form.category,
          bio: form.bio.trim() || null,
          tagline: form.tagline.trim() || null,
          photo_url: photoUrl,
        })
        .eq("id", editing.id);

      if (error) {
        toast({ title: "Error updating contestant", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Contestant updated!" });
      }
    } else {
      const { error } = await supabase.from("contestants").insert({
        name: form.name.trim(),
        category: form.category,
        bio: form.bio.trim() || null,
        tagline: form.tagline.trim() || null,
        photo_url: photoUrl,
      });

      if (error) {
        toast({ title: "Error adding contestant", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Contestant added!" });
      }
    }
    setSaving(false);
    setShowForm(false);
    fetchContestants();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? All their votes will also be deleted.`)) return;

    const { error } = await supabase.from("contestants").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting contestant", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contestant deleted" });
      fetchContestants();
    }
  };

  const missContestants = contestants.filter((c) => c.category === "miss");
  const masterContestants = contestants.filter((c) => c.category === "master");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Contestants</h1>
          <p className="text-muted-foreground font-body mt-1">
            Manage Miss & Master contestants
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Contestant
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Miss Category */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-secondary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Miss YIBS ({missContestants.length})
              </h2>
            </div>
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              {missContestants.length === 0 ? (
                <p className="text-muted-foreground font-body p-6 text-center">No miss contestants yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 font-body text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="text-left px-6 py-3 font-body text-sm font-semibold text-muted-foreground">Tagline</th>
                      <th className="text-right px-6 py-3 font-body text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missContestants.map((c) => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-body font-medium text-card-foreground">{c.name}</td>
                        <td className="px-6 py-4 font-body text-sm text-muted-foreground">{c.tagline || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id, c.name)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Master Category */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-secondary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Master YIBS ({masterContestants.length})
              </h2>
            </div>
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              {masterContestants.length === 0 ? (
                <p className="text-muted-foreground font-body p-6 text-center">No master contestants yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 font-body text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="text-left px-6 py-3 font-body text-sm font-semibold text-muted-foreground">Tagline</th>
                      <th className="text-right px-6 py-3 font-body text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterContestants.map((c) => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-body font-medium text-card-foreground">{c.name}</td>
                        <td className="px-6 py-4 font-body text-sm text-muted-foreground">{c.tagline || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id, c.name)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in-up">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-2xl font-bold text-card-foreground mb-6">
              {editing ? "Edit Contestant" : "Add Contestant"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-card-foreground mb-1 block">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Contestant name"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-card-foreground mb-1 block">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as "miss" | "master" })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="miss">Miss</option>
                  <option value="master">Master</option>
                </select>
              </div>
              <div>
                <label className="font-body text-sm font-medium text-card-foreground mb-1 block">Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Grace with Purpose"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-card-foreground mb-1 block">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  placeholder="Short biography"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-card-foreground mb-2 block">Photo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="relative w-full aspect-[3/4] max-h-48 rounded-xl overflow-hidden border border-border mb-2">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); setForm({ ...form, photo_url: "" }); }}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors font-body"
                >
                  <Upload className="w-5 h-5" />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </button>
                <p className="text-xs text-muted-foreground mt-1 font-body">Or paste an image URL:</p>
                <input
                  value={form.photo_url}
                  onChange={(e) => { setForm({ ...form, photo_url: e.target.value }); if (e.target.value) { setPhotoFile(null); setPhotoPreview(e.target.value); } }}
                  className="w-full px-4 py-2 rounded-xl border border-input bg-background font-body text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                  placeholder="https://..."
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-primary-foreground font-body font-bold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editing ? "Save Changes" : "Add Contestant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContestants;
