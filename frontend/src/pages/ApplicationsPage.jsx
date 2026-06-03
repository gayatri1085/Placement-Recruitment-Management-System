import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api/axios';

export default function ApplicationsPage() {
  const { fetchApplications, state } = useApp();
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const isOfficer = ['admin', 'placement_officer'].includes(state.authUser?.role);
  const limit = 10;

  const load = async (p = 1, s = search, st = statusFilter) => {
    const params = { page: p, limit };
    if (s) params.search = s;
    if (st) params.status = st;
    const res = await fetchApplications(params);
    setApplications(res.data || []);
    setTotal(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setPage(p);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page-container" data-testid="applications-page">
      <h2 className="page-title">Applications <span className="count-badge">{total}</span></h2>
      <div className="filter-bar">
        <input placeholder="Search by drive/company/student..." value={search} onChange={e => { setSearch(e.target.value); load(1, e.target.value, statusFilter); }} data-testid="app-search" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); load(1, search, e.target.value); }} data-testid="app-status-filter">
          <option value="">All Status</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="table-wrapper">
        <table className="data-table" data-testid="applications-table">
          <thead><tr><th>App ID</th><th>Student</th><th>Drive</th><th>Round</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
          <tbody>
            {applications.map(a => (
              <tr key={a._id}>
                <td>{a.applicationId}</td>
                <td>{a.student?.name}</td>
                <td>{a.drive?.title}</td>
                <td>{a.currentRound}</td>
                <td><span className={`badge ${a.status === 'selected' ? 'badge-green' : a.status === 'shortlisted' ? 'badge-yellow' : a.status === 'rejected' ? 'badge-red' : 'badge-blue'}`}>{a.status}</span></td>
                <td>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '-'}</td>
                <td className="action-btns">
                  <Link to={`/applications/${a._id}`} className="btn-sm">View</Link>
                  {isOfficer && (
                    <button onClick={async () => {
                      const status = prompt('Update status (applied/shortlisted/selected/rejected):');
                      if (status) { await API.patch(`/applications/${a._id}`, { status }); load(page); }
                    }} className="btn-sm">Update</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <div className="empty-state">No applications found</div>}
      </div>
      <div className="pagination">
        <button onClick={() => load(page - 1)} disabled={page <= 1}>← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => load(page + 1)} disabled={page >= totalPages}>Next →</button>
      </div>
    </div>
  );
}
