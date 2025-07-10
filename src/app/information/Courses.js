import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";
import Select from 'react-select';

import { toast } from "react-hot-toast";
import {
  addCourse,
  deleteCourse,
  editCourse,
  getCourses,
  getSections,
} from "../api/db-crud";
import { mdiBookOpenPageVariant, mdiPlusCircle, mdiFormatListBulletedType, mdiSchool, mdiCalendar, mdiAccount, mdiCheckCircle, mdiPencil, mdiDeleteOutline, mdiContentSave, mdiClose } from '@mdi/js';
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
  if (course.batch === "") {
    return "Batch cannot be empty";
  }
  if (course.sections.length === 0) {
    return "Sections cannot be empty";
  }
  if (course.session === "") {
    return "Session cannot be empty";
  }
  if (course.class_per_week === "") {
    return "Class per week cannot be empty";
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
  const sessionValue = ["Jan-23"]; // it will be fetched from database

  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteCourseSelected, setDeleteCourseSelected] = useState(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const handleCheckboxChange = (e) => {
    const checkboxValue = e.target.value;
    const isChecked = e.target.checked;

    setSelectedCheckboxes((prevSelected) => {
      let updated;
      if (isChecked) {
        updated = [...prevSelected, checkboxValue];
      } else {
        updated = prevSelected.filter((item) => item !== checkboxValue);
      }
      // Also update selectedCourse.sections directly
      setSelectedCourse((prev) => prev ? { ...prev, sections: updated } : prev);
      return updated;
    });
  };

  useEffect(() => {
    getCourses().then((res) => {
      setCourses(res);
    });
    getSections().then((res) => {
      setSections(res);
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
                      batch: 0,
                      sections: [],
                      session: sessionValue[0],
                      class_per_week: 0,
                      teacher_credit: 0,
                      from: "",
                      to: "",
                      level_term: "",
                    });
                    setSelectedCheckboxes([]);
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
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiBookOpenPageVariant} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Course ID
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiBookOpenPageVariant} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Course Name
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiFormatListBulletedType} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Type
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiSchool} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Batch
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiFormatListBulletedType} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Sections
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiCalendar} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Session
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiAccount} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Class Per Week
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
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
                        <td> {course.type} </td>
                        <td> {course.batch} </td>
                        <td> {Array.isArray(course.sections) ? course.sections.join(", ") : ""} </td>
                        <td> {course.session} </td>
                        <td> {course.class_per_week} </td>
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
                                setSelectedCheckboxes(course.sections || []);
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
                              <Icon path={mdiPencil} size={0.7} style={{ marginRight: "6px" }} />
                              Edit
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
                              <Icon path={mdiDeleteOutline} size={0.7} style={{ marginRight: "6px" }} />
                              Delete
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
          onHide={() => { setSelectedCourse(null); setSelectedCheckboxes([]); }}
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
                {selectedCourse.prev_course_id ? "Edit" : "Add"} Course
              </h4>
            </div>
          </Modal.Header>
          <Modal.Body style={{ background: "#f8f9fa", borderRadius: "0 0 20px 20px", padding: "2rem 2rem 0 2rem" }}>
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
              <Form className="px-2 py-1">
                <Row>
                  <Col md={4} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Course ID</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Course ID"
                        value={selectedCourse.course_id}
                        style={inputCellStyle}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, course_id: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
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
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Class Per Week</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Class Per Week"
                        value={selectedCourse.class_per_week}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            class_per_week: Number.parseFloat(
                              e.target.value || "0"
                            ),
                          })
                        }
                      />
                    </FormGroup>
                  </Col>

                  <Col md={4} className="px-2 py-1 d-flex align-items-center">
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
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Batch</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Batch"
                        value={selectedCourse.batch}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            batch: Number.parseInt(e.target.value || "0"),
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={4} className="px-2 py-1 d-flex align-items-center">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Session</Form.Label>
                      <br />
                      <Form.Select
                        size="lg"
                        value={sessionValue.indexOf(selectedCourse.session)}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            session:
                              sessionValue[Number.parseInt(e.target.value)],
                          })
                        }
                      >
                        {sessionValue.map((session, index) => (
                          <option key={index} value={index}>
                            {session}
                          </option>
                        ))}
                      </Form.Select>
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Teacher Credit</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Teacher Credit"
                        value={selectedCourse.teacher_credit}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            teacher_credit: Number.parseFloat(
                              e.target.value || "0"
                            ),
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>From</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter offering department"
                        value={selectedCourse.from}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            from: e.target.value || "CSE",
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4} className="px-2 py-1 d-flex align-items-center">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>To</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Offered department"
                        value={selectedCourse.to}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            to: e.target.value || "CSE",
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Level-Term</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Level-Term (e.g. L-2 T-1)"
                        value={selectedCourse.level_term}
                        style={inputCellStyle}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            level_term: e.target.value || "",
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-2 py-1 d-flex align-items-center">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Sections</Form.Label>
                      <Select
                        isMulti
                        name="sections"
                        options={(
                          selectedCourse.batch && selectedCourse.type !== undefined && selectedCourse.session && selectedCourse.to
                            ? sections.filter(
                                (s) =>
                                  s.batch === selectedCourse.batch &&
                                  s.type === selectedCourse.type &&
                                  s.session === selectedCourse.session &&
                                  s.department === selectedCourse.to
                              )
                            : sections
                        ).map((section) => ({ value: section.section, label: section.section }))}
                        value={selectedCheckboxes.map(val => ({ value: val, label: val }))}
                        onChange={selectedOptions => {
                          const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                          setSelectedCheckboxes(values);
                          setSelectedCourse(prev => prev ? { ...prev, sections: values } : prev);
                        }}
                        placeholder="Select sections..."
                        noOptionsMessage={() => "No sections available"}
                        styles={{
                          control: (base) => ({
                            ...base,
                            minWidth: "110px",
                            width: "100%",
                            borderRadius: "12px",
                            border: "1.5px solid rgba(194, 137, 248, 0.3)",
                            boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
                            fontWeight: 500,
                            color: "#333",
                            background: "#f8faff",
                            fontSize: "1rem",
                            padding: "2px 0",
                            minHeight: "40px",
                            transition: "all 0.3s ease"
                          }),
                          multiValue: (base) => ({
                            ...base,
                            background: "#e9d8fd",
                            borderRadius: "8px",
                            color: "#7c4fd5"
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "#7c4fd5",
                            fontWeight: 500
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "#b39ddb"
                          })
                        }}
                      />
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
              onClick={() => { setSelectedCourse(null); setSelectedCheckboxes([]); }}
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
                  if (!selectedCourse.prev_course_id) {
                    addCourse(selectedCourse)
                      .then((res) => {
                        setCourses([...courses, selectedCourse]);
                        toast.success("Course added successfully");
                      })
                      .catch(console.log);
                  } else {
                    editCourse(selectedCourse.prev_course_id, selectedCourse)
                      .then((res) => {
                        const index = courses.findIndex(
                          (t) => t.course_id === selectedCourse.prev_course_id
                        );
                        const newCourses = [...courses];
                        newCourses[index] = selectedCourse;
                        setCourses(newCourses);
                        toast.success("Course updated successfully");
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
        >
          <Modal.Header closeButton>Delete {deleteCourseSelected.course_id}</Modal.Header>
          <Modal.Body className="px-4">
            <p>Are you sure you want to delete this course?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              style={modalButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = "rgb(154, 77, 226)";
                e.target.style.color = "white";
                e.target.style.borderColor = "rgb(154, 77, 226)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(154, 77, 226, 0.15)";
                e.target.style.color = "rgb(154, 77, 226)";
                e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
              }}
              onClick={() => setDeleteCourseSelected(null)}
            >
              Close
            </Button>
            <Button
              style={{
                borderRadius: "12px",
                padding: "12px 28px",
                fontWeight: "600",
                background: "linear-gradient(135deg, #dc3545, #c82333)",
                border: "none",
                boxShadow: "0 6px 16px rgba(220, 53, 69, 0.25)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "1rem",
                color: "white"
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
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
