import { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { getTeachers } from '../api/db-crud';
import { getAllSessionalAssignment } from '../api/theory-assign';
import TeacherDetails from './TeacherDetails';
import toast from 'react-hot-toast';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionalAssignments, setSessionalAssignments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherInitial, setSelectedTeacherInitial] = useState(null);
  const buttonRefs = useRef({});

  // Function to fetch teachers and assignments data
  const fetchTeachersAndAssignments = async () => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
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
      <div className="page-header">
        <h3 className="page-title" style={{
          color: "rgb(174, 117, 228)",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <i className="mdi mdi-account-multiple me-2"></i>
          Teachers List
        </h3>
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
          <div className="card" style={{
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            border: "none",
            transition: "all 0.3s ease",
            overflow: "hidden"
          }}>
            <div className="card-header" style={{
              background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
              height: "75px",
              display: "flex",
              alignItems: "center",
              position: "relative",
              padding: "0 30px",
              boxShadow: "0 4px 20px rgba(154, 77, 226, 0.2)"
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
                <i className="mdi mdi-account-multiple" style={{ fontSize: "24px", color: "white" }}></i>
              </div>
              <span style={{
                fontSize: "19px",
                fontWeight: "700",
                letterSpacing: "0.5px",
                zIndex: 1,
                color: "white",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
              }}>Active Teachers</span>
            </div>
            <div className="card-body" style={{
              padding: "30px",
              position: "relative",
              backgroundColor: "rgba(255, 255, 255, 0.9)"
            }}>
              {loading ? (
                <div className="d-flex justify-content-center" style={{ padding: "50px 0" }}>
                  <div className="d-flex flex-column align-items-center">
                    <div className="spinner-border" style={{
                      color: "rgb(174, 117, 228)",
                      width: "3rem",
                      height: "3rem"
                    }} role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <div style={{ marginTop: "15px", color: "#666", fontWeight: "500" }}>
                      Loading teacher data...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    width: "100%",
                    margin: "0 auto",
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                          color: "white",
                          padding: "12px 16px",
                          fontWeight: "600",
                          borderTopLeftRadius: "8px",
                          borderBottomLeftRadius: "8px",
                          borderRight: "1px solid rgba(255, 255, 255, 0.1)"
                        }}> Seniority Rank </th>
                        <th style={{
                          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                          color: "white",
                          padding: "12px 16px",
                          fontWeight: "600",
                          borderRight: "1px solid rgba(255, 255, 255, 0.1)"
                        }}> Initial </th>
                        <th style={{
                          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                          color: "white",
                          padding: "12px 16px",
                          fontWeight: "600",
                          borderRight: "1px solid rgba(255, 255, 255, 0.1)"
                        }}> Name </th>
                        <th style={{
                          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                          color: "white",
                          padding: "12px 16px",
                          fontWeight: "600",
                          borderRight: "1px solid rgba(255, 255, 255, 0.1)"
                        }}> Designation </th>
                        <th style={{
                          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                          color: "white",
                          padding: "12px 16px",
                          fontWeight: "600",
                          borderRight: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>Status</th>
                        <th style={{
                          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                          color: "white",
                          padding: "12px 16px",
                          fontWeight: "600",
                          borderTopRightRadius: "8px",
                          borderBottomRightRadius: "8px"
                        }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher, index) => (
                        <tr key={teacher.initial} style={{
                          backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(194, 137, 248, 0.05)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f8f9fa" : "white";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                        }}>
                          <td style={{
                            padding: "12px 16px",
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
                            padding: "12px 16px",
                            fontWeight: "600",
                            borderBottom: "none",
                            color: "rgb(106, 27, 154)",
                            verticalAlign: "middle",
                          }}> {teacher.initial} </td>
                          <td style={{
                            padding: "12px 16px",
                            fontWeight: "500",
                            borderBottom: "none",
                            verticalAlign: "middle",
                          }}> {teacher.name} </td>
                          <td style={{
                            padding: "12px 16px",
                            fontWeight: "500",
                            borderBottom: "none",
                            verticalAlign: "middle",
                          }}> {teacher.designation} </td>
                          <td style={{
                            padding: "12px 16px",
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
                                  alignItems: "center"
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
                                alignItems: "center"
                              }}>
                                <i className="mdi mdi-close-circle me-1"></i>
                                Not Assigned
                              </span>
                            )}
                          </td>
                          <td style={{
                            padding: "12px 16px",
                            borderBottom: "none",
                            verticalAlign: "middle",
                            textAlign: "center"
                          }}>
                            <button
                              ref={el => buttonRefs.current[teacher.initial] = el}
                              onClick={() => {
                                setSelectedTeacherInitial(teacher.initial);
                                setShowModal(true);
                              }}
                              onMouseDown={e => e.preventDefault()}
                              style={{
                                background: sessionalAssignments[teacher.initial] && sessionalAssignments[teacher.initial].length > 0 
                                  ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" 
                                  : "linear-gradient(135deg, rgb(33, 150, 243) 0%, rgb(13, 71, 161) 100%)",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                color: "white",
                                fontWeight: "500",
                                boxShadow: sessionalAssignments[teacher.initial] && sessionalAssignments[teacher.initial].length > 0 
                                  ? "0 4px 12px rgba(174, 117, 228, 0.3)"
                                  : "0 4px 12px rgba(33, 150, 243, 0.3)",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = sessionalAssignments[teacher.initial] && sessionalAssignments[teacher.initial].length > 0 
                                  ? "0 6px 15px rgba(174, 117, 228, 0.4)"
                                  : "0 6px 15px rgba(33, 150, 243, 0.4)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = sessionalAssignments[teacher.initial] && sessionalAssignments[teacher.initial].length > 0 
                                  ? "0 4px 12px rgba(174, 117, 228, 0.3)"
                                  : "0 4px 12px rgba(33, 150, 243, 0.3)";
                                e.currentTarget.style.transform = "translateY(0)";
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Teacher Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        onExited={() => {
          // Clean up focus and reset teacher selection when modal closes
          if (selectedTeacherInitial && buttonRefs.current[selectedTeacherInitial]) {
            const btn = buttonRefs.current[selectedTeacherInitial];
            btn.blur();
          }
          setSelectedTeacherInitial(null);
          if (document.activeElement) {
            document.activeElement.blur();
          }
        }}
        size="lg"
        aria-labelledby="teacher-details-modal"
        scrollable
        animation={true}
        keyboard={true}
        backdrop="static"
        centered
        dialogClassName="teacher-details-modal"
      >
        <style>
          {`
            .teacher-details-modal .modal-content {
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: none;
            }
            .teacher-details-modal .modal-header {
              background: linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%);
              border-bottom: none;
              padding: 20px 30px;
              color: white;
            }
            .teacher-details-modal .modal-title {
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .teacher-details-modal .btn-close {
              background-color: rgba(255, 255, 255, 0.5);
              border-radius: 50%;
              opacity: 1;
              width: 28px;
              height: 28px;
            }
            .teacher-details-modal .btn-close:hover {
              background-color: rgba(255, 255, 255, 0.8);
              transform: rotate(90deg);
              transition: all 0.3s ease;
            }
          `}
        </style>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="mdi mdi-book-open-variant mr-2"></i>
            Sessional Course Assignments
          </Modal.Title>
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
      
      <style>
        {`
          .table tbody tr:hover {
            background-color: rgba(194, 137, 248, 0.05) !important;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal.show .modal-dialog {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
