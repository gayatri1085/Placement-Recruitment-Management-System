import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/students/${id}`).then(r => setStudent(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!student) return <div className="error-state">Student not found</div>;

  return (
    <div className="page-container" data-testid="student-detail">
      <Link to="/students" className="back-link">← Back to Students</Link>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{student.name}</h2>
          <span className={`badge ${student.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{student.status}</span>
        </div>
        <div className="detail-grid">
          <div><label>Student ID</label><p>{student.studentId}</p></div>
          <div><label>Email</label><p>{student.email}</p></div>
          <div><label>Department</label><p>{student.department}</p></div>
          <div><label>CGPA</label><p>{student.cgpa}</p></div>
          <div><label>Graduation Year</label><p>{student.graduationYear}</p></div>
          <div><label>Phone</label><p>{student.phone}</p></div>
        </div>
        {student.skills?.length > 0 && (
          <div className="skills-section">
            <label>Skills</label>
            <div className="skills-list">
              {student.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
