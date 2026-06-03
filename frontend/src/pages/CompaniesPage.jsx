import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api/axios';

export default function CompaniesPage() {
  const { fetchCompanies, state } = useApp();
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyId: '', name: '', role: '', package: '', eligibleDepartments: '', minimumCgpa: '', driveDate: '', status: 'upcoming' });
  const isOfficer = ['admin', 'placement_officer'].includes(state.authUser?.role);

  const load = async () => {
    const res = await fetchCompanies();
    setCompanies(res.data || []);
    setTotal(res.total || 0);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/companies', { ...form, package: Number(form.package), minimumCgpa: Number(form.minimumCgpa), eligibleDepartments: form.eligibleDepartments.split(',').map(d => d.trim()) });
    setShowForm(false);
    setForm({ companyId: '', name: '', role: '', package: '', eligibleDepartments: '', minimumCgpa: '', driveDate: '', status: 'upcoming' });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    await API.delete(`/companies/${id}`);
    load();
  };

  return (
    <div className="page-container" data-testid="companies-page">
      <div className="page-header">
        <h2 className="page-title">Companies <span className="count-badge">{total}</span></h2>
        {isOfficer && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Company</button>}
      </div>

      {showForm && (
        <div className="form-card" data-testid="company-form">
          <h3>Create Company</h3>
          <form onSubmit={handleCreate} className="grid-form">
            {['companyId','name','role','package','minimumCgpa'].map(f => (
              <div key={f} className="form-group">
                <label>{f}</label>
                <input required value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} />
              </div>
            ))}
            <div className="form-group"><label>Eligible Departments (comma-sep)</label><input value={form.eligibleDepartments} onChange={e => setForm({...form, eligibleDepartments: e.target.value})} /></div>
            <div className="form-group"><label>Drive Date</label><input type="date" required value={form.driveDate} onChange={e => setForm({...form, driveDate: e.target.value})} /></div>
            <div className="form-group"><label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table" data-testid="companies-table">
          <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Package (LPA)</th><th>Min CGPA</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {companies.map(c => (
              <tr key={c._id}>
                <td>{c.companyId}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.role}</td>
                <td>{c.package}</td>
                <td>{c.minimumCgpa}</td>
                <td><span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'upcoming' ? 'badge-yellow' : 'badge-gray'}`}>{c.status}</span></td>
                <td className="action-btns">
                  <Link to={`/companies/${c._id}`} className="btn-sm">View</Link>
                  {isOfficer && <button onClick={() => handleDelete(c._id)} className="btn-sm btn-danger">Del</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {companies.length === 0 && <div className="empty-state">No companies found</div>}
      </div>
    </div>
  );
}
