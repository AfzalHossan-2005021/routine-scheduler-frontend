import React from "react";
import { useState } from "react";
import { Button, Card } from "react-bootstrap";
import { setTheoryEmail,setScheduleEmail,setSessionalEmail } from "../api/dashboard";
import EditEmailModal from "./EditEmailModal";
import { toast } from "react-hot-toast";


export default function Emailtemplate({ theoryEmail, scheduleEmail, sessionalEmail }) {
    const [showModal, setShowModal] = useState(false);
    const [mask, setMask] = useState();
    const [editedEmail, setEditedEmail] = useState(theoryEmail);

    const handleEditClick = (type, email) => {
        setShowModal(true);
        setEditedEmail(email);
        setMask(type);
       
    }

    const handleClose = () => {
        setShowModal(false);
      }

    

    const handleSave = () => {
        setShowModal(false);
        const email={
            email:editedEmail
        }
        if(mask === "THEORY"){
            setTheoryEmail(email).then((res) => {
                toast.success("Theory Email Updated");
            });
        }else if(mask === "SCHEDULE"){
            setScheduleEmail(email).then((res) => {
                toast.success("Schedule Email Updated");
            });
        }else if(mask === "SESSIONAL"){
            setSessionalEmail(email).then((res) => {
                toast.success("Sessional Email Updated");
            }
            );
        }
    }

    return (
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
                            Email Templates
                        </h4>
                        <div
                            className="row flex-row flex-nowrap "
                            style={{ overflowX: "auto", paddingBottom: "10px" }}
                        >
                            <div className="col-md-4 mb-3">
                                <Card style={{ 
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    border: "none",
                                    height: "100%"
                                }}>
                                    <Card.Body>
                                        <Card.Title style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            color: "#6b38af",
                                            fontWeight: "600",
                                            marginBottom: "15px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                                                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M9 22V12H15V22" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Theory Course
                                            </div>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M22 6L12 13L2 6" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </Card.Title>
                                        <Card.Subtitle className="mb-3" style={{ color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>
                                            For selecting course
                                        </Card.Subtitle>
                                        {
                                            theoryEmail &&
                                            <Card.Text style={{ 
                                                background: "#f9f4ff", 
                                                padding: "12px", 
                                                borderRadius: "8px",
                                                fontSize: "0.9rem",
                                                marginBottom: "15px"
                                            }}>
                                                {theoryEmail}
                                            </Card.Text>
                                        }
                                    <div className="d-flex justify-content-between mt-3">
                                        <Button 
                                            variant="outline-success" 
                                            style={{
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Copy
                                        </Button>
                                        <Button 
                                            variant="outline-primary" 
                                            onClick={() => handleEditClick("THEORY", theoryEmail)}
                                            style={{
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Edit
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                            </div>
                            
                            <div className="col-md-4 mb-3">
                                <Card style={{ 
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    border: "none",
                                    height: "100%"
                                }}>
                                    <Card.Body>
                                        <Card.Title style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            color: "#6b38af",
                                            fontWeight: "600",
                                            marginBottom: "15px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                                                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M16 2V6" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M8 2V6" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M3 10H21" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Schedule Ask
                                            </div>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M22 6L12 13L2 6" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </Card.Title>
                                        <Card.Subtitle className="mb-3" style={{ color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>
                                            For asking schedule
                                        </Card.Subtitle>
                                        {
                                            scheduleEmail &&
                                            <Card.Text style={{ 
                                                background: "#f9f4ff", 
                                                padding: "12px", 
                                                borderRadius: "8px",
                                                fontSize: "0.9rem",
                                                marginBottom: "15px"
                                            }}>
                                                {scheduleEmail}
                                            </Card.Text>
                                        }
                                    <div className="d-flex justify-content-between mt-3">
                                        <Button 
                                            variant="outline-success" 
                                            style={{
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Copy
                                        </Button>
                                        <Button 
                                            variant="outline-primary" 
                                            onClick={() => handleEditClick("SCHEDULE", scheduleEmail)}
                                            style={{
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Edit
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Card style={{ 
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    border: "none",
                                    height: "100%"
                                }}>
                                    <Card.Body>
                                        <Card.Title style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            color: "#6b38af",
                                            fontWeight: "600",
                                            marginBottom: "15px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                                                    <path d="M12 6V12L16 14" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Sessional Schedule
                                            </div>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M22 6L12 13L2 6" stroke="#6b38af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </Card.Title>
                                        <Card.Subtitle className="mb-3" style={{ color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>
                                            For selecting sessional
                                        </Card.Subtitle>
                                        {
                                            sessionalEmail &&
                                            <Card.Text style={{ 
                                                background: "#f9f4ff", 
                                                padding: "12px", 
                                                borderRadius: "8px",
                                                fontSize: "0.9rem",
                                                marginBottom: "15px"
                                            }}>
                                                {sessionalEmail}
                                            </Card.Text>
                                        }
                                    <div className="d-flex justify-content-between mt-3">
                                        <Button 
                                            variant="outline-success" 
                                            style={{
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Copy
                                        </Button>
                                        <Button 
                                            variant="outline-primary" 
                                            onClick={() => handleEditClick("SESSIONAL", sessionalEmail)}
                                            style={{
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Edit
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
   

        
            <EditEmailModal
        showModal={showModal}
        handleClose={handleClose}
        handleSave={handleSave}
        editedEmail={editedEmail}
        setEditedEmail={setEditedEmail}
        mask={mask}
      />
      </div>
    )
}