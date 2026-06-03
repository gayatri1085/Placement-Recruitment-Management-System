import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function StudentsPage() {
  const { fetchStudents } = useApp();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ department: '', cgpaMin: '', status: '' });
  const limit = 10;

  const load = async (p = 1, f = filters) => {
    const params = { page: p, limit };
    if (f.department) params.department = f.department;
    if (f.cgpaMin) params.cgpaMin = f.cgpaMin;
    if (f.status) params.status = f.status;
    const res = await fetchStudents(params);
    setStudents(res.data || []);
    setTotal(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setPage(p);
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    load(1, updated);
  };

  return (
    <div className="page-container" data-testid="students-page">
      <h2 className="page-title">Students <span className="count-badge">{total}</span></h2>
      <div className="filter-bar">
        <select name="department" value={filters.department} onChange={handleFilter} data-testid="dept-filter">
          <option value="">All Departments</option>
          {['CSE','IT','ECE','EEE','MECH','CIVIL','AI&DS'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input name="cgpaMin" type="number" min="0" max="10" step="0.1" placeholder="Min CGPA" value={filters.cgpaMin} onChange={handleFilter} data-testid="cgpa-filter" />
        <select name="status" value={filters.status} onChange={handleFilter} data-testid="status-filter">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="placed">Placed</option>
        </select>
      </div>
      <div className="table-wrapper">
        <table className="data-table" data-testid="students-table">
          <thead>
            <tr><th>Student ID</th><th>Name</th><th>Department</th><th>CGPA</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id} data-testid={`student-row-${s._id}`}>
                <td>{s.studentId}</td>
                <td>{s.name}</td>
                <td><span className="badge badge-blue">{s.department}</span></td>
                <td>{s.cgpa}</td>
                <td><span className={`badge ${s.status === 'active' ? 'badge-green' : s.status === 'placed' ? 'badge-purple' : 'badge-gray'}`}>{s.status}</span></td>
                <td><Link to={`/students/${s._id}`} className="btn-sm">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <div className="empty-state">No students found</div>}
      </div>
      <div className="pagination">
        <button onClick={() => load(page - 1)} disabled={page <= 1}>← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => load(page + 1)} disabled={page >= totalPages}>Next →</button>
      </div>
    </div>
  );
}
