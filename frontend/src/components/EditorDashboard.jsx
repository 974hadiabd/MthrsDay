import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X, Camera, Heart, Clock, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getReasons,
  addReason,
  updateReason,
  deleteReason,
  getTimeline,
  addTimelineItem,
  updateTimelineItem,
  deleteTimelineItem
} from '../utils/storage';
import { ImageCropper } from './ImageCropper';
import { FullScreenImage } from './FullScreenImage';

// Compress and convert image to JPEG
const processImage = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      console.warn('Large file detected, will compress');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxWidth = 1200;
        const maxHeight = 1200;
        
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedData = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedData);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const EditorDashboard = ({ activeTab, onDataChange }) => {
  const [editingAccount, setEditingAccount] = useState('user'); // 'user' (Mama) | 'baba'
  const [reasons, setReasons] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [editingReasonId, setEditingReasonId] = useState(null);
  const [editingReasonText, setEditingReasonText] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [editingTimelineId, setEditingTimelineId] = useState(null);
  const [editingCaption, setEditingCaption] = useState('');
  const [imageError, setImageError] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const fetchReasons = useCallback(async () => {
    const data = await getReasons(editingAccount);
    setReasons(data);
  }, [editingAccount]);

  const fetchTimeline = useCallback(async () => {
    const data = await getTimeline(editingAccount);
    setTimeline(data);
  }, [editingAccount]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReasons(), fetchTimeline()]);
      setLoading(false);
    };
    loadData();
  }, [fetchReasons, fetchTimeline]);

  useEffect(() => {
    if (imageError) {
      const timer = setTimeout(() => setImageError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [imageError]);

  // Reasons handlers
  const handleAddReason = async () => {
    if (!newReason.trim() || saving) return;
    setSaving(true);
    try {
      await addReason(newReason.trim(), editingAccount);
      await fetchReasons();
      setNewReason('');
      onDataChange?.();
    } catch (error) {
      setImageError('Failed to add reason. Please try again.');
    }
    setSaving(false);
  };

  const handleUpdateReason = async (id) => {
    if (!editingReasonText.trim() || saving) return;
    setSaving(true);
    try {
      await updateReason(id, editingReasonText.trim());
      await fetchReasons();
      setEditingReasonId(null);
      setEditingReasonText('');
      onDataChange?.();
    } catch (error) {
      setImageError('Failed to update reason. Please try again.');
    }
    setSaving(false);
  };

  const handleDeleteReason = async (id) => {
    if (saving) return;
    setSaving(true);
    try {
      await deleteReason(id);
      await fetchReasons();
      onDataChange?.();
    } catch (error) {
      setImageError('Failed to delete reason. Please try again.');
    }
    setSaving(false);
  };

  // Timeline handlers
  const handleAddTimelineItem = async (imageData = null) => {
    if ((!newCaption.trim() && !imageData) || saving) return;
    setSaving(true);
    try {
      await addTimelineItem(newCaption.trim() || 'New memory', imageData, editingAccount);
      await fetchTimeline();
      setNewCaption('');
      onDataChange?.();
    } catch (error) {
      setImageError('Failed to add timeline item. Please try again.');
    }
    setSaving(false);
  };

  const handleUpdateTimelineItem = async (id, updates) => {
    if (saving) return;
    setSaving(true);
    try {
      await updateTimelineItem(id, updates);
      await fetchTimeline();
      setEditingTimelineId(null);
      setEditingCaption('');
      onDataChange?.();
    } catch (error) {
      setImageError('Failed to update timeline item. Please try again.');
    }
    setSaving(false);
  };

  const handleDeleteTimelineItem = async (id) => {
    if (saving) return;
    setSaving(true);
    try {
      await deleteTimelineItem(id);
      await fetchTimeline();
      onDataChange?.();
    } catch (error) {
      setImageError('Failed to delete timeline item. Please try again.');
    }
    setSaving(false);
  };

  const handleImageSelect = async (e, isEdit = false, itemId = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i)) {
      setImageError('Please select a valid image file (JPG, PNG, GIF, WebP, HEIC)');
      return;
    }

    try {
      setImageError(null);
      const compressedImage = await processImage(file);
      setPendingImage(compressedImage);
      setEditingItemId(isEdit ? itemId : null);
    } catch (error) {
      console.error('Image processing error:', error);
      setImageError('Failed to process image. Please try a different file.');
    }
  };

  const handleCropSave = async (croppedImage) => {
    if (editingItemId) {
      await handleUpdateTimelineItem(editingItemId, { image: croppedImage });
    } else {
      await handleAddTimelineItem(croppedImage);
    }
    setPendingImage(null);
    setEditingItemId(null);
  };

  const handleCropCancel = () => {
    setPendingImage(null);
    setEditingItemId(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <RefreshCw className="w-8 h-8 text-alive-accent animate-spin mb-4" />
        <p className="font-sans text-sm text-alive-text-muted">Loading...</p>
      </div>
    );
  }

  // Account switcher shown at the top of both editor tabs
  const AccountSwitcher = () => (
    <div className="flex items-center gap-1 bg-alive-surface rounded-full p-1 mb-6 w-fit" data-testid="account-switcher">
      <button
        onClick={() => setEditingAccount('user')}
        disabled={saving}
        data-testid="edit-account-mama"
        className={`px-4 py-2 rounded-full font-sans text-sm transition-colors ${
          editingAccount === 'user'
            ? 'bg-white text-purple-700 shadow-sm font-semibold'
            : 'text-alive-text-muted'
        }`}
      >
        Mama (1234)
      </button>
      <button
        onClick={() => setEditingAccount('baba')}
        disabled={saving}
        data-testid="edit-account-baba"
        className={`px-4 py-2 rounded-full font-sans text-sm transition-colors ${
          editingAccount === 'baba'
            ? 'bg-white text-blue-700 shadow-sm font-semibold'
            : 'text-alive-text-muted'
        }`}
      >
        Baba (baba1234)
      </button>
    </div>
  );

  // Tab 1: Reasons Why Editor
  if (activeTab === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8" data-testid="editor-reasons">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-alive-accent" />
            <h2 className="font-serif text-xl text-alive-text-primary">Edit Reasons Why</h2>
          </div>
          <button
            onClick={fetchReasons}
            disabled={saving}
            className="w-10 h-10 rounded-full bg-alive-surface flex items-center justify-center text-alive-text-muted hover:text-alive-accent transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <AccountSwitcher />

        {/* Error message */}
        <AnimatePresence>
          {imageError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="font-sans text-sm text-red-700">{imageError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add new reason */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
            placeholder="Add a new reason..."
            data-testid="new-reason-input"
            className="flex-1 bg-alive-surface border border-alive-border rounded-lg px-4 py-3 font-sans text-sm text-alive-text-primary placeholder-alive-text-muted focus:outline-none focus:border-alive-accent transition-colors"
            style={{ fontFamily: "'Cairo', 'Manrope', sans-serif" }}
            disabled={saving}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddReason}
            data-testid="add-reason-btn"
            disabled={saving}
            className="w-12 h-12 bg-alive-accent text-white rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Reasons list */}
        <div className="space-y-3">
          <AnimatePresence>
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-lg border border-alive-border p-4"
                data-testid={`reason-item-${index}`}
              >
                {editingReasonId === reason.id ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editingReasonText}
                      onChange={(e) => setEditingReasonText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateReason(reason.id)}
                      data-testid={`edit-reason-input-${index}`}
                      className="flex-1 bg-alive-surface border border-alive-border rounded px-3 py-2 font-sans text-sm focus:outline-none focus:border-alive-accent"
                      style={{ fontFamily: "'Cairo', 'Manrope', sans-serif" }}
                      autoFocus
                      disabled={saving}
                    />
                    <button
                      onClick={() => handleUpdateReason(reason.id)}
                      data-testid={`save-reason-${index}`}
                      disabled={saving}
                      className="w-10 h-10 bg-green-500 text-white rounded flex items-center justify-center disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingReasonId(null);
                        setEditingReasonText('');
                      }}
                      className="w-10 h-10 bg-gray-200 text-gray-600 rounded flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-sans text-sm text-alive-text-primary flex-1" style={{ fontFamily: "'Cairo', 'Manrope', sans-serif" }}>{reason.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingReasonId(reason.id);
                          setEditingReasonText(reason.text);
                        }}
                        data-testid={`edit-reason-${index}`}
                        className="w-8 h-8 text-alive-text-muted hover:text-alive-accent transition-colors flex items-center justify-center"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReason(reason.id)}
                        data-testid={`delete-reason-${index}`}
                        disabled={saving}
                        className="w-8 h-8 text-alive-text-muted hover:text-red-500 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {reasons.length === 0 && (
          <div className="text-center py-12" data-testid="editor-reasons-empty">
            <Heart className="w-12 h-12 text-alive-text-muted opacity-30 mx-auto mb-4" />
            <p className="font-sans text-sm text-alive-text-muted">
              No reasons added yet. Add your first reason above!
            </p>
          </div>
        )}
      </div>
    );
  }

  // Tab 2: Timeline Editor
  if (activeTab === 1) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8" data-testid="editor-timeline">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-alive-accent" />
            <h2 className="font-serif text-xl text-alive-text-primary">Edit Timeline</h2>
          </div>
          <button
            onClick={fetchTimeline}
            disabled={saving}
            className="w-10 h-10 rounded-full bg-alive-surface flex items-center justify-center text-alive-text-muted hover:text-alive-accent transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <AccountSwitcher />

        {/* Error message */}
        <AnimatePresence>
          {imageError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
              data-testid="image-error"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="font-sans text-sm text-red-700">{imageError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add new timeline item */}
        <div className="bg-alive-surface rounded-xl border border-alive-border p-4 mb-8">
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="Caption for new memory..."
            data-testid="new-timeline-caption"
            className="w-full bg-white border border-alive-border rounded-lg px-4 py-3 font-sans text-sm text-alive-text-primary placeholder-alive-text-muted focus:outline-none focus:border-alive-accent transition-colors mb-3"
            style={{ fontFamily: "'Cairo', 'Manrope', sans-serif" }}
            disabled={saving}
          />
          <div className="flex gap-3">
            <input
              type="file"
              accept="image/*,.heic,.heif"
              ref={fileInputRef}
              onChange={(e) => handleImageSelect(e, false)}
              className="hidden"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              data-testid="add-timeline-with-image"
              disabled={saving}
              className="flex-1 bg-white border border-alive-border rounded-lg py-3 font-sans text-sm text-alive-text-muted flex items-center justify-center gap-2 hover:border-alive-accent transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Add with photo
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddTimelineItem()}
              data-testid="add-timeline-btn"
              disabled={saving}
              className="flex-1 bg-alive-accent text-white rounded-lg py-3 font-sans text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add caption only
            </motion.button>
          </div>
        </div>

        {/* Timeline items */}
        <div className="space-y-4">
          <AnimatePresence>
            {timeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-xl border border-alive-border overflow-hidden"
                data-testid={`timeline-edit-item-${index}`}
              >
                {/* Image */}
                <div className="aspect-video bg-alive-surface relative">
                  {item.image ? (
                    <>
                      <img
                        src={item.image}
                        alt={item.caption}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setFullScreenImage(item)}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <input
                          type="file"
                          accept="image/*,.heic,.heif"
                          onChange={(e) => handleImageSelect(e, true, item.id)}
                          className="hidden"
                          id={`edit-image-${item.id}`}
                        />
                        <label
                          htmlFor={`edit-image-${item.id}`}
                          className="w-8 h-8 bg-black/50 rounded-full text-white flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </label>
                        <button
                          onClick={() => handleUpdateTimelineItem(item.id, { image: null })}
                          disabled={saving}
                          className="w-8 h-8 bg-black/50 rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        ref={editFileInputRef}
                        onChange={(e) => handleImageSelect(e, true, item.id)}
                        className="hidden"
                      />
                      <button
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={saving}
                        className="flex flex-col items-center text-alive-text-muted hover:text-alive-accent transition-colors disabled:opacity-50"
                      >
                        <Camera className="w-10 h-10 mb-2 opacity-50" />
                        <span className="font-sans text-xs">Add photo</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Caption editor */}
                <div className="p-4">
                  {editingTimelineId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingCaption}
                        onChange={(e) => setEditingCaption(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateTimelineItem(item.id, { caption: editingCaption })}
                        className="flex-1 bg-alive-surface border border-alive-border rounded px-3 py-2 font-sans text-sm focus:outline-none focus:border-alive-accent"
                        style={{ fontFamily: "'Cairo', 'Manrope', sans-serif" }}
                        autoFocus
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleUpdateTimelineItem(item.id, { caption: editingCaption })}
                        disabled={saving}
                        className="w-10 h-10 bg-green-500 text-white rounded flex items-center justify-center disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTimelineId(null);
                          setEditingCaption('');
                        }}
                        className="w-10 h-10 bg-gray-200 text-gray-600 rounded flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-sans text-sm text-alive-text-primary flex-1" style={{ fontFamily: "'Cairo', 'Manrope', sans-serif" }}>{item.caption}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTimelineId(item.id);
                            setEditingCaption(item.caption);
                          }}
                          data-testid={`edit-timeline-${index}`}
                          className="w-8 h-8 text-alive-text-muted hover:text-alive-accent transition-colors flex items-center justify-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTimelineItem(item.id)}
                          data-testid={`delete-timeline-${index}`}
                          disabled={saving}
                          className="w-8 h-8 text-alive-text-muted hover:text-red-500 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {timeline.length === 0 && (
          <div className="text-center py-12" data-testid="editor-timeline-empty">
            <Clock className="w-12 h-12 text-alive-text-muted opacity-30 mx-auto mb-4" />
            <p className="font-sans text-sm text-alive-text-muted">
              No timeline items yet. Add your first memory above!
            </p>
          </div>
        )}

        {/* Image cropper modal */}
        <AnimatePresence>
          {pendingImage && (
            <ImageCropper
              imageData={pendingImage}
              onSave={handleCropSave}
              onCancel={handleCropCancel}
            />
          )}
        </AnimatePresence>

        {/* Full screen image */}
        {fullScreenImage && (
          <FullScreenImage
            imageData={fullScreenImage.image}
            caption={fullScreenImage.caption}
            onClose={() => setFullScreenImage(null)}
          />
        )}
      </div>
    );
  }

  // Tab 3: Blank white screen (editor only)
  return (
    <div className="flex-1 bg-white" data-testid="editor-blank-tab">
      {/* Intentionally blank */}
    </div>
  );
};
