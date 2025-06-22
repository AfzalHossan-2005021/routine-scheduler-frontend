import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { getTeachers } from '../api/db-crud';
import { getSessionalStatus } from '../api/theory-assign';
import TeacherDetails from './TeacherDetails';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionalAssignments, setSessionalAssignments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherInitial, setSelectedTeacherInitial] = useState(null);
  const buttonRefs = useRef({});

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachers();
        // Filter only active teachers and sort by seniority rank
        const activeTeachers = data
          .filter(teacher => teacher.active === 1)
          .sort((a, b) => a.seniority_rank - b.seniority_rank);
        setTeachers(activeTeachers);
        // Fetch sessional assignments for all teachers
        const sessionalStatus = await getSessionalStatus();
        // sessionalStatus.assignment is an array of assignments
        // Map: { initial: [assignments] }
        const assignmentMap = {};
        if (sessionalStatus && Array.isArray(sessionalStatus.assignment)) {
          sessionalStatus.assignment.forEach(course => {
            if (course.teachers && Array.isArray(course.teachers)) {
              course.teachers.forEach(teacher => {
                if (!assignmentMap[teacher.initial]) assignmentMap[teacher.initial] = [];
                assignmentMap[teacher.initial].push(course);
              });
            }
          });
        }
        setSessionalAssignments(assignmentMap);
      } catch (error) {
        console.error("Error fetching teachers or sessional assignments:", error);
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
                        <th>Status</th>
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
                            {sessionalAssignments[teacher.initial] && sessionalAssignments[teacher.initial].length > 0
                              ? <span className="text-success"><i className="mdi mdi-check-circle me-1"></i>Assigned</span>
                              : <span className="text-danger"><i className="mdi mdi-close-circle me-1"></i>Not Assigned</span>}
                          </td>
                          <td>
                            <button
                              ref={el => buttonRefs.current[teacher.initial] = el}
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                setSelectedTeacherInitial(teacher.initial);
                                setShowModal(true);
                              }}
                              onMouseDown={e => e.preventDefault()}
                            >
                              View Details
                            </button>
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

      {/* Floating Teacher Details Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        onExited={() => {
          if (selectedTeacherInitial && buttonRefs.current[selectedTeacherInitial]) {
            const btn = buttonRefs.current[selectedTeacherInitial];
            btn.blur();
            btn.classList.add('no-focus');
            setTimeout(() => {
              btn.classList.remove('no-focus');
            }, 200);
          }
          setSelectedTeacherInitial(null);
          if (document.activeElement) {
            document.activeElement.blur();
          }
        }}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Teacher Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {selectedTeacherInitial && (
            <TeacherDetails teacherId={selectedTeacherInitial} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
