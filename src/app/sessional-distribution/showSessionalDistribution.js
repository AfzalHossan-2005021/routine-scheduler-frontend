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
    return <div style={{ fontSize: '0.85rem' }}>Loading teachers...</div>;
  }

  if (teachers.length === 0) {
    return <div style={{ fontSize: '0.85rem' }}>No teachers assigned</div>;
  }

  return (
    <div style={{ fontSize: '0.85rem', marginTop: '3px' }}>
      <span>Teachers: </span>
      <span>
        {teachers.map((teacher, index) => (
          <span key={teacher.initial}>
            <span>{teacher.initial}</span>
            {index < teachers.length - 1 ? ', ' : ''}
          </span>
        ))}
      </span>
    </div>
  );
}

// Add some custom styles for the schedule table
const scheduleTableStyle = {
  table: {
    tableLayout: 'fixed',
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #dee2e6',
  },
  headerCell: {
    width: '80px',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: '8px 4px',
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
  },
  dayCell: {
    fontWeight: 'bold',
    background: '#f8f9fa',
    width: '60px',
    border: '1px solid #dee2e6',
  },
  courseCell: {
    height: '80px',
    border: '1px solid #dee2e6',
    padding: '4px',
    fontSize: '0.85rem',
    verticalAlign: 'middle',
    overflow: 'auto',
    maxHeight: '120px',
  },
  courseItem: {
    padding: '4px 6px',
    margin: '2px 0',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  alreadyScheduledCourseItem: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    border: '1px solid #28a745',
    fontWeight: 'bold',
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
    return <div className="page-content">Loading schedules...</div>;
  }

  return (
    <div className="page-content">
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Sessional Course Distribution</h4>
              <div className="table-responsive">
                <table style={scheduleTableStyle.table}>
                  <thead>
                    <tr>
                      <th style={scheduleTableStyle.headerCell}>Time</th>
                      {days.map(day => (
                        <th key={day} style={scheduleTableStyle.headerCell}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {possibleLabTimes.map(time => (
                      <tr key={time}>
                        <td style={scheduleTableStyle.dayCell}>{time}</td>
                        {days.map(day => {
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
                                  <div style={{ fontWeight: 'bold' }}>{schedule.course_id}</div>
                                  <div>Section: {schedule.section}</div>
                                  {schedule.teacher && (
                                    <div style={{ fontStyle: 'italic' }}>Teacher: {schedule.teacher}</div>
                                  )}
                                  <CourseTeachers courseId={schedule.course_id} section={schedule.section} />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}