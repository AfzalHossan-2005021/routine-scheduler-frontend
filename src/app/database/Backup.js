import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
// CORRECTED IMPORT: Using a relative path to ensure the module is found.
import { getVersions, saveVersion, loadVersion, deleteVersion } from '../api/versions';

const Spinner = () => (
    <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
);

const Backup = () => {
    const [versions, setVersions] = useState([]);
    const [newVersionName, setNewVersionName] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchVersions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getVersions();
            setVersions(data);
        } catch (err) {
            // Error is handled by the global axios interceptor in App.js
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newVersionName) {
            toast.error('Please enter a name for the backup.');
            return;
        }
        
        setActionLoading('save');
        try {
            const data = await saveVersion(newVersionName);
            toast.success(data.message);
            setNewVersionName('');
            fetchVersions();
        } catch (err) {
            // Error handled by interceptor
        } finally {
            setActionLoading(null);
        }
    };

    const handleLoad = async (filename) => {
        if (!window.confirm(`Are you sure you want to load "${filename}"? This will overwrite the current routine.`)) return;

        setActionLoading(filename);
        try {
            const data = await loadVersion(filename);
            toast.success(`${data.message} Please refresh to see changes.`);
        } catch (err) {
            // Error handled by interceptor
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${filename}"?`)) return;
        
        setActionLoading(filename);
        try {
            const data = await deleteVersion(filename);
            toast.success(data.message);
            fetchVersions();
        } catch (err) {
            // Error handled by interceptor
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="container mt-3">
            <div className="card">
                <div className="card-header">
                    <h3>Database Backup and Restore</h3>
                </div>
                <div className="card-body">
                    <h5 className="card-title">Save New Backup</h5>
                    <form onSubmit={handleSave} className="mb-4">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., final-exam-draft-1"
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                disabled={actionLoading === 'save'}
                            />
                            <button className="btn btn-primary" type="submit" disabled={actionLoading === 'save'}>
                                {actionLoading === 'save' ? <Spinner /> : 'Save Current State'}
                            </button>
                        </div>
                    </form>

                    <hr />

                    <h5 className="card-title">Saved Backups</h5>
                    {loading ? (
                        <div className="text-center p-4"><Spinner /></div>
                    ) : (
                        <ul className="list-group">
                            {versions.length > 0 ? versions.map(version => (
                                <li key={version.filename} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        {/* Updated to replace .dump */}
                                        <strong>{version.filename.replace('.dump', '')}</strong>
                                        <br />
                                        <small className="text-muted">
                                            Saved: {new Date(version.createdAt).toLocaleString()} | Size: {Math.round(version.size / 1024)} KB
                                        </small>
                                    </div>
                                    <div className="btn-group" role="group">
                                        <button 
                                            className="btn btn-success btn-sm" 
                                            onClick={() => handleLoad(version.filename)}
                                            disabled={!!actionLoading}
                                            title={`Load ${version.filename}`}
                                        >
                                            {actionLoading === version.filename ? <Spinner /> : 'Load'}
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm" 
                                            onClick={() => handleDelete(version.filename)}
                                            disabled={!!actionLoading}
                                            title={`Delete ${version.filename}`}
                                        >
                                            {actionLoading === version.filename ? <Spinner /> : 'Delete'}
                                        </button>
                                    </div>
                                </li>
                            )) : (
                               <li className="list-group-item">No saved backups found.</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Backup;
