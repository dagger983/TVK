// src/services/supabaseService.js
import { supabase } from '../../supabase';

/**
 * Save or update user profile with Google Auth info + phone number
 */
export async function saveUserProfile(user) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id || `user_${Date.now()}`,
        name: user.name || 'Citizen',
        email: user.email || null,
        phone: user.phone || null,
        avatar_url: user.avatar_url || null,
        district: user.district || 'Chennai',
        ward: user.ward || 'Ward 4, Anna Nagar',
        preferred_language: user.preferred_language || 'ta',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Supabase saveUserProfile warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('⚠️ Supabase saveUserProfile exception:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch profile by user ID
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Insert a new complaint into Supabase
 */
export async function createComplaintInDb(complaintData) {
  try {
    const payload = {
      id: complaintData.id,
      user_id: complaintData.userId || 'user_tvk_demo',
      category: complaintData.category || 'other',
      category_key: complaintData.categoryKey || complaintData.category,
      status: complaintData.status || 'inProgress',
      title_en: complaintData.titleEn || complaintData.title,
      title_ta: complaintData.titleTa || complaintData.title,
      desc_en: complaintData.descEn || complaintData.description,
      desc_ta: complaintData.descTa || complaintData.description,
      landmark_en: complaintData.landmarkEn || complaintData.landmark,
      landmark_ta: complaintData.landmarkTa || complaintData.landmark,
      latitude: complaintData.latitude || null,
      longitude: complaintData.longitude || null,
      google_maps_url: complaintData.googleMapsUrl || null,
      photos: complaintData.photos || [],
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('complaints')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Supabase createComplaint warning:', error.message);
      return { success: false, error: error.message, data: payload };
    }

    return { success: true, data };
  } catch (err) {
    console.warn('⚠️ Supabase createComplaint error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all complaints (ordered by latest first)
 */
export async function fetchComplaintsFromDb() {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*, complaint_updates(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('⚠️ fetchComplaintsFromDb error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch admin updates and photos for a specific complaint
 */
export async function fetchComplaintUpdates(complaintId) {
  try {
    const { data, error } = await supabase
      .from('complaint_updates')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Add an admin status update with unlimited photos (for testing or admin integration)
 */
export async function addAdminUpdate(complaintId, {
  adminName = 'Ward Engineer',
  status = 'inProgress',
  titleEn,
  titleTa,
  messageEn,
  messageTa,
  adminPhotos = [],
}) {
  try {
    const { data, error } = await supabase
      .from('complaint_updates')
      .insert({
        complaint_id: complaintId,
        admin_name: adminName,
        status: status,
        title_en: titleEn,
        title_ta: titleTa || titleEn,
        message_en: messageEn,
        message_ta: messageTa || messageEn,
        admin_photos: adminPhotos,
      })
      .select()
      .single();

    if (error) throw error;

    // Also update complaint status if needed
    await supabase
      .from('complaints')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', complaintId);

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Subscribe to realtime updates for a complaint
 */
export function subscribeToComplaint(complaintId, onUpdate) {
  if (!supabase || !supabase.channel) return () => {};

  const channel = supabase
    .channel(`complaint_${complaintId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'complaint_updates',
        filter: `complaint_id=eq.${complaintId}`,
      },
      (payload) => {
        if (onUpdate) onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
