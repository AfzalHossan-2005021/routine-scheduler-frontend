import React, { useState } from 'react';
import {getTheoryTeacherAssignment} from '../api/theory-assign';
import {getCourses} from '../api/db-crud';
import { toast } from 'react-hot-toast';

export default function TheoryDistribution() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

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
              <th style={tableHeaderStyle}>Teacher</th>
              <th style={tableHeaderStyle}>Course ID</th>
              <th style={tableHeaderStyle}>Course Name</th>
              <th style={tableHeaderStyle}>Section</th>
              <th style={tableHeaderStyle}>Level-Term</th>
              <th style={tableHeaderStyle}>Credit Hours</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : courses && courses.length > 0 ? (
              courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.teacherName}</td>
                  <td>{course.courseId}</td>
                  <td>{course.courseName}</td>
                  <td>{course.section}</td>
                  <td>{course.levelTerm}</td>
                  <td>{course.creditHours}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
                  <div style={{ padding: "20px", backgroundColor: "rgba(194, 137, 248, 0.05)", borderRadius: "12px", color: "#888", border: "1px dashed rgba(194, 137, 248, 0.3)" }}>
                    <i className="mdi mdi-information-outline me-2" style={{ color: "rgb(174, 117, 228)" }}></i>
                    No theory courses assigned yet
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
