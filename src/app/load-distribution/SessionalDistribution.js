import React, { useState, useEffect } from 'react';
import { getTeachers, getLabCourses } from '../api/db-crud';
import { getSessionalTeachers } from '../api/theory-assign';
import { toast } from 'react-hot-toast';

export default function SessionalDistribution() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionalData();
  }, []);

  const fetchSessionalData = async () => {
    try {
      setLoading(true);
      const labCourses = await getLabCourses();
      
      // Get teacher assignments for each course
      const coursesWithTeachers = await Promise.all(
        labCourses.map(async (course) => {
          const teachers = await getSessionalTeachers(course.course_id, course.section);
          const teacherNames = teachers.map(t => t.initial).join(', ');
          
          return {
            courseId: course.course_id,
            courseName: course.name,
            section: course.section,
            teacherName: teacherNames || 'Not Assigned'
          };
        })
      );
      
      setCourses(coursesWithTeachers);
    } catch (error) {
      toast.error('Failed to load sessional distribution data');
      console.error('Error fetching sessional distribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tableStyle = {
    borderCollapse: "separate",
    borderSpacing: "0",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    boxShadow: "0 5px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(194, 137, 248, 0.1)",
    borderRadius: "10px",
    overflow: "hidden",
    width: "100%",
    margin: "0 auto",
    transition: "all 0.3s ease"
  };

  const tableHeaderStyle = {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
    color: "white",
    padding: "12px 16px",
    fontWeight: "600",
    borderBottom: "none"
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table" style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Course ID</th>
              <th style={tableHeaderStyle}>Course Name</th>
              <th style={tableHeaderStyle}>Section</th>
              <th style={tableHeaderStyle}>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : courses && courses.length > 0 ? (
              courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseId}</td>
                  <td>{course.courseName}</td>
                  <td>{course.section}</td>
                  <td>{course.teacherName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
                  <div style={{ padding: "20px", backgroundColor: "rgba(194, 137, 248, 0.05)", borderRadius: "12px", color: "#888", border: "1px dashed rgba(194, 137, 248, 0.3)" }}>
                    <i className="mdi mdi-information-outline me-2" style={{ color: "rgb(174, 117, 228)" }}></i>
                    No sessional courses assigned yet
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
