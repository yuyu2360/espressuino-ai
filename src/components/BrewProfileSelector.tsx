import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBrewProfileStore } from '../store/brewProfileStore';
import { getBrewingProfiles } from '../services/brewProfileService';
import type { BrewingProfile } from '../types';
import '../styles/BrewProfileSelector.css';

interface BrewProfileSelectorProps {
  onProfileChange?: (profile: BrewingProfile | null) => void;
}

export function BrewProfileSelector({ onProfileChange }: BrewProfileSelectorProps) {
  const { profile } = useAuthStore();
  const { currentProfile, setCurrentProfile } = useBrewProfileStore();
  const [profiles, setProfiles] = useState<BrewingProfile[]>([]);
  const [loading, setLoading] = useState(true);

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

    if (!currentProfile && data.length > 0) {
      const defaultProfile = data.find((p) => p.isDefault);
      const profileToSet = defaultProfile || data[0];
      setCurrentProfile(profileToSet);
      onProfileChange?.(profileToSet);
    }

    setLoading(false);
  };

  const handleProfileChange = (profileId: string) => {
    const selected = profiles.find((p) => p.id === profileId);
    if (selected) {
      setCurrentProfile(selected);
      onProfileChange?.(selected);
    }
  };

  if (loading) {
    return <div className="profile-selector loading">Loading profiles...</div>;
  }

  if (profiles.length === 0) {
    return (
      <div className="profile-selector empty">
        <span>No brew profiles</span>
      </div>
    );
  }

  return (
    <div className="profile-selector">
      <label htmlFor="profile-select">Brew Profile:</label>
      <select
        id="profile-select"
        value={currentProfile?.id || ''}
        onChange={(e) => handleProfileChange(e.target.value)}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.isDefault ? ' (Default)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
