import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, Button } from '@mui/material';
import toast from 'react-hot-toast';
import { uploadImage } from '@/hooks/useImageLibrary';

export default function ImageUploadModal({ isOpen, onClose, userId }: { isOpen: boolean, onClose: () => void, userId?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only image files are allowed (JPG, PNG, GIF, WebP)');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setError('');
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      // The old mytekai codebase had a specific route or S3 logic. 
      // Assuming uploadImage handles the POST to /api/media or similar.
      // This is a simplified placeholder for the actual API call logic.
      await uploadImage({ userId, file: formData }); 
      toast.success("Image uploaded successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <div className="p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="flex justify-between items-center mb-6">
          <DialogTitle className="p-0 font-bold text-xl m-0 flex items-center gap-2">
            <Upload size={20} className="text-blue-500" /> Upload Image
          </DialogTitle>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={32} className="text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg">Click or drag image to upload</h3>
            <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, GIF, WebP (Max 10MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <img src={previewUrl!} alt="Preview" className="w-full h-64 object-contain" />
              <button 
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleUpload}
                disabled={uploading}
                startIcon={uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
