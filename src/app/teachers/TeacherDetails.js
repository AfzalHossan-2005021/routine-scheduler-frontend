import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeacher } from '../api/db-crud';
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
        // Fetch teacher details
        const teacherData = await getTeacher(teacherId);
        setTeacher(teacherData);
        
        // Fetch all courses and filter for theory courses
        const coursesData = await getCourses();
        const theoryCourses = coursesData.filter(
          course => course.type === 0 && course.from === 'CSE'
        );
        setCourses(theoryCourses);
        
        // Fetch course assignments
        const assignmentData = await getTheoryAssignement();
        console.log('Assignments:', assignmentData);
        // Filter assignments for this teacher and add course titles
        const teacherAssignments = assignmentData
          .filter(assignment => assignment.initial === teacherId)
          .map(assignment => {
            // Find matching course to get title
            const matchingCourse = coursesData.find(
              course => course.course_id === assignment.course_id
            );
            return {
              ...assignment,
              course_title: matchingCourse ? matchingCourse.name : 'Unknown'
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
      
      // Refresh assignments with course titles
      const assignmentData = await getTheoryAssignement();
      const coursesData = await getCourses(); // Re-fetch courses to make sure we have updated data
      
      // Filter assignments for this teacher and add course titles
      const teacherAssignments = assignmentData
        .filter(assignment => assignment.initial === teacherId)
        .map(assignment => {
          // Find matching course to get title
          const matchingCourse = coursesData.find(
            course => course.course_id === assignment.course_id
          );
          return {
            ...assignment,
            course_title: matchingCourse ? matchingCourse.name : 'Unknown'
          };
        });
      
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
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((assignment) => (
                          <tr key={assignment.course_id}>
                            <td>{assignment.course_id}</td>
                            <td>{assignment.course_title || 'Unknown'}</td>
                            <td>{assignment.session || 'Current'}</td>
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
                            {courses.map((course) => (
                              <option key={course.course_id} value={course.course_id}>
                                {course.course_id} - {course.name || 'Untitled'}
                              </option>
                            ))}
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
