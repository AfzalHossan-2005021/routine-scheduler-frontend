import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getSessionalDistribution } from "../api/theory-assign";

export default function SessionalDistribution() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessionalDistribution();
  }, []);

  const fetchSessionalDistribution = async () => {
    setLoading(true);
    try {
      const response = await getSessionalDistribution();
      setCourses(response || []);
    } catch (error) {
      console.error("Error fetching sessional distribution:", error);
      toast.error("Failed to load sessional distribution data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "Not scheduled";
    return time;
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="text-center py-4">
          <div className="spinner-border text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading sessional distribution...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {courses.length === 0 ? (
        <div className="text-center py-4">
          <div className="mb-3">
            <i
              className="mdi mdi-flask-off-outline"
              style={{
                fontSize: "3rem",
                color: "#6c757d",
                opacity: 0.5,
              }}
            ></i>
          </div>
          <h6 className="text-muted mb-2">No Sessional Courses</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            No sessional courses have been distributed yet.
          </p>
        </div>
      ) : (
        <table className="card-inner-table table">
          <thead className="card-inner-tabale-header">
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Section</th>
              <th>Day</th>
              <th>Time</th>
              <th>Assigned Teachers</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={index}>
                <td>{course.course_id}</td>
                <td>{course.course_name || course.course_id}</td>
                <td>{course.section}</td>
                <td>{course.day || "Not scheduled"}</td>
                <td>{formatTime(course.time)}</td>
                <td>
                  {course.teachers_details &&
                  course.teachers_details.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {course.teachers_details.map((teacher, idx) => (
                        <div
                          key={idx}
                          className="colored-badge-light"
                          title={`${teacher.name} (${teacher.initial})`}
                        >
                          {teacher.surname}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span
                      style={{
                        color: "#6c757d",
                        fontStyle: "italic",
                        fontSize: "0.85rem",
                      }}
                    >
                      No teachers assigned
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
