import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/Header';
import {
  getBrewingProfiles,
  createBrewingProfile,
  updateBrewingProfile,
  deleteBrewingProfile,
  setDefaultBrewingProfile,
} from '../services/brewProfileService';
import type { BrewingProfile } from '../types';
import '../styles/BrewProfilesPage.css';

export function BrewProfilesPage() {
  const { profile } = useAuthStore();
  const [profiles, setProfiles] = useState<BrewingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    targetTemperature: 92,
    goalPressure: 9,
    preInfusionTime: 5,
    brewingTimeTarget: 28,
    coffeeInputAmount: 18,
    targetOutputAmount: 36,
    isDefault: false,
  });

  useEffect(() => {
    if (profile?.id) {
      loadProfiles();
    }
  }, [profile?.id]);

  const loadProfiles = async () => {
    if (!profile?.id) return;
    setLoading(true);
    const data = await getBrewingProfiles(profile.id);
    setProfiles(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    const profileData = {
      name: formData.name,
      targetTemperature: formData.targetTemperature,
      goalPressure: formData.goalPressure,
      preInfusionTime: formData.preInfusionTime,
      brewingTimeTarget: formData.brewingTimeTarget,
      coffeeInputAmount: formData.coffeeInputAmount,
      targetOutputAmount: formData.targetOutputAmount,
      isDefault: formData.isDefault,
    };

    if (editingId) {
      const existing = profiles.find((p) => p.id === editingId);
      if (existing) {
        await updateBrewingProfile(profile.id, { ...existing, ...profileData });
      }
    } else {
      await createBrewingProfile(profile.id, profileData);
    }

    resetForm();
    loadProfiles();
  };

  const handleEdit = (profile: BrewingProfile) => {
    setFormData({
      name: profile.name,
      targetTemperature: profile.targetTemperature,
      goalPressure: profile.goalPressure,
      preInfusionTime: profile.preInfusionTime,
      brewingTimeTarget: profile.brewingTimeTarget,
      coffeeInputAmount: profile.coffeeInputAmount,
      targetOutputAmount: profile.targetOutputAmount,
      isDefault: profile.isDefault,
    });
    setEditingId(profile.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!profile?.id) return;
    if (!confirm('Delete this brew profile?')) return;
    await deleteBrewingProfile(profile.id, id);
    loadProfiles();
  };

  const handleSetDefault = async (id: string) => {
    if (!profile?.id) return;
    await setDefaultBrewingProfile(profile.id, id);
    loadProfiles();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetTemperature: 92,
      goalPressure: 9,
      preInfusionTime: 5,
      brewingTimeTarget: 28,
      coffeeInputAmount: 18,
      targetOutputAmount: 36,
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="brew-profiles-page">
      <Header />

      <div className="brew-profiles-container">
        <div className="brew-profiles-header">
          <h1>Brew Profiles</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            New Profile
          </button>
        </div>

        {showForm && (
          <div className="brew-profile-form-card">
            <div className="form-header">
              <h2>{editingId ? 'Edit Brew Profile' : 'Create New Brew Profile'}</h2>
              <button className="btn-close" onClick={resetForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Profile Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Single Shot Espresso"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="targetTemp">Target Temperature (°C)</label>
                  <input
                    id="targetTemp"
                    type="number"
                    min="20"
                    max="110"
                    step="0.5"
                    value={formData.targetTemperature}
                    onChange={(e) => setFormData({ ...formData, targetTemperature: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="goalPressure">Goal Pressure (bar)</label>
                  <input
                    id="goalPressure"
                    type="number"
                    min="0"
                    max="15"
                    step="0.1"
                    value={formData.goalPressure}
                    onChange={(e) => setFormData({ ...formData, goalPressure: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="preInfusion">Pre-infusion Time (seconds)</label>
                  <input
                    id="preInfusion"
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={formData.preInfusionTime}
                    onChange={(e) => setFormData({ ...formData, preInfusionTime: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="brewTime">Brewing Time Target (seconds)</label>
                  <input
                    id="brewTime"
                    type="number"
                    min="1"
                    max="120"
                    step="0.5"
                    value={formData.brewingTimeTarget}
                    onChange={(e) => setFormData({ ...formData, brewingTimeTarget: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="coffeeInput">Coffee Input (grams)</label>
                  <input
                    id="coffeeInput"
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={formData.coffeeInputAmount}
                    onChange={(e) => setFormData({ ...formData, coffeeInputAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="targetOutput">Target Output (grams/ml)</label>
                  <input
                    id="targetOutput"
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={formData.targetOutputAmount}
                    onChange={(e) => setFormData({ ...formData, targetOutputAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox">
                  <input
                    id="isDefault"
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  <label htmlFor="isDefault">Set as default profile</label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Profile' : 'Create Profile'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="empty-state">
            <p>No brew profiles yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="profiles-grid">
            {profiles.map((p) => (
              <div key={p.id} className={`profile-card ${p.isDefault ? 'default' : ''}`}>
                {p.isDefault && <div className="default-badge">Default</div>}
                <h3>{p.name}</h3>

                <div className="profile-details">
                  <div className="detail-row">
                    <span className="label">Temperature</span>
                    <span className="value">{p.targetTemperature}°C</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Pressure</span>
                    <span className="value">{p.goalPressure} bar</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Pre-infusion</span>
                    <span className="value">{p.preInfusionTime}s</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Brew Time</span>
                    <span className="value">{p.brewingTimeTarget}s</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Coffee In</span>
                    <span className="value">{p.coffeeInputAmount}g</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Target Out</span>
                    <span className="value">{p.targetOutputAmount}g</span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn btn-small btn-secondary" onClick={() => handleEdit(p)}>
                    Edit
                  </button>
                  {!p.isDefault && (
                    <button className="btn btn-small btn-tertiary" onClick={() => handleSetDefault(p.id)}>
                      Set Default
                    </button>
                  )}
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
