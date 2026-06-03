import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useApp } from '../context/AppContext';

export default function CompanyDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const [company, setCompany] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const isOfficer = ['admin', 'placement_officer'].includes(state.authUser?.role);

  useEffect(() => {
    API.get(`/companies/${id}`).then(r => { setCompany(r.data.data); setForm(r.data.data); });
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await API.patch(`/companies/${id}`, form);
    setCompany(res.data.data);
    setEditing(false);
  };

  if (!company) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container" data-testid="company-detail">
      <Link to="/companies" className="back-link">← Back to Companies</Link>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{company.name}</h2>
          <span className={`badge ${company.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{company.status}</span>
          {isOfficer && <button onClick={() => setEditing(!editing)} className="btn-secondary ml-auto">Edit</button>}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="grid-form">
            {['name','role','package','minimumCgpa'].map(f => (
              <div key={f} className="form-group">
                <label>{f}</label>
                <input value={form[f] || ''} onChange={e => setForm({...form, [f]: e.target.value})} />
              </div>
            ))}
            <div className="form-group"><label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
          </form>
        ) : (
          <div className="detail-grid">
            <div><label>Company ID</label><p>{company.companyId}</p></div>
            <div><label>Role</label><p>{company.role}</p></div>
            <div><label>Package</label><p>{company.package} LPA</p></div>
            <div><label>Min CGPA</label><p>{company.minimumCgpa}</p></div>
            <div><label>Drive Date</label><p>{new Date(company.driveDate).toLocaleDateString()}</p></div>
            <div><label>Eligible Departments</label><p>{company.eligibleDepartments?.join(', ')}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
