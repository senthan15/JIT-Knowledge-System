import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2, FileSearch } from 'lucide-react';
import axios from 'axios';

export default function FileUpload({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);
    const [analyzing, setAnalyzing] = useState({}); // Map of file uri -> boolean
    const [analysisResults, setAnalysisResults] = useState({}); // Map of file uri -> string

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

    const handleAnalyze = async (file) => {
        setAnalyzing(prev => ({ ...prev, [file.uri]: true }));
        try {
            const response = await axios.post('http://localhost:3000/api/analyze', {
                fileUri: file.uri,
                mimeType: file.mimeType
            });
            setAnalysisResults(prev => ({ ...prev, [file.uri]: response.data.analysis }));
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Analysis failed");
        } finally {
            setAnalyzing(prev => ({ ...prev, [file.uri]: false }));
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {files.map((f, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <FileText size={16} />
                            <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{f.name}</span>
                            <CheckCircle size={16} color="#4ade80" />
                            <button
                                onClick={() => handleAnalyze(f)}
                                disabled={analyzing[f.uri]}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {analyzing[f.uri] ? <Loader2 size={14} className="animate-spin" /> : <FileSearch size={14} />}
                                {analyzing[f.uri] ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                        {analysisResults[f.uri] && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                                <strong>Analysis:</strong>
                                <br />
                                {analysisResults[f.uri]}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
