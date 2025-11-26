import { supabase } from '../lib/supabase';
import type { BrewingProfile } from '../types';

export async function getBrewingProfiles(profileId: string): Promise<BrewingProfile[]> {
  const { data, error } = await supabase
    .from('brewing_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brewing profiles:', error);
    return [];
  }

  return data as BrewingProfile[];
}

export async function getDefaultBrewingProfile(profileId: string): Promise<BrewingProfile | null> {
  const { data, error } = await supabase
    .from('brewing_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .eq('is_default', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching default brewing profile:', error);
    return null;
  }

  return data as BrewingProfile | null;
}

export async function createBrewingProfile(
  profileId: string,
  profile: Omit<BrewingProfile, 'id' | 'profileId' | 'createdAt'>
): Promise<BrewingProfile | null> {
  const { data, error } = await supabase
    .from('brewing_profiles')
    .insert({
      profile_id: profileId,
      name: profile.name,
      target_temperature: profile.targetTemperature,
      goal_pressure: profile.goalPressure,
      pre_infusion_time: profile.preInfusionTime,
      brewing_time_target: profile.brewingTimeTarget,
      coffee_input_amount: profile.coffeeInputAmount,
      target_output_amount: profile.targetOutputAmount,
      is_default: profile.isDefault,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating brewing profile:', error);
    return null;
  }

  return data as BrewingProfile;
}

export async function updateBrewingProfile(
  profileId: string,
  brewingProfile: BrewingProfile
): Promise<BrewingProfile | null> {
  const { data, error } = await supabase
    .from('brewing_profiles')
    .update({
      name: brewingProfile.name,
      target_temperature: brewingProfile.targetTemperature,
      goal_pressure: brewingProfile.goalPressure,
      pre_infusion_time: brewingProfile.preInfusionTime,
      brewing_time_target: brewingProfile.brewingTimeTarget,
      coffee_input_amount: brewingProfile.coffeeInputAmount,
      target_output_amount: brewingProfile.targetOutputAmount,
      is_default: brewingProfile.isDefault,
    })
    .eq('id', brewingProfile.id)
    .eq('profile_id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating brewing profile:', error);
    return null;
  }

  return data as BrewingProfile;
}

export async function deleteBrewingProfile(profileId: string, brewingProfileId: string): Promise<boolean> {
  const { error } = await supabase
    .from('brewing_profiles')
    .delete()
    .eq('id', brewingProfileId)
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error deleting brewing profile:', error);
    return false;
  }

  return true;
}

export async function setDefaultBrewingProfile(
  profileId: string,
  brewingProfileId: string
): Promise<boolean> {
  const { error: unsetError } = await supabase
    .from('brewing_profiles')
    .update({ is_default: false })
    .eq('profile_id', profileId);

  if (unsetError) {
    console.error('Error unsetting default profiles:', unsetError);
    return false;
  }

  const { error: setError } = await supabase
    .from('brewing_profiles')
    .update({ is_default: true })
    .eq('id', brewingProfileId)
    .eq('profile_id', profileId);

  if (setError) {
    console.error('Error setting default profile:', setError);
    return false;
  }

  return true;
}
