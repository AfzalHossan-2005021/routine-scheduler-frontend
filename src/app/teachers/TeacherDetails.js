import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeacher, getTeachers } from '../api/db-crud';
import { getTheoryAssignement, setTeacherAssignment } from '../api/theory-assign';
import { times, days } from '../shared/ScheduleSelctionTable';
import { getCourses } from '../api/db-crud';
import { getAllSchedule } from '../api/theory-schedule';
import { toast } from 'react-hot-toast';
import { Form } from 'react-bootstrap';
import ScheduleModal from './ScheduleModal';

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
    width: '100px',
    border: '1px solid #dee2e6',
  },
  courseCell: {
    height: '80px',
    border: '1px solid #dee2e6',
    padding: '4px',
    fontSize: '0.85rem',
    verticalAlign: 'middle',
    overflow: 'auto',  // Add scrolling for cells with multiple entries
    maxHeight: '120px',
  },
  scheduledCell: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    border: '2px solid #28a745',
  },
};

export default function TeacherDetails() {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // State for the scheduling modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingCourse, setSchedulingCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data needed
        const teacherData = await getTeacher(teacherId);
        const coursesData = await getCourses();
        const allAssignments = await getTheoryAssignement();
        const allTeachers = await getTeachers();
        const allSchedules = await getAllSchedule();
        
        
        setTeacher(teacherData);
        setSchedules(allSchedules || []);
        
        // Filter for theory courses and add teacher assignment information
        const theoryCourses = coursesData
          .filter(course => course.type === 0 && course.from === 'CSE')
          .map(course => {
            // Find all teachers assigned to this course
            const assignedTeachers = allAssignments
              .filter(assignment => assignment.course_id === course.course_id)
              .map(assignment => {
                const teacherInfo = allTeachers.find(t => t.initial === assignment.initial);
                return {
                  initial: assignment.initial,
                  name: teacherInfo ? `${teacherInfo.name} ${teacherInfo.surname || ''}` : assignment.initial
                };
              });
              
            // Get the number of sections directly from the course data
            const sectionCount = course.sections && Array.isArray(course.sections) 
              ? course.sections.length 
              : 1;
            
            return {
              ...course,
              assignedTeachers,
              sectionCount,
              // Flag to indicate if this course can accept more teacher assignments
              canAssignMore: assignedTeachers.length < sectionCount
            };
          });
          
        setCourses(theoryCourses);
        
        // Filter assignments for this teacher and add course titles
        const teacherAssignments = allAssignments
          .filter(assignment => assignment.initial === teacherId)
          .map(assignment => {
            // Find matching course to get title
            const matchingCourse = coursesData.find(
              course => course.course_id === assignment.course_id
            );
            
            // Find other teachers assigned to the same course
            const otherTeachers = allAssignments
              .filter(a => 
                a.course_id === assignment.course_id && 
                a.initial !== teacherId
              )
              .map(a => {
                const teacherInfo = allTeachers.find(t => t.initial === a.initial);
                return {
                  initial: a.initial,
                  name: teacherInfo ? `${teacherInfo.name} ${teacherInfo.surname || ''}` : a.initial
                };
              });
            
            // Find scheduled times for this course
            const courseSchedules = allSchedules ? allSchedules.filter(
              schedule => schedule.course_id === assignment.course_id
            ) : [];
            
            return {
              ...assignment,
              course_title: matchingCourse ? matchingCourse.name : 'Unknown',
              credits: matchingCourse ? matchingCourse.credits : 3, // Store course credits
              otherTeachers,
              schedules: courseSchedules
            };
          });
        
        setAssignments(teacherAssignments);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load teacher data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teacherId]);

  const handleCourseAssign = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course to assign');
      return;
    }

    try {
      setSubmitting(true);
      // Create the assignment object
      const assignment = {
        initial: teacherId,
        course_id: selectedCourse
      };
      
      // Submit the assignment
      await setTeacherAssignment(assignment);
      toast.success('Course assigned successfully');
      
      // Reload all data
      const allAssignments = await getTheoryAssignement();
      const coursesData = await getCourses(); 
      const allTeachers = await getTeachers();
      const allSchedules = await getAllSchedule();
      
      setSchedules(allSchedules || []);
      
      // Update assignments for this teacher
      const teacherAssignments = allAssignments
        .filter(assignment => assignment.initial === teacherId)
        .map(assignment => {
          // Find matching course to get title
          const matchingCourse = coursesData.find(
            course => course.course_id === assignment.course_id
          );
          
          // Find other teachers assigned to the same course
          const otherTeachers = allAssignments
            .filter(a => 
              a.course_id === assignment.course_id && 
              a.initial !== teacherId
            )
            .map(a => {
              const teacherInfo = allTeachers.find(t => t.initial === a.initial);
              return {
                initial: a.initial,
                name: teacherInfo ? `${teacherInfo.name} ${teacherInfo.surname || ''}` : a.initial
              };
            });
          
          return {
            ...assignment,
            course_title: matchingCourse ? matchingCourse.name : 'Unknown',
            otherTeachers
          };
        });
      
      // Update course dropdown to show teacher assignments
      const theoryCourses = coursesData
        .filter(course => course.type === 0 && course.from === 'CSE')
        .map(course => {
          // Find all teachers assigned to this course
          const assignedTeachers = allAssignments
            .filter(assignment => assignment.course_id === course.course_id)
            .map(assignment => {
              const teacherInfo = allTeachers.find(t => t.initial === assignment.initial);
              return {
                initial: assignment.initial,
                name: teacherInfo ? `${teacherInfo.name} ${teacherInfo.surname || ''}` : assignment.initial
              };
            });
          
          // Get the number of sections directly from the course data
          const sectionCount = course.sections && Array.isArray(course.sections) 
            ? course.sections.length 
            : 1;
            
          return {
            ...course,
            assignedTeachers,
            sectionCount,
            // Flag to indicate if this course can accept more teacher assignments
            canAssignMore: assignedTeachers.length < sectionCount
          };
        });
      
      setCourses(theoryCourses);
      setAssignments(teacherAssignments);
      setSelectedCourse('');
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error('Failed to assign course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Component for displaying schedule in a table
  const ScheduleTable = ({ schedules, teacherCourses }) => {
    // State to track which cell is being hovered (format: "day-time")
    const [hoveredCell, setHoveredCell] = useState(null);
    
    // Create a map of day -> time -> courses (array)
    const scheduleMap = {};
    
    // Initialize schedule map with empty arrays for each cell
    days.forEach(day => {
      scheduleMap[day] = {};
      times.forEach(time => {
        scheduleMap[day][time] = [];
      });
    });
    
    // Fill in the schedule map with courses
    schedules.forEach(schedule => {
      // Only include schedules for courses assigned to this teacher
      if (teacherCourses.includes(schedule.course_id)) {
        const day = schedule.day;
        // Map the time slot (0-5) to the displayed time (8-4)
        let displayTime = schedule.time;
        
        if (scheduleMap[day] && scheduleMap[day][displayTime]) {
          // Find the batch information from the section field if available
          let batch = '';
          let section = schedule.section || '';
          
          // Section is often in the format "A" or "1A" - extract batch if possible
          const sectionMatch = section.match(/^(\d+)([A-Za-z]+)$/);
          if (sectionMatch) {
            batch = sectionMatch[1]; // The number part is the batch
            section = sectionMatch[2]; // The letter part is the section
          }
          
          // Add this course to the array for this time slot
          scheduleMap[day][displayTime].push({
            course_id: schedule.course_id,
            section: section,
            batch: batch || schedule.batch || '',
            department: schedule.department || ''
          });
        }
      }
    });
    
  return (
    <div className="table-responsive">
      <table className="table table-bordered" style={scheduleTableStyle.table}>
        <thead>
          <tr>
            <th style={scheduleTableStyle.dayCell}>Day / Time</th>
            {times.map(time => (
              <th key={time} style={scheduleTableStyle.headerCell}>
                {time}:00 
                {time === 12 && <span className="ms-1">(PM)</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <th style={scheduleTableStyle.dayCell}>{day}</th>
              {times.map(time => {
                const courseInfoArray = scheduleMap[day][time];
                const hasSchedules = courseInfoArray.length > 0;
                const cellKey = `${day}-${time}`;
                const isHovered = hoveredCell === cellKey;
                
                const cellStyle = {
                  ...scheduleTableStyle.courseCell,
                  ...(hasSchedules ? scheduleTableStyle.scheduledCell : {}),
                };
                
                // Apply simple hover effect
                if (isHovered) {
                  cellStyle.opacity = 0.8;
                }
                
                return (
                  <td 
                    key={`${day}-${time}`}
                    style={cellStyle}
                    className="text-center"
                    onMouseEnter={() => hasSchedules && setHoveredCell(cellKey)}
                    onMouseLeave={() => hasSchedules && setHoveredCell(null)}
                  >
                    {hasSchedules && (
                      <div className="text-center">
                        {courseInfoArray.map((courseInfo, idx) => (
                          <div key={idx} className="mb-1">
                            <span style={{ color: 'black', fontSize: '16px', fontWeight: '500' }}>
                              Section - {courseInfo.section}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
  };

  const handleSchedule = async (courseId) => {
    // Find more detailed course information from the courses array
    const courseDetails = courses.find(course => course.course_id === courseId);
    if (!courseDetails) {
      toast.error('Course details not found');
      return;
    }
    
    // Set the course for scheduling
    setSchedulingCourse({
      id: courseDetails.course_id,
      title: courseDetails.name,
      type: courseDetails.type,
      batch: courseDetails.batch,
      sections: courseDetails.sections,
      credits: courseDetails.class_per_week
    });
    
    // Show the modal
    setShowScheduleModal(true);
  };

  const handleScheduleComplete = async () => {
    // Reload the schedules after a successful scheduling
    try {
      const allSchedules = await getAllSchedule();
      setSchedules(allSchedules || []);
      toast.success('Schedule updated successfully');
    } catch (error) {
      console.error('Error refreshing schedules:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Teacher Details </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/teachers">Teachers</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {teacherId}
            </li>
          </ol>
        </nav>
      </div>
      
      {teacher && (
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Teacher Information</h4>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Initial:</strong> {teacher.initial}</p>
                    <p><strong>Name:</strong> {teacher.name}</p>
                    <p><strong>Seniority Rank:</strong> {teacher.seniority_rank}</p>
                    <p><strong>Designation:</strong> {teacher.designation || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Theory Courses:</strong> {teacher.theory_courses}</p>
                    <p><strong>Sessional Courses:</strong> {teacher.sessional_courses}</p>
                    <p><strong>Status:</strong> {teacher.active ? 'Active' : 'Inactive'}</p>
                    <p><strong>Employment:</strong> {teacher.full_time_status ? 'Full-time' : 'Part-time'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Theory Course Assignments</h4>
                
                {assignments.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Course ID</th>
                          <th>Course Title</th>
                          <th>Session</th>
                          <th>Other Assigned Teachers</th>
                          <th>Schedule</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((assignment) => (
                          <tr key={assignment.course_id}>
                            <td>{assignment.course_id}</td>
                            <td>{assignment.course_title || 'Unknown'}</td>
                            <td>{assignment.session || 'Current'}</td>
                            <td>
                              {assignment.otherTeachers && assignment.otherTeachers.length > 0 ? (
                                <div>
                                  {assignment.otherTeachers.map((teacher, index) => (
                                    <div key={teacher.initial}>
                                      <Link to={`/teachers/${teacher.initial}`} className="text-decoration-none">
                                        {teacher.name || teacher.initial}
                                        {index < assignment.otherTeachers.length - 1 ? ',' : ''}
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">No other teachers assigned</span>
                              )}
                            </td>
                            <td>
                              {schedules
                                .filter(schedule => schedule.course_id === assignment.course_id)
                                .length > 0 ? (
                                  <div>
                                    <a href="#theory-schedule" className="text-success text-decoration-none">
                                      <i className="mdi mdi-check-circle"></i> Scheduled
                                    </a>
                                  </div>
                                ) : (
                                  <div className="d-flex align-items-center">
                                    <button 
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => handleSchedule(assignment.course_id)}
                                    >
                                      <i className="mdi mdi-calendar-plus"></i> Schedule
                                    </button>
                                  </div>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-3 mb-4">
                    <p className="text-muted">No theory courses are currently assigned to this teacher.</p>
                  </div>
                )}
                
                {assignments.length === 0 && (
                  <div className="row mt-4">
                    <div className="col-md-8">
                      <Form.Group>
                        <Form.Label>Assign a Theory Course</Form.Label>
                        <Form.Control
                          as="select"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          disabled={submitting}
                        >
                          <option value="">Select a course...</option>
                          {courses
                            // Filter to only show courses that can accept more teacher assignments
                            .filter(course => course.canAssignMore)
                            .map((course) => {
                              // Create base course information
                              let courseLabel = `${course.course_id} - ${course.name || 'Untitled'}`;
                              
                              // Check if teachers are assigned
                              const hasAssignedTeachers = course.assignedTeachers && course.assignedTeachers.length > 0;
                              
                              // Calculate remaining slots
                              const assignedCount = (course.assignedTeachers || []).length;
                              const totalSections = course.sectionCount || 1;
                              const remainingSlots = totalSections - assignedCount;
                              
                              // Add teacher and section information
                              let infoText = '';
                              if (hasAssignedTeachers) {
                                infoText = ` (${assignedCount}/${totalSections} assigned: ${course.assignedTeachers.map(t => t.initial).join(', ')})`;
                              } else {
                                infoText = ` (0/${totalSections} assigned)`;
                              }
                              
                              return (
                                <option 
                                  key={course.course_id} 
                                  value={course.course_id}
                                  style={{
                                    backgroundColor: hasAssignedTeachers ? '#f8f9fa' : 'white',
                                    fontWeight: remainingSlots === 1 ? 'bold' : 'normal', // Bold if last remaining slot
                                    color: remainingSlots > 1 ? 'black' : '#007bff' // Blue if last remaining slot
                                  }}
                                >
                                  {courseLabel}{infoText}
                                </option>
                              );
                            })}
                        </Form.Control>
                      </Form.Group>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button 
                        className="btn btn-primary"
                        onClick={handleCourseAssign}
                        disabled={submitting || !selectedCourse}
                      >
                        {submitting ? 'Assigning...' : 'Assign Course'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Only show Theory Schedule section if teacher has assigned courses with schedules */}
          {assignments.length > 0 && schedules.some(schedule => 
            assignments.some(assignment => assignment.course_id === schedule.course_id)
          ) && (
            <div id="theory-schedule" className="col-12 grid-margin">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Theory Schedule</h4>
                  <ScheduleTable schedules={schedules} teacherCourses={assignments.map(a => a.course_id)} />
                  <small className="text-muted d-block mt-2">
                    <i className="mdi mdi-information-outline me-1"></i>
                    This schedule shows which sections are scheduled for the teacher. Empty cells represent free periods.
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Schedule Modal */}
      {schedulingCourse && (
        <ScheduleModal
          show={showScheduleModal}
          onHide={() => setShowScheduleModal(false)}
          courseId={schedulingCourse.id}
          courseTitle={schedulingCourse.title}
          courseType={schedulingCourse.type}
          courseBatch={schedulingCourse.batch}
          courseSections={schedulingCourse.sections}
          courseCredits={schedulingCourse.credits}
          existingSchedules={schedules.filter(schedule => schedule.batch === schedulingCourse.batch)}
          teacherId={teacherId}
          onScheduleComplete={handleScheduleComplete}
        />
      )}
    </div>
  );
}
