import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "react-bootstrap";
import {
  getAllInitial,
  getPdfForStudent,
  getPdfForTeacher,
  getAllRooms,
  getPdfForRoom,
  getAllLevelTerms,
  regeneratePdfLevelTerm,
  regenerateRoom,
  regenerateTeacher,
} from "../api/pdf";
import { toast } from "react-hot-toast";
import { sendMail } from "../api/pdf";

export default function ShowPdf() {
  const [forStudent, setForStudent] = useState(true);
  const [forTeacher, setForTeacher] = useState(false);
  const [forRoom, setForRoom] = useState(false);

  const [initials, setInitials] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allLevels, setAllLevels] = useState([]);

  useEffect(() => {
    getAllInitial().then((res) => {
      setInitials(res.initials);
    });
    getAllRooms().then((res) => {
      setRooms(res.rooms);
    });
    getAllLevelTerms().then((res) => {
      setAllLevels(res);
    });
  }, []);

  const [selectedInitial, setSelectedInitial] = useState("");
  const handleSelectInitial = (selectedOption) => {
    setSelectedInitial(selectedOption);
  };
  const [selectedRoom, setSelectedRoom] = useState("");
  const handleSelectRoom = (selectedOption) => {
    setSelectedRoom(selectedOption);
  };

  const [lvlTerm, setLvlTerm] = useState("L4-T1");

  const [pdfData, setpdfData] = useState("");

  const handleSelect = (e) => {
    const selectedOption = e.target.value;
    console.log(selectedOption);
    setForStudent(false);
    setForTeacher(false);
    setForRoom(false);

    switch (selectedOption) {
      case "For Student":
        setForStudent(true);
        break;
      case "For Teacher":
        setForTeacher(true);
        break;
      case "For Room":
        setForRoom(true);
        break;
      default:
        break;
    }
  };

  const handleRadioChange = (event) => {
    setLvlTerm(event.target.value);
  };

  const displayPdf = () => {
    try {
      const toastId = toast.loading("Loading PDF...");
      
      let pdfPromise;
      let selectedType = "";
      let selectedValue = "";
      
      if (forStudent) {
        if (!lvlTerm) {
          toast.dismiss(toastId);
          toast.error("Please select a level term");
          return;
        }
        pdfPromise = getPdfForStudent(lvlTerm, "a");
        selectedType = "student";
        selectedValue = lvlTerm;
      } else if (forTeacher) {
        if (!selectedInitial) {
          toast.dismiss(toastId);
          toast.error("Please select a teacher");
          return;
        }
        pdfPromise = getPdfForTeacher(selectedInitial);
        selectedType = "teacher";
        selectedValue = selectedInitial;
      } else if (forRoom) {
        if (!selectedRoom) {
          toast.dismiss(toastId);
          toast.error("Please select a room");
          return;
        }
        pdfPromise = getPdfForRoom(selectedRoom);
        selectedType = "room";
        selectedValue = selectedRoom;
      } else {
        toast.dismiss(toastId);
        toast.error("Please select a format");
        return;
      }

      pdfPromise
        .then((res) => {
          if (!res || res.length === 0) {
            throw new Error("Empty PDF response");
          }
          const pdfBlob = new Blob([res], { type: "application/pdf" });
          setpdfData(pdfBlob);
          toast.dismiss(toastId);
          toast.success("PDF loaded successfully");
        })
        .catch((error) => {
          toast.dismiss(toastId);
          
          // Check if it's a 'file not found' error
          if (error.message?.includes("ENOENT") || 
              error.message?.includes("no such file") ||
              error.message?.includes("Empty PDF response")) {
            toast.error(
              <div>
                <p>PDF not found. Please generate it first.</p>
                <button 
                  onClick={() => regeneratePdf()}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    background: "linear-gradient(135deg, #c289f8, #ae75e4)",
                    border: "none",
                    color: "white",
                    fontWeight: "500",
                    marginTop: "8px"
                  }}
                >
                  Generate PDF
                </button>
              </div>,
              { duration: 5000 }
            );
          } else {
            toast.error(`Failed to load ${selectedType} PDF for ${selectedValue}`);
          }
          console.error("Error loading PDF:", error);
        });
    } catch (err) {
      console.error("Error in displayPdf:", err);
      toast.error("An unexpected error occurred");
    }
  };

  const regeneratePdf = () => {
    try {
      let toastId;
      let regeneratePromise;
      let selectedType = "";
      let selectedValue = "";
      
      if (forStudent) {
        if (!lvlTerm) {
          toast.error("Please select a level term");
          return;
        }
        toastId = toast.loading(`Generating PDF for ${lvlTerm}...`);
        regeneratePromise = regeneratePdfLevelTerm(lvlTerm);
        selectedType = "student";
        selectedValue = lvlTerm;
      } else if (forTeacher) {
        if (!selectedInitial) {
          toast.error("Please select a teacher");
          return;
        }
        toastId = toast.loading(`Generating PDF for teacher ${selectedInitial}...`);
        regeneratePromise = regenerateTeacher(selectedInitial);
        selectedType = "teacher";
        selectedValue = selectedInitial;
      } else if (forRoom) {
        if (!selectedRoom) {
          toast.error("Please select a room");
          return;
        }
        toastId = toast.loading(`Generating PDF for room ${selectedRoom}...`);
        regeneratePromise = regenerateRoom(selectedRoom);
        selectedType = "room";
        selectedValue = selectedRoom;
      } else {
        toast.error("Please select a format");
        return;
      }
      
      regeneratePromise
        .then((res) => {
          toast.dismiss(toastId);
          toast.success(`PDF generated successfully for ${selectedType} ${selectedValue}`);
          // Auto-load the PDF after regeneration
          displayPdf();
        })
        .catch((error) => {
          toast.dismiss(toastId);
          console.error(`Error generating ${selectedType} PDF:`, error);
          toast.error(
            <div>
              <p>{`Failed to generate PDF for ${selectedType} ${selectedValue}`}</p>
              <p style={{ fontSize: "0.8rem", marginTop: "8px" }}>
                Reason: {error.message || "Server error - contact administrator"}
              </p>
            </div>,
            { duration: 5000 }
          );
        });
    } catch (err) {
      console.error("Error in regeneratePdf:", err);
      toast.error("An unexpected error occurred");
    }
  };


  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Routine Generate </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              PDF Format
            </li>
          </ol>
        </nav>
      </div>

      {/* Control Panel */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card" style={{
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            border: "none",
            transition: "all 0.3s ease"
          }}>
            <div className="card-body" style={{ padding: "1.5rem" }}>
              <h4 className="card-title" style={{ 
                color: "rgb(174, 117, 228)", 
                borderBottom: "2px solid rgb(194, 137, 248)",
                paddingBottom: "12px",
                marginBottom: "20px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                letterSpacing: "0.3px"
              }}>
                <span style={{ marginRight: "8px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="rgb(194, 137, 248)"/>
                    <path d="M7 14L9 12L7 10H9V7H11V10H13L11 12L13 14H11V17H9V14H7Z" fill="rgb(194, 137, 248)"/>
                    <path d="M16 12.5C16.83 12.5 17.5 11.83 17.5 11C17.5 10.17 16.83 9.5 16 9.5C15.17 9.5 14.5 10.17 14.5 11C14.5 11.83 15.17 12.5 16 12.5Z" fill="rgb(194, 137, 248)"/>
                    <path d="M16 14.5C14.72 14.5 12 15.14 12 16.42V17H20V16.42C20 15.14 17.28 14.5 16 14.5Z" fill="rgb(194, 137, 248)"/>
                  </svg>
                </span>
                Select PDF Format
              </h4>
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="formatSelect" className="form-label" style={{ 
                    fontWeight: "600", 
                    marginBottom: "8px",
                    color: "#444",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Format Type
                  </label>
                  <Form.Select
                    id="formatSelect"
                    className="form-control btn-block"
                    onChange={handleSelect}
                    style={{
                      height: "48px",
                      borderRadius: "10px",
                      border: "1px solid #d0d5dd",
                      boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                      fontWeight: "500",
                      color: "#333",
                      padding: "0 14px",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c289f8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundPosition: "right 14px center",
                      backgroundSize: "16px",
                      transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      background: "linear-gradient(to bottom, #ffffff, #fdfaff)"
                    }}
                  >
                    <option value="" hidden>Select Format</option>
                    <option value="For Student">For Student</option>
                    <option value="For Teacher">For Teacher</option>
                    <option value="For Room">For Room</option>
                  </Form.Select>
                </div>

                {/* Conditional Second Column */}
                {forStudent && (
                  <div className="col-md-4">
                    <label className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "8px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Level Term
                    </label>
                    <div className="mt-2">
                      <div className="d-flex flex-wrap align-items-center gap-3">
                        {allLevels.map((item) => (
                          <Form.Check
                            key={item}
                            className="custom-radio"
                            type="radio"
                            id={`radio-${item}`}
                            label={item}
                            value={item}
                            checked={lvlTerm === item}
                            onChange={handleRadioChange}
                            style={{
                              borderRadius: "8px",
                              padding: "8px 12px",
                              background: lvlTerm === item ? "linear-gradient(135deg, #c289f8, #ae75e4)" : "#f8f9fa",
                              color: lvlTerm === item ? "white" : "#444",
                              fontWeight: "500",
                              boxShadow: lvlTerm === item ? "0 4px 8px rgba(174, 117, 228, 0.25)" : "none",
                              transition: "all 0.2s ease",
                              border: lvlTerm === item ? "none" : "1px solid #e0e0e0",
                              display: "inline-flex",
                              alignItems: "center",
                              marginBottom: "8px",
                              marginRight: "8px"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {forTeacher && (
                  <div className="col-md-4">
                    <label htmlFor="teacherSelect" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "8px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Teacher
                    </label>
                    <Form.Select
                      id="teacherSelect"
                      className="form-control btn-block"
                      onChange={(e) => handleSelectInitial(e.target.value)}
                      style={{
                        height: "48px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                        fontWeight: "500",
                        color: "#333",
                        padding: "0 14px",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c289f8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundPosition: "right 14px center",
                        backgroundSize: "16px",
                        transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        background: "linear-gradient(to bottom, #ffffff, #fdfaff)"
                      }}
                    >
                      <option value="" hidden>Select Teacher</option>
                      {initials.map((item) => (
                        <option key={item.initial} value={item.initial}>
                          {item.initial}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                )}

                {forRoom && (
                  <div className="col-md-4">
                    <label htmlFor="roomSelect" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "8px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Room
                    </label>
                    <Form.Select
                      id="roomSelect"
                      className="form-control btn-block"
                      onChange={(e) => handleSelectRoom(e.target.value)}
                      style={{
                        height: "48px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                        fontWeight: "500",
                        color: "#333",
                        padding: "0 14px",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c289f8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundPosition: "right 14px center",
                        backgroundSize: "16px",
                        transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        background: "linear-gradient(to bottom, #ffffff, #fdfaff)"
                      }}
                    >
                      <option value="" hidden>Select Room</option>
                      {rooms.map((item) => (
                        <option key={item.room} value={item.room}>
                          {item.room}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="col-md-4 d-flex align-items-end">
                  <div className="d-flex gap-3 mt-4 w-100">
                    <Button 
                      variant="outline-secondary"
                      onClick={regeneratePdf}
                      style={{
                        borderRadius: "10px",
                        padding: "10px 20px",
                        fontWeight: "600",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        border: "1px solid #d0d5dd",
                        transition: "all 0.3s ease",
                        flex: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 3V2M17 2V13M17 2L12 7L7 2V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 12L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 21L12 16L22 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Regenerate
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={displayPdf}
                      style={{
                        borderRadius: "10px",
                        padding: "10px 20px",
                        fontWeight: "600",
                        background: "linear-gradient(135deg, #c289f8, #ae75e4)",
                        border: "none",
                        boxShadow: "0 4px 8px rgba(194, 137, 248, 0.25)",
                        transition: "all 0.3s ease",
                        flex: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Show PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      {pdfData && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card" style={{
              borderRadius: "12px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
              border: "none",
              transition: "all 0.3s ease",
              overflow: "hidden"
            }}>
              <div className="card-body" style={{ padding: "0" }}>
                <iframe
                  title="PDF Viewer"
                  src={URL.createObjectURL(pdfData)}
                  width="100%"
                  height="600px"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mail Button */}
      {forTeacher && selectedInitial && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card" style={{
              borderRadius: "12px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
              border: "none",
              transition: "all 0.3s ease"
            }}>
              <div className="card-body" style={{ padding: "1.5rem" }}>
                <h4 className="card-title" style={{ 
                  color: "rgb(174, 117, 228)", 
                  borderBottom: "2px solid rgb(194, 137, 248)",
                  paddingBottom: "12px",
                  marginBottom: "20px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  letterSpacing: "0.3px"
                }}>
                  <span style={{ marginRight: "8px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 6L12 13L2 6" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  Email Options
                </h4>
                <Button 
                  variant="primary"
                  onClick={() => {
                    const toastId = toast.loading("Sending email...");
                    sendMail(selectedInitial)
                      .then((res) => {
                        toast.dismiss(toastId);
                        toast.success("Email sent successfully");
                      })
                      .catch((error) => {
                        toast.dismiss(toastId);
                        toast.error("Failed to send email");
                        console.error("Error sending email:", error);
                      });
                  }}
                  style={{
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #c289f8, #ae75e4)",
                    border: "none",
                    boxShadow: "0 4px 8px rgba(194, 137, 248, 0.25)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Send Email to Teacher
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
