import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeacher, getTeachers } from '../api/db-crud';
import { getTheoryAssignement, setTeacherAssignment, getSessionalStatus, setTeacherSessionalAssignment } from '../api/theory-assign';
import { times, days, possibleLabTimes } from '../shared/ScheduleSelctionTable';
import { getCourses } from '../api/db-crud';
import { getAllSchedule } from '../api/theory-schedule';
import { getSessionalSchedules } from '../api/sessional-schedule';
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
    width: '60px',
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
  selectableCell: {
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  selectedCell: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    border: '2px solid #007bff',
  },
  courseItem: {
    padding: '4px 6px',
    margin: '2px 0',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  selectedCourseItem: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    border: '1px solid #007bff',
    fontWeight: 'bold',
  },
};

export default function TeacherDetails(props) {
  const params = useParams();
  const teacherId = props.teacherId || params.teacherId;
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [sessionalAssignments, setSessionalAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessionalCourses, setSessionalCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [allSessionalSchedules, setAllSessionalSchedules] = useState([]);
  const [sessionalSchedules, setSessionalSchedules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSessionalCourse, setSelectedSessionalCourse] = useState('');
  const [selectedSessionalSection, setSelectedSessionalSection] = useState('');
  const [selectedSessionalSchedule, setSelectedSessionalSchedule] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingSessional, setSubmittingSessional] = useState(false);
  
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
        const sessionalStatus = await getSessionalStatus();
        
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
        
        // Filter for sessional courses
        const filteredSessionalCourses = coursesData
          .filter(course => course.type === 1 && course.from === 'CSE')
          .map(course => ({
            ...course,
            // Get sections from the course data if available
            sections: Array.isArray(course.sections) ? course.sections : []
          }));
        
        setSessionalCourses(filteredSessionalCourses);

        // Collect all available sessional schedules
        // This is a simple approach for demonstration - in production, you might want to fetch this from an API
        // that returns all sessional schedules
        const fetchAllSessionalSchedules = async () => {
          setLoadingSchedules(true);
          try {
            let allSchedules = [];
            
            // For each sessional course, try to fetch schedules for each section
            for (const course of filteredSessionalCourses) {
              if (course.batch && Array.isArray(course.sections)) {
                for (const section of course.sections) {
                  try {
                    const sectionSchedules = await getSessionalSchedules(course.batch, section);
                    if (sectionSchedules && sectionSchedules.length > 0) {
                      allSchedules = [...allSchedules, ...sectionSchedules];
                    }
                  } catch (error) {
                    console.log(`Could not fetch schedules for batch ${course.batch}, section ${section}`);
                  }
                }
              }
            }
            
            setAllSessionalSchedules(allSchedules);
          } catch (error) {
            console.error('Error fetching all sessional schedules:', error);
          } finally {
            setLoadingSchedules(false);
          }
        };
        
        // Start fetching all sessional schedules
        fetchAllSessionalSchedules();
        
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
        
        // Process sessional assignments if available
        if (sessionalStatus && sessionalStatus.assignment) {
          // Filter for sessional courses assigned to this teacher
          const sessionalCourses = sessionalStatus.assignment
            .filter(course => {
              // Check if the teacher is in the teachers array of this course
              return course.teachers && course.teachers.some(teacher => teacher.initial === teacherId);
            })
            .map(course => {
              // Extract section information for this teacher
              const teacherInfo = course.teachers.find(t => t.initial === teacherId);
              return {
                course_id: course.course_id,
                course_title: course.name,
                section: teacherInfo ? teacherInfo.section : '',
                // Find session from the first teacher record if available
                session: course.teachers && course.teachers.length > 0 ? 
                  (course.teachers[0].session || 'Current') : 'Current',
                // Find other teachers for the course (excluding current teacher)
                otherTeachers: course.teachers
                  .filter(t => t.initial !== teacherId)
                  .map(t => ({
                    initial: t.initial,
                    name: t.name || t.initial,
                    section: t.section
                  }))
              };
            });
            
          setSessionalAssignments(sessionalCourses);
        }
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
  
  // Simple selectable sessional schedule table
  const SessionalScheduleTable = ({ schedules, selectedSchedule, onSelectSchedule }) => {
    // Use possibleLabTimes for lab times
    const labTimes = possibleLabTimes;
    // Create a map of day -> time -> courses (array)
    const scheduleMap = {};
    // Initialize schedule map with empty arrays for each cell
    days.forEach(day => {
      scheduleMap[day] = {};
      labTimes.forEach(time => {
        scheduleMap[day][time] = [];
      });
    });
    // Fill in the schedule map with courses, avoiding duplicates
    schedules.forEach(schedule => {
      const day = schedule.day;
      const displayTime = schedule.time;
      if (scheduleMap[day] && scheduleMap[day][displayTime]) {
        const alreadyExists = scheduleMap[day][displayTime].some(
          s => s.course_id === schedule.course_id &&
               (s.section || '') === (schedule.section || '') &&
               (s.batch || '') === (schedule.batch || '')
        );
        if (!alreadyExists) {
          scheduleMap[day][displayTime].push({
            ...schedule,
            course_id: schedule.course_id,
            section: schedule.section || '',
            batch: schedule.batch || ''
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
              {labTimes.map(time => (
                <th key={time} style={scheduleTableStyle.headerCell}>
                  {time}:00
                  {time === 12 && <span className="ms-1">(PM)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => {
              const merged = Array(labTimes.length).fill(false);
              return (
                <tr key={day}>
                  <th style={scheduleTableStyle.dayCell}>{day}</th>
                  {labTimes.map((time, timeIdx) => {
                    if (merged[timeIdx]) return null; // Skip merged cells
                    const courseInfoArray = scheduleMap[day][time];
                    const hasSchedules = courseInfoArray.length > 0;
                    if (hasSchedules) {
                      const courseInfo = courseInfoArray[0];
                      const mergeLength = 3;
                      let canMerge = true;
                      for (let offset = 1; offset < mergeLength; offset++) {
                        const nextTime = labTimes[timeIdx + offset];
                        if (!nextTime) { canMerge = false; break; }
                        const nextCell = scheduleMap[day][nextTime];
                        if (!nextCell.some(s => s.course_id === courseInfo.course_id && s.section === courseInfo.section && s.batch === courseInfo.batch)) {
                          canMerge = false;
                          break;
                        }
                      }
                      if (canMerge) {
                        for (let offset = 1; offset < mergeLength; offset++) {
                          if (timeIdx + offset < merged.length) merged[timeIdx + offset] = true;
                        }
                        return (
                          <td
                            key={`${day}-${time}`}
                            colSpan={3}
                            style={{
                              ...scheduleTableStyle.courseCell,
                              ...scheduleTableStyle.selectableCell
                            }}
                            className="text-center"
                          >
                            <div
                              onClick={() => onSelectSchedule({ ...courseInfo, day, time })}
                              style={{
                                ...scheduleTableStyle.courseItem,
                                ...(selectedSchedule &&
                                  selectedSchedule.day === day &&
                                  selectedSchedule.time === time &&
                                  selectedSchedule.course_id === courseInfo.course_id &&
                                  selectedSchedule.section === courseInfo.section &&
                                  selectedSchedule.batch === courseInfo.batch
                                  ? scheduleTableStyle.selectedCourseItem
                                  : {})
                              }}
                              title={`${courseInfo.course_id} - Section ${courseInfo.section} (Batch ${courseInfo.batch})`}
                            >
                              <strong>{courseInfo.course_id}</strong>
                              <br />
                              {courseInfo.section && <span>Section: {courseInfo.section}</span>}
                              {courseInfo.batch && <span> | Batch: {courseInfo.batch}</span>}
                            </div>
                          </td>
                        );
                      }
                    }
                    // If not merging, render as usual
                    return (
                      <td
                        key={`${day}-${time}`}
                        style={{
                          ...scheduleTableStyle.courseCell,
                          ...(hasSchedules ? scheduleTableStyle.selectableCell : {})
                        }}
                        className="text-center"
                      >
                        {hasSchedules && (
                          <div className="d-flex flex-column">
                            {courseInfoArray.map((courseInfo, idx) => {
                              const isSelected = selectedSchedule &&
                                selectedSchedule.day === day &&
                                selectedSchedule.time === time &&
                                selectedSchedule.course_id === courseInfo.course_id &&
                                selectedSchedule.section === courseInfo.section &&
                                selectedSchedule.batch === courseInfo.batch;
                              return (
                                <div
                                  key={`${courseInfo.course_id}-${courseInfo.section}-${idx}`}
                                  onClick={() => onSelectSchedule({ ...courseInfo, day, time })}
                                  style={{
                                    ...scheduleTableStyle.courseItem,
                                    ...(isSelected ? scheduleTableStyle.selectedCourseItem : {})
                                  }}
                                  title={`${courseInfo.course_id} - Section ${courseInfo.section} (Batch ${courseInfo.batch})`}
                                >
                                  <strong>{courseInfo.course_id}</strong>
                                  <br />
                                  {courseInfo.section && <span>Section: {courseInfo.section}</span>}
                                  {courseInfo.batch && <span> | Batch: {courseInfo.batch}</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
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
  
  // Function to fetch sessional schedules
  const fetchSessionalSchedules = async (batch, section) => {
    if (!batch || !section) return;
    
    try {
      setLoadingSchedules(true);
      const sessionalSchedulesData = await getSessionalSchedules(batch, section);
      setAllSessionalSchedules(sessionalSchedulesData || []);
    } catch (error) {
      console.error('Error fetching sessional schedules:', error);
      toast.error('Failed to load sessional schedules');
      setAllSessionalSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };
  
  // Handle selection of a sessional schedule
  const handleSessionalScheduleSelect = (schedule) => {
    // If already selected, toggle selection off
    if (selectedSessionalSchedule && 
        selectedSessionalSchedule.day === schedule.day &&
        selectedSessionalSchedule.time === schedule.time &&
        selectedSessionalSchedule.course_id === schedule.course_id &&
        selectedSessionalSchedule.section === schedule.section) {
      setSelectedSessionalSchedule(null);
      setSelectedSessionalCourse('');
      setSelectedSessionalSection('');
    } else {
      // Otherwise, select this schedule
      setSelectedSessionalSchedule(schedule);
      setSelectedSessionalCourse(schedule.course_id);
      setSelectedSessionalSection(schedule.section);
    }
  };
  
  // Handle assignment of sessional course
  const handleSessionalCourseAssign = async () => {
    // Check if we are using the schedule table or manual selection
    const usingScheduleTable = Boolean(selectedSessionalSchedule);
    
    // Validate selections
    if (!usingScheduleTable && (!selectedSessionalCourse || !selectedSessionalSection)) {
      toast.error('Please select a sessional course and section');
      return;
    }

    try {
      setSubmittingSessional(true);
      
      let assignment = {};
      
      if (usingScheduleTable) {
        // Use the selected schedule to create the assignment
        assignment = {
          initial: teacherId,
          course_id: selectedSessionalSchedule.course_id,
          batch: selectedSessionalSchedule.batch,
          section: selectedSessionalSchedule.section
        };
      } else {
        // Use the manually selected course and section
        const selectedCourseInfo = sessionalCourses.find(c => c.course_id === selectedSessionalCourse);
        const batch = selectedCourseInfo?.batch || '19'; // Default to batch 19 if not specified
        
        assignment = {
          initial: teacherId,
          course_id: selectedSessionalCourse,
          batch: batch,
          section: selectedSessionalSection
        };
      }
      
      // Submit the assignment
      await setTeacherSessionalAssignment(assignment);
      toast.success('Sessional course assigned successfully');
      
      // Reload all data
      const sessionalStatus = await getSessionalStatus();
      
      // Process sessional assignments if available
      if (sessionalStatus && sessionalStatus.assignment) {
        // Filter for sessional courses assigned to this teacher
        const sessionalCourses = sessionalStatus.assignment
          .filter(course => {
            // Check if the teacher is in the teachers array of this course
            return course.teachers && course.teachers.some(teacher => teacher.initial === teacherId);
          })
          .map(course => {
            // Extract section information for this teacher
            const teacherInfo = course.teachers.find(t => t.initial === teacherId);
            return {
              course_id: course.course_id,
              course_title: course.name,
              section: teacherInfo ? teacherInfo.section : '',
              // Find session from the first teacher record if available
              session: course.teachers && course.teachers.length > 0 ? 
                (course.teachers[0].session || 'Current') : 'Current',
              // Find other teachers for the course (excluding current teacher)
              otherTeachers: course.teachers
                .filter(t => t.initial !== teacherId)
                .map(t => ({
                  initial: t.initial,
                  name: t.name || t.initial,
                  section: t.section
                }))
            };
          });
          
        setSessionalAssignments(sessionalCourses);
      }
      
      // Reset selections
      setSelectedSessionalCourse('');
      setSelectedSessionalSection('');
      setSelectedSessionalSchedule(null);
      // No need to reset allSessionalSchedules here as they're global for this teacher
      
    } catch (error) {
      console.error('Error assigning sessional course:', error);
      toast.error('Failed to assign sessional course. Please try again.');
    } finally {
      setSubmittingSessional(false);
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
          
          {/* Sessional Courses Assignment Table */}
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Sessional Course Assignments</h4>
                
                {sessionalAssignments.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Course ID</th>
                          <th>Course Title</th>
                          <th>Section</th>
                          <th>Session</th>
                          <th>Other Teachers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionalAssignments.map((assignment) => (
                          <tr key={`${assignment.course_id}-${assignment.section}`}>
                            <td>{assignment.course_id}</td>
                            <td>{assignment.course_title || 'Unknown'}</td>
                            <td>{assignment.section || 'Not specified'}</td>
                            <td>{assignment.session || 'Current'}</td>
                            <td>
                              {assignment.otherTeachers && assignment.otherTeachers.length > 0 ? (
                                <div>
                                  {assignment.otherTeachers.map((teacher, index) => (
                                    <div key={`${teacher.initial}-${teacher.section}`}>
                                      <Link to={`/teachers/${teacher.initial}`} className="text-decoration-none">
                                        {teacher.name || teacher.initial}
                                        {teacher.section && ` (Section: ${teacher.section})`}
                                        {index < assignment.otherTeachers.length - 1 ? ',' : ''}
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">No other teachers assigned</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-3 mb-4">
                    <p className="text-muted">No sessional courses are currently assigned to this teacher.</p>
                  </div>
                )}
                
                {sessionalAssignments.length === 0 && (
                  <div className="mt-4">
                    <h5>Assign Sessional Course</h5>
                    <div className="card mb-4">
                      <div className="card-body">
                        <h6 className="card-title">Choose from Schedule Table</h6>
                        <p className="text-muted mb-3">
                          <i className="mdi mdi-information-outline me-1"></i>
                          Select a sessional course from the table by clicking on it, then click "Assign Sessional Course".
                        </p>
                        {loadingSchedules ? (
                          <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          </div>
                        ) : allSessionalSchedules.length > 0 ? (
                          <div>
                            <SessionalScheduleTable 
                              schedules={allSessionalSchedules}
                              selectedSchedule={selectedSessionalSchedule}
                              onSelectSchedule={handleSessionalScheduleSelect}
                            />
                            {selectedSessionalSchedule && (
                              <div className="mt-3 alert alert-info">
                                <strong>Selected Course:</strong> {selectedSessionalSchedule.course_id} | 
                                Section: {selectedSessionalSchedule.section} | 
                                Day: {selectedSessionalSchedule.day} | 
                                Time: {selectedSessionalSchedule.time}:00
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="alert alert-warning">
                            <i className="mdi mdi-alert-circle-outline me-2"></i>
                            No schedules found for sessional courses.
                          </div>
                        )}
                        <div className="d-flex justify-content-end mt-3">
                          <button 
                            className="btn btn-primary"
                            onClick={handleSessionalCourseAssign}
                            disabled={submittingSessional || !selectedSessionalSchedule}
                          >
                            {submittingSessional ? 'Assigning...' : 'Assign Sessional Course'}
                          </button>
                        </div>
                      </div>
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
                  <h4 className="card-title">Weekly Schedule</h4>
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
