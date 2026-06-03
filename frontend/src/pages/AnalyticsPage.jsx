import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AnalyticsPage() {
  const { fetchAnalytics } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then(a => setAnalytics(a)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!analytics) return <div className="error-state">Failed to load analytics</div>;

  const { placements, departments, companies } = analytics;

  return (
    <div className="page-container" data-testid="analytics-page">
      <h2 className="page-title">Analytics</h2>

      <section className="analytics-section">
        <h3>Placement Overview</h3>
        <div className="analytics-cards" data-testid="placement-cards">
          <div className="card stat-card"><div className="stat-value">{placements?.totalApplications}</div><div className="stat-label">Total Applications</div></div>
          <div className="card stat-card"><div className="stat-value" style={{color:'#f59e0b'}}>{placements?.shortlistedCount}</div><div className="stat-label">Shortlisted</div></div>
          <div className="card stat-card"><div className="stat-value" style={{color:'#10b981'}}>{placements?.selectedCount}</div><div className="stat-label">Selected</div></div>
          <div className="card stat-card"><div className="stat-value" style={{color:'#ef4444'}}>{placements?.rejectedCount}</div><div className="stat-label">Rejected</div></div>
        </div>
      </section>

      <section className="analytics-section">
        <h3>Department-wise Placement</h3>
        <div className="table-wrapper" data-testid="dept-analytics">
          <table className="data-table">
            <thead><tr><th>Department</th><th>Placed Count</th><th>Placement %</th></tr></thead>
            <tbody>
              {(departments || []).map(d => (
                <tr key={d.department}>
                  <td><span className="badge badge-blue">{d.department}</span></td>
                  <td>{d.placedCount}</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${Math.min(d.placementPercentage, 100)}%`}} />
                    </div>
                    {d.placementPercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-section">
        <h3>Company-wise Analytics</h3>
        <div className="table-wrapper" data-testid="company-analytics">
          <table className="data-table">
            <thead><tr><th>Company</th><th>Highest Package (LPA)</th><th>Participation</th><th>Selected</th></tr></thead>
            <tbody>
              {(companies || []).map(c => (
                <tr key={c._id}>
                  <td><strong>{c.companyName}</strong></td>
                  <td>{c.highestPackage}</td>
                  <td>{c.participationCount}</td>
                  <td>{c.selectedStudents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
