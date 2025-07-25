import { createClient } from '@supabase/supabase-js';

// Supabase config (you should have this in your environment)
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your actual URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual key

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload audio file to Supabase Storage
 * @param file - Audio file to upload
 * @param filename - Name for the file (e.g., 'usul-althalatha.mp3')
 * @param folder - Optional folder (e.g., 'level-1', 'level-2')
 * @returns Promise with public URL or error
 */
export const uploadAudioFile = async (
  file: File, 
  filename: string, 
  folder: string = 'audio'
) => {
  try {
    const filePath = `${folder}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('audio-files')  // Your bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      });

    if (error) {
      console.error('Upload error:', error);
      return { error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath);

    return { 
      success: true, 
      url: urlData.publicUrl,
      path: filePath 
    };
  } catch (err) {
    console.error('Upload failed:', err);
    return { error: err };
  }
};

/**
 * Generate Supabase Storage URL for existing audio files
 * @param filename - Audio filename
 * @param folder - Folder name (default: 'audio')
 * @returns Public URL for audio file
 */
export const getAudioUrl = (filename: string, folder: string = 'audio'): string => {
  const filePath = `${folder}/${filename}`;
  
  const { data } = supabase.storage
    .from('audio-files')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Get all available audio files from a folder
 * @param folder - Folder to list files from
 * @returns Array of file objects
 */
export const listAudioFiles = async (folder: string = 'audio') => {
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('List error:', error);
      return { error };
    }

    return { files: data };
  } catch (err) {
    console.error('List failed:', err);
    return { error: err };
  }
};

/**
 * Delete audio file from storage
 * @param filePath - Full path to file (e.g., 'audio/file.mp3')
 * @returns Success/error result
 */
export const deleteAudioFile = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('audio-files')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { error };
    }

    return { success: true };
  } catch (err) {
    console.error('Delete failed:', err);
    return { error: err };
  }
};

// EXAMPLE USAGE:
/*
// Upload file
const fileInput = document.getElementById('audioFile') as HTMLInputElement;
const file = fileInput.files[0];
const result = await uploadAudioFile(file, 'usul-althalatha.mp3', 'level-1');

// Get URL for existing file
const audioUrl = getAudioUrl('usul-althalatha.mp3', 'level-1');
// Result: https://abcdefgh.supabase.co/storage/v1/object/public/audio-files/level-1/usul-althalatha.mp3
*/