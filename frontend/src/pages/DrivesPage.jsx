import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api/axios';

export default function DrivesPage() {
  const { fetchDrives, state } = useApp();
  const [drives, setDrives] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ driveId: '', company: '', title: '', mode: 'online', location: '', registrationDeadline: '', rounds: '', status: 'open' });
  const isOfficer = ['admin', 'placement_officer'].includes(state.authUser?.role);

  const load = async (status = statusFilter) => {
    const params = {};
    if (status) params.status = status;
    const res = await fetchDrives(params);
    setDrives(res.data || []);
    setTotal(res.total || 0);
  };

  useEffect(() => {
    load();
    API.get('/companies').then(r => setCompanies(r.data.data || []));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/drives', { ...form, rounds: form.rounds ? form.rounds.split(',').map(r => r.trim()) : [] });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this drive?')) return;
    await API.delete(`/drives/${id}`);
    load();
  };

  return (
    <div className="page-container" data-testid="drives-page">
      <div className="page-header">
        <h2 className="page-title">Drives <span className="count-badge">{total}</span></h2>
        {isOfficer && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Drive</button>}
      </div>

      <div className="filter-bar">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); load(e.target.value); }} data-testid="drive-status-filter">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Create Drive</h3>
          <form onSubmit={handleCreate} className="grid-form">
            <div className="form-group"><label>Drive ID</label><input required value={form.driveId} onChange={e => setForm({...form, driveId: e.target.value})} /></div>
            <div className="form-group"><label>Company</label>
              <select required value={form.company} onChange={e => setForm({...form, company: e.target.value})}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Title</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="form-group"><label>Mode</label>
              <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}>
                <option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div className="form-group"><label>Registration Deadline</label><input type="date" required value={form.registrationDeadline} onChange={e => setForm({...form, registrationDeadline: e.target.value})} /></div>
            <div className="form-group"><label>Rounds (comma-sep)</label><input value={form.rounds} onChange={e => setForm({...form, rounds: e.target.value})} /></div>
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table" data-testid="drives-table">
          <thead><tr><th>Drive ID</th><th>Title</th><th>Company</th><th>Mode</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {drives.map(d => (
              <tr key={d._id}>
                <td>{d.driveId}</td>
                <td><strong>{d.title}</strong></td>
                <td>{d.company?.name}</td>
                <td>{d.mode}</td>
                <td>{d.registrationDeadline ? new Date(d.registrationDeadline).toLocaleDateString() : '-'}</td>
                <td><span className={`badge ${d.status === 'open' ? 'badge-green' : d.status === 'completed' ? 'badge-gray' : 'badge-red'}`}>{d.status}</span></td>
                <td className="action-btns">
                  <Link to={`/drives/${d._id}`} className="btn-sm">View</Link>
                  {isOfficer && <button onClick={() => handleDelete(d._id)} className="btn-sm btn-danger">Del</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {drives.length === 0 && <div className="empty-state">No drives found</div>}
      </div>
    </div>
  );
}
