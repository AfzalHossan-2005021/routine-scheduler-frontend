import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getSessionalDistribution } from '../api/theory-assign';

/**
 * Helper function to format section display for 0.75 credit courses
 * @param {string} section - The section (A, B, C, etc.)
 * @param {number} classPerWeek - The class per week value (1 for 0.75 credit, 2 for 1.5 credit)
 * @returns {string} - Formatted section display
 */
function formatSectionDisplay(section, classPerWeek) {
  // For 0.75 credit courses (class_per_week = 0.75), show (A1/A2) format
  if (classPerWeek === 0.75) {
    return `${section}1/${section}2`;
  }
  // For other courses, show the section as is
  return section;
}

export default function SessionalDistribution() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessionalDistribution();
  }, []);

  const fetchSessionalDistribution = async () => {
    setLoading(true);
    try {
      const response = await getSessionalDistribution();
      console.log(response);
      setCourses(response || []);
    } catch (error) {
      console.error("Error fetching sessional distribution:", error);
      toast.error("Failed to load sessional distribution data");
    } finally {
      setLoading(false);
    }
  };

    // Table styles matching other components
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
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
    border: '1px solid #e1bee7',
  };


  const formatTime = (time) => {
    if (!time) return "Not scheduled";
    return time;
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="text-center py-4">
          <div className="spinner-border text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading sessional distribution...</p>
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
                <i className="mdi mdi-flask-outline mr-2"></i>Teachers Assigned In Sessional Courses
              </h6>
            </div>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              {courses.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="mdi mdi-flask-off-outline" style={{ fontSize: '3rem', color: '#6c757d', opacity: 0.5 }}></i>
                  </div>
                  <h6 className="text-muted mb-2">No Sessional Courses</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    No sessional courses have been distributed yet.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{...headerStyle, width: '120px'}}>Course ID</th>
                        <th style={{...headerStyle, width: '300px'}}>Course Name</th>
                        <th style={{...headerStyle, width: '100px'}}>Section</th>
                        <th style={{...headerStyle, width: '100px'}}>Day</th>
                        <th style={{...headerStyle, width: '150px'}}>Time</th>
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
                            {formatSectionDisplay(course.section,course.class_per_week)}
                          </td>
                          <td style={cellStyle}>
                            {course.day || 'Not scheduled'}
                          </td>
                          <td style={cellStyle}>
                            {formatTime(course.time)}
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
