import { useEffect, useRef, useState } from "react";
import { finalize, getStatus, initiate, setTeacherAssignment,resendTheoryPrefMail, saveReorderedTeacherPreference } from "../api/theory-assign";
import { toast } from "react-hot-toast";
import { getTeachers } from "../api/db-crud";
import { Alert, Button, Modal } from "react-bootstrap";
import { Form, FormGroup } from "react-bootstrap";
import CardWithButton from "../shared/CardWithButton";

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

  useEffect(() => {
    getStatus().then((res) => {
      setStatus({ values: [], submitted: [], ...res });
    });
    getTeachers().then((res) => {
      res = res.filter((t) => t.active === 1)
      setAllTeachers(res);
    })
  }, []);

  const selectedCourseRef = useRef();

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
              setStatus({ values: [], submitted: [], ...res });
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
                        <th> Action </th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.values.map((teacher, index) => (
                        <tr key={index}>
                          <td> {teacher.initial} </td>
                          <td> {teacher.name} </td>
                          <td> {teacher.email} </td>
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
                                      setStatus({ values: [], submitted: [], ...res });
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
                        <th> Action </th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.submitted.map((teacher, index) => (
                        <tr key={index}>
                          <td> {teacher.initial} </td>
                          <td> {teacher.name} </td>
                          <td> {teacher.email} </td>
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
              setStatus({ values: [], submitted: [], ...res });
            });
          }}
          size="md"
          centered
        >
          <Modal.Header closeButton>
            <h4>Theory Course Preference Selected By</h4>
            <h6 className="font-weight-light">
              {selectedTeacher.name} ({selectedTeacher.initial})
            </h6>
          </Modal.Header>
          <Modal.Body className="px-4">
            <form>
              <div className="row">
                <div className="col-12" style={{ padding: 10 }}>
                  <select
                    class="form-select"
                    multiple
                    aria-label="multiple select example"
                    style={{ height: 400, width: "100%" }}
                    ref={selectedCourseRef}
                  >
                    {selectedCourse.map((course) => (
                      <option value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row d-flex justify-content-between">
                <div className="col-3 " style={{ padding: 10 }}>
                  <div className="d-grid gap-2  mb-5">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="mb-2 btn-block"
                      onClick={(e) => {
                        const selectedOptions = Array.from(
                          selectedCourseRef.current.selectedOptions
                        ).map((option) => option.value);

                        setSelectedCourse(
                          selectedCourse.filter(
                            (course) => !selectedOptions.includes(course)
                          )
                        );

                        setSelectedCourse([
                          ...selectedOptions,
                          ...selectedCourse.filter(
                            (course) => !selectedOptions.includes(course)
                          ),
                        ]);
                        selectedCourseRef.current.selectedIndex = -1;
                      }}
                    >
                      Move Top
                    </Button>
                  </div>
                </div>
                <div className="col-3 " style={{ padding: 10 }}>
                  <div className="d-grid gap-2  mb-5">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="mb-2 btn-block"
                      onClick={(e) => {
                        const selectedOptions = Array.from(
                          selectedCourseRef.current.selectedOptions
                        ).map((option) => option.value);

                        const reorderedCourses = [...selectedCourse];

                        for (let i = 0; i < selectedOptions.length; i++) {
                          const index = reorderedCourses.findIndex(
                            (course) => course === selectedOptions[i]
                          );
                          if (index === 0) continue;
                          const temp = reorderedCourses[index];
                          reorderedCourses[index] = reorderedCourses[index - 1];
                          reorderedCourses[index - 1] = temp;
                        }
                        console.log(reorderedCourses);
                        setSelectedCourse(reorderedCourses);
                        selectedCourseRef.current.selectedIndex = Math.max(
                          0,
                          selectedCourseRef.current.selectedIndex - 1
                        );
                      }}
                    >
                      Move Up
                    </Button>
                  </div>
                </div>
                <div className="col-3 " style={{ padding: 10 }}>
                  <div className="d-grid gap-2  mb-5">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="mb-2 btn-block"
                      onClick={(e) => {
                        const selectedOptions = Array.from(
                          selectedCourseRef.current.selectedOptions
                        ).map((option) => option.value);
                        const reorderedCourses = [...selectedCourse];
                        for (let i = selectedOptions.length - 1; i >= 0; i--) {
                          const index = reorderedCourses.findIndex(
                            (course) => course === selectedOptions[i]
                          );
                          if (index === reorderedCourses.length - 1) continue;
                          const temp = reorderedCourses[index];
                          reorderedCourses[index] = reorderedCourses[index + 1];
                          reorderedCourses[index + 1] = temp;
                        }
                        setSelectedCourse(reorderedCourses);
                        selectedCourseRef.current.selectedIndex = Math.min(
                          selectedCourseRef.current.options.length - 1,
                          selectedCourseRef.current.selectedIndex + 1
                        );
                      }}
                    >
                      Move Down
                    </Button>
                  </div>
                </div>
                <div className="col-3 " style={{ padding: 10 }}>
                  <div className="d-grid gap-2  mb-5">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="mb-2 btn-block"
                      onClick={(e) => {
                        const selectedOptions = Array.from(
                          selectedCourseRef.current.selectedOptions
                        ).map((option) => option.value);
                        const reorderedCourses = [...selectedCourse];
                        for (let i = 0; i < selectedOptions.length; i++) {
                          const index = reorderedCourses.findIndex(
                            (course) => course === selectedOptions[i]
                          );
                          if (index === reorderedCourses.length - 1) continue;
                          const temp = reorderedCourses[index];
                          reorderedCourses[index] =
                            reorderedCourses[reorderedCourses.length - 1];
                          reorderedCourses[reorderedCourses.length - 1] = temp;
                        }
                        setSelectedCourse(reorderedCourses);
                        selectedCourseRef.current.selectedIndex = Math.min(
                          selectedCourseRef.current.options.length - 1,
                          selectedCourseRef.current.selectedIndex + 1
                        );
                      }}
                    >
                      Move Bottom
                    </Button>
                  </div>
                </div>
              </div>
            </form>
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
                      setStatus({ values: [], submitted: [], ...res });
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
                setStatus({ values: [], submitted: [], ...res });
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
        onClick={(e) => {
          finalize().then((res) => {
            getStatus().then((res) => {
              setStatus({ values: [], submitted: [], ...res });
            });
          });
        }}
      />

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
                        <th> Teachers </th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.assignment.map((course, index) => (
                        <tr key={index}>
                          <td> {course.course_id} </td>
                          <td> {course.name} </td>
                          <td>
                            <ul>
                              {(course.teachers ? course.teachers : []).map(
                                (teacher, i) => (
                                  <>
                                    <li>
                                      <div>
                                        {teacher.initial} - {teacher.name}
                                        <FormGroup>
                                          <Form.Select
                                            size="lg"
                                            onChange={(e) => {
                                              const [newInitial, newName] = e.target.value.split("|");
                                        
                                              setTeacherAssignment({ course_id: course.course_id, initial: newInitial, old_initial: teacher.initial })
                                                .then((res) => {
                                                  setStatus((prev) => ({
                                                    ...prev,
                                                    assignment: prev.assignment.map((c, j) =>
                                                      j === index
                                                        ? {
                                                            ...c,
                                                            teachers: c.teachers.map((t, k) =>
                                                              k === i ? { initial: newInitial, name: newName } : t
                                                            ),
                                                          }
                                                        : c
                                                    ),
                                                  }));
                                                });
                                            }}
                                          >
                                            <option value="None">Change Teacher</option>
                                            {allTeachers?.map(t => (
                                              <option value={`${t.initial}|${t.name}`}>{t.initial} - {t.name}</option>
                                            ))}
                                          </Form.Select>
                                        </FormGroup>
                                      </div>
                                    </li>
                                    
                                  </>
                                )
                              )}
                            </ul>
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
