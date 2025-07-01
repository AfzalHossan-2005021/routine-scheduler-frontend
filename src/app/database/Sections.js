import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";

import { toast } from "react-hot-toast";
import {
  createSection,
  deleteSection,
  getSections,
  updateSection,
} from "../api/db-crud";
import { mdiAccountGroupOutline, mdiPlusCircle, mdiDomain, mdiFormatListBulletedType, mdiDoor, mdiCalendar, mdiSchool, mdiBookOpenPageVariant, mdiCheckCircle, mdiPencil, mdiDeleteOutline, mdiContentSave, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';

const regexSection = /^[A-C][1-3]?$/;

const validateSection = (section) => {
  if (section.batch === "") {
    return "Batch cannot be empty";
  }

  if (section.batch < 18 || section.batch > 23) {
    return "Invalid Batch";
  }

  if (section.section === "") {
    return "Section cannot be empty";
  }

  if (!regexSection.test(section.section)) {
    return "Invalid Section";
  }

  if (section.type === "") {
    return "Type cannot be empty";
  }

  if (section.session === "") {
    return "Session cannot be empty";
  }

  return null;
};

// Define a consistent style object for all input cells
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

export default function Sections() {
  const sessionValue = ["Jan-23"]; // it will be fetched from database

  // const dummySections = [
  //   {
  //     batch: 18,
  //     section: "A",
  //     type: "Theory",
  //     room: "203",
  //     session: "January 2023",
  //     level_term: "L1-T1",
  //   },
  // ];

  const [sections, setSections] = useState([]);

  useEffect(() => {
    getSections().then((res) => {
      setSections(res);
    });
  }, []);

  const [selectedSection, setSelectedSection] = useState(null);
  const [deleteSectionSelected, setDeleteSectionSelected] = useState(null);

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
            <Icon path={mdiAccountGroupOutline} size={1} color="white" />
          </div>
          Section Information
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
            <li className="breadcrumb-item" style={{ color: "rgba(255,255,255,0.8)" }}>
              <a href="!#" onClick={(event) => event.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                Database
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
              Sections
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
                    <Icon path={mdiAccountGroupOutline} size={1} color="rgb(194, 137, 248)" />
                  </span>
                  Section Management
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
                    setSelectedSection({
                      batch: 0,
                      section: "",
                      type: 0,
                      room: "",
                      session: sessionValue[0],
                      department: "",
                      prev_batch: 0,
                      prev_section: "",
                      prev_department: "",
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
                  Add New Section
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
                        <Icon path={mdiSchool} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Batch
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiBookOpenPageVariant} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Level-Term
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiDomain} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Department
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiFormatListBulletedType} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Section
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiFormatListBulletedType} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Type
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiDoor} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Room
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiCalendar} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Session
                      </th>
                      <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                        <Icon path={mdiCheckCircle} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section, index) => (
                      <tr key={index} style={{ transition: "all 0.2s", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(194, 137, 248, 0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <td> {section.batch} </td>
                        <td> {section.level_term} </td>
                        <td> {section.department} </td>
                        <td> {section.section} </td>
                        <td> {section.type===0? "Theory":"Sessional"} </td>
                        <td> {section.room} </td>
                        <td> {section.session} </td>
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
                              onClick={() => setSelectedSection({ ...section, index, prev_batch: section.batch, prev_section: section.section, prev_department: section.department })}
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
                              onClick={() => setDeleteSectionSelected({ batch: section.batch, section: section.section, department: section.department })}
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
      {selectedSection !== null && (
        <Modal
          show={true}
          onHide={() => setSelectedSection(null)}
          size="md"
          centered
          contentClassName="border-0 shadow add-section-modal-content"
          backdrop="static"
        >
          <style>{`
            .add-section-modal-content {
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
            .add-section-modal-header-bg {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M11 100H89V0H11V100ZM0 0V100H100V0H0Z" fill="white" fill-opacity="0.05"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="2" fill="white" fill-opacity="0.08"/%3E%3C/svg%3E');
              background-size: 80px 80px, 20px 20px;
              opacity: 0.15;
              z-index: 0;
            }
            .add-section-modal-header-content {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
            }
            .add-section-modal-header-icon {
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
            .add-section-modal-title {
              margin: 0;
              font-weight: 600;
              font-size: 18px;
              letter-spacing: 0.5px;
              color: white;
            }
            .add-section-modal-divider {
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
            <div className="add-section-modal-header-bg"></div>
            <div className="add-section-modal-header-content">
              <div className="add-section-modal-header-icon">
                <Icon path={mdiAccountGroupOutline} size={1} color="white" />
              </div>
              <h4 className="add-section-modal-title">
                {selectedSection.prev_section === "" ? "Add" : "Edit"} Section
              </h4>
            </div>
          </Modal.Header>
          <Modal.Body style={{ background: "#f8f9fa", borderRadius: "0 0 20px 20px", padding: "2rem 2rem 0 2rem" }}>
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
              <Form>
                <Row>
                  <Col md={4} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Batch</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Batch"
                        value={selectedSection.batch}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            batch: Number.parseInt(e.target.value || "0"),
                          })
                        }
                        style={inputCellStyle}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Section</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Section"
                        value={selectedSection.section}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            section: e.target.value,
                          })
                        }
                        style={inputCellStyle}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Room</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Room"
                        value={selectedSection.room}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            room: e.target.value,
                          })
                        }
                        style={inputCellStyle}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={4} className="px-2 py-1 d-flex align-items-center">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Type</Form.Label>
                      <br />
                      <Form.Select
                        size="lg"
                        value={selectedSection.type}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            type: Number.parseInt(e.target.value),
                          })
                        }
                        style={inputCellStyle}
                      >
                        <option value="0">Theory</option>
                        <option value="1">Sessional</option>
                      </Form.Select>
                    </FormGroup>
                  </Col>

                  <Col md={4} className="px-2 py-1 d-flex align-items-center">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Session</Form.Label>
                      <br />
                      <Form.Select
                        size="lg"
                        value={sessionValue.indexOf(selectedSection.session)}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            session:
                              sessionValue[Number.parseInt(e.target.value)],
                          })
                        }
                        style={inputCellStyle}
                      >
                        <option value="0">{sessionValue[0]}</option>
                      </Form.Select>
                    </FormGroup>
                  </Col>
                  <Col md={4} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Level-Term</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="L_-T_"
                        value={selectedSection.level_term}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            level_term: e.target.value,
                          })
                        }
                        style={inputCellStyle}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Department</Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Department"
                        value={selectedSection.department}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            department: e.target.value,
                          })
                        }
                        style={inputCellStyle}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className="add-section-modal-divider"></div>
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
              onClick={() => setSelectedSection(null)}
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
              onClick={(e) => {
                e.preventDefault();
                const result = validateSection(selectedSection);
                if (result === null) {
                  if (selectedSection.prev_section === "") {
                    createSection({...selectedSection, room: selectedSection.room || "000"})
                      .then((res) => {
                        setSections([...sections, selectedSection]);
                        toast.success("Section added successfully");
                      })
                      .catch(console.log);
                  } else {
                    updateSection(
                      selectedSection.prev_batch,
                      selectedSection.prev_section,
                      selectedSection.prev_department,
                      selectedSection
                    )
                      .then((res) => {
                        const index = sections.findIndex(
                          (t) =>
                            t.batch === selectedSection.prev_batch &&
                            t.section === selectedSection.prev_section
                        );
                        const newSections = [...sections];
                        newSections[index] = selectedSection;
                        setSections(newSections);
                        toast.success("Section updated successfully");
                      })
                      .catch(console.log);
                  }
                  setSelectedSection(null);
                } else toast.error(result);
              }}
            >
              <Icon path={mdiContentSave} size={0.9} style={{ marginRight: 6 }} />
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {deleteSectionSelected !== null && (
      <Modal
        show={deleteSectionSelected !== null}
        onHide={() => setDeleteSectionSelected(null)}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          Delete Section : {deleteSectionSelected.batch}{deleteSectionSelected.section}, {deleteSectionSelected.department}
        </Modal.Header>
        <Modal.Body className="px-4">
          <p>Are you sure you want to delete this section?</p>
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
            onClick={() => setDeleteSectionSelected(null)}
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
              deleteSection(deleteSectionSelected.batch, deleteSectionSelected.section, deleteSectionSelected.department)
                .then((res) => {
                  setDeleteSectionSelected(null);
                  setSections(
                    sections.filter(
                      (t) =>
                        t.batch !== deleteSectionSelected.batch &&
                        t.section !== deleteSectionSelected.section && 
                        t.department !== deleteSectionSelected.department
                    )
                  );
                  toast.success("Section deleted successfully");
                })
                .catch(console.log);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>)}
    </div>
  );
}