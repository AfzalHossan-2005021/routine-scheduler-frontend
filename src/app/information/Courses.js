import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";

import { toast } from "react-hot-toast";
import { addCourse, deleteCourse, editCourse, getCourses } from "../api/db-crud";
import { getDepartments, getAllLevelTermsName } from "../api/academic-config";
import { mdiBookOpenPageVariant, mdiPlusCircle, mdiFormatListBulletedType, mdiSchool, mdiCheckCircle, mdiPencil, mdiDeleteOutline, mdiContentSave, mdiClose, mdiClock, mdiNotebookCheck, mdiOfficeBuilding } from '@mdi/js';
import Icon from '@mdi/react';

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

// Define the consistent style object for all input cells
const inputCellStyle = {
  minWidth: "110px",
  width: "100%",
  borderRadius: "12px",
  border: "1.5px solid rgba(194, 137, 248, 0.3)",
  boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
  fontWeight: 500,
  color: "#333",
  background: "#f8faff",
  fontSize: "1rem",
  padding: "8px 12px",
  height: "40px",
  transition: "all 0.3s ease"
};

// Define a shared style object for modal action buttons
const modalButtonStyle = {
  borderRadius: "6px",
  padding: "7px 14px",
  fontWeight: "500",
  background: "rgba(154, 77, 226, 0.15)",
  border: "1px solid rgba(154, 77, 226, 0.5)",
  color: "rgb(154, 77, 226)",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "0.9rem"
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [allDepartmentNames, setAllDepartmentNames] = useState([]);
  const [allLevelTermNames, setAllLevelTermNames] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteCourseSelected, setDeleteCourseSelected] = useState(null);

  useEffect(() => {
    getCourses().then((res) => {
      setCourses(res);
    });
    getDepartments().then((res) => {
      setAllDepartmentNames(res);
    });
    getAllLevelTermsName().then((res) => {
      setAllLevelTermNames(res);
    });
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
            <Icon path={mdiBookOpenPageVariant} size={1} color="white" />
          </div>
          Course Information
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
            <li className="breadcrumb-item" style={{ color: "rgba(255,255,255,0.8)" }}>
              <a href="!#" onClick={(event) => event.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                Database
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
              Courses
            </li>
          </ol>
        </nav>
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
                  <span style={{ marginRight: "12px" }}>
                    <Icon path={mdiBookOpenPageVariant} size={1} color="rgb(194, 137, 248)" />
                  </span>
                  Course Management
                </h4>
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
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    minWidth: "auto",
                    justifyContent: "center"
                  }}
                  onClick={(e) => {
                    setSelectedCourse({
                      course_id: "",
                      name: "",
                      type: 0,
                      class_per_week: 0,
                      from: "",
                      to: "",
                      teacher_credit: 0,
                      level_term: ""
                    });
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
                >
                  <Icon path={mdiPlusCircle} size={0.9} style={{ marginRight: "8px" }} />
                  Add New Course
                </button>
              </div>
              <div className="table-responsive">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{
                      backgroundColor: "rgba(174, 117, 228, 0.08)",
                      borderBottom: "2px solid rgba(174, 117, 228, 0.1)"
                    }}>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiNotebookCheck} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Course ID
                      </th>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiBookOpenPageVariant} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Course Name
                      </th>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiFormatListBulletedType} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} /> Type
                      </th>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiSchool} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} /> Level/Term
                      </th>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiOfficeBuilding} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} /> Offering Dept
                      </th>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiOfficeBuilding} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} /> Host Dept
                      </th>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiClock} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Credit
                      </th>
                      <th style={{ padding: "20px 15px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiCheckCircle} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course, index) => (
                      <tr key={index} style={{ transition: "all 0.2s", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(194, 137, 248, 0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <td> {course.course_id} </td>
                        <td> {course.name} </td>
                        <td style={{ textAlign: "center" }}>{course.type === 0 ? "Theory" : "Sessional"}</td>
                        <td style={{ textAlign: "center" }}> {course.level_term} </td>
                        <td style={{ textAlign: "center" }}> {course.from} </td>
                        <td style={{ textAlign: "center" }}> {course.to} </td>
                        <td style={{ textAlign: "center" }}> {course.class_per_week} </td>
                        <td>
                          <div className="d-flex">
                            <button
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
                              onClick={() => {
                                setSelectedCourse(course);
                                setSelectedCourse(prev => ({
                                  ...prev,
                                  course_id_old: course.course_id
                                }));
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.background = "rgb(154, 77, 226)";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = "rgba(154, 77, 226, 0.15)";
                                e.currentTarget.style.color = "rgb(154, 77, 226)";
                              }}
                            >
                              <Icon path={mdiPencil} size={0.7} />
                            </button>
                            <button
                              type="button"
                              style={{
                                background: "rgba(220, 53, 69, 0.1)",
                                color: "#dc3545",
                                border: "1px solid rgba(220, 53, 69, 0.3)",
                                borderRadius: "6px",
                                padding: "7px 14px",
                                transition: "all 0.3s ease",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                              className="btn"
                              onClick={() => setDeleteCourseSelected(course)}
                              onMouseOver={e => {
                                e.currentTarget.style.background = "#dc3545";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = "rgba(220, 53, 69, 0.1)";
                                e.currentTarget.style.color = "#dc3545";
                              }}
                            >
                              <Icon path={mdiDeleteOutline} size={0.7} />
                            </button>
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
          contentClassName="border-0 shadow add-course-modal-content"
          backdrop="static"
        >
          <style>{`
            .add-course-modal-content {
              border-radius: 20px !important;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(194, 137, 248, 0.1) !important;
              animation: fadeInModal 0.3s ease;
              overflow: hidden;
              border: none;
            }
            @keyframes fadeInModal {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .add-course-modal-header-bg {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M11 100H89V0H11V100ZM0 0V100H100V0H0Z" fill="white" fill-opacity="0.05"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="2" fill="white" fill-opacity="0.08"/%3E%3C/svg%3E');
              background-size: 80px 80px, 20px 20px;
              opacity: 0.15;
              z-index: 0;
            }
            .add-course-modal-header-content {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
            }
            .add-course-modal-header-icon {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background-color: rgba(255, 255, 255, 0.15);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .add-course-modal-title {
              margin: 0;
              font-weight: 600;
              font-size: 18px;
              letter-spacing: 0.5px;
              color: white;
            }
            .add-course-modal-divider {
              border-top: 1px solid #e1e5e9;
              margin: 0 -2rem 1.5rem -2rem;
            }
          `}</style>
          <Modal.Header style={{
            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
            color: "white",
            borderBottom: "none",
            borderRadius: "20px 20px 0 0",
            padding: "24px 30px 24px 30px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div className="add-course-modal-header-bg"></div>
            <div className="add-course-modal-header-content">
              <div className="add-course-modal-header-icon">
                <Icon path={mdiBookOpenPageVariant} size={1} color="white" />
              </div>
              <h4 className="add-course-modal-title">
                {selectedCourse.course_id ? "Edit" : "Add"} Course
              </h4>
            </div>
          </Modal.Header>
          <Modal.Body style={{ background: "#f8f9fa", borderRadius: "0 0 20px 20px", padding: "2rem 2rem 0 2rem" }}>
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
              <Form className="px-2 py-1">
                <Row>
                  <Col md={6} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Course ID</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Course ID"
                        value={selectedCourse.course_id}
                        style={inputCellStyle}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, course_id: e.target.value })}
                        disabled={!!selectedCourse.course_id_old}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Credit</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="e.g. 1.5"
                        value={selectedCourse.class_per_week}
                        style={inputCellStyle}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            setSelectedCourse({
                              ...selectedCourse,
                              class_per_week: value,
                            });
                          }
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Course Name</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Course Name"
                        value={selectedCourse.name}
                        style={inputCellStyle}
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
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Type</Form.Label>
                      <br />
                      <Form.Select
                        size="lg"
                        value={selectedCourse.type}
                        style={inputCellStyle}
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
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Level-Term</Form.Label>
                      <Form.Select
                        size="lg"
                        value={selectedCourse.level_term}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            level_term: e.target.value || "",
                          })
                        }
                      >
                        <option value="">Select Level-Term</option>
                        {allLevelTermNames && allLevelTermNames.length > 0 ?
                          allLevelTermNames.map((levelTerm, i) => (
                            <option key={i} value={levelTerm}>{levelTerm}</option>
                          )) :
                          <option disabled>No level-terms available</option>
                        }
                      </Form.Select>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Offering Department</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="e.g. CSE"
                        value={selectedCourse.from}
                        style={inputCellStyle}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, from: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6} className="px-2 py-1 d-flex align-items-center">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Host Department</Form.Label>
                      <Form.Select
                        size="lg"
                        value={selectedCourse.to}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            to: e.target.value || "CSE",
                          })
                        }
                      >
                        <option value="">Select Department</option>
                        {allDepartmentNames && allDepartmentNames.length > 0 ?
                          allDepartmentNames.map((dept, i) => (
                            <option key={i} value={dept}>{dept}</option>
                          )) :
                          <option disabled>No departments available</option>
                        }
                      </Form.Select>
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className="add-course-modal-divider"></div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none", padding: "0 2rem 1.5rem 2rem", background: "#f8f9fa" }}>
            <Button
              style={modalButtonStyle}
              className="d-flex align-items-center justify-content-center"
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
              onClick={() => setSelectedCourse(null)}
            >
              <Icon path={mdiClose} size={0.9} style={{ marginRight: 6 }} />
              Close
            </Button>
            <Button
              style={modalButtonStyle}
              className="d-flex align-items-center justify-content-center"
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
                const result = validateCourse(selectedCourse);
                if (result === null) {
                  if (!selectedCourse.course_id) {
                    addCourse(selectedCourse)
                      .then((res) => {
                        if (res.message && res.message.includes("Successfully Saved")) {
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
                    editCourse(selectedCourse.course_id, selectedCourse)
                      .then((res) => {
                        if (res.message && res.message.includes("Successfully Updated")) {
                          getCourses().then((res) => {
                            setCourses(res);
                            setSelectedCourse(null);
                            toast.success("Course updated successfully");
                          });
                        } else {
                          setSelectedCourse(null);
                          toast.error("Failed to update course: " + res.message);
                        }
                      })
                      .catch(console.log);
                  }
                  setSelectedCourse(null);
                } else toast.error(result);
              }}
            >
              <Icon path={mdiContentSave} size={0.9} style={{ marginRight: 6 }} />
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {deleteCourseSelected !== null && (
        <Modal
          show={deleteCourseSelected !== null}
          onHide={() => setDeleteCourseSelected(null)}
          size="md"
          centered
          contentClassName="border-0 shadow"
          backdrop="static"
        >
          <Modal.Header
            style={{
              background: "linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.1) 100%)",
              borderBottom: "1px solid rgba(220, 53, 69, 0.2)",
              paddingTop: "16px",
              paddingBottom: "16px"
            }}
          >
            <div className="d-flex align-items-center">
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(220, 53, 69, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "10px"
              }}>
                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "18px", color: "#dc3545" }}></i>
              </div>
              <Modal.Title style={{ fontSize: "18px", fontWeight: "600", color: "#dc3545" }}>Delete Course</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body className="px-4">
            <p>Are you sure you want to delete course: {deleteCourseSelected.course_id}?</p>
            <p>This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "1px solid rgba(220, 53, 69, 0.2)", padding: "16px" }}>
            <Button
              style={{
                background: "rgba(154, 77, 226, 0.15)",
                color: "rgb(154, 77, 226)",
                border: "1.5px solid rgba(154, 77, 226, 0.5)",
                borderRadius: "8px",
                padding: "8px 20px",
                fontWeight: "500",
                fontSize: "1rem",
                marginRight: "10px",
                transition: "all 0.3s ease"
              }}
              onClick={() => setDeleteCourseSelected(null)}
              onMouseOver={e => {
                e.currentTarget.style.background = "rgb(154, 77, 226)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "rgb(154, 77, 226)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "rgba(154, 77, 226, 0.15)";
                e.currentTarget.style.color = "rgb(154, 77, 226)";
                e.currentTarget.style.borderColor = "rgba(154, 77, 226, 0.5)";
              }}
            >
              <i className="mdi mdi-close mr-1"></i>
              Cancel
            </Button>
            <Button
              style={{
                background: "rgba(220, 53, 69, 0.1)",
                color: "#dc3545",
                border: "1.5px solid rgba(220, 53, 69, 0.3)",
                borderRadius: "8px",
                padding: "8px 20px",
                fontWeight: "500",
                marginLeft: "10px",
                transition: "all 0.3s ease"
              }}
              onClick={(e) => {
                deleteCourse(deleteCourseSelected.course_id).then((res) => {
                  toast.success("Course deleted successfully");
                  setCourses((prevCourses) =>
                    prevCourses.filter(
                      (c) => c.course_id !== deleteCourseSelected.course_id
                    )
                  );
                  setDeleteCourseSelected(null);
                });
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "#dc3545";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "rgba(220, 53, 69, 0.1)";
                e.currentTarget.style.color = "#dc3545";
              }}
            >
              <i className="mdi mdi-delete-outline mr-1"></i>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
