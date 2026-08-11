import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Tags } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import toast from 'react-hot-toast';
import { updateMediaMeta } from '@/hooks/useImageLibrary';

export default function UpdateMetaModal({ isOpen, onClose, image, onUpdate }: { isOpen: boolean, onClose: () => void, image: any, onUpdate?: () => void }) {
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (image && isOpen) {
      setDescription(image.description || '');
      
      let initialHashtags = '';
      if (Array.isArray(image.hashtags)) {
        initialHashtags = image.hashtags.join(' ');
      } else if (typeof image.hashtags === 'string') {
        try {
          const parsed = JSON.parse(image.hashtags);
          if (Array.isArray(parsed)) {
            initialHashtags = parsed.join(' ');
          } else {
            initialHashtags = image.hashtags;
          }
        } catch {
          initialHashtags = image.hashtags;
        }
      }
      setHashtags(initialHashtags);
    }
  }, [image, isOpen]);

  const handleUpdate = async () => {
    if (!image?.id && !image?._id) return;
    setUpdating(true);
    
    try {
      // Split hashtags string into array of strings
      const tagsArray = hashtags.split(/\s+/).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`);
      
      await updateMediaMeta(image.id || image._id, { 
        description, 
        hashtags: tagsArray 
      }); 
      
      toast.success("Metadata updated successfully");
      if (onUpdate) onUpdate();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update metadata");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <div className="p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="flex justify-between items-center mb-6">
          <DialogTitle className="p-0 font-bold text-xl m-0 flex items-center gap-2">
            <Tags size={20} className="text-blue-500" /> Update Metadata
          </DialogTitle>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          {image?.mediaUrl && (
             <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mb-4 flex justify-center">
               <img src={image.mediaUrl} alt="Preview" className="h-40 object-contain" />
             </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description / Caption</label>
            <TextField 
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this image..."
              variant="outlined"
              size="small"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hashtags</label>
            <TextField 
              fullWidth
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#marketing #seo #growth"
              variant="outlined"
              size="small"
              helperText="Separate tags with spaces"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={onClose}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleUpdate}
              disabled={updating}
              startIcon={updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
