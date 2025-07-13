import React, { useState, useEffect } from 'react';
import { useConfig } from '../shared/ConfigContext';
import toast from 'react-hot-toast';
import { getDepartmentalSessionalSchedule } from '../api/sessional-schedule';
import { getSessionalTeachers } from '../api/theory-assign';

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
    width: '120px',
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
                                    ...scheduleTableStyle.alreadyScheduledCourseItem
                                  }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}