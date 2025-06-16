import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeachers } from '../api/db-crud';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachers();
        // Filter only active teachers and sort by seniority rank
        const activeTeachers = data
          .filter(teacher => teacher.active === 1)
          .sort((a, b) => a.seniority_rank - b.seniority_rank);
        setTeachers(activeTeachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Teachers List </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="!#" onClick={(event) => event.preventDefault()}>
                Dashboard
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Teachers
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Active Teachers</h4>
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th> Seniority Rank </th>
                        <th> Initial </th>
                        <th> Name </th>
                        <th> Designation </th>
                        <th> Details </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr key={teacher.initial}>
                          <td> {teacher.seniority_rank} </td>
                          <td> {teacher.initial} </td>
                          <td> {teacher.name} </td>
                          <td> {teacher.designation} </td>
                          <td>
                            <Link
                              to={`/teachers/${teacher.initial}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
