import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { createRoom, deleteRoom, getRooms } from "../api/db-crud";
import { mdiContentSave, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';

const styles = {
  card: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(194, 137, 248, 0.1)",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    margin: "0 auto"
  },
  cardHeader: {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
    color: "white",
    padding: "24px 30px",
    fontWeight: "600",
    borderBottom: "none",
    position: "relative",
    overflow: "hidden"
  },
  button: {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(174, 117, 228, 0.3)",
    transition: "all 0.3s ease",
    fontSize: "15px",
    letterSpacing: "0.5px"
  },
  formControl: {
    borderRadius: "12px",
    border: "1.5px solid rgba(194, 137, 248, 0.3)",
    boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
    padding: "12px 15px",
    fontSize: "15px",
    transition: "all 0.3s ease",
    backgroundColor: "#f8faff",
    height: "auto"
  },
  tableHeader: {
    backgroundColor: "rgba(194, 137, 248, 0.08)",
    color: "#444",
    fontWeight: "600",
    borderBottom: "2px solid rgba(194, 137, 248, 0.2)"
  }
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

const validateRoom = (room) => {
  if (room.room === "") {
    return "Room cannot be empty";
  }
  if (room.type === "") {
    return "Type cannot be empty";
  }
  return null;
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    getRooms().then((res) => {
      setRooms(res);
    });
  }, []);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleteRoomSelected, setDeleteRoomSelected] = useState(null);

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
            <i className="mdi mdi-domain" style={{ fontSize: "20px", color: "white" }}></i>
          </div>
          Room Information
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
            <li className="breadcrumb-item" style={{ color: "rgba(255,255,255,0.8)" }}>
              <a href="!#" onClick={(event) => event.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                Database
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
              Rooms
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
                    <i className="mdi mdi-domain" style={{ fontSize: "24px", color: "rgb(194, 137, 248)" }}></i>
                  </span>
                  Room Management
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
                    setSelectedRoom({
                      room: "",
                      type: 0,
                      active: false,
                      prev_room: "",
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
                  <i className="mdi mdi-plus-circle" style={{ fontSize: "18px", marginRight: "8px" }}></i>
                  Add New Room
                </button>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th>
                        <div className="d-flex align-items-center">
                          <i className="mdi mdi-door" style={{marginRight: "6px", color: "rgb(174, 117, 228)"}}></i>
                          Room
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <i className="mdi mdi-format-list-bulleted-type" style={{marginRight: "6px", color: "rgb(174, 117, 228)"}}></i>
                          Type
                        </div>
                      </th>
                      <th style={{ textAlign: 'center' }}>
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="mdi mdi-check-circle" style={{marginRight: "6px", color: "rgb(174, 117, 228)"}}></i>
                          Active
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <i className="mdi mdi-cog" style={{marginRight: "6px", color: "rgb(174, 117, 228)"}}></i>
                          Action
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room, index) => (
                      <tr key={index} style={{
                        borderBottom: "1px solid #f0f0f0",
                        transition: "all 0.2s ease",
                        backgroundColor: "#ffffff",
                        cursor: "pointer"
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f3eaff"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ffffff"}
                      >
                        <td style={{ minWidth: '120px' }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ ...styles.formControl, minWidth: '110px', width: '100%', padding: '8px 12px', height: '40px' }}
                            value={room.room}
                            onChange={e => {
                              const newRooms = [...rooms];
                              newRooms[index].room = e.target.value;
                              setRooms(newRooms);
                            }}

                          />
                        </td>
                        <td style={{ minWidth: '120px' }}>
                          <select
                            className="form-control form-control-sm"
                            style={{ ...styles.formControl, minWidth: '110px', width: '100%', padding: '8px 12px', height: '40px' }}
                            value={room.type}
                            onChange={e => {
                              const newRooms = [...rooms];
                              newRooms[index].type = Number(e.target.value);
                              setRooms(newRooms);
                            }}
                          >
                            <option value={0}>Theory</option>
                            <option value={1}>Sessional</option>
                          </select>
                        </td>
                        <td style={{ minWidth: '80px', textAlign: 'center' }}>
                          <div 
                            className="custom-checkbox-wrapper d-flex align-items-center justify-content-center"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              const newChecked = !(room.active === true);
                              const newRooms = [...rooms];
                              newRooms[index].active = newChecked;
                              setRooms(newRooms);
                            }}
                          >
                            {/* Custom Checkbox */}
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                border: room.active === true ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                                background: room.active === true
                                  ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" 
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: room.active === true ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                              }}
                            >
                              {room.active === true && (
                                <i 
                                  className="mdi mdi-check"
                                  style={{ 
                                    color: "white", 
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    marginTop: "1px" 
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: '120px' }}>
                          <div className="d-flex">
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
                              }}
                              className="btn"
                              onClick={() => setDeleteRoomSelected(room.room)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "#dc3545";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(220, 53, 69, 0.1)";
                                e.currentTarget.style.color = "#dc3545";
                              }}
                            >
                              <i className="mdi mdi-delete-outline mr-1"></i>
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
      {selectedRoom !== null && (
        <Modal
          show={true}
          onHide={() => setSelectedRoom(null)}
          size="md"
          centered
          contentClassName="border-0 shadow add-room-modal-content"
          backdrop="static"
        >
          <style>{`
            .add-room-modal-content {
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
            .add-room-modal-header-bg {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M11 100H89V0H11V100ZM0 0V100H100V0H0Z" fill="white" fill-opacity="0.05"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="2" fill="white" fill-opacity="0.08"/%3E%3C/svg%3E');
              background-size: 80px 80px, 20px 20px;
              opacity: 0.15;
              z-index: 0;
            }
            .add-room-modal-header-content {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
            }
            .add-room-modal-header-icon {
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
            .add-room-modal-title {
              margin: 0;
              font-weight: 600;
              font-size: 18px;
              letter-spacing: 0.5px;
              color: white;
            }
            .add-room-modal-divider {
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
            <div className="add-room-modal-header-bg"></div>
            <div className="add-room-modal-header-content">
              <div className="add-room-modal-header-icon">
                <i className="mdi mdi-domain" style={{ fontSize: "20px", color: "white" }}></i>
              </div>
              <h4 className="add-room-modal-title">
                {selectedRoom.prev_room === "" ? "Add" : "Edit"} Room
              </h4>
            </div>
          </Modal.Header>
          <Modal.Body style={{ background: "#f8f9fa", borderRadius: "0 0 20px 20px", padding: "2rem 2rem 0 2rem" }}>
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
              <Form>
                <Row>
                  <Col md={6} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>
                        Room Number
                      </Form.Label>
                      <FormControl
                        type="text"
                        placeholder="Enter Room Number"
                        value={selectedRoom.room}
                        style={{
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
                        }}
                        onChange={(e) =>
                          setSelectedRoom({
                            ...selectedRoom,
                            room: e.target.value,
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6} className="px-2 py-1">
                    <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>
                        Room Type
                      </Form.Label>
                      <div>
                        <Form.Select
                          value={selectedRoom.type}
                          style={{
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
                          }}
                          onChange={(e) =>
                            setSelectedRoom({
                              ...selectedRoom,
                              type: Number.parseInt(e.target.value),
                            })
                          }
                        >
                          <option value="0">Theory</option>
                          <option value="1">Sessional</option>
                        </Form.Select>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-2 py-1 d-flex align-items-center">
                    <div className="form-check d-flex align-items-center">
                      <div
                        className="custom-checkbox-wrapper d-flex align-items-center"
                        style={{
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          marginRight: "8px",
                        }}
                        onClick={() =>
                          setSelectedRoom({
                            ...selectedRoom,
                            active: !selectedRoom.active,
                          })
                        }
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "5px",
                            border: selectedRoom.active ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                            background: selectedRoom.active
                              ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            boxShadow: selectedRoom.active ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                          }}
                        >
                          {selectedRoom.active && (
                            <i
                              className="mdi mdi-check"
                              style={{
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "bold",
                                marginTop: "1px"
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <label className="form-check-label mb-0" style={{ cursor: "pointer", fontWeight: "500", color: "#333", marginLeft: 0 }}>
                        Active
                      </label>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className="add-room-modal-divider"></div>
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
              onClick={() => setSelectedRoom(null)}
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
                const result = validateRoom(selectedRoom);
                if (result === null) {
                  createRoom(selectedRoom)
                    .then((res) => {
                      setRooms([...rooms, selectedRoom]);
                      toast.success("Room added successfully");
                    })
                    .catch(console.log);
                  setSelectedRoom(null);
                } else toast.error(result);
              }}
            >
              <Icon path={mdiContentSave} size={0.9} style={{ marginRight: 6 }} />
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal
        show={deleteRoomSelected !== null}
        onHide={() => setDeleteRoomSelected(null)}
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
            <Modal.Title style={{ fontSize: "18px", fontWeight: "600", color: "#dc3545" }}>Delete Room</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <p>Are you sure you want to delete this room?</p>
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
            onClick={() => setDeleteRoomSelected(null)}
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
              deleteRoom(deleteRoomSelected)
                .then((res) => {
                  setDeleteRoomSelected(null);
                  setRooms(rooms.filter((r) => r.room !== deleteRoomSelected));
                  toast.success("Room deleted successfully");
                })
                .catch(console.log);
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#dc3545";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(220, 53, 69, 0.1)";
              e.currentTarget.style.color = "#dc3545";
            }}
          >
            <i className="mdi mdi-delete-outline mr-1"></i>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}