import { createSignal, For } from 'solid-js';
import { uploadAudioFile, listAudioFiles, deleteAudioFile } from '../utils/audioStorage';

interface UploadResult {
  filename: string;
  url?: string;
  error?: string;
  uploading?: boolean;
}

export function AudioUploader() {
  const [files, setFiles] = createSignal<UploadResult[]>([]);
  const [folder, setFolder] = createSignal('audio');
  const [isDragging, setIsDragging] = createSignal(false);
  const [existingFiles, setExistingFiles] = createSignal<any[]>([]);

  // Load existing files
  const loadExistingFiles = async () => {
    const result = await listAudioFiles(folder());
    if (result.files) {
      setExistingFiles(result.files);
    }
  };

  // Handle file upload
  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadResult[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Only audio files
      if (!file.type.startsWith('audio/')) {
        newFiles.push({
          filename: file.name,
          error: 'Nur Audio-Dateien erlaubt!'
        });
        continue;
      }

      newFiles.push({
        filename: file.name,
        uploading: true
      });
    }
    
    setFiles([...files(), ...newFiles]);

    // Upload each file
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (!file.type.startsWith('audio/')) continue;

      try {
        const result = await uploadAudioFile(file, file.name, folder());
        
        setFiles(prev => prev.map(f => 
          f.filename === file.name ? {
            ...f,
            uploading: false,
            url: result.url,
            error: result.error ? 'Upload fehlgeschlagen' : undefined
          } : f
        ));
      } catch (err) {
        setFiles(prev => prev.map(f => 
          f.filename === file.name ? {
            ...f,
            uploading: false,
            error: 'Upload fehlgeschlagen'
          } : f
        ));
      }
    }

    // Reload existing files
    await loadExistingFiles();
  };

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // File input handler
  const handleFileInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      handleFiles(input.files);
    }
  };

  // Delete file
  const deleteFile = async (filename: string) => {
    const filePath = `${folder()}/${filename}`;
    const result = await deleteAudioFile(filePath);
    
    if (result.success) {
      setExistingFiles(prev => prev.filter(f => f.name !== filename));
    }
  };

  return (
    <div style={{ padding: '20px', background: 'var(--color-surface)', 'border-radius': '12px' }}>
      <h2 style={{ color: 'var(--color-text)', 'margin-bottom': '20px' }}>
        🎵 Audio Files Upload
      </h2>

      {/* Folder Selection */}
      <div style={{ 'margin-bottom': '20px' }}>
        <label style={{ color: 'var(--color-text)', 'margin-bottom': '8px', display: 'block' }}>
          Ordner:
        </label>
        <select
          value={folder()}
          onChange={(e) => {
            setFolder(e.currentTarget.value);
            loadExistingFiles();
          }}
          style={{
            padding: '8px 12px',
            'border-radius': '6px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-background)',
            color: 'var(--color-text)'
          }}
        >
          <option value="audio">audio</option>
          <option value="level-1">level-1</option>
          <option value="level-2">level-2</option>
          <option value="level-3">level-3</option>
          <option value="level-4">level-4</option>
        </select>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging() ? 'var(--color-primary)' : 'var(--color-border)'}`,
          'border-radius': '12px',
          padding: '40px',
          'text-align': 'center',
          'margin-bottom': '20px',
          background: isDragging() ? 'var(--color-primary-light)' : 'var(--color-background)',
          transition: 'all 0.3s ease'
        }}
      >
        <p style={{ color: 'var(--color-text)', 'margin-bottom': '15px' }}>
          📁 Audio-Dateien hier hinziehen oder klicken zum Auswählen
        </p>
        
        <input
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileInput}
          style={{
            padding: '8px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            'border-radius': '6px',
            cursor: 'pointer'
          }}
        />
        
        <p style={{ color: 'var(--color-text-secondary)', 'font-size': '12px', 'margin-top': '10px' }}>
          Unterstützt: MP3, WAV, OGG, AAC
        </p>
      </div>

      {/* Upload Results */}
      <div style={{ 'margin-bottom': '30px' }}>
        <For each={files()}>
          {(file) => (
            <div style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              padding: '12px',
              'margin-bottom': '8px',
              background: 'var(--color-background)',
              'border-radius': '8px',
              border: '1px solid var(--color-border)'
            }}>
              <span style={{ color: 'var(--color-text)' }}>{file.filename}</span>
              
              <div>
                {file.uploading && (
                  <span style={{ color: 'var(--color-warning)' }}>⏳ Lädt...</span>
                )}
                {file.url && (
                  <span style={{ color: 'var(--color-success)' }}>✅ Hochgeladen</span>
                )}
                {file.error && (
                  <span style={{ color: 'var(--color-error)' }}>❌ {file.error}</span>
                )}
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Existing Files */}
      <div>
        <h3 style={{ color: 'var(--color-text)', 'margin-bottom': '15px' }}>
          📁 Vorhandene Dateien in "{folder()}"
        </h3>
        
        <button
          onClick={loadExistingFiles}
          style={{
            padding: '6px 12px',
            background: 'var(--color-secondary)',
            color: 'white',
            border: 'none',
            'border-radius': '6px',
            cursor: 'pointer',
            'margin-bottom': '15px'
          }}
        >
          🔄 Aktualisieren
        </button>
        
        <For each={existingFiles()}>
          {(file) => (
            <div style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              padding: '12px',
              'margin-bottom': '8px',
              background: 'var(--color-background)',
              'border-radius': '8px',
              border: '1px solid var(--color-border)'
            }}>
              <div>
                <span style={{ color: 'var(--color-text)', 'font-weight': '500' }}>
                  {file.name}
                </span>
                <br />
                <span style={{ color: 'var(--color-text-secondary)', 'font-size': '12px' }}>
                  {Math.round(file.metadata?.size / 1024 / 1024 * 100) / 100 || '?'} MB
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    const url = `https://YOUR_SUPABASE_URL/storage/v1/object/public/audio-files/${folder()}/${file.name}`;
                    navigator.clipboard.writeText(url);
                    alert('URL kopiert!');
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '4px',
                    cursor: 'pointer',
                    'font-size': '12px'
                  }}
                >
                  📋 URL
                </button>
                
                <button
                  onClick={() => deleteFile(file.name)}
                  style={{
                    padding: '4px 8px',
                    background: 'var(--color-error)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '4px',
                    cursor: 'pointer',
                    'font-size': '12px'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}