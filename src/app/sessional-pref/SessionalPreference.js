import { useEffect, useRef } from "react";
import { useState } from "react";
import { finalizeSessional as finalize, getSessionalStatus as getStatus, initiateSessional as initiate, setTeacherSessionalAssignment } from "../api/theory-assign";
import { getTeachers } from "../api/db-crud";
import { Alert, Button, Modal, FormGroup, Form } from "react-bootstrap";
import CardWithButton from "../shared/CardWithButton";

export default function SessionalPreference() {
  const [status, setStatus] = useState({
    status: 0,
    values: [],
    submitted: [],
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);

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
        })
  }, []);

  const selectedCourseRef = useRef();
  
  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Sessional Course Assign </h3>
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
                                console.log("RESEND");
                                }}
                            >
                              Resend
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
                                // console.log(teacher.response);
                              }}
                            >
                              Show
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
          onHide={() => setSelectedTeacher(null)}
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
            <Button variant="outline-dark">Close</Button>
          </Modal.Footer>
        </Modal>
      )}

      <CardWithButton
        title="Assign Teachers according to Seniorty"
        subtitle="Final Phase"
        status={
          status.status < 2
            ? "Only Avaliable when everybody submitted"
            : status.status === 2
            ? "Click to Assign and Finalize"
            : "This Phase is Completed"
        }
        bgColor={
          status.status < 2
            ? "secondary"
            : status.status === 2
            ? "info"
            : "success"
        }
        icon={
          status.status < 2
            ? "mdi-cancel"
            : status.status === 2
            ? "mdi-autorenew"
            : "mdi-check"
        }
        disabled={status.status !== 2}
        onClick={(e) => {
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
                      {status.assignment.map((course, cindex) => (
                        <tr key={cindex}>
                          <td> {course.course_id} </td>
                          <td> {course.name} </td>
                          <td>
                              {course.teachers && [...new Set(course.teachers.map(t => t.section))].sort().map((section, index) => (<>
                                <strong>{section}</strong><br/>
                                <ul>
                                  {course.teachers.filter(teacher => teacher.section === section).map((teacher, i) => (
                                  
                                  // <li>{teacher.name} ({teacher.initial})</li>
                                  <li key={i}>
                                  <div>
                                    {teacher.initial} - {teacher.name}
                                    <FormGroup>
                                      <Form.Select
                                        size="lg"
                                        onChange={(e) => {
                                          const [newInitial, newName] = e.target.value.split("|");
                                
                                          setTeacherSessionalAssignment({
                                            course_id: course.course_id,
                                            initial: newInitial,
                                            section: section,
                                            old_initial: teacher.initial, // Ensure API supports this
                                          }).then((res) => {
                                            setStatus((prev) => ({
                                              ...prev,
                                              assignment: prev.assignment.map((c, j) =>
                                                j === cindex
                                                  ? {
                                                      ...c,
                                                      teachers: c.teachers.map((t) =>
                                                        t.initial === teacher.initial && t.section === section
                                                          ? { initial: newInitial, name: newName, section: t.section }
                                                          : t
                                                      ),
                                                    }
                                                  : c
                                              ),
                                            }));
                                          });
                                        }}
                                      >
                                        <option value="None">Change Teacher</option>
                                        {allTeachers?.map((t) => (
                                          <option key={t.initial} value={`${t.initial}|${t.name}`}>
                                            {t.initial} - {t.name}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </FormGroup>
                                  </div>
                                </li>  
                                  
                                )
                                  )}
                                </ul> 
                              </>))}
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
    </div>
  );
}