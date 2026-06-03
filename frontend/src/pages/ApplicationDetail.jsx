import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);

  useEffect(() => {
    API.get(`/applications/${id}`).then(r => setApp(r.data.data));
  }, [id]);

  if (!app) return <div className="loading">Loading...</div>;
  const { student, drive } = app;

  return (
    <div className="page-container" data-testid="application-detail">
      <Link to="/applications" className="back-link">← Back to Applications</Link>
      <div className="detail-card">
        <div className="detail-header">
          <h2>Application: {app.applicationId}</h2>
          <span className={`badge ${app.status === 'selected' ? 'badge-green' : app.status === 'shortlisted' ? 'badge-yellow' : app.status === 'rejected' ? 'badge-red' : 'badge-blue'}`}>{app.status}</span>
        </div>
        <div className="detail-section">
          <h4>Student</h4>
          <div className="detail-grid">
            <div><label>Name</label><p>{student?.name}</p></div>
            <div><label>Department</label><p>{student?.department}</p></div>
            <div><label>CGPA</label><p>{student?.cgpa}</p></div>
            <div><label>Email</label><p>{student?.email}</p></div>
          </div>
        </div>
        <div className="detail-section">
          <h4>Drive</h4>
          <div className="detail-grid">
            <div><label>Title</label><p>{drive?.title}</p></div>
            <div><label>Company</label><p>{drive?.company?.name}</p></div>
            <div><label>Mode</label><p>{drive?.mode}</p></div>
            <div><label>Location</label><p>{drive?.location}</p></div>
          </div>
        </div>
        <div className="detail-section">
          <h4>Application Details</h4>
          <div className="detail-grid">
            <div><label>Current Round</label><p>{app.currentRound}</p></div>
            <div><label>Applied At</label><p>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
