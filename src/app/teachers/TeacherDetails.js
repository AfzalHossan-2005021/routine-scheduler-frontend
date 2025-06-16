import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeacher, getTeachers } from '../api/db-crud';
import { getTheoryAssignement, setTeacherAssignment } from '../api/theory-assign';
import { getCourses } from '../api/db-crud';
import { toast } from 'react-hot-toast';
import { Form } from 'react-bootstrap';

export default function TeacherDetails() {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data needed
        const teacherData = await getTeacher(teacherId);
        const coursesData = await getCourses();
        const allAssignments = await getTheoryAssignement();
        const allTeachers = await getTeachers();
        
        setTeacher(teacherData);
        
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
            
            return {
              ...assignment,
              course_title: matchingCourse ? matchingCourse.name : 'Unknown',
              otherTeachers
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-3 mb-4">
                    <p className="text-muted">No theory courses are currently assigned to this teacher.</p>
                    
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
