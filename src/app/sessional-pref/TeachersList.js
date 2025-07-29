import { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { getTeachers } from '../api/db-crud';
import { getAllSessionalAssignment } from '../api/theory-assign';
import TeacherDetails from './TeacherDetails';
import toast from 'react-hot-toast';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [sessionalAssignments, setSessionalAssignments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherInitial, setSelectedTeacherInitial] = useState(null);
  const buttonRefs = useRef({});

  // Function to fetch teachers and assignments data
  const fetchTeachersAndAssignments = async () => {
    try {
      // Fetch and process teachers
      const data = await getTeachers();
      const activeTeachers = data
        .filter(teacher => teacher.active === 1)
        .sort((a, b) => a.seniority_rank - b.seniority_rank);
      setTeachers(activeTeachers);

      // Fetch sessional assignments with fallback
      const assignmentData = await fetchAssignmentData();

      // Process assignments into teacher-indexed map
      const assignmentMap = processAssignmentData(assignmentData);
      setSessionalAssignments(assignmentMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load teachers or assignments");
    }
  };

  // Helper function to fetch assignment data with fallback
  const fetchAssignmentData = async () => {
    try {
      // Try the primary API endpoint
      const data = await getAllSessionalAssignment();
      return data;
    } catch (error) {
      console.error("Error with getAllSessionalAssignment:", error);
      return [];
    }
  };

  // Helper function to process assignment data into proper format
  const processAssignmentData = (assignments) => {
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return {};
    }

    // Group assignments by course
    const courseMap = {};
    assignments.forEach(assignment => {
      const courseKey = `${assignment.course_id}-${assignment.section || ''}`;

      if (!courseMap[courseKey]) {
        courseMap[courseKey] = {
          course_id: assignment.course_id,
          section: assignment.section,
          batch: assignment.batch,
          teachers: []
        };
      }

      if (!courseMap[courseKey].teachers.some(t => t.initial === assignment.initial)) {
        courseMap[courseKey].teachers.push({ initial: assignment.initial });
      }
    });

    // Map courses to teachers
    const teacherMap = {};
    Object.values(courseMap).forEach(course => {
      if (course.teachers && course.teachers.length) {
        course.teachers.forEach(teacher => {
          if (!teacherMap[teacher.initial]) {
            teacherMap[teacher.initial] = [];
          }
          teacherMap[teacher.initial].push(course);
        });
      }
    });

    return teacherMap;
  };

  // Initial data fetch
  useEffect(() => {
    fetchTeachersAndAssignments();
  }, []);

  return (
    <div>
      {/* Modern Page Header */}
      <div className="page-header" style={{
        background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
        borderRadius: "16px",
        padding: "1.5rem",
        marginBottom: "2rem",
        boxShadow: "0 8px 32px rgba(174, 117, 228, 0.15)",
        color: "white"
      }}>
        <h3 className="page-title" style={{
          fontSize: "1.8rem",
          fontWeight: "700",
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "white"
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
          }}>
            <i className="mdi mdi-account-multiple" style={{ fontSize: "24px", color: "white" }}></i>
          </div>
          Active Teachers
        </h3>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card" style={{
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "none",
            transition: "all 0.3s ease",
            background: "white"
          }}>
            <div className="card-body" style={{ padding: "2rem" }}>
              <div style={{ borderBottom: "3px solid rgb(194, 137, 248)", paddingBottom: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 className="card-title" style={{
                  color: "rgb(174, 117, 228)",
                  marginBottom: 0,
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.3px"
                }}>
                  <i className="mdi mdi-account-multiple" style={{ fontSize: "24px", marginRight: "8px" }}></i>
                  Teachers List
                </h4>
              </div>
              <div className="table-responsive">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{
                      backgroundColor: "rgba(174, 117, 228, 0.08)",
                      borderBottom: "2px solid rgba(174, 117, 228, 0.1)"
                    }}>
                      <th style={{ width: "180px", padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <i className="mdi mdi-sort" style={{ fontSize: "20px", cursor: "pointer", margin: 0 }}></i> Seniority Rank
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <i className='mdi mdi-account' style={{ fontSize: "20px", cursor: "pointer", margin: 0 }}></i> Initial
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <i className='mdi mdi-account-box' style={{ fontSize: "20px", cursor: "pointer", margin: 0 }}></i> Name
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <i className='mdi mdi-briefcase' style={{ fontSize: "20px", cursor: "pointer", margin: 0 }}></i> Designation
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <i className='mdi mdi-check-circle' style={{ fontSize: "20px", cursor: "pointer", margin: 0 }}></i> Status
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <i className='mdi mdi-eye' style={{ fontSize: "20px", cursor: "pointer", margin: 0 }}></i> Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.initial} style={{ transition: "all 0.2s", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(194, 137, 248, 0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <td style={{
                          padding: "12px 22px",
                          fontWeight: "500",
                          borderBottom: "none",
                          verticalAlign: "middle",
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, rgba(194, 137, 248, 0.1) 0%, rgba(174, 117, 228, 0.1) 100%)",
                            border: "1px solid rgba(174, 117, 228, 0.2)",
                            color: "rgb(174, 117, 228)",
                            fontWeight: "600",
                            margin: "0 auto"
                          }}>
                            {teacher.seniority_rank}
                          </div>
                        </td>
                        <td style={{
                          padding: "12px 22px",
                          fontWeight: "600",
                          borderBottom: "none",
                          color: "rgb(106, 27, 154)",
                          verticalAlign: "middle",
                        }}> {teacher.initial} </td>
                        <td style={{
                          padding: "12px 22px",
                          fontWeight: "500",
                          borderBottom: "none",
                          verticalAlign: "middle",
                        }}> {teacher.name} </td>
                        <td style={{
                          padding: "12px 22px",
                          fontWeight: "500",
                          borderBottom: "none",
                          verticalAlign: "middle",
                        }}> {teacher.designation} </td>
                        <td style={{
                          padding: "12px 22px",
                          borderBottom: "none",
                          verticalAlign: "middle",
                        }}>
                          {sessionalAssignments[teacher.initial] && sessionalAssignments[teacher.initial].length > 0 ? (
                            <span
                              style={{
                                backgroundColor: "rgba(40, 167, 69, 0.1)",
                                color: "#28a745",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontWeight: "500",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <i className="mdi mdi-check-circle me-1"></i>
                              Assigned
                              <span className="ms-1 badge" style={{
                                backgroundColor: "rgba(40, 167, 69, 0.2)",
                                color: "#28a745",
                                fontSize: "10px",
                                padding: "2px 6px"
                              }}>
                                {sessionalAssignments[teacher.initial].length}
                              </span>
                            </span>
                          ) : (
                            <span style={{
                              backgroundColor: "rgba(220, 53, 69, 0.1)",
                              color: "#dc3545",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontWeight: "500",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              <i className="mdi mdi-close-circle me-1"></i>
                              Not Assigned
                            </span>
                          )}
                        </td>
                        <td style={{
                          padding: "12px 22px",
                          borderBottom: "none",
                          verticalAlign: "middle"
                        }}>
                          <button
                            ref={el => buttonRefs.current[teacher.initial] = el}
                            onClick={() => {
                              setSelectedTeacherInitial(teacher.initial);
                              setShowModal(true);
                            }}
                            type="button"
                            style={{
                              background: "rgba(154, 77, 226, 0.15)",
                              color: "rgb(154, 77, 226)",
                              border: "1px solid rgba(154, 77, 226, 0.5)",
                              borderRadius: "6px",
                              padding: "7px 14px",
                              transition: "all 0.3s ease",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginRight: "8px"
                            }}
                            className="btn"
                            onMouseOver={e => {
                              e.currentTarget.style.background = "rgb(154, 77, 226)";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.background = "rgba(154, 77, 226, 0.15)";
                              e.currentTarget.style.color = "rgb(154, 77, 226)";
                            }}
                          >
                            {sessionalAssignments[teacher.initial] && sessionalAssignments[teacher.initial].length > 0 ? (
                              <>
                                <i className="mdi mdi-account-details"></i>
                                View Details
                              </>
                            ) : (
                              <>
                                <i className="mdi mdi-plus-circle"></i>
                                Assign
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Teacher Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        onExited={() => setSelectedTeacherInitial(null)}
        size="lg"
        aria-labelledby="teacher-details-modal"
        scrollable
        animation={true}
        keyboard={true}
        backdrop="static"
        centered
        dialogClassName="teacher-details-modal"
      >
        <Modal.Header
          style={{
            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
            color: "white",
            borderBottom: "none",
            borderRadius: "5px 5px 0 0",
            position: "relative",
            overflow: "hidden",
            verticalAlign: "middle",
          }}>
          <Modal.Title>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                background: "transparent",
                borderBottom: "none"
              }}>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "15px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                zIndex: 1
              }}>
                <i className="mdi mdi-book-open-variant" style={{ fontSize: "24px", color: "white" }}></i>
              </div>
              <span style={{
                fontSize: "19px",
                fontWeight: "700",
                letterSpacing: "0.5px",
                zIndex: 1,
                color: "white",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
              }}>
                Sessional Course Assignments
              </span>
            </div>
          </Modal.Title>
          <button
            onClick={() => setShowModal(false)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgb(154, 77, 226)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = 'white';
            }}
          >
            <i className="mdi mdi-close"></i>
          </button>
        </Modal.Header>
        <Modal.Body style={{
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '30px'
        }}>
          {selectedTeacherInitial && (
            <TeacherDetails
              teacherId={selectedTeacherInitial}
              onAssignmentChange={() => fetchTeachersAndAssignments()}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
