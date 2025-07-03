import { useEffect, useState } from "react";
import { finalize, getStatus, setTheoryAssignStatus, initiate, setTeacherAssignment, resendTheoryPrefMail, saveReorderedTeacherPreference } from "../api/theory-assign";
import { toast } from "react-hot-toast";
import { getTeachers } from "../api/db-crud";
import { Alert, Button, Modal } from "react-bootstrap";
import { Form, FormGroup } from "react-bootstrap";
import CardWithButton from "../shared/CardWithButton";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Icon from '@mdi/react';
import { mdiContentSave, mdiClose, mdiCheckCircle, mdiReload } from '@mdi/js';

export default function TheoryPreference() {
  const [status, setStatus] = useState({
    status: 0,
    values: [],
    submitted: [],
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [selectedTeacherRow, setSelectedTeacherRow] = useState(null);
  const [allCourses] = useState([]);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);

  useEffect(() => {
    getStatus().then((res) => {
      // Sort the teachers in the status by seniority rank
      let modifiedRes = { ...res };
      if (modifiedRes.values && modifiedRes.values.length > 0) {
        modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
      }
      if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
        modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
      }
      setStatus({ values: [], submitted: [], ...modifiedRes });
    });
    getTeachers().then((res) => {
      res = res.filter((t) => t.active === 1);
      // Sort teachers by seniority rank (lower rank means more senior)
      const sortedTeachers = [...res].sort((a, b) => a.seniority_rank - b.seniority_rank);
      setAllTeachers(sortedTeachers);
    });
  }, []);

  // const selectedCourseRef = useRef(); // Commented out as it's unused

  // Helper to get courses not in selectedCourse
  const getOfferedCourses = () => allCourses.filter(c => !selectedCourse.includes(c));

  // Drag and drop handler for reordering and moving between lists
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Drag within Your Preference
    if (source.droppableId === 'preference-list' && destination.droppableId === 'preference-list') {
      const reordered = Array.from(selectedCourse);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      setSelectedCourse(reordered);
      return;
    }

    // Drag from Offered Courses to Your Preference
    if (source.droppableId === 'offered-list' && destination.droppableId === 'preference-list') {
      const offered = getOfferedCourses();
      const course = offered[source.index];
      if (!selectedCourse.includes(course)) {
        const newPref = Array.from(selectedCourse);
        newPref.splice(destination.index, 0, course);
        setSelectedCourse(newPref);
      }
      return;
    }

    // Drag from Your Preference to Offered Courses (remove from preference)
    if (source.droppableId === 'preference-list' && destination.droppableId === 'offered-list') {
      const newPref = Array.from(selectedCourse);
      newPref.splice(source.index, 1);
      setSelectedCourse(newPref);
      return;
    }
  };

  // These functions are not currently used, but kept in case they are needed in the future
  // Add course to preference (at end)
  /*
  const addToPreference = (course) => {
    if (!selectedCourse.includes(course)) {
      setSelectedCourse([...selectedCourse, course]);
    }
  };

  // Remove course from preference (goes back to offered)
  const removeFromPreference = (index) => {
    const newPref = Array.from(selectedCourse);
    newPref.splice(index, 1);
    setSelectedCourse(newPref);
  };
  */

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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" stroke="white" strokeWidth="1" fill="white" />
            </svg>
          </div>
          Theory Course Assign
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
            <li className="breadcrumb-item" style={{ color: "rgba(255,255,255,0.8)" }}>
              <a href="!#" onClick={(event) => event.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                Phases
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
              Theory Preference
            </li>
          </ol>
        </nav>
      </div>
      <div className="mb-4">
        <CardWithButton
          title="Send Email with Form Link"
          subtitle="Initial Phase"
          status={parseInt(status.status) === 0 ? "Click to Start" : "Sent"}
          bgColor={parseInt(status.status) === 0 ? "info" : "success"}
          icon={parseInt(status.status) === 0 ? "mdi-autorenew" : "mdi-check"}
          disabled={false}
          onClick={(e) => {
            initiate().then((res) => {
              getStatus().then((res) => {
                // Sort the teachers in the status by seniority rank
                let modifiedRes = { ...res };
                if (modifiedRes.values && modifiedRes.values.length > 0) {
                  modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
                }
                if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                  modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
                }
                setStatus({ values: [], submitted: [], ...modifiedRes });
              });
            });
            setStatus({ ...status, status: 1 });
            setTheoryAssignStatus(1);
          }}
        />
      </div>

      <div className="row">
        <div className="col-12 grid-margin">
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
                  <span style={{ marginRight: "12px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Yet to submit the form
                </h4>
              </div>
              {(status.values.length !== 0 || parseInt(status.status) >= 1) && (
                <div className="table-responsive">
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{
                        backgroundColor: "rgba(174, 117, 228, 0.08)",
                        borderBottom: "2px solid rgba(174, 117, 228, 0.1)"
                      }}>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 6 15.9391 6 17V19" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Initial
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Name
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 6L12 13L2 6" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Email
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Seniority Rank
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 12L11 14L15 10" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...status.values].sort((a, b) => a.seniority_rank - b.seniority_rank).map((teacher, index) => (
                        <tr key={index} style={{
                          borderLeft: "3px solid transparent",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          transition: "all 0.2s ease"
                        }} className="hover-row">
                          <td style={{ padding: "15px 20px" }}> {teacher.initial} </td>
                          <td style={{ padding: "15px 20px" }}> {teacher.name} </td>
                          <td style={{ padding: "15px 20px" }}> {teacher.email} </td>
                          <td style={{ padding: "15px 20px" }}> {teacher.seniority_rank} </td>
                          <td style={{ padding: "15px 20px" }}>
                            <button
                              type="button"
                              style={{
                                borderRadius: "6px",
                                padding: "7px 14px",
                                fontWeight: "500",
                                background: "rgba(154, 77, 226, 0.15)",
                                border: "1px solid rgba(154, 77, 226, 0.5)",
                                color: "rgb(154, 77, 226)",
                                transition: "all 0.3s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "0.9rem",
                                marginRight: "10px"
                              }}
                              onMouseEnter={e => {
                                e.target.style.background = "rgb(154, 77, 226)";
                                e.target.style.color = "white";
                                e.target.style.borderColor = "rgb(154, 77, 226)";
                              }}
                              onMouseLeave={e => {
                                e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                e.target.style.color = "rgb(154, 77, 226)";
                                e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                              }}
                              onClick={() => {
                                setConfirmAction("Resend");
                                setSelectedTeacherRow(teacher);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="mdi mdi-send" style={{ fontSize: "16px", marginRight: "4px" }}></i>
                              Resend
                            </button>
                            <button
                              type="button"
                              style={{
                                borderRadius: "6px",
                                padding: "7px 14px",
                                fontWeight: "500",
                                background: "rgba(40, 167, 69, 0.15)",
                                border: "1px solid rgba(40, 167, 69, 0.5)",
                                color: "rgb(40, 167, 69)",
                                transition: "all 0.3s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "0.9rem"
                              }}
                              onMouseEnter={e => {
                                e.target.style.background = "rgb(40, 167, 69)";
                                e.target.style.color = "white";
                                e.target.style.borderColor = "rgb(40, 167, 69)";
                              }}
                              onMouseLeave={e => {
                                e.target.style.background = "rgba(40, 167, 69, 0.15)";
                                e.target.style.color = "rgb(40, 167, 69)";
                                e.target.style.borderColor = "rgba(40, 167, 69, 0.5)";
                              }}
                              onClick={() => {
                                setSelectedTeacherRow(teacher);
                                // Open directly in new tab
                                const newWindow = window.open(`/form/theory-pref/${teacher.initial}`, '_blank');

                                // Set up polling to check if window closed
                                const pollTimer = setInterval(() => {
                                  if (newWindow.closed) {
                                    clearInterval(pollTimer);
                                    // Refresh data when child window closes
                                    getStatus().then((res) => {
                                      // Sort the teachers in the status by seniority rank
                                      let modifiedRes = { ...res };
                                      if (modifiedRes.values && modifiedRes.values.length > 0) {
                                        modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
                                      }
                                      if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                                        modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
                                      }
                                      setStatus({ values: [], submitted: [], ...modifiedRes });
                                    });
                                  }
                                }, 500);
                              }}
                            >
                              <i className="mdi mdi-plus-circle" style={{ fontSize: "16px", marginRight: "4px" }}></i>
                              Add Preference
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {status.values.length === 0 && parseInt(status.status) >= 2 && (
                <Alert variant="success text-center">
                  All submitted, waiting for next phase
                </Alert>
              )}
              {status.values.length === 0 && parseInt(status.status) === 0 && (
                <Alert variant="info text-center">
                  Click "Initial Phase" to start the process
                </Alert>
              )}
              {status.values.length === 0 && parseInt(status.status) === 1 && (
                <Alert variant="info text-center">
                  Table is ready for teachers to submit preferences
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 grid-margin">
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
                  <span style={{ marginRight: "12px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" stroke="rgb(194, 137, 248)" strokeWidth="1" fill="rgb(194, 137, 248)" />
                    </svg>
                  </span>
                  Already Submitted
                </h4>
              </div>
              {(status.submitted.length !== 0 || parseInt(status.status) >= 1) && (
                <div className="table-responsive">
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{
                        backgroundColor: "rgba(174, 117, 228, 0.08)",
                        borderBottom: "2px solid rgba(174, 117, 228, 0.1)"
                      }}>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 6 15.9391 6 17V19" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Initial
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Name
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 6L12 13L2 6" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Email
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Seniority Rank
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 12L11 14L15 10" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...status.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank).map((teacher, index) => (
                        <tr key={index} style={{
                          borderLeft: "3px solid transparent",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          transition: "all 0.2s ease"
                        }} className="hover-row">
                          <td style={{ padding: "15px 20px" }}> {teacher.initial} </td>
                          <td style={{ padding: "15px 20px" }}> {teacher.name} </td>
                          <td style={{ padding: "15px 20px" }}> {teacher.email} </td>
                          <td style={{ padding: "15px 20px" }}> {teacher.seniority_rank} </td>
                          <td style={{ padding: "15px 20px" }}>
                            <button
                              type="button"
                              style={{
                                borderRadius: "6px",
                                padding: "7px 14px",
                                fontWeight: "500",
                                background: "rgba(154, 77, 226, 0.15)",
                                border: "1px solid rgba(154, 77, 226, 0.5)",
                                color: "rgb(154, 77, 226)",
                                transition: "all 0.3s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "0.9rem"
                              }}
                              onMouseEnter={e => {
                                e.target.style.background = "rgb(154, 77, 226)";
                                e.target.style.color = "white";
                                e.target.style.borderColor = "rgb(154, 77, 226)";
                              }}
                              onMouseLeave={e => {
                                e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                e.target.style.color = "rgb(154, 77, 226)";
                                e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                              }}
                              onClick={() => {
                                setSelectedTeacher({
                                  ...teacher,
                                });
                                setSelectedCourse(teacher.response);
                              }}
                            >
                              <i className="mdi mdi-pencil" style={{ fontSize: "16px", marginRight: "4px" }}></i>
                              Edit Preference
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {status.submitted.length === 0 && parseInt(status.status) === 0 && (
                <Alert variant="info text-center">
                  Click "Initial Phase" to start and show submitted teachers
                </Alert>
              )}
              {status.submitted.length === 0 && parseInt(status.status) >= 1 && (
                <Alert variant="info text-center">
                  No teachers have submitted yet
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedTeacher !== null && (
        <Modal
          show={true}
          onHide={() => {
            setSelectedTeacher(null);
            getStatus().then((res) => {
              // Sort the teachers in the status by seniority rank
              let modifiedRes = { ...res };
              if (modifiedRes.values && modifiedRes.values.length > 0) {
                modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
              }
              if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
              }
              setStatus({ values: [], submitted: [], ...modifiedRes });
            });
          }}
          size="md"
          centered
          dialogClassName="custom-width-modal" // custom class for finer control
        >
          <Modal.Header closeButton style={{
            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
            color: "white",
            borderBottom: "none",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            padding: "1.25rem 1.5rem"
          }}>
            <div>
              <h4 style={{ color: "white", marginBottom: "0.25rem", fontSize: "1.4rem", fontWeight: "600" }}>Theory Course Preference</h4>
              <h6 style={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: "400", margin: "0", fontSize: "1.05rem" }}>
                Selected by {selectedTeacher.name} ({selectedTeacher.initial})
              </h6>
            </div>
          </Modal.Header>
          <Modal.Body style={{
            padding: "1.5rem",
            background: "rgba(174, 117, 228, 0.04)"
          }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 540, padding: 10 }}>
                  <h6 style={{
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    color: 'rgb(174, 117, 228)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "10px" }}>
                      <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Your Preference (Drag to reorder)
                  </h6>
                  <Droppable droppableId="preference-list">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          border: '1px solid rgba(174, 117, 228, 0.3)',
                          borderRadius: '10px',
                          minHeight: 250,
                          maxHeight: 350,
                          overflowY: 'auto',
                          padding: 10,
                          background: 'white',
                          width: '100%',
                          boxShadow: '0 4px 15px rgba(174, 117, 228, 0.08)'
                        }}
                      >
                        {selectedCourse.map((course, idx) => (
                          <Draggable key={course} draggableId={course} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  userSelect: 'none',
                                  padding: '10px 12px',
                                  margin: '0 0 8px 0',
                                  background: snapshot.isDragging ? 'rgba(174, 117, 228, 0.08)' : '#fff',
                                  border: '1px solid ' + (snapshot.isDragging ? 'rgba(174, 117, 228, 0.5)' : 'rgba(0, 0, 0, 0.1)'),
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  boxShadow: snapshot.isDragging ? '0 4px 10px rgba(174, 117, 228, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                                  fontWeight: '500',
                                  color: snapshot.isDragging ? 'rgb(174, 117, 228)' : '#333',
                                  ...provided.draggableProps.style
                                }}
                              >
                                <span style={{ flex: 1 }}>{course}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          </Modal.Body>
          <Modal.Footer style={{
            borderTop: "1px solid rgba(174, 117, 228, 0.2)",
            padding: "1.25rem 1.5rem"
          }}>
            <Button
              className="me-auto"
              style={{
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "500",
                background: "rgba(40, 167, 69, 0.15)",
                border: "1px solid rgba(40, 167, 69, 0.5)",
                color: "rgb(40, 167, 69)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.95rem"
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgb(40, 167, 69)";
                e.target.style.color = "white";
                e.target.style.borderColor = "rgb(40, 167, 69)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(40, 167, 69, 0.15)";
                e.target.style.color = "rgb(40, 167, 69)";
                e.target.style.borderColor = "rgba(40, 167, 69, 0.5)";
              }}
              onClick={() => {
                saveReorderedTeacherPreference(selectedTeacher.initial, selectedCourse)
                  .then(() => {
                    // Refresh the status to show updated data
                    getStatus().then((res) => {
                      // Sort the teachers in the status by seniority rank
                      let modifiedRes = { ...res };
                      if (modifiedRes.values && modifiedRes.values.length > 0) {
                        modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
                      }
                      if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                        modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
                      }
                      setStatus({ values: [], submitted: [], ...modifiedRes });
                    });
                    setSelectedTeacher(null);
                  });
              }}
            >
              <Icon path={mdiContentSave} size={0.85} />
              Save
            </Button>
            <Button
              style={{
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "500",
                background: "rgba(108, 117, 125, 0.15)",
                border: "1px solid rgba(108, 117, 125, 0.5)",
                color: "rgb(108, 117, 125)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.95rem"
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgb(108, 117, 125)";
                e.target.style.color = "white";
                e.target.style.borderColor = "rgb(108, 117, 125)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(108, 117, 125, 0.15)";
                e.target.style.color = "rgb(108, 117, 125)";
                e.target.style.borderColor = "rgba(108, 117, 125, 0.5)";
              }}
              onClick={() => {
                setSelectedTeacher(null);
                getStatus().then((res) => {
                  // Sort the teachers in the status by seniority rank
                  let modifiedRes = { ...res };
                  if (modifiedRes.values && modifiedRes.values.length > 0) {
                    modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
                  }
                  if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                    modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
                  }
                  setStatus({ values: [], submitted: [], ...modifiedRes });
                });
              }}>
              <Icon path={mdiClose} size={0.85} />
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <div className="mb-4">
        <CardWithButton
          title="Assign Teachers according to Seniorty"
          subtitle="Final Phase"
          status={
            parseInt(status.status) === 0
              ? "Click to Start"
              : parseInt(status.status) < 3
                ? "Click to Assign"
                : "This Phase is Completed"
          }
          bgColor={
            parseInt(status.status) === 0
              ? "info"
              : parseInt(status.status) < 3
                ? "info"
                : "success"
          }
          icon={
            parseInt(status.status) === 0
              ? "mdi-autorenew"
              : parseInt(status.status) < 3
                ? "mdi-autorenew"
                : "mdi-check"
          }
          disabled={false}
          onClick={() => {
            if (parseInt(status.status) === 0) {
              setTheoryAssignStatus(3);
              setStatus({ ...status, status: 3 });
            } else {
              setShowAssignConfirm(true);
            }
          }}
        />
      </div>
      <Modal show={showAssignConfirm} onHide={() => setShowAssignConfirm(false)} centered>
        <Modal.Header closeButton style={{
          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
          color: "white",
          borderBottom: "none",
          borderTopLeftRadius: "15px",
          borderTopRightRadius: "15px",
          padding: "1.25rem 1.5rem"
        }}>
          <Modal.Title style={{ color: "white", fontSize: "1.4rem", fontWeight: "600" }}>Confirm Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem", fontSize: "1.05rem" }}>
          Are you sure you want to assign Teachers?
        </Modal.Body>
        <Modal.Footer style={{
          borderTop: "1px solid rgba(174, 117, 228, 0.2)",
          padding: "1.25rem 1.5rem"
        }}>
          <Button
            style={{
              borderRadius: "6px",
              padding: "8px 16px",
              fontWeight: "500",
              background: "rgba(220, 53, 69, 0.15)",
              border: "1px solid rgba(220, 53, 69, 0.5)",
              color: "rgb(220, 53, 69)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.95rem"
            }}
            onMouseEnter={e => {
              e.target.style.background = "rgb(220, 53, 69)";
              e.target.style.color = "white";
              e.target.style.borderColor = "rgb(220, 53, 69)";
            }}
            onMouseLeave={e => {
              e.target.style.background = "rgba(220, 53, 69, 0.15)";
              e.target.style.color = "rgb(220, 53, 69)";
              e.target.style.borderColor = "rgba(220, 53, 69, 0.5)";
            }}
            onClick={() => setShowAssignConfirm(false)}
          >
            <Icon path={mdiClose} size={0.85} />
            Cancel
          </Button>
          <Button
            style={{
              borderRadius: "6px",
              padding: "8px 16px",
              fontWeight: "500",
              background: "rgba(154, 77, 226, 0.15)",
              border: "1px solid rgba(154, 77, 226, 0.5)",
              color: "rgb(154, 77, 226)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.95rem"
            }}
            onMouseEnter={e => {
              e.target.style.background = "rgb(154, 77, 226)";
              e.target.style.color = "white";
              e.target.style.borderColor = "rgb(154, 77, 226)";
            }}
            onMouseLeave={e => {
              e.target.style.background = "rgba(154, 77, 226, 0.15)";
              e.target.style.color = "rgb(154, 77, 226)";
              e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
            }}
            onClick={() => {
              setShowAssignConfirm(false);
              finalize().then((res) => {
                getStatus().then((res) => {
                  // Sort the teachers in the status by seniority rank
                  let modifiedRes = { ...res };
                  if (modifiedRes.values && modifiedRes.values.length > 0) {
                    modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
                  }
                  if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                    modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
                  }
                  setStatus({ values: [], submitted: [], ...modifiedRes });
                });
              });
              setTheoryAssignStatus(3);
              setStatus({ ...status, status: 3 });
            }}
          >
            <Icon path={mdiCheckCircle} size={0.85} />
            Yes, Assign
          </Button>
        </Modal.Footer>
      </Modal>

      {(parseInt(status.status) === 3) && (
        <div className="row">
          <div className="col-12 grid-margin">
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
                    <span style={{ marginRight: "12px" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    Assigned Teachers
                  </h4>
                </div>
                <div className="table-responsive">
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{
                        backgroundColor: "rgba(174, 117, 228, 0.08)",
                        borderBottom: "2px solid rgba(174, 117, 228, 0.1)"
                      }}>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 2V6" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 2V6" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 10H22" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Course ID
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Name
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Teacher 1
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Teacher 2
                        </th>
                        <th style={{
                          padding: "18px 20px",
                          color: "rgb(174, 117, 228)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          border: "none"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Teacher 3
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(status.assignment || parseInt(status.status) === 3 ?
                        (status.assignment || []).length > 0 ?
                          status.assignment :
                          // When status = 3 but no assignment data, show placeholder courses
                          [
                            { course_id: 'TBD', name: 'Courses will be loaded after assignment', teachers: [] }
                          ]
                        : []
                      ).map((course, index) => {
                        return (
                          <tr key={index} style={{
                            borderLeft: "3px solid transparent",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            transition: "all 0.2s ease"
                          }} className="hover-row">
                            <td style={{ padding: "15px 20px" }}> {course.course_id} </td>
                            <td style={{ padding: "15px 20px" }}> {course.name} </td>
                            {/* Teacher Dropdowns - Using loop for all three teachers */}
                            {[0, 1, 2].map((teacherIndex) => {
                              return (
                                <td key={teacherIndex}>
                                  <FormGroup>
                                    <Form.Select
                                      size="lg"
                                      style={{
                                        border: "1px solid " + (course.teachers && course.teachers[teacherIndex] ? "rgba(174, 117, 228, 0.5)" : "#e4e4e4"),
                                        borderRadius: "8px",
                                        background: course.teachers && course.teachers[teacherIndex] ? "linear-gradient(to right, rgba(182, 109, 255, 0.1), rgba(255, 255, 255, 0.9))" : "#fff",
                                        color: course.teachers && course.teachers[teacherIndex] ? "rgb(154, 77, 226)" : "#3e4b5b",
                                        boxShadow: course.teachers && course.teachers[teacherIndex] ? "0 4px 12px rgba(174, 117, 228, 0.1)" : "none",
                                        padding: "12px 16px",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease"
                                      }}
                                      className="custom-select-styled"
                                      value={(course.teachers && course.teachers[teacherIndex])
                                        ? `${course.teachers[teacherIndex].initial}|${course.teachers[teacherIndex].name}`
                                        : "None"}
                                      onChange={(e) => {
                                        const [newInitial, newName] = e.target.value.split("|");
                                        const oldInitial = course.teachers && course.teachers[teacherIndex]
                                          ? course.teachers[teacherIndex].initial
                                          : null;

                                        setTeacherAssignment({ course_id: course.course_id, initial: newInitial, old_initial: oldInitial })
                                          .then((res) => {
                                            setStatus((prev) => ({
                                              ...prev,
                                              assignment: prev.assignment.map((c, j) =>
                                                j === index
                                                  ? {
                                                    ...c,
                                                    teachers: c.teachers
                                                      ? [
                                                        ...c.teachers.slice(0, teacherIndex),
                                                        { initial: newInitial, name: newName },
                                                        ...c.teachers.slice(teacherIndex + 1)
                                                      ]
                                                      : [
                                                        ...(new Array(teacherIndex).fill(null)),
                                                        { initial: newInitial, name: newName }
                                                      ]
                                                  }
                                                  : c
                                              ),
                                            }));
                                          });
                                      }}
                                      disabled={parseInt(status.status) === 3 && !status.assignment}
                                    >
                                      <option value="None" style={{ fontWeight: "500" }}>Select Teacher</option>
                                      {allTeachers?.map(t => {
                                        return (
                                          <option key={t.initial} value={`${t.initial}|${t.name}`} style={{ padding: "8px" }}>
                                            {t.initial} - {t.name}
                                          </option>
                                        );
                                      })}
                                    </Form.Select>
                                  </FormGroup>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <Modal show={true} onHide={() => setShowConfirm(false)} centered>
          <Modal.Header closeButton style={{
            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
            color: "white",
            borderBottom: "none",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            padding: "1.25rem 1.5rem"
          }}>
            <Modal.Title style={{ color: "white", fontSize: "1.4rem", fontWeight: "600" }}>Confirm Action</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "1.5rem", fontSize: "1.05rem" }}>
            Are you sure you want to proceed with <b>{confirmAction}</b> for <b>{selectedTeacherRow?.name}</b> ({selectedTeacherRow?.initial})?
          </Modal.Body>
          <Modal.Footer style={{
            borderTop: "1px solid rgba(174, 117, 228, 0.2)",
            padding: "1.25rem 1.5rem"
          }}>
            <Button
              style={{
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "500",
                background: "rgba(108, 117, 125, 0.15)",
                border: "1px solid rgba(108, 117, 125, 0.5)",
                color: "rgb(108, 117, 125)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.95rem"
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgb(108, 117, 125)";
                e.target.style.color = "white";
                e.target.style.borderColor = "rgb(108, 117, 125)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(108, 117, 125, 0.15)";
                e.target.style.color = "rgb(108, 117, 125)";
                e.target.style.borderColor = "rgba(108, 117, 125, 0.5)";
              }}
              onClick={() => setShowConfirm(false)}
            >
              <Icon path={mdiClose} size={0.85} />
              Cancel
            </Button>
            <Button
              style={{
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "500",
                background: "rgba(154, 77, 226, 0.15)",
                border: "1px solid rgba(154, 77, 226, 0.5)",
                color: "rgb(154, 77, 226)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.95rem"
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgb(154, 77, 226)";
                e.target.style.color = "white";
                e.target.style.borderColor = "rgb(154, 77, 226)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(154, 77, 226, 0.15)";
                e.target.style.color = "rgb(154, 77, 226)";
                e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
              }}
              onClick={async () => {
                if (confirmAction === "Resend") {
                  try {
                    await resendTheoryPrefMail(selectedTeacherRow.initial);
                    toast.success("Resent email successfully");
                  } catch (err) {
                    toast.error("Failed to resend email");
                  }
                }
                setShowConfirm(false);
              }}
            >
              <Icon path={mdiReload} size={0.85} />
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

/*
Place this CSS in your main stylesheet (e.g., index.css or App.css):
.custom-width-modal .modal-dialog {
  max-width: 620px;
}

.hover-row:hover {
  background-color: rgba(174, 117, 228, 0.04);
  border-left: 3px solid rgb(174, 117, 228) !important;
}
*/
