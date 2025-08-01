import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTeachers } from '../api/db-crud';
import { 
  getTeacherTheoryAssigments,
  getTeacherSessionalAssignment,
  getAllTeachersCredit,
} from '../api/theory-assign';


export default function ShowLoadDistribution() {
  // State variables
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [teacherCredits, setTeacherCredits] = useState([]);

  useEffect(() => {
    const fetchTeachersAndAssignments = async () => {
      try {
        setLoading(true);
        
        // Get all teachers
        const teachersData = await getTeachers();
        // Filter to show only active teachers
        const activeTeachers = teachersData.filter(teacher => teacher.active === 1);
        setTeachers(activeTeachers);

        // Get calculated credits for all teachers
        const creditsData = await getAllTeachersCredit();
        setTeacherCredits(creditsData);

        // Get all assignments for each active teacher
        const assignmentsPromises = activeTeachers.map(async (teacher) => {
          try {
            const [theoryAssignments, sessionalAssignments] = await Promise.all([
              getTeacherTheoryAssigments(teacher.initial).catch(() => []),
              getTeacherSessionalAssignment(teacher.initial).catch(() => [])
            ]);

            // Find the credit data for this teacher
            const creditInfo = creditsData.find(c => c.initial === teacher.initial) || {
              totalCredit: 0,
              breakdown: { thesis1: 0, thesis2: 0, msc: 0, sessionalCourses: 0, theoryCourses: 0 }
            };

            return {
              teacher,
              theoryAssignments: theoryAssignments || [],
              sessionalAssignments: sessionalAssignments || [],
              creditInfo
            };
          } catch (error) {
            console.error(`Error fetching assignments for ${teacher.initial}:`, error);
            return {
              teacher,
              theoryAssignments: [],
              sessionalAssignments: [],
              creditInfo: {
                totalCredit: 0,
                breakdown: { thesis1: 0, thesis2: 0, msc: 0, sessionalCourses: 0, theoryCourses: 0 }
              }
            };
          }
        });

        const assignments = await Promise.all(assignmentsPromises);
        setTeacherAssignments(assignments);

      } catch (error) {
        console.error("Error fetching teachers and assignments:", error);
        toast.error("Failed to load teacher assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersAndAssignments();
  }, []);

  // Table styles
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
  };

  const teacherCellStyle = {
    ...cellStyle,
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#495057',
  };

  const courseBadgeStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    margin: '2px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
  };

  const theoryBadgeStyle = {
    ...courseBadgeStyle,
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #bbdefb',
  };

  const sessionalBadgeStyle = {
    ...courseBadgeStyle,
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
    border: '1px solid #e1bee7',
  };

  const emptyStyle = {
    color: '#6c757d',
    fontStyle: 'italic',
    fontSize: '0.85rem',
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="text-center py-4">
          <div className="spinner-border text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading teacher assignments...</p>
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
                <i className="mdi mdi-account-group mr-2"></i>Total Load Per Teacher
              </h6>
            </div>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              {teacherAssignments.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="mdi mdi-account-off-outline" style={{ fontSize: '3rem', color: '#6c757d', opacity: 0.5 }}></i>
                  </div>
                  <h6 className="text-muted mb-2">No Teacher Data</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Unable to load teacher assignment information.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{...headerStyle, width: '200px'}}>Teacher</th>
                        <th style={{...headerStyle, width: '180px'}}>Supervision</th>
                        <th style={{...headerStyle, width: '300px'}}>Theory Assignments</th>
                        <th style={{...headerStyle, width: '300px'}}>Sessional Assignments</th>
                        <th style={{...headerStyle, width: '120px'}}>Total Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherAssignments.map((assignment, index) => {
                        const { teacher, theoryAssignments, sessionalAssignments, creditInfo } = assignment;
                        const totalCourses = theoryAssignments.length + sessionalAssignments.length + (teacher.offers_msc ? 1 : 0);
                        const totalCredit = creditInfo ? creditInfo.totalCredit : 0;
                        
                        return (
                          <tr key={teacher.initial} style={{ 
                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fbfd' 
                          }}>
                            {/* Teacher Info */}
                            <td style={teacherCellStyle}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#2c3e50' }}>
                                  {teacher.name}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                  <i className="mdi mdi-account-badge mr-1"></i>
                                  {teacher.initial}
                                </div>
                                {/* <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                  <i className="mdi mdi-email mr-1"></i>
                                  {teacher.email}
                                </div> */}
                              </div>
                            </td>

                            {/* Supervision */}
                            <td style={cellStyle}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{
                                  ...courseBadgeStyle,
                                  backgroundColor: (teacher.offers_thesis_1) ? '#d4edda' : '#f8d7da',
                                  color: (teacher.offers_thesis_1 ) ? '#155724' : '#721c24',
                                  border: `1px solid ${(teacher.offers_thesis_1 ) ? '#c3e6cb' : '#f5c6cb'}`,
                                }}>
                                  <i className="mdi mdi-book-account mr-1"></i>
                                  {(teacher.offers_thesis_1 ) ? `Thesis 1 (${creditInfo?.breakdown?.thesis1 || 0})` : 'No Thesis 1'}
                                </span>
                                <span style={{
                                  ...courseBadgeStyle,
                                  backgroundColor: (teacher.offers_thesis_2) ? '#d4edda' : '#f8d7da',
                                  color: (teacher.offers_thesis_2) ? '#155724' : '#721c24',
                                  border: `1px solid ${(teacher.offers_thesis_2) ? '#c3e6cb' : '#f5c6cb'}`,
                                }}>
                                  <i className="mdi mdi-book-account mr-1"></i>
                                  {(teacher.offers_thesis_2) ? `Thesis 2 (${creditInfo?.breakdown?.thesis2 || 0})` : 'No Thesis 2'}
                                </span>
                                <span style={{
                                  ...courseBadgeStyle,
                                  backgroundColor: teacher.offers_msc ? '#d1ecf1' : '#f8d7da',
                                  color: teacher.offers_msc ? '#0c5460' : '#721c24',
                                  border: `1px solid ${teacher.offers_msc ? '#bee5eb' : '#f5c6cb'}`,
                                }}>
                                  <i className="mdi mdi-school mr-1"></i>
                                  {teacher.offers_msc ? `MSC (${creditInfo?.breakdown?.msc || 0})` : 'No MSC'}
                                </span>
                              </div>
                            </td>

                            {/* Theory Assignments */}
                            <td style={cellStyle}>
                              {theoryAssignments.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {theoryAssignments.map((course, idx) => (
                                    <span key={idx} style={theoryBadgeStyle}>
                                      <i className="mdi mdi-book-open-variant mr-1"></i>
                                      {course.course_id}
                                      {course.section && (
                                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                          ({course.section})
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div style={emptyStyle}>
                                  <i className="mdi mdi-minus-circle mr-1"></i>
                                  No theory assignments
                                </div>
                              )}
                            </td>

                            {/* Sessional Assignments */}
                            <td style={cellStyle}>
                              {sessionalAssignments.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {sessionalAssignments.map((course, idx) => (
                                    <span key={idx} style={sessionalBadgeStyle}>
                                      <i className="mdi mdi-laptop mr-1"></i>
                                      {course.course_id}
                                      {course.section && (
                                        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                          {' '}({course.section})
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div style={emptyStyle}>
                                  <i className="mdi mdi-minus-circle mr-1"></i>
                                  No sessional assignments
                                </div>
                              )}
                            </td>

                            {/* Total Credits */}
                            <td style={{...cellStyle, textAlign: 'center'}}>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <div style={{
                                  fontSize: '1.5rem',
                                  fontWeight: '700',
                                  color: totalCredit > 0 ? '#28a745' : '#6c757d'
                                }}>
                                  {totalCredit.toFixed(1)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                                  Total Credit
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary Stats */}
              {teacherAssignments.length > 0 && (
                <div className="mt-4">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="card border-primary">
                        <div className="card-body text-center">
                          <div className="text-primary" style={{ fontSize: '2rem' }}>
                            <i className="mdi mdi-account-group"></i>
                          </div>
                          <h4 className="text-primary">{teacherAssignments.length}</h4>
                          <p className="text-muted mb-0">Total Teachers</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-success">
                        <div className="card-body text-center">
                          <div className="text-success" style={{ fontSize: '2rem' }}>
                            <i className="mdi mdi-account-check"></i>
                          </div>
                          <h4 className="text-success">
                            {teacherAssignments.filter(a => a.theoryAssignments.length > 0 || a.sessionalAssignments.length > 0).length}
                          </h4>
                          <p className="text-muted mb-0">Assigned Teachers</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-info">
                        <div className="card-body text-center">
                          <div className="text-info" style={{ fontSize: '2rem' }}>
                            <i className="mdi mdi-calculator"></i>
                          </div>
                          <h4 className="text-info">
                            {teacherAssignments.reduce((total, a) => total + (a.creditInfo?.totalCredit || 0), 0).toFixed(1)}
                          </h4>
                          <p className="text-muted mb-0">Total Credits</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-warning">
                        <div className="card-body text-center">
                          <div className="text-warning" style={{ fontSize: '2rem' }}>
                            <i className="mdi mdi-chart-line"></i>
                          </div>
                          <h4 className="text-warning">
                            {teacherAssignments.length > 0 ? 
                              (teacherAssignments.reduce((total, a) => total + (a.creditInfo?.totalCredit || 0), 0) / teacherAssignments.length).toFixed(1) 
                              : '0.0'
                            }
                          </h4>
                          <p className="text-muted mb-0">Avg Credits/Teacher</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}