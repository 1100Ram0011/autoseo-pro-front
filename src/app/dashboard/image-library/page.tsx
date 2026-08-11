"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Trash2, Archive, RefreshCw, Upload, Edit, MoreHorizontal } from 'lucide-react';
import { FilterSearchInput, FilterTabs, FilterDropdown } from '@/components/ImageLibrary/FilterControls';
import ImageUploadModal from '@/components/ImageLibrary/ImageUploadModal';
import UpdateMetaModal from '@/components/ImageLibrary/UpdateMetaModal';
import { useGetImages, useGetDeletedImages, useGetArchivedMedia, deleteMedia, archiveMedia } from '@/hooks/useImageLibrary';
import toast from 'react-hot-toast';
import { Button, Paper, IconButton, Menu, MenuItem } from '@mui/material';

export default function ImageLibraryPage() {
  const { images, isLoading: imagesLoading, mutate: mutateImages } = useGetImages();
  const { deletedImages, mutate: mutateDeleted } = useGetDeletedImages();
  const { archivedMedia, mutate: mutateArchived } = useGetArchivedMedia();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const tabs = [
    { id: 'all', label: 'All Images' },
    { id: 'archived', label: 'Archived' },
    { id: 'deleted', label: 'Trash' },
  ];

  const sourceFilters = [
    { id: 'all', label: 'All Sources' },
    { id: 'ai', label: 'AI Generated' },
    { id: 'manual', label: 'Manual Uploads' },
  ];

  let currentData = [];
  if (activeTab === 'all') currentData = images;
  else if (activeTab === 'archived') currentData = archivedMedia;
  else if (activeTab === 'deleted') currentData = deletedImages;

  const filteredData = useMemo(() => {
    return currentData.filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.hashtags && typeof item.hashtags === 'string' && item.hashtags.toLowerCase().includes(q));

      const matchesSource = filterSource === 'all' || item.source === filterSource || item.uploadType === filterSource;

      return matchesSearch && matchesSource;
    });
  }, [currentData, searchQuery, filterSource]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      toast.success('Image moved to trash');
      mutateImages();
      mutateDeleted();
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveMedia(id);
      toast.success('Image archived');
      mutateImages();
      mutateArchived();
    } catch (err) {
      toast.error('Failed to archive image');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <ImageIcon size={28} className="text-blue-500" />
            </div>
            Image Library
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Manage your AI-generated and manually uploaded media assets.
          </p>
        </div>
        <Button 
          variant="contained" 
          onClick={() => setUploadModalOpen(true)}
          startIcon={<Upload size={18} />}
          sx={{ 
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            boxShadow: '0 4px 14px 0 rgba(59,130,246,0.3)',
          }}
        >
          Upload Image
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <FilterTabs 
          items={tabs} 
          value={activeTab} 
          onChange={setActiveTab} 
        />
        <div className="flex w-full md:w-auto items-center gap-2">
          <FilterSearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            className="w-full md:w-64"
          />
          <FilterDropdown 
            items={sourceFilters}
            value={filterSource}
            onChange={setFilterSource}
            onClear={() => setFilterSource('all')}
          />
        </div>
      </div>

      {imagesLoading && activeTab === 'all' ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {filteredData.map((img: any) => (
              <motion.div
                key={img.id || img._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="break-inside-avoid"
              >
                <Paper elevation={0} className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-auto">
                    <img 
                      src={img.mediaUrl} 
                      alt={img.description || 'Library item'} 
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      {img.description && (
                        <p className="text-white text-sm line-clamp-2 mb-2 font-medium">
                          {img.description}
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        {activeTab === 'all' && (
                          <>
                            <IconButton size="small" onClick={() => { setSelectedImage(img); setUpdateModalOpen(true); }} className="bg-white/20 hover:bg-white/40 text-blue-300 backdrop-blur-sm">
                              <Edit size={16} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleArchive(img.id || img._id)} className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm">
                              <Archive size={16} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(img.id || img._id)} className="bg-white/20 hover:bg-white/40 text-red-300 backdrop-blur-sm">
                              <Trash2 size={16} />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {!imagesLoading && filteredData.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="text-slate-400 h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No images found</h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchQuery ? "Try adjusting your search or filters." : "Upload some images to see them here."}
          </p>
        </div>
      )}

      <ImageUploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => { setUploadModalOpen(false); mutateImages(); }} 
      />

      <UpdateMetaModal 
        isOpen={updateModalOpen} 
        onClose={() => setUpdateModalOpen(false)} 
        image={selectedImage}
        onUpdate={() => mutateImages()}
      />
    </div>
  );
}
