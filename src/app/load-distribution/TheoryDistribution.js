import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getTheoryDistribution } from '../api/theory-assign';

export default function TheoryDistribution() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTheoryDistribution();
  }, []);

  const fetchTheoryDistribution = async () => {
    setLoading(true);
    try {
      const response = await getTheoryDistribution();
      setCourses(response || []);
    } catch (error) {
      console.error('Error fetching theory distribution:', error);
      toast.error('Failed to load theory distribution data');
    } finally {
      setLoading(false);
    }
  };

  // Table styles matching CreditDistribution
  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    backgroundColor: '#f8f9fa',
    boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #ccd4e0',
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: '600',
    padding: '15px 12px',
    textAlign: 'center',
    border: 'none',
    fontSize: '0.95rem',
  };

  const cellStyle = {
    padding: '12px',
    border: '1px solid #dee2e6',
    backgroundColor: 'white',
    verticalAlign: 'top',
    textAlign: 'center',
  };

  const teacherBadgeStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    margin: '2px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #bbdefb',
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="text-center py-4">
          <div className="spinner-border text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading theory distribution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px 8px 0 0',
              padding: '1rem 1.5rem'
            }}>
              <h6 className="card-title mb-0" style={{ color: 'white', fontWeight: '600' }}>
                <i className="mdi mdi-book-open-page-variant mr-2"></i>Teacher Assigned In Theory Courses
              </h6>
            </div>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              {courses.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="mdi mdi-book-off-outline" style={{ fontSize: '3rem', color: '#6c757d', opacity: 0.5 }}></i>
                  </div>
                  <h6 className="text-muted mb-2">No Theory Courses</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    No theory courses have been distributed yet.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{...headerStyle, width: '120px'}}>Course ID</th>
                        <th style={{...headerStyle, width: '350px'}}>Course Name</th>
                        <th style={{...headerStyle, width: '100px'}}>Section</th>
                        <th style={{...headerStyle, width: '200px'}}>Assigned Teachers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={index}>
                          <td style={{...cellStyle, fontWeight: '600', color: '#495057'}}>
                            {course.course_id}
                          </td>
                          <td style={cellStyle}>
                            {course.course_name || course.course_id}
                          </td>
                          <td style={cellStyle}>
                            {course.section}
                          </td>
                          <td style={cellStyle}>
                            {course.teachers_details && course.teachers_details.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {course.teachers_details.map((teacher, idx) => (
                                  <div key={idx} style={teacherBadgeStyle} title={`${teacher.name} (${teacher.initial})`}>
                                    {teacher.surname}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#6c757d', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                No teachers assigned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
