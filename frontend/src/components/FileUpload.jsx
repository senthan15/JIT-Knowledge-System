import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function FileUpload({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await axios.post('http://localhost:3000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFiles(prev => [...prev, ...response.data.files]);
            onUploadComplete(response.data.files);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Knowledge Base</h2>

            <div style={{ position: 'relative' }}>
                <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                    disabled={uploading}
                />
                <div className="input-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(59, 130, 246, 0.1)', border: '1px dashed var(--primary)' }}>
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    <span>{uploading ? 'Uploading...' : 'Upload Policy Docs'}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {files.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <FileText size={16} />
                        <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <CheckCircle size={16} color="#4ade80" />
                    </div>
                ))}
            </div>
        </div>
    );
}
