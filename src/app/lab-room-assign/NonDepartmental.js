import { useState, useEffect } from "react";
import { Modal, Form, FormControl, Button } from "react-bootstrap";
import { Icon } from "@mdi/react";
import {
    mdiBookOpenPageVariant,
    mdiFormatListBulletedType,
    mdiDoor,
    mdiCheckCircle,
    mdiPencil,
    mdiContentSave,
    mdiClose,
} from "@mdi/js";
import { getAllNonDepartmentalLabRoomAssignment, updateNonDepartmentalLabRoomAssignment } from "../api/theory-room-assign"; // Mock API call

import { toast } from "react-hot-toast";

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

const validateAssignment = (assignment) => {
    if (!assignment.course_id) {
        return "Course ID cannot be empty";
    }

    if (!assignment.section) {
        return "Section cannot be empty";
    }

    if (!assignment.room_no) {
        return "Room number cannot be empty";
    }

    return null;
};

export default function NonDepartmental() {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        getAllNonDepartmentalLabRoomAssignment()
            .then((response) => {
                setAssignments(response);
            })
            .catch((error) => {
                toast.error("Failed to fetch assignments");
            });
    }, []);

    return (
        <div>
            <div className="page-header" style={{
                background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
                borderRadius: "16px",
                padding: "1.5rem",
                marginBottom: "2rem",
                boxShadow: "0 8px 32px rgba(174, 117, 228, 0.15)",
                color: "white",
            }}>
                <h3 className="page-title" style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "white",
                }}>
                    <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    }}>
                        <Icon path={mdiDoor} size={1} color="white" />
                    </div>
                    Non-Departmental Lab Room Assignment
                </h3>
            </div>
            <div className="card" style={{
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                border: "none",
                transition: "all 0.3s ease",
                background: "white",
            }}>
                <div className="card-body" style={{ padding: "2rem" }}>
                    <div className="table-responsive">
                        <table className="table" style={{ margin: 0 }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: "rgba(174, 117, 228, 0.08)",
                                    borderBottom: "2px solid rgba(174, 117, 228, 0.1)",
                                }}>
                                    <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                                        <Icon path={mdiBookOpenPageVariant} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Course ID
                                    </th>
                                    <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                                        <Icon path={mdiFormatListBulletedType} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Section
                                    </th>
                                    <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                                        <Icon path={mdiDoor} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Room No
                                    </th>
                                    <th style={{ padding: "18px 20px", color: "rgb(174, 117, 228)", fontWeight: "700", fontSize: "0.95rem", border: "none" }}>
                                        <Icon path={mdiCheckCircle} size={0.7} color="rgb(174, 117, 228)" style={{ marginRight: "8px", verticalAlign: "middle" }} />Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(assignments) && assignments.map((assignment, index) => (
                                    <tr key={index} style={{ transition: "all 0.2s", cursor: "pointer" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(194, 137, 248, 0.08)"}
                                        onMouseLeave={e => e.currentTarget.style.background = ""}
                                    >
                                        <td> {assignment.course_id} </td>
                                        <td> {assignment.section} </td>
                                        <td> {assignment.room_no} </td>
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
                                                        marginRight: "8px",
                                                    }}
                                                    className="btn"
                                                    onClick={() => setSelectedAssignment({ ...assignment })}
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
                                                    Update
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

            {/* Update Assignment Modal */}
            {selectedAssignment !== null && (
                <Modal
                    show={selectedAssignment !== null}
                    onHide={() => setSelectedAssignment(null)}
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
                    <Modal.Header
                        style={{
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
                                <Icon path={mdiDoor} size={1} color="white" />
                            </div>
                            <h4 className="add-section-modal-title">
                                Update Non-Departmental Lab Room Assignment
                            </h4>
                        </div>
                    </Modal.Header>
                    <Modal.Body style={{ padding: "24px" }}>
                        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{
                                        fontWeight: 600,
                                        color: "#7c4fd5",
                                        marginRight: "15px",
                                        marginBottom: 0,
                                        whiteSpace: "nowrap"
                                    }}>
                                        Course ID
                                    </Form.Label>
                                    <FormControl
                                        style={inputCellStyle}
                                        type="text"
                                        value={selectedAssignment?.course_id || ''}
                                        onChange={(e) => setSelectedAssignment({ ...selectedAssignment, course_id: e.target.value })}
                                        placeholder="Enter course ID"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{
                                        fontWeight: 600,
                                        color: "#7c4fd5",
                                        marginRight: "15px",
                                        marginBottom: 0,
                                        whiteSpace: "nowrap"
                                    }}>
                                        Section
                                    </Form.Label>
                                    <FormControl
                                        style={inputCellStyle}
                                        type="text"
                                        value={selectedAssignment?.section || ''}
                                        onChange={(e) => setSelectedAssignment({ ...selectedAssignment, section: e.target.value })}
                                        placeholder="Enter section"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{
                                        fontWeight: 600,
                                        color: "#7c4fd5",
                                        marginRight: "15px",
                                        marginBottom: 0,
                                        whiteSpace: "nowrap"
                                    }}>
                                        Room No
                                    </Form.Label>
                                    <FormControl
                                        style={inputCellStyle}
                                        type="text"
                                        value={selectedAssignment?.room_no || ''}
                                        onChange={(e) => setSelectedAssignment({ ...selectedAssignment, room_no: e.target.value })}
                                        placeholder="Enter room number"
                                    />
                                </Form.Group>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ border: "none", padding: "0 24px 24px" }}>
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
                            onClick={() => setSelectedAssignment(null)}
                        >
                            <Icon path={mdiClose} size={0.7} style={{ marginRight: "8px" }} />
                            Cancel
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
                                const validationError = validateAssignment(selectedAssignment);
                                if (validationError) {
                                    toast.error(validationError);
                                    return;
                                }

                                updateNonDepartmentalLabRoomAssignment(selectedAssignment)
                                    .then(() => {
                                        getAllNonDepartmentalLabRoomAssignment()
                                            .then((response) => {
                                                setAssignments(response);
                                                toast.success("Assignment updated successfully");
                                            })
                                    })
                                    .catch((error) => {
                                        toast.error("Failed to update assignment");
                                    });

                                setSelectedAssignment(null);
                            }}
                        >
                            <Icon path={mdiContentSave} size={0.7} style={{ marginRight: "8px" }} />
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
}
