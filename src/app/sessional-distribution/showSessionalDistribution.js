import React, { useState, useEffect } from 'react';
import { useConfig } from '../shared/ConfigContext';
import toast from 'react-hot-toast';
import { getDepartmentalSessionalSchedule, setSessionalSchedules, teacherContradiction } from '../api/sessional-schedule';
import { getSessionalTeachers } from '../api/theory-assign';
import { getTeachers, getLabCourses } from '../api/db-crud';
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
  addButton: {
    position: 'absolute',
    right: '8px',
    top: '8px',
    padding: '4px 8px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#218838'
    }
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
  const [sessionalSchedules, setAllSessionalSchedules] = useState(() => Array.isArray(window.initialData?.sessionalSchedules) ? window.initialData.sessionalSchedules : []);
  const [showModal, setShowModal] = useState(false);
  const [showLabCoursesModal, setShowLabCoursesModal] = useState(false);
  const [labCourses, setLabCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [showRemoveTeacherList, setShowRemoveTeacherList] = useState(false);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [selectedTeacherToRemove, setSelectedTeacherToRemove] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState(null);

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
        console.log(data);
        setAllSessionalSchedules(Array.isArray(data) ? data : []);
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
    if (!Array.isArray(sessionalSchedules)) return [];
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
      setAllSessionalSchedules(data);
      
      setShowConfirmation(false);
      setShowRemoveTeacherList(false);
      setShowModal(false);
      setSelectedTeacherToRemove(null);
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Failed to remove teacher");
    }
  };

  const handleCourseRemoval = async (courseToRemove) => {
    try {
      if (!courseToRemove.batch || !courseToRemove.section || !courseToRemove.department) {
        console.error('Missing required data:', courseToRemove);
        toast.error('Missing required data for removing course');
        return;
      }

      console.log('Removing course with data:', {
        batch: courseToRemove.batch,
        section: courseToRemove.section,
        department: courseToRemove.department,
        schedules: {
          course_id: "None",
          day: courseToRemove.day,
          time: courseToRemove.time
        }
      });

      const schedules = {
        course_id: "None",
        day: courseToRemove.day,
        time: courseToRemove.time,
        batch: courseToRemove.batch,
        section: courseToRemove.section,
        department: courseToRemove.department
      };
      
      await setSessionalSchedules(courseToRemove.batch, courseToRemove.section, courseToRemove.department, schedules);
      
      // Refresh the sessional schedules
      const data = await getDepartmentalSessionalSchedule();
      setAllSessionalSchedules(Array.isArray(data) ? data : []);
      
      toast.success('Course removed successfully');
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error('Failed to remove course: ' + (error.message || 'Unknown error'));
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
      setAllSessionalSchedules(data);
      
      setShowTeachersList(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast.error("Failed to assign teacher");
    }
  };

  // First, let's log the lab courses when they're fetched
  useEffect(() => {
    const fetchLabCourses = async () => {
      try {
        const courses = await getLabCourses();
        console.log('Fetched lab courses:', courses);
        
        // Filter out courses that are already assigned in any time slot
        const filteredCourses = courses.filter(course => {
          // Check if this course exists in any schedule
          const isAssigned = sessionalSchedules.some(schedule => 
            schedule.course_id === course.course_id && 
            schedule.section === course.section
          );
          return !isAssigned; // Keep only unassigned courses
        });
        
        console.log('Filtered courses (removing already assigned):', filteredCourses);
        setLabCourses(filteredCourses);
      } catch (error) {
        console.error('Error fetching lab courses:', error);
      }
    };
    if (showLabCoursesModal) {
      fetchLabCourses();
    }
  }, [showLabCoursesModal, sessionalSchedules]);

  const handleAddCourse = async (course, day, time) => {
    try {
      if (!course || !day || !time) {
        console.error('Missing required data:', { course, day, time });
        toast.error('Missing required data for adding course');
        return;
      }

      // First check if this section already has a course in this time slot
      const existingCourseInSlot = sessionalSchedules.find(schedule => 
        schedule.day === day && 
        schedule.time === time && 
        schedule.batch === course.batch &&
        schedule.section === course.section &&
        schedule.department === course.department
      );

      if (existingCourseInSlot) {
        toast.error(`Section ${course.section} already has ${existingCourseInSlot.course_id} scheduled at this time slot`);
        return;
      }

      // Check for teacher schedule conflicts
      try {
        const teacherConflicts = await getSessionalTeachers(course.course_id, course.section);
        const contradictions = await teacherContradiction(course.batch, course.section, course.course_id);
        
        // Check if any assigned teacher has a schedule conflict
        for (const contradiction of contradictions) {
          const conflictingSchedules = contradiction.schedule.filter(
            schedule => schedule.day === day && schedule.time === time
          );
          console.log('Checking teacher conflicts for:', contradiction.initial, conflictingSchedules);
          if (conflictingSchedules.length > 0) {
            toast(`Warning: Teacher ${contradiction.initial} is already assigned to ${conflictingSchedules[0].course_id}(${conflictingSchedules[0].section}) at this time slot.`, {
              icon: '⚠️',
              duration: 5000,
              style: {
                background: '#FFF3CD',
                color: '#856404',
                border: '1px solid #FFEEBA'
              }
            });
            // Not returning here, allowing the assignment to proceed
          }
        }
      } catch (error) {
        console.error('Error checking teacher conflicts:', error);
      }

      console.log('Adding course with data:', {
        course_id: course.course_id,
        batch: course.batch,
        section: course.section,
        department: course.department,
        day,
        time
      });

      // Create the schedule for the new course
      const schedule = {
        course_id: course.course_id,
        day: day,
        time: time
      };
            
      // This will insert a new record in the database
      await setSessionalSchedules(course.batch, course.section, course.department, schedule);
      
      // Refresh the sessional schedules
      const data = await getDepartmentalSessionalSchedule();
      console.log('Updated schedules:', data);
      setAllSessionalSchedules(Array.isArray(data) ? data : []);
      
      // Close the modal
      //setShowLabCoursesModal(false);
      
      toast.success('Course added successfully');
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Failed to add course: ' + (error.message || 'Unknown error'));
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
                            <td key={`${day}-${time}`} style={{
                              ...scheduleTableStyle.courseCell,
                              position: 'relative',
                            }}>
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                zIndex: 2
                              }}>
                                <i 
                                  className="mdi mdi-pencil"
                                  style={{
                                    color: '#667eea',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    padding: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s ease',
                                  }}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setSelectedCell({ day, time });
                                    try {
                                      const courses = await getLabCourses();
                                      console.log('Available lab courses:', courses);
                                      setLabCourses(courses);
                                      setShowLabCoursesModal(true);
                                    } catch (error) {
                                      console.error("Error fetching lab courses:", error);
                                      toast.error("Failed to load lab courses");
                                    }
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.color = '#764ba2';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.color = '#667eea';
                                  }}
                                />
                              </div>
                              {scheduledCourses.map((schedule, index) => (
                                <div 
                                  key={index} 
                                  style={{
                                    ...scheduleTableStyle.courseItem,
                                    ...scheduleTableStyle.alreadyScheduledCourseItem,
                                    cursor: 'pointer',
                                    position: 'relative'
                                  }}
                                  //onClick={() => handleCourseClick(schedule)}
                                >
                                  <div style={scheduleTableStyle.courseTitle}>
                                    {schedule.course_id}
                                  </div>
                                  <div 
                                    style={{
                                      position: 'absolute',
                                      right: '8px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      cursor: 'pointer',
                                      zIndex: 2
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const courseData = {
                                        course_id: schedule.course_id,
                                        day,
                                        time,
                                        section: schedule.section,
                                        batch: schedule.batch,
                                        department: schedule.department
                                      };
                                      console.log('Setting course to remove:', courseData);
                                      setCourseToRemove(courseData);
                                      setShowConfirmation(true);
                                    }}
                                  >
                                    <i 
                                      className="mdi mdi-close-circle"
                                      style={{
                                        color: '#dc3545',
                                        fontSize: '1.2rem',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.color = '#c82333';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.color = '#dc3545';
                                        e.currentTarget.style.transform = 'scale(1)';
                                      }}
                                    />
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
            </div>

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
            {showConfirmation && courseToRemove && (
              <>
                <div style={overlayStyle} onClick={() => {
                  setShowConfirmation(false);
                  setCourseToRemove(null);
                }} />
                <div style={{
                  ...modalStyle,
                  zIndex: 1001,
                  maxWidth: '400px',
                  textAlign: 'center'
                }}>
                  <h6 style={{ marginBottom: '20px', color: '#dc3545' }}>Confirm Removal</h6>
                  <p style={{ marginBottom: '20px' }}>
                    Do you want to remove {courseToRemove.course_id} from {courseToRemove.day}, {courseToRemove.time}:00 slot?
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#6c757d',
                        color: 'white',
                      }}
                      onClick={() => {
                        setShowConfirmation(false);
                        setCourseToRemove(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#dc3545',
                        color: 'white',
                      }}
                      onClick={async () => {
                        await handleCourseRemoval(courseToRemove);
                        setShowConfirmation(false);
                        setCourseToRemove(null);
                      }}
                    >
                      Yes, Remove
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Lab Courses Modal */}
            {showLabCoursesModal && (
              <>
                <div style={overlayStyle} onClick={() => setShowLabCoursesModal(false)} />
                <div style={{
                  ...modalStyle,
                  maxWidth: '500px',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowLabCoursesModal(false)}
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
                    
                    <div style={{ 
                      marginBottom: '20px',
                      padding: '15px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}>
                      <i className="mdi mdi-plus-circle-outline mr-2"></i>
                      Add Sessional Course
                    </div>

                    <div style={{ 
                      display: 'grid',
                      gap: '10px',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
                    }}>
                      {labCourses.map((course) => (
                        <div
                          key={course.course_id + course.section}
                          style={{
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            position: 'relative',
                          }}
                        >
                          <div style={{
                            fontWeight: '600',
                            color: '#2d3748',
                            fontSize: '1rem',
                            marginBottom: '4px'
                          }}>
                            {course.course_id} <span style={{ color: '#4a5568' }}>({course.section})</span>
                          </div>
                          <div style={{
                            color: '#718096',
                            fontSize: '0.875rem',
                            lineHeight: '1.4'
                          }}>
                            {course.name}
                          </div>
                          <button
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '8px',
                              padding: '4px 8px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: '#218838'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Add button clicked for course:', course);
                              console.log('Selected cell:', selectedCell);
                              if (!selectedCell) {
                                toast.error('No time slot selected');
                                return;
                              }
                              if (!course.batch || !course.section || !course.department) {
                                console.log('Course details:', course);
                                toast.error('Course is missing required details');
                                return;
                              }
                              handleAddCourse(course, selectedCell.day, selectedCell.time);
                            }}
                          >
                            <i className="mdi mdi-plus"></i> Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}