import { useEffect } from "react";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";
import { toast } from "react-hot-toast";
import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher,
} from "../api/db-crud";

const initial_regex = /^[A-Z]{2,6}$/;
const email_regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

const validate = (teacher) => {
  if (teacher.initial === "") {
    return "Initial cannot be empty";
  }
  if (teacher.name === "") {
    return "Name cannot be empty";
  }
  if (teacher.surname === "") {
    return "Surname cannot be empty";
  }
  if (teacher.email === "") {
    return "Email cannot be empty";
  }
  if (teacher.seniority_rank === "") {
    return "Seniority Rank cannot be empty";
  }
  if (teacher.theory_courses === "") {
    return "Theory Courses cannot be empty";
  }
  if (teacher.sessional_courses === "") {
    return "Sessional Courses cannot be empty";
  }
  if (!email_regex.test(teacher.email)) {
    return "Invalid email";
  }
  if (!initial_regex.test(teacher.initial)) {
    return "Invalid initial";
  }
  return null;
};

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    getTeachers().then((res) => {
      // Sort teachers by seniority rank (lower rank means more senior)
      const sortedTeachers = [...res].sort((a, b) => a.seniority_rank - b.seniority_rank);
      setTeachers(sortedTeachers);
    });
  }, []);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleteTeacherSelected, setDeleteTeacherSelected] = useState(null);

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Teacher Information </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="!#" onClick={(event) => event.preventDefault()}>
                Database
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
              <h4 className="card-title float-right">
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={(e) => {
                    setSelectedTeacher({
                      initial: "",
                      name: "",
                      surname: "",
                      email: "",
                      seniority_rank: 0,
                      active: 1,
                      theory_courses: 0,
                      sessional_courses: 0,
                      designation: "",
                      full_time_status: false,
                      offers_thesis_1: false,
                      offers_thesis_2: false,
                      offers_msc: false,
                      teacher_credits_offered: 0,
                      prev_initial: "",
                    });
                  }}
                >
                  Add New Teacher
                </button>
              </h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th> Initial </th>
                      <th> Name </th>
                      <th> Surname </th>
                      <th> Email </th>
                      <th> Seniority Rank </th>
                      <th> Active </th>
                      <th> Theory Courses </th>
                      <th> Sessional Courses </th>
                      <th>Designation</th>
                      <th>Fulll time status</th>
                      <th>Offer Thesis 1</th>
                      <th>Offer Thesis 2</th>
                      <th>Offer MSC</th>
                      <th>Teacher credits offered</th>
                      <th> Action </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers
                      .slice() // copy array to avoid mutating state
                      .sort((a, b) => a.seniority_rank - b.seniority_rank)
                      .map((teacher, sortedIndex) => {
                        // Find the actual index in the teachers array for updating state
                        const index = teachers.findIndex(
                          (t) => t.initial === teacher.initial
                        );
                        return (
                          <tr key={teacher.initial}>
                            <td style={{ minWidth: "120px" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ minWidth: "110px", width: "100%" }}
                                value={teacher.initial}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].initial = e.target.value;
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      initial: e.target.value
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "140px" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ minWidth: "130px", width: "100%" }}
                                value={teacher.name}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].name = e.target.value;
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      name: e.target.value
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "140px" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ minWidth: "130px", width: "100%" }}
                                value={teacher.surname}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].surname = e.target.value;
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      surname: e.target.value
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "200px" }}>
                              <input
                                type="email"
                                className="form-control form-control-sm"
                                style={{ minWidth: "190px", width: "100%" }}
                                value={teacher.email}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].email = e.target.value;
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      email: e.target.value
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "80px" }}>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ minWidth: "70px", width: "100%" }}
                                value={teacher.seniority_rank}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].seniority_rank = Number(e.target.value);
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      seniority_rank: Number(e.target.value)
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "60px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={teacher.active === 1 || teacher.active === true}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].active = e.target.checked ? 1 : 0;
                                  setTeachers(newTeachers);
                                  updateTeacher(teacher.prev_initial || teacher.initial, {
                                    ...teacher,
                                    active: e.target.checked ? 1 : 0
                                  })
                                    .then(() => toast.success("Teacher updated successfully"))
                                    .catch(console.log);
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "80px" }}>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ minWidth: "70px", width: "100%" }}
                                value={teacher.theory_courses}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].theory_courses = Number(e.target.value);
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      theory_courses: Number(e.target.value)
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "80px" }}>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ minWidth: "70px", width: "100%" }}
                                value={teacher.sessional_courses}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].sessional_courses = Number(e.target.value);
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      sessional_courses: Number(e.target.value)
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "120px" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ minWidth: "110px", width: "100%" }}
                                value={teacher.designation}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].designation = e.target.value;
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      designation: e.target.value
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "90px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={teacher.full_time_status === true}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].full_time_status = e.target.checked;
                                  setTeachers(newTeachers);
                                  updateTeacher(teacher.prev_initial || teacher.initial, {
                                    ...teacher,
                                    full_time_status: e.target.checked
                                  })
                                    .then(() => toast.success("Teacher updated successfully"))
                                    .catch(console.log);
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "90px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={teacher.offers_thesis_1 === true}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].offers_thesis_1 = e.target.checked;
                                  setTeachers(newTeachers);
                                  updateTeacher(teacher.prev_initial || teacher.initial, {
                                    ...teacher,
                                    offers_thesis_1: e.target.checked
                                  })
                                    .then(() => toast.success("Teacher updated successfully"))
                                    .catch(console.log);
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "90px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={teacher.offers_thesis_2 === true}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].offers_thesis_2 = e.target.checked;
                                  setTeachers(newTeachers);
                                  updateTeacher(teacher.prev_initial || teacher.initial, {
                                    ...teacher,
                                    offers_thesis_2: e.target.checked
                                  })
                                    .then(() => toast.success("Teacher updated successfully"))
                                    .catch(console.log);
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "90px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={teacher.offers_msc === true}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].offers_msc = e.target.checked;
                                  setTeachers(newTeachers);
                                  updateTeacher(teacher.prev_initial || teacher.initial, {
                                    ...teacher,
                                    offers_msc: e.target.checked
                                  })
                                    .then(() => toast.success("Teacher updated successfully"))
                                    .catch(console.log);
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "100px" }}>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ minWidth: "90px", width: "100%" }}
                                value={teacher.teacher_credits_offered}
                                onChange={e => {
                                  const newTeachers = [...teachers];
                                  newTeachers[index].teacher_credits_offered = Number(e.target.value);
                                  setTeachers(newTeachers);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateTeacher(teacher.prev_initial || teacher.initial, {
                                      ...teacher,
                                      teacher_credits_offered: Number(e.target.value)
                                    })
                                      .then(() => toast.success("Teacher updated successfully"))
                                      .catch(console.log);
                                  }
                                }}
                              />
                            </td>
                            <td style={{ minWidth: "120px" }}>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm ml-2"
                                onClick={() => setDeleteTeacherSelected(teacher.initial)}
                              >
                                Delete
                              </button>
                            </td>
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

      {selectedTeacher !== null && (
        <Modal
          show={true}
          onHide={() => setSelectedTeacher(null)}
          size="md"
          centered
        >
          <Modal.Header closeButton>
            {selectedTeacher.prev_initial === "" ? "Add" : "Edit"} Teacher
          </Modal.Header>
          <Modal.Body className="px-4">
            <Form className="px-2 py-1">
              <Row>
                <Col md={4} className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Initial</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Initial"
                      value={selectedTeacher.initial}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          initial: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Name</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Name"
                      value={selectedTeacher.name}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          name: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={4} className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Surname</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Surname"
                      value={selectedTeacher.surname}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          surname: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Email</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Email"
                      value={selectedTeacher.email}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          email: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Seniority Rank</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Seniority Rank"
                      value={selectedTeacher.seniority_rank}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          seniority_rank: Number.parseInt(
                            e.target.value || "0"
                          ),
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1 d-flex align-items-center">
                  {/* Currently Active Checkbox */}
                  <div className="form-check">
                    <label className="form-check-label">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTeacher.active}
                        onChange={(e) =>
                          setSelectedTeacher({
                            ...selectedTeacher,
                            active: e.target.checked ? 1 : 0,
                          })
                        }
                      />
                      <i className="input-helper"></i>
                      Active
                    </label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Theory Courses</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Number Theory Courses to take"
                      value={selectedTeacher.theory_courses}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          theory_courses: Number.parseInt(
                            e.target.value || "0"
                          ),
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Sessional Courses</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Number Sessional Courses to take"
                      value={selectedTeacher.sessional_courses}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          sessional_courses: Number.parseInt(
                            e.target.value || "0"
                          ),
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Designation</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Designation"
                      value={selectedTeacher.designation}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          designation: e.target.value || "",
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1 d-flex align-items-center">
                  {/* Currently Active Checkbox */}
                  <div className="form-check">
                    <label className="form-check-label">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTeacher.full_time_status}
                        onChange={(e) =>
                          setSelectedTeacher({
                            ...selectedTeacher,
                            full_time_status: e.target.checked ? true : false,
                          })
                        }
                      />
                      <i className="input-helper"></i>
                      Full Time Status : {selectedTeacher.full_time_status ? "FULL" : "PART"}
                    </label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col className="px-2 py-1 d-flex align-items-center">
                  {/* Currently Active Checkbox */}
                  <div className="form-check">
                    <label className="form-check-label">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTeacher.offer_thesis_1}
                        onChange={(e) =>
                          setSelectedTeacher({
                            ...selectedTeacher,
                            offer_thesis_1: e.target.checked ? true : false,
                          })
                        }
                      />
                      <i className="input-helper"></i>
                      Offer Thesis 1 : {selectedTeacher.offers_thesis_1 ? "YES" : "NO"}
                    </label>
                  </div>
                </Col>
                <Col className="px-2 py-1 d-flex align-items-center">
                  {/* Currently Active Checkbox */}
                  <div className="form-check">
                    <label className="form-check-label">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTeacher.offers_thesis_2}
                        onChange={(e) =>
                          setSelectedTeacher({
                            ...selectedTeacher,
                            offers_thesis_2: e.target.checked ? true : false,
                          })
                        }
                      />
                      <i className="input-helper"></i>
                      Offer Thesis 2: {selectedTeacher.offers_thesis_2 ? "YES" : "NO"}
                    </label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="px-2 py-1">
                  <FormGroup>
                    <Form.Label>Teacher Credits Offered</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter credits"
                      value={selectedTeacher.teacher_credits_offered}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          teacher_credits_offered: e.target.value || "",
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1 d-flex align-items-center">
                  {/* Currently Active Checkbox */}
                  <div className="form-check">
                    <label className="form-check-label">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTeacher.offers_msc}
                        onChange={(e) =>
                          setSelectedTeacher({
                            ...selectedTeacher,
                            offers_msc: e.target.checked ? true : false,
                          })
                        }
                      />
                      <i className="input-helper"></i>
                      Offer MSC : {selectedTeacher.offers_msc ? "YES" : "NO"}
                    </label>
                  </div>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-dark"
              onClick={() => setSelectedTeacher(null)}
            >
              Close
            </Button>
            <Button
              variant="success"
              onClick={(e) => {
                e.preventDefault();
                const result = validate(selectedTeacher);
                if (result === null) {
                  if (selectedTeacher.prev_initial === "") {
                    createTeacher(selectedTeacher)
                      .then((res) => {
                        const updatedTeachers = [...teachers, selectedTeacher];
                        // Maintain sorting by seniority rank after adding a teacher
                        setTeachers(updatedTeachers.sort((a, b) => a.seniority_rank - b.seniority_rank));
                        toast.success("Teacher added successfully");
                      })
                      .catch(console.log);
                  } else {
                    updateTeacher(selectedTeacher.prev_initial, selectedTeacher)
                      .then((res) => {
                        const index = teachers.findIndex(
                          (t) => t.initial === selectedTeacher.prev_initial
                        );
                        const newTeachers = [...teachers];
                        newTeachers[index] = selectedTeacher;
                        // Maintain sorting by seniority rank after updating a teacher
                        setTeachers(newTeachers.sort((a, b) => a.seniority_rank - b.seniority_rank));
                        toast.success("Teacher updated successfully");
                      })
                      .catch(console.log);
                  }
                  setSelectedTeacher(null);
                } else toast.error(result);
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal
        show={deleteTeacherSelected !== null}
        onHide={() => setDeleteTeacherSelected(null)}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          Delete Teacher: {deleteTeacherSelected}
        </Modal.Header>
        <Modal.Body className="px-4">
          <p>Are you sure you want to delete this teacher?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-dark"
            onClick={() => {
              setDeleteTeacherSelected(null);
            }}
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={(e) => {
              deleteTeacher(deleteTeacherSelected)
                .then((res) => {
                  setDeleteTeacherSelected(null);
                  setTeachers(
                    teachers.filter((t) => t.initial !== deleteTeacherSelected)
                  );
                  toast.success("Teacher deleted successfully");
                })
                .catch(console.log);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}