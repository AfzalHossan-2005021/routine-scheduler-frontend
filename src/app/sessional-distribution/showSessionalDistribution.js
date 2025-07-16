import React, { useState, useEffect } from 'react';
import { useConfig } from '../shared/ConfigContext';
import toast from 'react-hot-toast';
import { getDepartmentalSessionalSchedule } from '../api/sessional-schedule';
import { getSessionalTeachers } from '../api/theory-assign';
import { getTeachers } from '../api/db-crud';
import { 
  setTeacherSessionalAssignment,
  getTeacherSessionalAssignment,
  deleteTeacherSessionalAssignment
} from '../api/theory-assign';

/**
 * CourseTeachers Component
 * 
 * Fetches and displays the teachers assigned to a specific course section.
 * Handles loading states and displays appropriate messages if no teachers are assigned.
 */
function CourseTeachers({ courseId, section }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTeachers = async () => {
      try {
        setLoading(true);
        const data = await getSessionalTeachers(courseId, section);
        if (isMounted) {
          setTeachers(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Error loading teachers for ${courseId} (${section}):`, error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTeachers();

    return () => {
      isMounted = false;
    };
  }, [courseId, section]);

  if (loading) {
    return <div style={{ fontSize: '0.85rem', color: '#666' }}>
      <i className="mdi mdi-loading mdi-spin mr-1"></i>Loading...
    </div>;
  }

  if (teachers.length === 0) {
    return <div style={scheduleTableStyle.noTeacher}>
      <i className="mdi mdi-account-off mr-1"></i>No teachers assigned
    </div>;
  }

  return (
    <div style={scheduleTableStyle.teacherBadge}>
      <i className="mdi mdi-account-multiple mr-1"></i>
      {teachers.map((teacher, index) => (
        <span key={teacher.initial}>
          {teacher.initial}
          {index < teachers.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  );
}

// Add some custom styles for the schedule table
const scheduleTableStyle = {
  table: {
    width: '100%',
    margin: '0 auto',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    borderCollapse: 'separate',
    borderSpacing: 0,
    border: '2px solid #ccd4e0',
  },
  headerCell: {
    width: '200px',
    textAlign: 'center',
    fontWeight: '600',
    padding: '12px 8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    fontSize: '0.9rem',
  },
  dayCell: {
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    width: '80px',
    border: 'none',
    padding: '12px 8px',
    fontSize: '0.9rem',
    verticalAlign: 'middle',
  },
  courseCell: {
    minHeight: '100px',
    height: 'auto',
    border: '2px solid #ccd4e0',
    padding: '8px',
    fontSize: '0.85rem',
    verticalAlign: 'top',
    backgroundColor: 'white',
    width: '200px',
    minWidth: '200px',
  },
  courseItem: {
    padding: '10px',
    margin: '4px 0',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  alreadyScheduledCourseItem: {
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    border: '2px solid #43a047',
    color: '#2e7d32',
  },
  courseTitle: {
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '4px',
    width: '100%',
    textAlign: 'center',
  },
  sectionBadge: {
    backgroundColor: 'rgba(111, 66, 193, 0.18)',
    color: '#6f42c1',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    minWidth: '100px',
  },
  teacherBadge: {
    backgroundColor: 'rgba(0, 150, 136, 0.18)',
    color: '#00838f',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    width: '100%',
  },
  noTeacher: {
    color: '#dc3545',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    marginTop: '2px',
  },
};

/**
 * ShowSessionalDistribution Component
 * 
 * Displays a table view of sessional course distributions across different days and time slots.
 * This component shows the allocation of sessional courses, their assigned teachers,
 * and scheduling information in a grid format.
 */
export default function ShowSessionalDistribution() {
  // Get configuration settings
  const { days, possibleLabTimes } = useConfig();

  // State variables
  const [loading, setLoading] = useState(true);
  const [sessionalSchedules, setSessionalSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [showRemoveTeacherList, setShowRemoveTeacherList] = useState(false);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [selectedTeacherToRemove, setSelectedTeacherToRemove] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Modal Style
  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    minWidth: '300px',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '5px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  };

  // Fetch teachers when component mounts
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await getTeachers();

        setTeachers(data);
      } catch (error) {
        console.error("Error loading teachers:", error);
        toast.error("Failed to load teachers");
      }
    };
    loadTeachers();
  }, []);

  // Fetch sessional schedules on component mount
  useEffect(() => {
    const fetchSessionalSchedules = async () => {
      try {
        setLoading(true);
        const data = await getDepartmentalSessionalSchedule();
        setSessionalSchedules(data);
      } catch (error) {
        console.error("Error fetching sessional schedules:", error);
        toast.error("Failed to load sessional schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionalSchedules();
  }, []);

  /**
   * Get scheduled courses for a specific day and time slot
   * @param {string} day - The day to check
   * @param {number} time - The time slot to check
   * @returns {Array} Array of scheduled courses for this slot
   */
  const getScheduledCourses = (day, time) => {
    return sessionalSchedules.filter(schedule => 
      schedule.day === day && schedule.time === time
    );
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    setShowTeachersList(false);
  };

  const handleAssignTeacher = async () => {
    try {
      setLoadingTeachers(true);
      const currentTeachers = await getSessionalTeachers(selectedCourse.course_id, selectedCourse.section);
      
      if (currentTeachers.length >= 3) {
        toast('Warning: There are already 3 teachers assigned in course ' + selectedCourse.course_id, {
          icon: '⚠️',
          style: {
            background: '#FFF3CD',
            color: '#856404',
            border: '1px solid #FFEEBA'
          }
        });
      }

      // Get the latest list of teachers and filter active ones
      const teacherData = await getTeachers();
      const activeTeachers = teacherData
        .filter(teacher => teacher.active === 1)
        .sort((a, b) => a.seniority_rank - b.seniority_rank);

      // Filter out already assigned teachers from active teachers
      const assignedTeacherInitials = currentTeachers.map(t => t.initial);
      const availableTeachers = activeTeachers.filter(t => !assignedTeacherInitials.includes(t.initial));
      
      setTeachers(availableTeachers);
      setShowTeachersList(true);
    } catch (error) {
      console.error("Error checking current teachers:", error);
      toast.error("Failed to check current teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleRemoveTeacher = async () => {
    try {
      setLoadingTeachers(true);
      const currentTeachers = await getSessionalTeachers(selectedCourse.course_id, selectedCourse.section);
      setAssignedTeachers(currentTeachers);
      setShowRemoveTeacherList(true);
      setShowTeachersList(false);
    } catch (error) {
      console.error("Error fetching assigned teachers:", error);
      toast.error("Failed to fetch assigned teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleTeacherRemoval = async () => {
    if (!selectedTeacherToRemove) return;

    try {
      const unassignData = {
        initial: selectedTeacherToRemove,
        course_id: selectedCourse.course_id,
        batch: selectedCourse.batch,
        section: selectedCourse.section,        
      };

      console.log(unassignData);

      await deleteTeacherSessionalAssignment(unassignData);
      toast.success(`Teacher ${selectedTeacherToRemove} removed from ${selectedCourse.course_id}`);
      
      // Refresh the course data
      const data = await getDepartmentalSessionalSchedule();
      setSessionalSchedules(data);
      
      setShowConfirmation(false);
      setShowRemoveTeacherList(false);
      setShowModal(false);
      setSelectedTeacherToRemove(null);
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Failed to remove teacher");
    }
  };

  const handleTeacherSelect = async (teacherInitial) => {
    try {
      const assignment = {
        initial: teacherInitial,
        course_id: selectedCourse.course_id,
        batch: selectedCourse.batch,
        section: selectedCourse.section,
      };

      console.log(assignment);

      await setTeacherSessionalAssignment(assignment);
      toast.success(`Teacher ${teacherInitial} assigned to ${selectedCourse.course_id}`);
      
      // Refresh the course data
      const data = await getDepartmentalSessionalSchedule();
      setSessionalSchedules(data);
      
      setShowTeachersList(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast.error("Failed to assign teacher");
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="text-center py-4">
          <div className="spinner-border text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading sessional schedules...</p>
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
                <i className="mdi mdi-table-large mr-2"></i>Sessional Course Distribution
              </h6>
            </div>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              {sessionalSchedules.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="mdi mdi-clipboard-text-outline" style={{ fontSize: '3rem', color: '#6c757d', opacity: 0.5 }}></i>
                  </div>
                  <h6 className="text-muted mb-2">No Sessional Distributions</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    There are no sessional courses distributed yet.
                  </p>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '80vh' }}>
                  <table style={{
                    ...scheduleTableStyle.table,
                    minWidth: `${possibleLabTimes.length * 200 + 100}px`
                  }}>
                    <thead>
                      <tr>
                        <th style={scheduleTableStyle.headerCell}>Day / Time</th>
                        {possibleLabTimes.map(time => (
                          <th key={time} style={{
                            ...scheduleTableStyle.headerCell,
                            width: '200px',
                            minWidth: '200px'
                          }}>{time}:00</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map(day => (
                        <tr key={day}>
                          <td style={scheduleTableStyle.dayCell}>{day}</td>
                          {possibleLabTimes.map(time => {
                            const scheduledCourses = getScheduledCourses(day, time);
                            return (
                              <td key={`${day}-${time}`} style={scheduleTableStyle.courseCell}>
                                {scheduledCourses.map((schedule, index) => (
                                  <div 
                                    key={index} 
                                    style={{
                                      ...scheduleTableStyle.courseItem,
                                      ...scheduleTableStyle.alreadyScheduledCourseItem,
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleCourseClick(schedule)}
                                  >
                                    <div style={scheduleTableStyle.courseTitle}>
                                      {schedule.course_id}
                                    </div>
                                    <div style={scheduleTableStyle.sectionBadge}>
                                      <i className="mdi mdi-account-group mr-1"></i>
                                      Section {schedule.section}
                                    </div>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                      <CourseTeachers 
                                        courseId={schedule.course_id} 
                                        section={schedule.section}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Modal */}
              {showModal && (
                <>
                  <div style={overlayStyle} onClick={() => setShowModal(false)} />
                  <div style={modalStyle}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowModal(false)}
                        style={{
                          position: 'absolute',
                          right: '-10px',
                          top: '-10px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                      <h5 style={{ marginBottom: '20px', color: '#333' }}>
                        {selectedCourse.course_id} - Section {selectedCourse.section}
                      </h5>
                    
                    {!showTeachersList && !showRemoveTeacherList ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#4CAF50',
                            color: 'white',
                          }}
                          onClick={handleAssignTeacher}
                          disabled={loadingTeachers}
                        >
                          {loadingTeachers ? (
                            <><i className="mdi mdi-loading mdi-spin mr-2"></i>Loading...</>
                          ) : (
                            <><i className="mdi mdi-account-plus mr-2"></i>Assign Teacher</>
                          )}
                        </button>
                        <button
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#f44336',
                            color: 'white',
                          }}
                          onClick={handleRemoveTeacher}
                          disabled={loadingTeachers}
                        >
                          {loadingTeachers ? (
                            <><i className="mdi mdi-loading mdi-spin mr-2"></i>Loading...</>
                          ) : (
                            <><i className="mdi mdi-account-remove mr-2"></i>Remove Teacher</>
                          )}
                        </button>
                      </div>
                    ) : showRemoveTeacherList ? (
                      <div>
                        <h6 style={{ marginBottom: '15px', color: '#666' }}>Select Teacher to Remove</h6>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {assignedTeachers.map(teacher => (
                            <div
                              key={teacher.initial}
                              style={{
                                padding: '10px',
                                margin: '5px 0',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: teacher.initial === selectedTeacherToRemove ? '#ffebee' : '#f8f9fa',
                                borderColor: teacher.initial === selectedTeacherToRemove ? '#f44336' : '#ddd',
                              }}
                              onClick={() => setSelectedTeacherToRemove(teacher.initial)}
                            >
                              {teacher.name} ({teacher.initial})
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                          <button
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#6c757d',
                              color: 'white',
                            }}
                            onClick={() => {
                              setShowRemoveTeacherList(false);
                              setSelectedTeacherToRemove(null);
                            }}
                          >
                            Back
                          </button>
                          <button
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#dc3545',
                              color: 'white',
                              opacity: selectedTeacherToRemove ? 1 : 0.5,
                              cursor: selectedTeacherToRemove ? 'pointer' : 'not-allowed',
                            }}
                            onClick={() => selectedTeacherToRemove && setShowConfirmation(true)}
                            disabled={!selectedTeacherToRemove}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h6 style={{ marginBottom: '15px', color: '#666' }}>Select a Teacher</h6>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {teachers.map(teacher => (
                            <div
                              key={teacher.initial}
                              style={{
                                padding: '10px',
                                margin: '5px 0',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: '#f8f9fa',
                              }}
                              onClick={() => handleTeacherSelect(teacher.initial)}
                            >
                              {teacher.name} ({teacher.initial})
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '15px', textAlign: 'right' }}>
                          <button
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#6c757d',
                              color: 'white',
                            }}
                            onClick={() => setShowTeachersList(false)}
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </>
              )}

              {/* Confirmation Modal */}
              {showConfirmation && (
                <>
                  <div style={overlayStyle} />
                  <div style={{
                    ...modalStyle,
                    zIndex: 1001,
                    maxWidth: '400px',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ marginBottom: '20px', color: '#dc3545' }}>Confirm Removal</h6>
                    <p style={{ marginBottom: '20px' }}>
                      Do you really want to remove {selectedTeacherToRemove} from {selectedCourse.course_id}?
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#6c757d',
                          color: 'white',
                        }}
                        onClick={() => setShowConfirmation(false)}
                      >
                        Cancel
                      </button>
                      <button
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#dc3545',
                          color: 'white',
                        }}
                        onClick={handleTeacherRemoval}
                      >
                        Yes, Remove
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}