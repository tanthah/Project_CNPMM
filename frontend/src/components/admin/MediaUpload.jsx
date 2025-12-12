// frontend/src/components/admin/MediaUpload.jsx
import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import './css/MediaUpload.css';
import { useNotification } from '../NotificationProvider';

export default function MediaUpload({ 
  media = [], 
  onMediaChange, 
  maxFiles = 10,
  acceptVideo = false 
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const notify = useNotification();

  const handleFileSelect = async (files) => {
    if (media.length + files.length > maxFiles) {
      notify.warn(`Chỉ được tải lên tối đa ${maxFiles} files`);
      return;
    }

    setUploading(true);
    const newMedia = [];

    for (let file of files) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !(acceptVideo && isVideo)) {
        notify.error(`File ${file.name} không hợp lệ`);
        continue;
      }

      // Validate file size (10MB for images, 50MB for videos)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        notify.warn(`File ${file.name} quá lớn (tối đa ${isVideo ? '50MB' : '10MB'})`);
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      newMedia.push({
        file,
        preview,
        type: isVideo ? 'video' : 'image',
        uploading: true
      });
    }

    onMediaChange([...media, ...newMedia]);
    setUploading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
  };

  const handleRemove = (index) => {
    const newMedia = [...media];
    // Revoke object URL to prevent memory leak
    if (newMedia[index].preview) {
      URL.revokeObjectURL(newMedia[index].preview);
    }
    newMedia.splice(index, 1);
    onMediaChange(newMedia);
  };

  const moveMedia = (fromIndex, toIndex) => {
    const newMedia = [...media];
    const [removed] = newMedia.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, removed);
    onMediaChange(newMedia);
  };

  return (
    <div className="media-upload">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="media-input"
          multiple
          accept={acceptVideo ? 'image/*,video/*' : 'image/*'}
          onChange={handleInputChange}
          disabled={uploading || media.length >= maxFiles}
          style={{ display: 'none' }}
        />
        <label htmlFor="media-input" className="upload-label">
          <i className="bi bi-cloud-upload"></i>
          <p>Kéo thả hoặc click để chọn file</p>
          <small>
            {acceptVideo 
              ? 'Hỗ trợ: JPG, PNG, GIF, MP4, WEBM (Tối đa 10 files)' 
              : 'Hỗ trợ: JPG, PNG, GIF (Tối đa 10 files)'}
          </small>
          {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
        </label>
      </div>

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div className="media-grid">
          {media.map((item, index) => (
            <div key={index} className="media-item">
              {item.type === 'video' ? (
                <video src={item.preview || item.url} controls className="media-preview" />
              ) : (
                <img src={item.preview || item.url} alt={`Media ${index + 1}`} className="media-preview" />
              )}
              
              <div className="media-actions">
                {index > 0 && (
                  <button
                    type="button"
                    className="btn-move"
                    onClick={() => moveMedia(index, index - 1)}
                    title="Di chuyển lên"
                  >
                    <i className="bi bi-arrow-left"></i>
                  </button>
                )}
                {index < media.length - 1 && (
                  <button
                    type="button"
                    className="btn-move"
                    onClick={() => moveMedia(index, index + 1)}
                    title="Di chuyển xuống"
                  >
                    <i className="bi bi-arrow-right"></i>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemove(index)}
                  title="Xóa"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
              
              {index === 0 && (
                <span className="badge-primary">Ảnh chính</span>
              )}
              
              {item.uploading && (
                <div className="uploading-overlay">
                  <Spinner animation="border" size="sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
