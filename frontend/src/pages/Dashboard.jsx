import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { state, fetchAnalytics, fetchDrives, fetchApplications, fetchInterviews } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [drives, setDrives] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const isOfficer = ['admin', 'placement_officer'].includes(state.authUser?.role);

  useEffect(() => {
    if (isOfficer) {
      fetchAnalytics().then(a => setAnalytics(a)).catch(() => {});
      fetchInterviews().then(r => setInterviews((r.data || []).slice(0, 5))).catch(() => {});
    }
    fetchDrives({ status: 'open' }).then(r => setDrives((r.data || []).slice(0, 5))).catch(() => {});
    fetchApplications({ status: 'shortlisted', limit: 5 }).then(r => setShortlisted(r.data || [])).catch(() => {});
  }, []);

  return (
    <div className="page-container" data-testid="dashboard">
      <h2 className="page-title">Dashboard</h2>
      <p className="welcome">Welcome, <strong>{state.authUser?.name}</strong> ({state.authUser?.role})</p>

      {isOfficer && analytics?.placements && (
        <div className="analytics-cards" data-testid="analytics-cards">
          <div className="card stat-card"><div className="stat-value">{analytics.placements.totalApplications}</div><div className="stat-label">Total Applications</div></div>
          <div className="card stat-card"><div className="stat-value" style={{color:'#f59e0b'}}>{analytics.placements.shortlistedCount}</div><div className="stat-label">Shortlisted</div></div>
          <div className="card stat-card"><div className="stat-value" style={{color:'#10b981'}}>{analytics.placements.selectedCount}</div><div className="stat-label">Selected</div></div>
          <div className="card stat-card"><div className="stat-value" style={{color:'#ef4444'}}>{analytics.placements.rejectedCount}</div><div className="stat-label">Rejected</div></div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card" data-testid="upcoming-drives">
          <h3>Upcoming Open Drives</h3>
          {drives.length === 0 ? <p className="empty">No open drives</p> : drives.map(d => (
            <div key={d._id} className="list-item">
              <Link to={`/drives/${d._id}`}><strong>{d.title}</strong></Link>
              <span className="badge badge-green">{d.status}</span>
              <div className="text-sm">{d.company?.name} · {d.mode}</div>
            </div>
          ))}
        </div>

        <div className="card" data-testid="shortlisted-students">
          <h3>Shortlisted Applications</h3>
          {shortlisted.length === 0 ? <p className="empty">No shortlisted applications</p> : shortlisted.map(a => (
            <div key={a._id} className="list-item">
              <Link to={`/applications/${a._id}`}><strong>{a.student?.name || 'Student'}</strong></Link>
              <div className="text-sm">{a.drive?.title}</div>
              <span className="badge badge-yellow">shortlisted</span>
            </div>
          ))}
        </div>

        {isOfficer && (
          <div className="card" data-testid="recent-interviews">
            <h3>Recent Interviews</h3>
            {interviews.length === 0 ? <p className="empty">No interviews scheduled</p> : interviews.map(i => (
              <div key={i._id} className="list-item">
                <strong>{i.application?.student?.name || 'Student'}</strong>
                <div className="text-sm">Round: {i.round} · {i.result}</div>
                <span className={`badge ${i.result === 'pass' ? 'badge-green' : i.result === 'fail' ? 'badge-red' : 'badge-gray'}`}>{i.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
