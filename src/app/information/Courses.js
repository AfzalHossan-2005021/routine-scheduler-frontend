import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";

import { toast } from "react-hot-toast";
import {
  addCourse,
  deleteCourse,
  editCourse,
  getCourses,
  getSections,
} from "../api/db-crud";
import {
  getDepartments,
  getAllLevelTermsName,
  getHostedDepartments,
} from "../api/academic-config";
import ConfirmationModal from "../shared/ConfirmationModal";

const validateCourse = (course) => {
  if (course.course_id === "") {
    return "Course ID cannot be empty";
  }
  if (course.name === "") {
    return "Course Name cannot be empty";
  }
  if (course.type === "") {
    return "Type cannot be empty";
  }
  if (course.class_per_week === "") {
    return "Credit cannot be empty";
  }
  if (course.class_per_week <= 0) {
    return "Credit must be a positive number";
  }
  if (course.level === "") {
    return "Level cannot be empty";
  }
  if (course.from === "") {
    return "From cannot be empty";
  }
  if (course.to === "") {
    return "To cannot be empty";
  }
  if (course.from !== "CSE" && course.to !== "CSE") {
    return "Offering or Host Department must be CSE";
  }
  return null;
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [allHostedDepartments, setAllHostedDepartments] = useState([]);
  const [allDepartmentNames, setAllDepartmentNames] = useState([]);
  const [allLevelTermNames, setAllLevelTermNames] = useState([]);
  const [allSections, setAllSections] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [addNewCourse, setAddNewCourse] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({
    title: "",
    body: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
    onCancel: () => {},
    confirmIcon: "mdi-delete",
    red: 220,
    green: 53,
    blue: 69,
  });

  const handleShowConfirmation = (
    title,
    body,
    confirmText,
    cancelText,
    onConfirm,
    confirmIcon,
    red,
    green,
    blue
  ) => {
    setConfirmationDetails({
      title,
      body,
      confirmText,
      cancelText,
      onConfirm,
      confirmIcon,
      red,
      green,
      blue,
    });
    setShowConfirmation(true);
  };

  const handleHideConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleDelete = (course_id) => {
    handleShowConfirmation(
      "Delete course",
      `Are you sure you want to delete ${course_id}?`,
      "Delete",
      "Cancel",
      async () => {
        try {
          deleteCourse(course_id).then((res) => {
            toast.success("Course deleted successfully");
            setCourses((prevCourses) =>
              prevCourses.filter((c) => c.course_id !== course_id)
            );
          });
        } catch (error) {
          console.error("Error deleting level term:", error);
          toast.error(`Failed to delete ${course_id}`);
        }
      },
      "mdi-delete",
      220,
      53,
      69
    );
  };

  useEffect(() => {
    getCourses().then((res) => {
      setCourses(res);
    });
    getHostedDepartments().then((res) => {
      setAllHostedDepartments(res);
    });
    getDepartments().then((res) => {
      setAllDepartmentNames(res);
    });
    getAllLevelTermsName().then((res) => {
      setAllLevelTermNames(res);
    });
    // Fetch all sections for course-section assignment
    getSections().then((res) => {
      setAllSections(res || []);
    }).catch(error => {
      console.error('Error fetching sections:', error);
    });
  }, []);

  return (
    <div>
      {/* Modern Page Header */}
      <div className="page-header">
        <h3 className="page-title">
          <div className="page-title-icon-container mdi mdi-book-open-page-variant"></div>
          Course Information
        </h3>
        <nav aria-label="breadcrumb">
          <ol
            className="breadcrumb"
            style={{ marginBottom: "0", background: "transparent" }}
          >
            <li
              className="breadcrumb-item"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              <a
                href="!#"
                onClick={(event) => event.preventDefault()}
                style={{
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                }}
              >
                Information
              </a>
            </li>
            <li
              className="breadcrumb-item active"
              aria-current="page"
              style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}
            >
              Courses
            </li>
          </ol>
        </nav>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-view">
              <div className="card-control-container">
                <h4 className="card-name">
                  <div className="card-icon mdi mdi-book-open-page-variant"></div>
                  Course Management
                </h4>
                <div className="card-control-button-container">
                  <button
                    className="card-control-button mdi mdi-plus-circle"
                    onClick={(e) => {
                      setAddNewCourse(true);
                      setSelectedCourse({
                        course_id: "",
                        name: "",
                        type: 0,
                        class_per_week: 0,
                        from: "",
                        to: "",
                        teacher_credit: 0,
                        level_term: "",
                        assignedSections: [],
                      });
                    }}
                  >
                    Add New Course
                  </button>
                </div>
              </div>
              <div className="card-table-container table-responsive">
                <table className="card-table table">
                  <thead className="card-table-header">
                    <tr>
                      <th className="sticky-col">
                        <i className="mdi mdi-notebook"></i>
                        Course ID
                      </th>
                      <th>
                        <i className="mdi mdi-book-open-page-variant"></i>
                        Course Name
                      </th>
                      <th>
                        <i className="mdi mdi-format-list-bulleted-type"></i>
                        Type
                      </th>
                      <th>
                        <i className="mdi mdi-school"></i>
                        Level/Term
                      </th>
                      <th>
                        <i className="mdi mdi-office-building"></i>
                        Offering From
                      </th>
                      <th>
                        <i className="mdi mdi-office-building"></i>
                        Offering To
                      </th>
                      <th>
                        <i className="mdi mdi-clock"></i>
                        Credit
                      </th>
                      <th>
                        <i className="mdi mdi-cog"></i>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="card-table-body">
                    {courses.map((course, index) => (
                      <tr key={index}>
                        <td
                          className="sticky-col"
                          style={{ textAlign: "center" }}
                        >
                          {course.course_id}
                        </td>
                        <td> {course.name} </td>
                        <td style={{ textAlign: "center" }}>
                          {course.type === 0 ? "Theory" : "Sessional"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {course.level_term}
                        </td>
                        <td style={{ textAlign: "center" }}> {course.from} </td>
                        <td style={{ textAlign: "center" }}> {course.to} </td>
                        <td style={{ textAlign: "center" }}>
                          {course.class_per_week}
                        </td>
                        <td>
                          <div className="d-flex">
                            <button
                              className="edit mdi mdi-pencil"
                              onClick={() => {
                                setSelectedCourse(course);
                                setSelectedCourse((prev) => ({
                                  ...prev,
                                  course_id_old: course.course_id,
                                }));
                              }}
                            ></button>
                            <button
                              className="delete mdi mdi-delete-outline"
                              onClick={() => handleDelete(course.course_id)}
                            ></button>
                          </div>
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
      {selectedCourse !== null && (
        <Modal
          show={true}
          onHide={() => setSelectedCourse(null)}
          size="md"
          centered
          contentClassName="modal-content"
          backdrop="static"
        >
          <Modal.Header className="modal-header">
            <Modal.Title className="modal-header-content">
              <div className="modal-header-icon">
                <i className="mdi mdi-book-open-page-variant"></i>
              </div>
              <h4 className="modal-title">
                {addNewCourse ? "Add" : "Edit"} Course
              </h4>
            </Modal.Title>
            <button
              className="modal-header-close-button mdi mdi-close"
              onClick={() => setSelectedCourse(null)}
            ></button>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <div className="modal-body-content-container">
              <Form className="px-2 py-1">
                <Row>
                  <Col md={6} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label className="form-label">Course ID</Form.Label>
                      <FormControl
                        type="text"
                        className="form-control"
                        placeholder="Enter Course ID"
                        value={selectedCourse.course_id}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            course_id: e.target.value,
                          })
                        }
                        disabled={!!selectedCourse.course_id_old}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label className="form-label">Credit</Form.Label>
                      <FormControl
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1.5"
                        value={selectedCourse.class_per_week}
                        onChange={(e) => {
                          setSelectedCourse({
                            ...selectedCourse,
                            class_per_week: Number.parseInt(
                              e.target.value || "0"
                            ),
                          });
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label className="form-label">
                        Course Name
                      </Form.Label>
                      <FormControl
                        type="text"
                        className="form-control"
                        placeholder="Enter Course Name"
                        value={selectedCourse.name}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            name: e.target.value,
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label className="form-label">Type</Form.Label>
                      <br />
                      <Form.Select
                        className="form-select"
                        value={selectedCourse.type}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            type: e.target.value === "0" ? 0 : 1,
                          })
                        }
                      >
                        <option value="0">Theory</option>
                        <option value="1">Sessional</option>
                      </Form.Select>
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label className="form-label">Level-Term</Form.Label>
                      <Form.Select
                        className="form-select"
                        value={selectedCourse.level_term}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            level_term: e.target.value || "",
                          })
                        }
                      >
                        <option value="">Select Level-Term</option>
                        {allLevelTermNames && allLevelTermNames.length > 0 ? (
                          allLevelTermNames.map((levelTerm, i) => (
                            <option key={i} value={levelTerm}>
                              {levelTerm}
                            </option>
                          ))
                        ) : (
                          <option disabled>No level-terms available</option>
                        )}
                      </Form.Select>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label className="form-label">
                        Offering From
                      </Form.Label>
                      <Form.Select
                        className="form-select"
                        value={selectedCourse.from}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            from: e.target.value || "CSE",
                          })
                        }
                      >
                        <option value="">Select Department</option>
                        {allHostedDepartments &&
                        allHostedDepartments.length > 0 ? (
                          allHostedDepartments.map((dept, i) => (
                            <option key={i} value={dept}>
                              {dept}
                            </option>
                          ))
                        ) : (
                          <option disabled>No departments available</option>
                        )}
                      </Form.Select>
                    </FormGroup>
                  </Col>
                  <Col md={6} className="px-2 py-1 d-flex align-items-center">
                    <FormGroup>
                      <Form.Label className="form-label">
                        Offering To
                      </Form.Label>
                      <Form.Select
                        className="form-select"
                        value={selectedCourse.to}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            to: e.target.value || "CSE",
                          })
                        }
                      >
                        <option value="">Select Department</option>
                        {allDepartmentNames && allDepartmentNames.length > 0 ? (
                          allDepartmentNames.map((dept, i) => (
                            <option key={i} value={dept}>
                              {dept}
                            </option>
                          ))
                        ) : (
                          <option disabled>No departments available</option>
                        )}
                      </Form.Select>
                    </FormGroup>
                  </Col>
                </Row>
                {/* Show section assignment for both Theory and Sessional courses */}
                <Row>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label className="form-label">
                        Assign to Sections {selectedCourse.type === 0 ? "(Theory)" : "(Sessional)"}
                      </Form.Label>
                        <Form.Select
                          multiple
                          className="form-select"
                          value={selectedCourse.assignedSections || []}
                          onChange={(e) => {
                            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedCourse({
                              ...selectedCourse,
                              assignedSections: selectedValues,
                            });
                          }}
                          style={{ minHeight: '100px' }}
                        >
                          {allSections && allSections.length > 0 ? (
                            allSections
                              .filter(section => 
                                section.level_term === selectedCourse.level_term && 
                                section.department === selectedCourse.to
                              )
                              .map((section, i) => (
                                <option 
                                  key={i} 
                                  value={`${section.batch}-${section.section}`}
                                >
                                  Batch: {section.batch}, Section: {section.section}
                                </option>
                              ))
                          ) : (
                            <option disabled>No sections available</option>
                          )}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Hold Ctrl (Cmd on Mac) to select multiple sections
                        </Form.Text>
                      </FormGroup>
                    </Col>
                  </Row>
              </Form>
            </div>
            <div className="modal-divider"></div>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <button
              className="card-control-button mdi mdi-close"
              onClick={() => setSelectedCourse(null)}
            >
              Close
            </button>
            <button
              className="card-control-button mdi mdi-content-save"
              onClick={() => {
                const result = validateCourse(selectedCourse);
                if (result === null) {
                  if (addNewCourse) {
                    console.log('DEBUG Frontend: Adding course data:', selectedCourse);
                    addCourse(selectedCourse)
                      .then((res) => {
                        if (
                          res.message &&
                          res.message.includes("Successfully Saved")
                        ) {
                          getCourses().then((res) => {
                            setCourses(res);
                            setSelectedCourse(null);
                            toast.success("Course added successfully");
                          });
                        } else {
                          setSelectedCourse(null);
                          toast.error("Failed to add course: " + res.message);
                        }
                      })
                      .catch(console.log);
                  } else {
                    console.log("In edit course.");
                    editCourse(selectedCourse.course_id, selectedCourse)
                      .then((res) => {
                        if (
                          res.message &&
                          res.message.includes("Successfully Updated")
                        ) {
                          getCourses().then((res) => {
                            setCourses(res);
                            setSelectedCourse(null);
                            toast.success("Course updated successfully");
                          });
                        } else {
                          setSelectedCourse(null);
                          toast.error(
                            "Failed to update course: " + res.message
                          );
                        }
                      })
                      .catch(console.log);
                  }
                  setSelectedCourse(null);
                } else toast.error(result);
              }}
            >
              Save
            </button>
          </Modal.Footer>
        </Modal>
      )}
      <ConfirmationModal
        show={showConfirmation}
        onHide={handleHideConfirmation}
        title={confirmationDetails.title}
        body={confirmationDetails.body}
        confirmText={confirmationDetails.confirmText}
        cancelText={confirmationDetails.cancelText}
        onConfirm={() => {
          confirmationDetails.onConfirm();
          handleHideConfirmation();
        }}
        onCancel={handleHideConfirmation}
        confirmIcon={confirmationDetails.confirmIcon}
        red={confirmationDetails.red}
        green={confirmationDetails.green}
        blue={confirmationDetails.blue}
      />
    </div>
  );
}
