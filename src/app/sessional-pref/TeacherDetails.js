import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Database and API imports
import { getTeacher } from '../api/db-crud';
import {
  getTeacherTheoryAssigments,
  getTeacherSessionalAssignment,
  setTeacherSessionalAssignment,
  getSessionalTeachers
} from '../api/theory-assign';
import { getCourseAllSchedule, getCourseSectionalSchedule } from '../api/theory-schedule';
import { getDepartmentalSessionalSchedule } from '../api/sessional-schedule';

// UI components and utilities
import { days, possibleLabTimes } from '../shared/ScheduleSelctionTable';
import toast from 'react-hot-toast';

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
  alreadyScheduledCourseItem: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    border: '1px solid #28a745',
    fontWeight: 'bold',
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

/**
 * CourseTeachers Component
 * 
 * Fetches and displays the teachers assigned to a specific course section.
 * Handles loading states and displays appropriate messages if no teachers are assigned.
 */
function CourseTeachers({ courseId, section, fetchTeachers, isAlreadyScheduled, currentTeacherId }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTeachers = async () => {
      try {
        setLoading(true);
        const teachersList = await fetchTeachers(courseId, section);

        if (isMounted) {
          setTeachers(teachersList);
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
  }, [courseId, section, fetchTeachers]);

  const textStyle = isAlreadyScheduled ? { color: '#155724' } : {};

  if (loading) {
    return <span style={{ ...textStyle, fontSize: '0.85rem' }}>Loading teachers...</span>;
  }

  if (teachers.length === 0) {
    return <span style={{ ...textStyle, fontSize: '0.85rem' }}>No teachers assigned</span>;
  }

  return (
    <div style={{ fontSize: '0.85rem', marginTop: '3px' }}>
      <span style={textStyle}>Teachers: </span>
      <span style={textStyle}>
        {teachers.map((teacher, index) => (
          <span key={teacher.initial}>
            <span style={{ fontWeight: teacher.initial === currentTeacherId ? '600' : 'normal' }}>
              {teacher.initial}
            </span>
            {index < teachers.length - 1 ? ', ' : ''}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * TeacherDetails Component
 * 
 * Displays detailed information about a teacher and allows for course assignments.
 * This component handles both theory and sessional course assignments, schedules,
 * and status management. It provides interfaces for selecting and assigning courses,
 * viewing existing assignments, and managing schedule conflicts.
 */
export default function TeacherDetails(props) {
  // Get the teacher ID and callback from props
  const { teacherId, onAssignmentChange } = props;

  const [departmentalSessionalSchedules, setdepartmentalSessionalSchedules] = useState([]); // All available sessional schedules

  // Basic teacher information
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  // Course and assignment data
  const [assignedTheoryCourses, setAssignedTheoryCourses] = useState([]);       // Assigned theory courses
  const [assignedSessionalCourses, setAssignedSessionalCourses] = useState([]); // Assigned sessional courses
  const [theorySchedule, setTheorySchedule] = useState([]);                     // Theory schedules
  const [sessionalSchedule, setSessionalSchedule] = useState([]);               // Sessional schedules

  // Selection and schedule tracking
  const [selectedSessionalSchedules, setSelectedSessionalSchedules] = useState([]); // Selected course schedules

  // Cache for course teachers to avoid redundant API calls
  const [courseTeachersCache, setCourseTeachersCache] = useState({});
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [submittingSessional, setSubmittingSessional] = useState(false);


  useEffect(() => {
    // Fetch all sessional schedules on component mount
    getDepartmentalSessionalSchedule().then(data => {
      setdepartmentalSessionalSchedules(data);
    }).catch(error => {
      console.error("Error fetching all schedules:", error);
      toast.error("Failed to load all schedules");
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [
          teacherData,
          assignedTheoryCoursesData,
          assignedSessionalCoursesData,
        ] = await Promise.all([
          getTeacher(teacherId).catch(error => {
            console.error("Error fetching teacher data:", error);
            toast.error("Failed to load teacher information");
            return null;
          }),
          getTeacherTheoryAssigments(teacherId).catch(error => {
            console.error("Error fetching assigned theory courses:", error);
            toast.error("Failed to load assigned theory courses");
            return [];
          }),
          getTeacherSessionalAssignment(teacherId).catch(error => {
            console.error("Error fetching assigned sessional courses:", error);
            toast.error("Failed to load assigned sessional courses");
            return [];
          })
        ]);

        setTeacher(teacherData);
        setAssignedTheoryCourses(assignedTheoryCoursesData);
        setAssignedSessionalCourses(assignedSessionalCoursesData);
      } catch (error) {
        console.error("Error fetching teacher details:", error);
        toast.error("Failed to load teacher details");
      } finally {
        setLoading(false);
      }
    };
    if (teacherId) {
      // Only fetch data if teacherId is provided
      fetchData();
    }
  }, [teacherId]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);

        // Create arrays to hold the promises for each course
        const theoryPromises = assignedTheoryCourses.map(course =>
          getCourseAllSchedule(course.course_id).catch(error => {
            console.error(`Error fetching schedule for course ${course.course_id}:`, error);
            return []; // Return empty array for failed requests
          })
        );

        const sessionalPromises = assignedSessionalCourses.map(course =>
          getCourseSectionalSchedule(course.course_id, course.section).catch(error => {
            console.error(`Error fetching sessional schedules for ${course.batch} ${course.section}:`, error);
            return []; // Return empty array for failed requests
          })
        );

        // Fetch all schedules in parallel - one array for theory, one for sessional
        const [theoryResults, sessionalResults] = await Promise.all([
          Promise.all(theoryPromises),
          Promise.all(sessionalPromises)
        ]);

        // Flatten results if needed (depends on your API response structure)
        const theorySchedules = theoryResults.flat();
        const sessionalSchedules = sessionalResults.flat();

        // Update state with fetched schedules
        setTheorySchedule(theorySchedules);
        setSessionalSchedule(sessionalSchedules);

        // Schedules have been fetched successfully
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast.error("Failed to load schedules");
      } finally {
        // Always set loading to false when done, whether successful or not
        setLoadingSchedules(false);
      }
    };

    if (assignedTheoryCourses.length > 0 || assignedSessionalCourses.length > 0) {
      fetchSchedules();
    }
  }, [assignedTheoryCourses, assignedSessionalCourses]);

  /**
   * Check for time conflicts with existing schedules
   * @param {string} day - The day to check
   * @param {number} time - The time slot to check
   * @returns {object} - Detailed conflict information
   */
  const hasTimeConflict = (day, time) => {
    // Check theory schedules for conflicts
    const theoryConflict = theorySchedule.some(schedule =>
      schedule.day === day && schedule.time === time
    );

    // Check already assigned sessional courses for conflicts - two methods:
    // 1. Direct check: Look for courses in assignedSessionalCourses that have day/time info
    // 2. Schedule lookup: Find sessionalSchedule items that match this day/time and 
    //    correspond to a course in assignedSessionalCourses

    const directAssignedConflict = assignedSessionalCourses.some(course =>
      course.day === day && course.time === time
    );

    const scheduleAssignedConflict = !directAssignedConflict && sessionalSchedule.some(schedule =>
      schedule.day === day &&
      schedule.time === time &&
      assignedSessionalCourses.some(course =>
        course.course_id === schedule.course_id &&
        course.section === schedule.section
      )
    );

    const assignedSessionalConflict = directAssignedConflict || scheduleAssignedConflict;

    // Check if already selected in this time slot for the current selection process
    const alreadySelected = selectedSessionalSchedules.some(selected =>
      selected.day === day && selected.time === time
    );

    // Determine conflict type prioritizing the most restrictive conflict
    // Order of priority: theory > already-scheduled > selected
    const type = theoryConflict ? 'theory' :
      (assignedSessionalConflict ? 'already-scheduled' :
        (alreadySelected ? 'selected' : null));

    return {
      hasConflict: theoryConflict || assignedSessionalConflict || alreadySelected,
      theoryConflict,
      assignedSessionalConflict,
      alreadySelected,
      type
    };
  };

  /**
   * Get details about conflicting schedules for a specific day and time
   * This helps provide better user feedback about which specific classes conflict
   * @param {string} day - The day to check
   * @param {number} time - The time slot to check
   * @returns {Array} - Array of conflict details grouped by type
   */
  const getConflictDetails = (day, time) => {
    const details = [];

    // 1. Check theory schedules
    const conflictingTheory = theorySchedule.filter(schedule =>
      schedule.day === day && schedule.time === time
    );

    if (conflictingTheory.length > 0) {
      details.push({
        type: 'theory',
        courses: conflictingTheory.map(s => ({
          id: s.course_id,
          time: s.time || time
        }))
      });
    }

    // 2. Check already assigned sessional courses - two approaches:
    const alreadyScheduledSessional = [];

    // a) First check for direct assignments with day/time info
    const directScheduledCourses = assignedSessionalCourses.filter(course =>
      course.day === day && course.time === time
    );

    directScheduledCourses.forEach(course => {
      alreadyScheduledSessional.push({
        id: course.course_id,
        section: course.section || 'Unknown',
        batch: course.batch || 'All',
        day: course.day,
        time: course.time
      });
    });

    // b) Then check through sessional schedule
    // If we don't have any direct conflicts yet, check through the schedule
    if (alreadyScheduledSessional.length === 0) {
      assignedSessionalCourses.forEach(course => {
        const courseSchedule = sessionalSchedule.find(schedule =>
          schedule.course_id === course.course_id &&
          schedule.section === course.section &&
          schedule.day === day &&
          schedule.time === time
        );

        if (courseSchedule) {
          alreadyScheduledSessional.push({
            id: course.course_id,
            section: course.section || courseSchedule.section || 'Unknown',
            batch: course.batch || 'All',
            day: day,
            time: time
          });
        }
      });
    }

    if (alreadyScheduledSessional.length > 0) {
      details.push({
        type: 'already-scheduled',
        courses: alreadyScheduledSessional
      });
    }

    return details;
  };

  /**
   * Generate detailed tooltip text for conflicts
   * Uses the conflict details to create a more descriptive tooltip
   * @param {string} day - The day to check
   * @param {number} time - The time slot to check
   * @returns {string} - Multi-line tooltip text
   */
  const generateConflictTooltip = (day, time) => {
    // Get conflicts for all three lab hours (lab sessions are 3 hours)
    // Using spread syntax to combine arrays efficiently
    const details = [
      ...getConflictDetails(day, time),
      ...getConflictDetails(day, time + 1),
      ...getConflictDetails(day, time + 2)
    ];

    if (details.length === 0) return '';

    // Format the tooltip text with each conflict on a new line
    const tooltips = [];

    // Helper function to process and format conflict details by type
    const formatConflictsByType = (details, type, headerText, formatCourse) => {
      const filteredDetails = details.filter(d => d.type === type);

      if (filteredDetails.length > 0) {
        tooltips.push(headerText);

        // Loop through each conflict detail and format each course
        filteredDetails.forEach(detail => {
          detail.courses.forEach(course => {
            tooltips.push(formatCourse(course));
          });
        });
      }
    };

    // Format theory conflicts
    formatConflictsByType(
      details,
      'theory',
      'Theory class conflicts:',
      course => `  • ${course.id} (At: ${course.time}:00)`
    );

    // Format already scheduled sessional conflicts
    formatConflictsByType(
      details,
      'already-scheduled',
      'Already assigned courses:',
      course => `  • ${course.id} (Section: ${course.section}${course.batch ? `, Batch: ${course.batch}` : ''})`
    );

    // Format other sessional conflicts
    formatConflictsByType(
      details,
      'sessional',
      'Sessional class conflicts:',
      course => `  • ${course.id} (Section: ${course.section})`
    );

    // Join all tooltip lines with newline characters
    return tooltips.join('\n');
  };

  // Simple selectable sessional schedule table
  const SessionalScheduleTable = ({ schedules, selectedSchedules, onSelectSchedule }) => {
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

    // Build a map of all conflicts for each day and time slot
    // This improves performance by calculating conflicts once
    const conflictMap = days.reduce((dayMap, day) => {
      // Initialize map for this day
      dayMap[day] = {};

      // For each time slot in this day
      labTimes.forEach(time => {
        // Get detailed conflict information
        const timeConflict = hasTimeConflict(day, time);

        // Special handling for 'selected' conflicts - these aren't blocking
        // but we want to keep the type for styling purposes
        if (timeConflict.type === 'selected') {
          dayMap[day][time] = {
            ...timeConflict,
            hasConflict: false, // Mark as non-blocking
            type: 'selected'    // Keep type for styles
          };
        } else {
          dayMap[day][time] = timeConflict;
        }
      });

      return dayMap;
    }, {});

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
                                ...(selectedSchedules.some(selected =>
                                  selected.day === day &&
                                  selected.time === time &&
                                  selected.course_id === courseInfo.course_id &&
                                  selected.section === courseInfo.section &&
                                  selected.batch === courseInfo.batch)
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
                    const conflict = conflictMap[day][time].hasConflict;
                    const conflictType = conflictMap[day][time].type;

                    /**
                     * Get conflict styling and information based on conflict type
                     * This helper consolidates styling and feedback logic for different conflict types
                     */
                    const getConflictInfo = (conflict, conflictType, day, time, selectedSchedules) => {
                      // Default values
                      let style = {};
                      let icon = null;
                      let tooltip = '';

                      if (!conflict) return { style, icon, tooltip };

                      // Common position styling
                      const baseStyle = { position: 'relative' };

                      // Style and feedback configuration by conflict type
                      const conflictConfig = {
                        theory: {
                          style: {
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            border: '2px dashed #dc3545',
                          },
                          icon: <i className="mdi mdi-book-open-variant text-danger"></i>,
                          defaultTooltip: 'You have a theory class at this time'
                        },
                        'already-scheduled': {
                          style: {
                            backgroundColor: 'rgba(40, 167, 69, 0.15)',
                            border: '2px solid #28a745',
                          },
                          icon: <i className="mdi mdi-calendar-check text-success"></i>,
                          defaultTooltip: 'You are already assigned to a sessional class at this time'
                        },
                        selected: {
                          style: {
                            backgroundColor: 'rgba(23, 162, 184, 0.1)',
                            border: '2px dashed #17a2b8',
                          },
                          icon: <i className="mdi mdi-check-circle-outline text-info"></i>,
                          defaultTooltip: 'You already selected a course for this time slot'
                        }
                      };

                      // Get configuration for current conflict type
                      const config = conflictConfig[conflictType] || {};

                      if (config) {
                        style = { ...baseStyle, ...config.style };
                        icon = config.icon;

                        // Generate tooltip based on conflict type
                        if (conflictType === 'selected') {
                          // Get details of the already selected course
                          const selectedCourse = selectedSchedules.find(s => s.day === day && s.time === time);
                          tooltip = selectedCourse
                            ? `Already selected: ${selectedCourse.course_id} (Section ${selectedCourse.section})`
                            : config.defaultTooltip;
                        } else {
                          tooltip = generateConflictTooltip(day, time) || config.defaultTooltip;
                        }
                      }

                      return { style, icon, tooltip };
                    };

                    // Get conflict styling and information
                    const { style: conflictStyle, icon: conflictIcon, tooltip: conflictTooltip } =
                      getConflictInfo(conflict, conflictType, day, time, selectedSchedules);

                    return (
                      <td
                        key={`${day}-${time}`}
                        style={{
                          ...scheduleTableStyle.courseCell,
                          ...(hasSchedules && (!conflict || conflictType === 'selected') ? scheduleTableStyle.selectableCell : {}),
                          ...conflictStyle
                        }}
                        className="text-center"
                        title={conflict ? conflictTooltip : ''}
                      >
                        {/* Show conflict indicator */}
                        {conflict && (
                          <div
                            style={{ position: 'absolute', top: '2px', right: '2px' }}
                            onClick={() => {
                              // Show a properly formatted toast notification when clicking the conflict icon
                              const formattedTooltip = conflictTooltip.split('\n').map((line, i) => (
                                <div key={i} style={{ marginBottom: i !== conflictTooltip.split('\n').length - 1 ? '4px' : '0' }}>
                                  {line}
                                </div>
                              ));
                              toast.custom(
                                <div className="bg-white shadow-lg rounded-lg px-4 py-3 border border-gray-200" style={{ maxWidth: '350px' }}>
                                  <div className="flex items-center mb-2">
                                    {conflictIcon}
                                    <span className="ml-2 font-semibold">Time Slot Conflict</span>
                                  </div>
                                  <div className="text-sm">{formattedTooltip}</div>
                                </div>,
                                { duration: 500 }
                              );
                            }}
                          >
                            {conflictIcon}
                          </div>
                        )}

                        {/* Show course info if available */}
                        {hasSchedules && (
                          <div className="d-flex flex-column">
                            {courseInfoArray.map((courseInfo, idx) => {
                              // Check if this course is already scheduled for the teacher
                              const isAlreadyScheduled = conflictType === 'already-scheduled' &&
                                getConflictDetails(day, time)
                                  .filter(d => d.type === 'already-scheduled')
                                  .flatMap(detail => detail.courses)
                                  .some(course => course.id === courseInfo.course_id && course.section === courseInfo.section);

                              const isSelected = selectedSchedules.some(selected =>
                                selected.day === day &&
                                selected.time === time &&
                                selected.course_id === courseInfo.course_id &&
                                selected.section === courseInfo.section &&
                                selected.batch === courseInfo.batch);
                              return (
                                <div
                                  key={`${courseInfo.course_id}-${courseInfo.section}-${idx}`}
                                  onClick={() => {
                                    // Function to show tooltip for blocking conflicts
                                    const showConflictTooltip = () => {
                                      // Format tooltip text with proper spacing
                                      const formattedTooltip = conflictTooltip.split('\n').map((line, i) => (
                                        <div
                                          key={i}
                                          style={{
                                            marginBottom: i !== conflictTooltip.split('\n').length - 1 ? '4px' : '0'
                                          }}
                                        >
                                          {line}
                                        </div>
                                      ));

                                      // Show a custom toast with the formatted tooltip
                                      toast.custom(
                                        <div className="bg-white shadow-lg rounded-lg px-4 py-3 border border-gray-200" style={{ maxWidth: '350px' }}>
                                          <div className="flex items-center mb-2">
                                            {conflictIcon}
                                            <span
                                              className="ml-2 font-semibold"
                                              style={{ color: isAlreadyScheduled ? '#155724' : '#dc3545' }}
                                            >
                                              {isAlreadyScheduled ? 'Already Assigned' : 'Cannot Select Time Slot'}
                                            </span>
                                          </div>
                                          <div className="text-sm">{formattedTooltip}</div>
                                        </div>,
                                        { duration: 500 }
                                      );
                                    };

                                    // Handle click based on conflict status
                                    if (isAlreadyScheduled || conflictType === 'theory') {
                                      showConflictTooltip();
                                      return;
                                    }

                                    // Allow selection if not blocked
                                    onSelectSchedule({ ...courseInfo, day, time });
                                  }}
                                  style={{
                                    ...scheduleTableStyle.courseItem,
                                    ...(isSelected ? scheduleTableStyle.selectedCourseItem : {}),
                                    ...(isAlreadyScheduled ? scheduleTableStyle.alreadyScheduledCourseItem : {}),
                                    ...((conflict && conflictType !== 'selected' && !isAlreadyScheduled) ? { opacity: 0.7 } : {}),
                                    cursor: isAlreadyScheduled ? 'not-allowed' : 'pointer',
                                    position: 'relative'
                                  }}
                                  // Keep a simple title for non-conflict items
                                  title={!conflict ? `${courseInfo.course_id} - Section ${courseInfo.section} (Batch ${courseInfo.batch})` : ''}
                                >
                                  <strong style={isAlreadyScheduled ? { color: '#155724' } : {}}>{courseInfo.course_id} ({courseInfo.section})</strong>
                                  <br />
                                  {courseInfo.section && (
                                    <CourseTeachers
                                      courseId={courseInfo.course_id}
                                      section={courseInfo.section}
                                      fetchTeachers={fetchCourseTeachers}
                                      isAlreadyScheduled={isAlreadyScheduled}
                                      currentTeacherId={teacherId}
                                    />
                                  )}
                                  {isAlreadyScheduled && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '3px',
                                      right: '6px',
                                      fontSize: '11px',
                                      color: '#155724',
                                      fontWeight: 'normal'
                                    }}>
                                      <i className="mdi mdi-check-circle ml-1" style={{ fontSize: '14px', color: '#155724' }}></i>
                                    </div>
                                  )}
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

  /**
   * Fetches teachers for a specific course and section
   * @param {string} courseId - The course ID
   * @param {string} section - The section
   * @returns {Promise<Array>} - Promise resolving to an array of teachers
   */
  const fetchCourseTeachers = async (courseId, section) => {
    // Create a cache key for this course-section combination
    const cacheKey = `${courseId}-${section}`;

    // Check if we already have this data cached
    if (courseTeachersCache[cacheKey]) {
      return courseTeachersCache[cacheKey];
    }

    try {
      const teachers = await getSessionalTeachers(courseId, section);

      // Update the cache with the fetched data
      setCourseTeachersCache(prevCache => ({
        ...prevCache,
        [cacheKey]: teachers || []
      }));

      return teachers || [];
    } catch (error) {
      console.error(`Error fetching teachers for ${courseId} (${section}):`, error);
      return [];
    }
  };

  // Helper function to prepare assignment data
  const prepareAssignmentData = (initial, schedule) => {
    return {
      initial: initial,
      course_id: schedule.course_id,
      batch: schedule.batch, // Default batch if not provided
      section: schedule.section
    };
  };

  /**
   * Handle selection of a sessional schedule
   * Manages the addition, removal, and replacement of course selections
   * @param {object} schedule - The schedule to select/deselect
   */
  const handleSessionalScheduleSelect = (schedule) => {
    // Define helper functions for matching schedules
    const matchesTimeSlot = s => s.day === schedule.day && s.time === schedule.time;
    const isExactMatch = s => (
      matchesTimeSlot(s) &&
      s.course_id === schedule.course_id &&
      s.section === schedule.section
    );

    // Check selection state
    const isExactCourseSelected = selectedSessionalSchedules.some(isExactMatch);
    const existingSelectionForTimeSlot = selectedSessionalSchedules.find(matchesTimeSlot);

    // CASE 1: Toggle selection (clicking already selected course)
    if (isExactCourseSelected) {
      setSelectedSessionalSchedules(prev => prev.filter(s => !isExactMatch(s)));

      toast.success(`Removed ${schedule.course_id} (Section ${schedule.section}) from selection`, {
        icon: '❌',
        duration: 2000
      });
      return;
    }

    // CASE 2: Check for blocking conflicts (theory or already scheduled)
    const conflictCheck = hasTimeConflict(schedule.day, schedule.time);
    if (conflictCheck.theoryConflict || conflictCheck.assignedSessionalConflict) {
      // Get list of conflicting courses by type
      const getConflictingCourseNames = (type) => {
        return getConflictDetails(schedule.day, schedule.time)
          .filter(detail => detail.type === type)
          .flatMap(detail => detail.courses.map(c => c.id))
          .join(", ");
      };

      // Format appropriate conflict message
      const conflictInfo = conflictCheck.theoryConflict
        ? {
          courses: getConflictingCourseNames('theory'),
          message: `You already have a theory class (%s) scheduled at ${schedule.day} ${schedule.time}:00`,
          icon: '📚'
        }
        : {
          courses: getConflictingCourseNames('already-scheduled'),
          message: `You are already assigned to teach (%s) at ${schedule.day} ${schedule.time}:00`,
          icon: '📅'
        };

      // Format and show error message
      const formattedMessage = conflictInfo.message.replace('%s', conflictInfo.courses);
      toast.error(`${conflictInfo.icon} Can't select this time slot - ${formattedMessage}`, {
        duration: 4000
      });
      return;
    }

    // CASE 3: Replace an existing selection in the same time slot
    if (existingSelectionForTimeSlot) {
      // Replace the existing selection with the new one
      setSelectedSessionalSchedules(prev =>
        prev.map(s => matchesTimeSlot(s) ? schedule : s)
      );

      // Show a replacement notification using toast() instead of toast.info() which doesn't exist
      toast(`Replaced ${existingSelectionForTimeSlot.course_id} with ${schedule.course_id} for ${schedule.day} at ${schedule.time}:00`, {
        icon: '🔄',
        duration: 3000
      });
      return;
    }

    // CASE 4: Add a new selection (no conflicts, no existing selection for this time slot)
    setSelectedSessionalSchedules(prev => [...prev, schedule]);

    // Show a success notification
    toast.success(`Selected ${schedule.course_id} (Section ${schedule.section}) for ${schedule.day} at ${schedule.time}:00`, {
      icon: '✅',
      duration: 2000
    });
  };

  // Handle assignment of sessional courses
  const handleSessionalCourseAssign = async () => {
    // Check if we have any selected schedules
    if (selectedSessionalSchedules.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    try {
      setSubmittingSessional(true);

      // Handle multiple assignments sequentially
      let successCount = 0;
      let failCount = 0;
      let failedCourses = [];

      // Show a loading toast
      const loadingToast = toast.loading(`Assigning ${selectedSessionalSchedules.length} courses...`);

      // Process each selected schedule
      for (const schedule of selectedSessionalSchedules) {
        try {
          // Prepare assignment data using helper function
          const assignment = prepareAssignmentData(teacherId, schedule);

          let result;
          let success = false;

          try {
            // Call the API to save assignment
            result = await setTeacherSessionalAssignment(assignment);

            // Check if assignment was successful based on backend response format
            if (result) {
              if (result.success === true ||
                result.status === 'success' ||
                (result.message && result.message.includes("Successful"))) {
                success = true;
              } else {
                console.warn(`Assignment response didn't indicate success:`, result);
              }
            } else {
              console.warn(`Empty response received for ${schedule.course_id} assignment`);
            }
          } catch (error) {
            console.error(`Error assigning ${schedule.course_id} (Section ${schedule.section}):`, error);

            // Extract and log detailed error information
            if (error.response) {
              console.error(`Server responded with status ${error.response.status}:`,
                error.response.data);
            } else if (error.request) {
              console.error("Request was sent but no response received:", error.request);
            } else {
              console.error("Error setting up request:", error.message);
            }
          }

          if (success) {
            successCount++;
          } else {
            failCount++;
            failedCourses.push(`${schedule.course_id} (Section ${schedule.section})`);
          }
        } catch (error) {
          console.error(`Error assigning course ${schedule.course_id}:`, error);
          failCount++;
          failedCourses.push(`${schedule.course_id} (Section ${schedule.section})`);
        }
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success/failure messages
      if (successCount > 0) {
        toast.success(
          `Successfully assigned ${successCount} course${successCount !== 1 ? 's' : ''}`,
          { duration: 3000 }
        );

        // Notify user if all assignments were successful
        if (failCount === 0) {
          toast.success(
            "All assignments were saved successfully!",
            { duration: 2000 }
          );
        }
      }

      if (failCount > 0) {
        toast.error(
          <div>
            <div>Failed to assign {failCount} course{failCount !== 1 ? 's' : ''}:</div>
            <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
              {failedCourses.map((course, index) => (
                <li key={index} style={{ listStyleType: 'disc' }}>{course}</li>
              ))}
            </ul>
          </div>,
          { duration: 4000 }
        );
      }

      // Clear the selected schedules regardless of success/failure
      setSelectedSessionalSchedules([]);

      // If at least one assignment succeeded, show a loading state while we fetch updated data
      if (successCount > 0) {
        // Show a subtle notification about updating the view
        toast("Updating the view with your new assignments...", {
          icon: '🔄',
          duration: 2000
        });
      }

      // Reload data to refresh UI without page refresh
      try {
        // Fetch all updated data in parallel for better performance
        const [
          updatedTheoryCourses,
          updatedSessionalCourses,
        ] = await Promise.all([
          getTeacherTheoryAssigments(teacherId),
          getTeacherSessionalAssignment(teacherId)
        ]);

        // Update other state variables with fresh data
        if (updatedSessionalCourses) {
          setAssignedSessionalCourses(updatedSessionalCourses);
          onAssignmentChange();
        }

        if (updatedTheoryCourses) {
          setAssignedTheoryCourses(updatedTheoryCourses);
        }

        // After updating assignments, also fetch updated schedules
        try {
          // Create arrays to hold the promises for each course
          const theoryPromises = updatedTheoryCourses.map(course =>
            getCourseAllSchedule(course.course_id).catch(error => {
              console.error(`Error fetching schedule for course ${course.course_id}:`, error);
              return []; // Return empty array for failed requests
            })
          );

          const sessionalPromises = updatedSessionalCourses.map(course =>
            getCourseSectionalSchedule(course.course_id, course.section).catch(error => {
              console.error(`Error fetching sessional schedules for ${course.course_id} ${course.section}:`, error);
              return []; // Return empty array for failed requests
            })
          );

          // Execute all schedule fetch promises in parallel
          const [theoryResults, sessionalResults] = await Promise.all([
            Promise.all(theoryPromises),
            Promise.all(sessionalPromises)
          ]);

          // Flatten results
          const theorySchedules = theoryResults.flat();
          const sessionalSchedules = sessionalResults.flat();

          // Update schedule states
          setTheorySchedule(theorySchedules);
          setSessionalSchedule(sessionalSchedules);
        } catch (scheduleError) {
          console.error("Error updating schedule data:", scheduleError);
        }
      } catch (error) {
        console.error("Error refreshing assignment data:", error);
        toast.error("Could not fully refresh assignment data. Some information may be outdated.");
      }

    } catch (error) {
      console.error('Error assigning sessional courses:', error);

      // Show specific error message if available
      const errorMessage = error.response?.data?.message ||
        'Failed to complete all course assignments. Please try again.';

      toast.error(errorMessage);
    } finally {
      setSubmittingSessional(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-gradient-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <div className="mt-3 text-primary">Loading teacher details...</div>
      </div>
    );
  }

  // Badge style for status indicators
  const badgeStyle = (isSuccess) => ({
    fontSize: '14px',
    padding: '6px 10px',
    verticalAlign: 'middle'
  });

  // Render badge based on assignment status
  const renderAssignmentBadge = () => {
    if (assignedSessionalCourses.length > 0) {
      return (
        <span className="ml-3 badge badge-success" style={badgeStyle(true)}>
          <i className="mdi mdi-check-circle-outline mr-1"></i> Assigned
        </span>
      );
    } else {
      return (
        <span className="ml-3 badge badge-warning" style={badgeStyle(false)}>
          <i className="mdi mdi-alert-circle-outline mr-1"></i> Not Assigned
        </span>
      );
    }
  };

  return (
    <div>
      <div className="page-header mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">
              <span className="text-primary">
                <i className="mdi mdi-account-tie mr-2"></i> {teacher?.name || teacherId}
              </span>
              {renderAssignmentBadge()}
            </h3>
          </div>
        </div>
      </div>

      {teacher && (
        <div className="row">
          {/* Sessional Courses Assignment Table */}
          <div className="col-12 grid-margin">
            <div className="card">
              {/* Add some padding to the card body on left and right*/}
              <div className="card-body" style={{ padding: '0px 30px' }}>
                <div className="mt-4">
                  <div className="card mb-4">
                    <h6 className="card-title text-primary">
                      <i className="mdi mdi-table-large mr-2"></i>Choose from Schedule Table
                    </h6>
                    {loadingSchedules ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-info" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading available schedules...</p>
                      </div>
                    ) : departmentalSessionalSchedules.length > 0 ? (
                      <div>
                        <SessionalScheduleTable
                          schedules={departmentalSessionalSchedules}
                          selectedSchedules={selectedSessionalSchedules}
                          onSelectSchedule={handleSessionalScheduleSelect}
                        />
                        {selectedSessionalSchedules.length > 0 && (
                          <div className="mt-4 card shadow-lg" style={{
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: 'none',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.075)'
                          }}>
                            <div className="card-header d-flex align-items-center justify-content-between py-3" style={{
                              background: 'linear-gradient(135deg, #4776E6, #8E54E9)',
                              borderBottom: 'none'
                            }}>
                              <div className="d-flex align-items-center">
                                <i className="mdi mdi-clipboard-check-outline mr-2 text-white" style={{ fontSize: '22px' }}></i>
                                <h5 className="mb-0 font-weight-bold text-white">Selected Courses</h5>
                              </div>
                              <span className="badge badge-light text-primary px-3 py-2" style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                {selectedSessionalSchedules.length} {selectedSessionalSchedules.length === 1 ? 'Course' : 'Courses'}
                              </span>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table mb-0">
                                  <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr>
                                      <th style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#495057',
                                        borderBottom: '2px solid #eaedf2',
                                        padding: '12px 16px'
                                      }}>Course</th>
                                      <th style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#495057',
                                        borderBottom: '2px solid #eaedf2',
                                        padding: '12px 16px'
                                      }}>Section</th>
                                      <th style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#495057',
                                        borderBottom: '2px solid #eaedf2',
                                        padding: '12px 16px'
                                      }}>Day</th>
                                      <th style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#495057',
                                        borderBottom: '2px solid #eaedf2',
                                        padding: '12px 16px'
                                      }}>Time</th>
                                      <th style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#495057',
                                        borderBottom: '2px solid #eaedf2',
                                        padding: '12px 16px',
                                        textAlign: 'center'
                                      }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedSessionalSchedules.map((schedule, index) => (
                                      <tr
                                        key={`${schedule.course_id}-${schedule.section}-${index}`}
                                        style={{
                                          transition: 'all 0.2s ease',
                                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fbfd',
                                          borderLeft: '4px solid transparent'
                                        }}
                                        className="hover-row"
                                      >
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <div className="d-flex align-items-center">
                                            <div className="course-index mr-3" style={{
                                              width: '32px',
                                              height: '32px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '14px',
                                              fontWeight: '600',
                                              borderRadius: '50%',
                                              color: 'white',
                                              background: 'linear-gradient(45deg, #5e72e4, #825ee4)'
                                            }}>
                                              {index + 1}
                                            </div>
                                            <div>
                                              <span className="font-weight-bold" style={{ color: '#344767', fontSize: '15px' }}>{schedule.course_id}</span>
                                            </div>
                                          </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <span className="badge" style={{
                                            backgroundColor: 'rgba(111, 66, 193, 0.18)',
                                            color: '#6f42c1',
                                            padding: '8px 14px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 4px rgba(111, 66, 193, 0.15)'
                                          }}>
                                            <i className="mdi mdi-account-group mr-1"></i>{schedule.section}
                                          </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <span className="badge" style={{
                                            backgroundColor: 'rgba(40, 167, 69, 0.18)',
                                            color: '#28a745',
                                            padding: '8px 14px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 4px rgba(40, 167, 69, 0.15)'
                                          }}>
                                            <i className="mdi mdi-calendar-week mr-1"></i>{schedule.day}
                                          </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <span className="badge" style={{
                                            backgroundColor: 'rgba(23, 162, 184, 0.18)',
                                            color: '#17a2b8',
                                            padding: '8px 14px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 4px rgba(23, 162, 184, 0.15)'
                                          }}>
                                            <i className="mdi mdi-clock-time-four-outline mr-1"></i>{schedule.time}:00
                                          </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                                          <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleSessionalScheduleSelect(schedule)}
                                            title="Remove selection"
                                            style={{
                                              width: '36px',
                                              height: '36px',
                                              padding: '0',
                                              borderRadius: '50%',
                                              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                          >
                                            <i className="mdi mdi-close"></i>
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div className="card-footer py-3" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #edf2f9' }}>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted d-flex align-items-center">
                                  <i className="mdi mdi-information-outline mr-1" style={{ fontSize: '16px' }}></i>
                                  These courses will be assigned to this teacher
                                </small>
                                <small className="text-primary">
                                  <i className="mdi mdi-gesture-tap mr-1"></i>
                                  Click the <i className="mdi mdi-close mx-1 text-danger"></i> button to unselect a course
                                </small>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-warning border-left border-warning" style={{ borderLeftWidth: '4px' }}>
                        <div className="d-flex align-items-center">
                          <i className="mdi mdi-alert-circle-outline mr-3" style={{ fontSize: '24px' }}></i>
                          <span>No schedules found for sessional courses.</span>
                        </div>
                      </div>
                    )}
                    <div className="d-flex justify-content-end mt-3">
                      <button
                        className="btn btn-gradient-primary"
                        onClick={handleSessionalCourseAssign}
                        disabled={submittingSessional || selectedSessionalSchedules.length === 0}
                      >
                        {submittingSessional ?
                          <><span className="spinner-border spinner-border-sm mr-2"></span>Assigning...</> :
                          <><i className="mdi mdi-check-circle mr-2"></i>Assign {selectedSessionalSchedules.length} Sessional Course{selectedSessionalSchedules.length !== 1 ? 's' : ''}</>}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
