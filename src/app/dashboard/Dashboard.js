import React from "react";
import { useEffect, useState } from "react";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { getTheoryEmail,getScheduleEmail,getSessionalEmail } from "../api/dashboard";
import Emailtemplate from "./Emailtemplate";
import themeImg from '../../assets/images/dashboard/theme.png';

function App() {
  const [theoryEmail, setTheoryEmail] = useState("");
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [sessionalEmail, setSessionalEmail] = useState("");

  useEffect(() => {
    getTheoryEmail().then((res) => setTheoryEmail(res.email));
    getScheduleEmail().then((res) => setScheduleEmail(res.email));
    getSessionalEmail().then((res) => setSessionalEmail(res.email));
  }
  , []);

  return (
    <div>
      {/* Theme image at the top */}
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        <img src={themeImg} alt="Theme" style={{ width: '100%', height: 'auto', maxHeight: '1000px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 16px rgba(154,77,226,0.08)' }} />
      </div>

      {/* Email Templates Section */}
      <Emailtemplate theoryEmail={theoryEmail} scheduleEmail={scheduleEmail} sessionalEmail={sessionalEmail}/>

      {/* Modern Gmail Credentials Section */}
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
              <h4 className="card-title" style={{ 
                color: "rgb(174, 117, 228)", 
                borderBottom: "3px solid rgb(194, 137, 248)",
                paddingBottom: "16px",
                marginBottom: "24px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.3px"
              }}>
                <span style={{ marginRight: "12px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="rgb(194, 137, 248)"/>
                  </svg>
                </span>
                Gmail Credentials
              </h4>
              
              <Alert 
                variant="info" 
                className="mb-4"
                style={{
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "rgba(174, 117, 228, 0.08)",
                  padding: "20px 24px",
                  borderLeft: "4px solid rgb(174, 117, 228)"
                }}
              >
                <Alert.Heading style={{ 
                  color: "rgb(174, 117, 228)", 
                  fontSize: "1.2rem", 
                  marginBottom: "12px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px",
                  fontWeight: "600"
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  How to get Gmail Credentials?
                </Alert.Heading>
                <ol style={{ color: "#555", marginBottom: "0", fontSize: "1rem", lineHeight: "1.6" }}>
                  <li style={{ marginBottom: "8px" }}>
                    Go to{" "}
                    <a href="https://myaccount.google.com/lesssecureapps" style={{ 
                      color: "rgb(174, 117, 228)", 
                      fontWeight: "600",
                      textDecoration: "none"
                    }}>
                      https://myaccount.google.com/lesssecureapps
                    </a>
                  </li>
                  <li style={{ marginBottom: "8px" }}>Turn on the option</li>
                  <li>Save the credentials</li>
                </ol>
              </Alert>
              
              <Form>
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label htmlFor="gmailInput" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "12px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "1rem"
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 6L12 13L2 6" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Email Address
                    </label>
                    <InputGroup className="mb-3">
                      <Form.Control 
                        id="gmailInput"
                        placeholder="Gmail Username" 
                        type="email" 
                        style={{
                          height: "52px",
                          borderRadius: "12px 0 0 12px",
                          border: "2px solid #e1e5e9",
                          borderRight: "none",
                          boxShadow: "0 2px 8px rgba(16, 24, 40, 0.06)",
                          fontWeight: "500",
                          color: "#333",
                          background: "#ffffff",
                          fontSize: "1rem",
                          transition: "all 0.3s ease"
                        }}
                      />
                      <InputGroup.Text style={{
                        borderRadius: "0 12px 12px 0",
                        border: "2px solid #e1e5e9",
                        borderLeft: "none",
                        background: "#ffffff",
                        color: "#666",
                        fontWeight: "500",
                        fontSize: "1rem"
                      }}>
                        @gmail.com
                      </InputGroup.Text>
                    </InputGroup>
                  </div>
                  <div className="col-md-6 mb-4">
                    <label htmlFor="passwordInput" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "12px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "1rem"
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Password
                    </label>
                    <InputGroup className="mb-3">
                      <Form.Control 
                        id="passwordInput"
                        placeholder="Gmail Password" 
                        type="password" 
                        style={{
                          height: "52px",
                          borderRadius: "12px",
                          border: "2px solid #e1e5e9",
                          boxShadow: "0 2px 8px rgba(16, 24, 40, 0.06)",
                          fontWeight: "500",
                          color: "#333",
                          background: "#ffffff",
                          fontSize: "1rem",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </InputGroup>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <Button 
                    variant="primary"
                    style={{
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #c289f8, #ae75e4)",
                      border: "none",
                      boxShadow: "0 6px 16px rgba(174, 117, 228, 0.25)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "1rem"
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.5 10.5L12 14L15.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Credentials
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={false} onHide={() => {}}>
        <Modal.Header closeButton>
          <Modal.Title>Theory Course Preference</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            rows="10"
            value={`Hello {teacher_name}! <br />;
I would like to request you to
fill up the form attached to this email for giving your preferred
theory course. <br />
{link} <br />
Thank you.`}
          ></textarea>
          <Alert variant="info" className="mt-3">
            Available Variables: <br /> <br />
            <code> teacher_name </code> <code> link </code>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary">Close</Button>
          <Button variant="primary">Save changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
