import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useApp } from '../context/AppContext';

export default function DriveDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const [drive, setDrive] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const isOfficer = ['admin', 'placement_officer'].includes(state.authUser?.role);

  useEffect(() => {
    API.get(`/drives/${id}`).then(r => { setDrive(r.data.data); setForm({ ...r.data.data, company: r.data.data.company?._id }); });
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await API.patch(`/drives/${id}`, { location: form.location, status: form.status, rounds: form.rounds });
    setDrive(res.data.data);
    setEditing(false);
  };

  if (!drive) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container" data-testid="drive-detail">
      <Link to="/drives" className="back-link">← Back to Drives</Link>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{drive.title}</h2>
          <span className={`badge ${drive.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{drive.status}</span>
          {isOfficer && <button onClick={() => setEditing(!editing)} className="btn-secondary ml-auto">Edit</button>}
        </div>
        {editing ? (
          <form onSubmit={handleUpdate} className="grid-form">
            <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div className="form-group"><label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="open">Open</option><option value="closed">Closed</option><option value="completed">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
          </form>
        ) : (
          <div className="detail-grid">
            <div><label>Drive ID</label><p>{drive.driveId}</p></div>
            <div><label>Company</label><p>{drive.company?.name}</p></div>
            <div><label>Mode</label><p>{drive.mode}</p></div>
            <div><label>Location</label><p>{drive.location}</p></div>
            <div><label>Deadline</label><p>{drive.registrationDeadline ? new Date(drive.registrationDeadline).toLocaleDateString() : '-'}</p></div>
            <div><label>Rounds</label><p>{drive.rounds?.join(', ') || 'N/A'}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
