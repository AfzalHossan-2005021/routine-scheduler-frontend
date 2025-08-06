import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";

import { toast } from "react-hot-toast";
import {
  addCourse,
  deleteCourse,
  editCourse,
  getCourses,
  getActiveCourseIds,
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
  const [activeCourseIds, setActiveCourseIds] = useState(new Set());
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
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
          await deleteCourse(course_id);
          toast.success("Course deleted successfully");
          // Reload all course data from server after successful deletion
          await reloadCourseData();
        } catch (error) {
          console.error("Error deleting course:", error);
          toast.error(`Failed to delete ${course_id}`);
        }
      },
      "mdi-delete",
      220,
      53,
      69
    );
  };

  // Function to update displayed courses based on the toggle
  const updateDisplayedCourses = () => {
    console.log('updateDisplayedCourses called:', { 
      showActiveOnly, 
      coursesLength: courses.length, 
      activeCourseIdsSize: activeCourseIds.size,
      activeCourseIds: Array.from(activeCourseIds)
    });
    
    if (showActiveOnly) {
      // Filter courses to show only those that exist in the courses table
      const filteredCourses = courses.filter(course => {
        const isActive = activeCourseIds.has(course.course_id);
        console.log(`Course ${course.course_id}: ${isActive ? 'ACTIVE' : 'NOT ACTIVE'}`);
        return isActive;
      });
      console.log('Filtered courses:', filteredCourses.length);
      setDisplayedCourses(filteredCourses);
    } else {
      // Show all courses from all_courses table
      console.log('Showing all courses:', courses.length);
      setDisplayedCourses(courses);
    }
  };

  // Handle toggle between active and all courses
  const handleToggleChange = (showActive) => {
    setShowActiveOnly(showActive);
  };

  // Centralized function to reload all course data
  const reloadCourseData = async () => {
    try {
      console.log('Reloading course data...');
      
      // Fetch all courses (from all_courses table) - this is the main dataset
      const coursesRes = await getCourses();
      console.log('All courses fetched:', coursesRes);
      setCourses(coursesRes);
      
      // Fetch active course IDs (from courses table) for filtering
      const activeCoursesRes = await getActiveCourseIds();
      console.log('Active course IDs fetched:', activeCoursesRes);
      const activeIds = new Set(activeCoursesRes.map(course => course.course_id));
      console.log('Active IDs set:', Array.from(activeIds));
      setActiveCourseIds(activeIds);
      
      console.log('Course data reloaded successfully');
    } catch (error) {
      console.error('Error reloading course data:', error);
      toast.error('Failed to reload course data');
    }
  };

  // Update displayed courses when courses, activeCourseIds, or showActiveOnly changes
  useEffect(() => {
    updateDisplayedCourses();
  }, [courses, activeCourseIds, showActiveOnly]);

  useEffect(() => {
    // Initial data loading
    reloadCourseData();
    
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
                  {/* Toggle between All and Active Courses with buttons */}
                  <div className="d-flex align-items-center me-3">
                    <div className="btn-group" role="group" aria-label="Course filter">
                      <button
                        type="button"
                        className={`btn btn-sm ${!showActiveOnly ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleToggleChange(false)}
                        style={{ fontSize: '12px', padding: '4px 12px' }}
                      >
                        All Courses
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${showActiveOnly ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleToggleChange(true)}
                        style={{ fontSize: '12px', padding: '4px 12px' }}
                      >
                        Active Only
                      </button>
                    </div>
                  </div>
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
                    {displayedCourses.map((course, index) => (
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
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="e.g. 1.5"
                        value={selectedCourse.class_per_week}
                        onChange={(e) => {
                          setSelectedCourse({
                            ...selectedCourse,
                            class_per_week: Number.parseFloat(
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
              onClick={async () => {
                const result = validateCourse(selectedCourse);
                if (result === null) {
                  try {
                    if (addNewCourse) {
                      console.log('DEBUG Frontend: Adding course data:', selectedCourse);
                      const res = await addCourse(selectedCourse);
                      if (res.message && res.message.includes("Successfully Saved")) {
                        toast.success("Course added successfully");
                        setSelectedCourse(null);
                        setAddNewCourse(false);
                        // Reload all course data after successful addition
                        await reloadCourseData();
                      } else {
                        setSelectedCourse(null);
                        toast.error("Failed to add course: " + res.message);
                      }
                    } else {
                      console.log("In edit course.");
                      const res = await editCourse(selectedCourse.course_id, selectedCourse);
                      if (res.message && res.message.includes("Successfully Updated")) {
                        toast.success("Course updated successfully");
                        setSelectedCourse(null);
                        // Reload all course data after successful update
                        await reloadCourseData();
                      } else {
                        setSelectedCourse(null);
                        toast.error("Failed to update course: " + res.message);
                      }
                    }
                  } catch (error) {
                    console.error('Error saving course:', error);
                    setSelectedCourse(null);
                    toast.error("An error occurred while saving the course");
                  }
                } else {
                  toast.error(result);
                }
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
