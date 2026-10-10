import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, Download, Eye } from 'lucide-react';
import api from '../services/api';

/**
 * Reusable PDF Uploader Component
 *
 * @param {Object} props
 * @param {string} props.fileCategory - 'PROJECT_INSTRUCTION' or 'STUDENT_SUBMISSION'
 * @param {number} [props.entityId] - Optional associated project/assignment ID
 * @param {string} [props.label] - Custom label
 * @param {string} [props.helperText] - Custom helper text
 * @param {Function} props.onUploadSuccess - Callback returning the uploaded file metadata
 * @param {Function} [props.onRemove] - Callback when file is cleared/removed
 * @param {Object} [props.initialFile] - Pre-existing file metadata { fileName, originalFileName, fileSize, downloadUrl }
 */
export default function PdfUploader({
  fileCategory = 'PROJECT_INSTRUCTION',
  entityId = null,
  label = 'Upload Document (PDF only)',
  helperText = 'Maximum file size: 10 MB. Only genuine PDF documents accepted.',
  onUploadSuccess,
  onRemove,
  initialFile = null,
}) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(initialFile);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');

    // 1. Extension and MIME check
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError('Invalid file format. Only standard PDF (.pdf) documents are permitted.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Size limit check (10 MB = 10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError(`File size exceeds 10 MB limit (${formatFileSize(selectedFile.size)}). Please choose a smaller PDF.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Upload to backend
    try {
      setUploading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileCategory', fileCategory);
      if (entityId) {
        formData.append('entityId', entityId);
      }

      const res = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(pct);
          }
        },
      });

      if (res.data?.success && res.data?.data) {
        const uploadedData = res.data.data;
        setFile(uploadedData);
        if (onUploadSuccess) {
          onUploadSuccess(uploadedData);
        }
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to upload PDF. Ensure the file is not corrupted and is a valid PDF.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="pdf-uploader" style={{ marginBottom: '18px' }}>
      <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B', marginBottom: '6px', display: 'block' }}>
        {label}
      </label>

      {error && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {file ? (
        /* Uploaded File Pill / Display */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: '#15803D',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.originalFileName || file.fileName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                PDF Document &bull; {formatFileSize(file.fileSize)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '10px' }}>
            {file.downloadUrl && (
              <a
                href={file.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 10px', fontSize: '0.78rem', textDecoration: 'none' }}
                title="Download / View PDF"
              >
                <Download size={14} /> View
              </a>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 8px', color: '#DC2626' }}
              title="Remove PDF"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Trigger */
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '10px',
              padding: '24px 16px',
              textAlign: 'center',
              backgroundColor: uploading ? '#F8FAFC' : '#FFFFFF',
              cursor: uploading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.backgroundColor = '#EFF6FF';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={28} className="spin" color="#2563EB" />
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B' }}>
                  Uploading & Verifying PDF... {progress > 0 && `(${progress}%)`}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Validating file header magic bytes
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <Upload size={20} />
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>
                  Click to select PDF from device
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  {helperText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
