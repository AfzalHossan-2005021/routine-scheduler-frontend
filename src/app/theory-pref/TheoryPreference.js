import { useEffect, useRef, useState } from "react";
import { finalize, getStatus, initiate, setTeacherAssignment,resendTheoryPrefMail, saveReorderedTeacherPreference } from "../api/theory-assign";
import { toast } from "react-hot-toast";
import { getTeachers } from "../api/db-crud";
import { Alert, Button, Modal } from "react-bootstrap";
import { Form, FormGroup } from "react-bootstrap";
import CardWithButton from "../shared/CardWithButton";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  const [allCourses, setAllCourses] = useState([]);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);

  useEffect(() => {
    getStatus().then((res) => {
      // Sort the teachers in the status by seniority rank
      let modifiedRes = {...res};
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

  const selectedCourseRef = useRef();

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

  // Add course to preference (at end)
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

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Theory Course Assign </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">Phases</li>
          </ol>
        </nav>
      </div>
      <CardWithButton
        title="Send Email with Form Link"
        subtitle="Initial Phase"
        status={status.status === 0 ? "Not Sent" : "Sent"}
        bgColor={status.status === 0 ? "danger" : "success"}
        icon={status.status === 0 ? "mdi-autorenew" : "mdi-check"}
        disabled={status.status !== 0}
        onClick={(e) => {
          initiate().then((res) => {
            getStatus().then((res) => {
              // Sort the teachers in the status by seniority rank
              let modifiedRes = {...res};
              if (modifiedRes.values && modifiedRes.values.length > 0) {
                modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
              }
              if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
              }
              setStatus({ values: [], submitted: [], ...modifiedRes });
            });
          });
        }}
      />

      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Yet to submit the form </h4>
              {status.values.length !== 0 && (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th> Initial </th>
                        <th> Name </th>
                        <th> Email </th>
                        <th> Seniority Rank </th>
                        <th> Action </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...status.values].sort((a, b) => a.seniority_rank - b.seniority_rank).map((teacher, index) => (
                        <tr key={index}>
                          <td> {teacher.initial} </td>
                          <td> {teacher.name} </td>
                          <td> {teacher.email} </td>
                          <td> {teacher.seniority_rank} </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setConfirmAction("Resend");
                                setSelectedTeacherRow(teacher);
                                setShowConfirm(true);
                              }}
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-sm ms-2"
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
                                      let modifiedRes = {...res};
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
                              Add Preference
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {status.values.length === 0 && status.status >= 2 && (
                <Alert variant="success text-center">
                  All submitted, waiting for next phase
                </Alert>
              )}
              {status.values.length === 0 && status.status === 0 && (
                <Alert variant="warning text-center">
                  Initialize the process to send email
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Already Submitted</h4>
              {status.submitted.length !== 0 && (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th> Initial </th>
                        <th> Name </th>
                        <th> Email </th>
                        <th> Seniority Rank </th>
                        <th> Action </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...status.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank).map((teacher, index) => (
                        <tr key={index}>
                          <td> {teacher.initial} </td>
                          <td> {teacher.name} </td>
                          <td> {teacher.email} </td>
                          <td> {teacher.seniority_rank} </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedTeacher({
                                  ...teacher,
                                });
                                setSelectedCourse(teacher.response);
                                console.log(selectedTeacher);
                              }}
                            >
                              Edit Preference
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {status.values.length === 0 && status.status === 0 && (
                <Alert variant="warning text-center">
                  Initialize the process to send email
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
              let modifiedRes = {...res};
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
          <Modal.Header closeButton>
            <h4>Theory Course Preference Selected By</h4>
            <h6 className="font-weight-light">
              {selectedTeacher.name} ({selectedTeacher.initial})
            </h6>
          </Modal.Header>
          <Modal.Body className="px-3">
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 540, padding: 6 }}>
                  <h6>Your Preference (Drag to reorder)</h6>
                  <Droppable droppableId="preference-list">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ border: '1px solid #ccc', borderRadius: 4, minHeight: 250, maxHeight: 350, overflowY: 'auto', padding: 6, background: '#fafafa', width: '100%' }}
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
                                  padding: 6,
                                  margin: '0 0 6px 0',
                                  background: snapshot.isDragging ? '#e0e0e0' : '#fff',
                                  border: '1px solid #aaa',
                                  borderRadius: 4,
                                  display: 'flex',
                                  alignItems: 'center',
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
          <Modal.Footer>
            <Button 
              variant="success" 
              className="me-auto"
              onClick={() => {
                saveReorderedTeacherPreference(selectedTeacher.initial, selectedCourse)
                  .then(() => {
                    // Refresh the status to show updated data
                    getStatus().then((res) => {
                      // Sort the teachers in the status by seniority rank
                      let modifiedRes = {...res};
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
              Save
            </Button>
            <Button variant="outline-dark" onClick={() => {
              setSelectedTeacher(null);
              getStatus().then((res) => {
                // Sort the teachers in the status by seniority rank
                let modifiedRes = {...res};
                if (modifiedRes.values && modifiedRes.values.length > 0) {
                  modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
                }
                if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                  modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
                }
                setStatus({ values: [], submitted: [], ...modifiedRes });
              });
            }}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <CardWithButton
        title="Assign Teachers according to Seniorty"
        subtitle="Final Phase"
        status={
          status.status === 0
            ? "Only Avaliable when somebody submitted"
            : status.status < 4
            ? "Click to Assign"
            : "This Phase is Completed"
        }
        bgColor={
          status.status === 0
            ? "secondary"
            : status.status < 4
            ? "info"
            : "success"
        }
        icon={
          status.status === 0
            ? "mdi-cancel"
            : status.status < 4
            ? "mdi-autorenew"
            : "mdi-check"
        }
        disabled={status.status === 0}
        onClick={() => setShowAssignConfirm(true)}
      />
      <Modal show={showAssignConfirm} onHide={() => setShowAssignConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to assign Teachers?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowAssignConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            setShowAssignConfirm(false);
            finalize().then((res) => {
              getStatus().then((res) => {
                // Sort the teachers in the status by seniority rank
              let modifiedRes = {...res};
              if (modifiedRes.values && modifiedRes.values.length > 0) {
                modifiedRes.values = [...modifiedRes.values].sort((a, b) => a.seniority_rank - b.seniority_rank);
              }
              if (modifiedRes.submitted && modifiedRes.submitted.length > 0) {
                modifiedRes.submitted = [...modifiedRes.submitted].sort((a, b) => a.seniority_rank - b.seniority_rank);
              }
              setStatus({ values: [], submitted: [], ...modifiedRes });
              });
            });
          }}>
            Yes, Assign
          </Button>
        </Modal.Footer>
      </Modal>

      {status.assignment && (
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Assigned Teachers</h4>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th> Course ID </th>
                        <th> Name </th>
                        <th> Teacher 1 </th>
                        <th> Teacher 2 </th>
                        <th> Teacher 3 </th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.assignment.map((course, index) => (
                        <tr key={index}>
                          <td> {course.course_id} </td>
                          <td> {course.name} </td>
                          {/* Teacher Dropdowns - Using loop for all three teachers */}
                          {[0, 1, 2].map((teacherIndex) => (
                            <td key={teacherIndex}>
                              <FormGroup>
                                <Form.Select
                                  size="lg"
                                  style={{
                                    border: "1px solid #e4e4e4",
                                    borderRadius: "4px",
                                    background: course.teachers && course.teachers[teacherIndex] ? "linear-gradient(to right, rgba(182, 109, 255, 0.1), rgba(255, 255, 255, 0.9))" : "#fff",
                                    color: "#3e4b5b",
                                    boxShadow: "none",
                                    padding: "10px 15px",
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
                                >
                                  <option value="None" style={{fontWeight: "500"}}>Select Teacher</option>
                                  {allTeachers?.map(t => (
                                    <option key={t.initial} value={`${t.initial}|${t.name}`} style={{padding: "8px"}}>
                                      {t.initial} - {t.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </FormGroup>
                            </td>
                          ))}
                        </tr>
                      ))}
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
          <Modal.Header closeButton>
            <Modal.Title>Confirm Action</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to proceed with <b>{confirmAction}</b> for <b>{selectedTeacherRow?.name}</b> ({selectedTeacherRow?.initial})?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={async () => {
              if (confirmAction === "Resend") {
                try {
                  await resendTheoryPrefMail(selectedTeacherRow.initial);
                  toast.success("Resent email successfully");
                } catch (err) {
                  toast.error("Failed to resend email");
                }
              }
              setShowConfirm(false);
            }}>
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
*/
