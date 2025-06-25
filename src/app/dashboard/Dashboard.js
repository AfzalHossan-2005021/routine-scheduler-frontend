import React from "react";
import { useEffect, useState } from "react";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { getTheoryEmail,getScheduleEmail,getSessionalEmail } from "../api/dashboard";
import Emailtemplate from "./Emailtemplate";

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
      <div className="page-header">
        <h3 className="page-title"> Dashboard </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              Overview
            </li>
          </ol>
        </nav>
      </div>
      <div className="row mb-4">
        <div className="col-md-4 stretch-card grid-margin">
          <div className="card" style={{
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            border: "none",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, #FF6B6B, #FF3E3E)",
            color: "white"
          }}>
            <div className="card-body" style={{ padding: "1.5rem" }}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <h4 className="font-weight-normal mb-3" style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "10px" }}>
                      <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Current Session
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                <h2 className="mb-4" style={{ fontSize: "1.8rem", fontWeight: "700" }}>January 2023</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h6 className="card-text mb-0">Progress</h6>
                  <span>20%</span>
                </div>
                <div style={{ 
                  height: "6px", 
                  background: "rgba(255,255,255,0.3)", 
                  borderRadius: "3px",
                  marginTop: "8px",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    width: "20%", 
                    height: "100%", 
                    background: "white",
                    borderRadius: "3px"
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 stretch-card grid-margin">
          <div className="card" style={{
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            border: "none",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, #36D1DC, #5B86E5)",
            color: "white"
          }}>
            <div className="card-body" style={{ padding: "1.5rem" }}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <h4 className="font-weight-normal mb-3" style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "10px" }}>
                      <path d="M18 20V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20V4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 20V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Current Progress
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 7L21 12L16 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                <h2 className="mb-4" style={{ fontSize: "1.8rem", fontWeight: "700" }}>Schedule Collection</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h6 className="card-text mb-0">Progress</h6>
                  <span>35%</span>
                </div>
                <div style={{ 
                  height: "6px", 
                  background: "rgba(255,255,255,0.3)", 
                  borderRadius: "3px",
                  marginTop: "8px",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    width: "35%", 
                    height: "100%", 
                    background: "white",
                    borderRadius: "3px"
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 stretch-card grid-margin">
          <div className="card" style={{
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            border: "none",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, #11998e, #38ef7d)",
            color: "white"
          }}>
            <div className="card-body" style={{ padding: "1.5rem" }}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <h4 className="font-weight-normal mb-3" style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "10px" }}>
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Last Activity
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                <h2 className="mb-4" style={{ fontSize: "1.8rem", fontWeight: "700" }}>Prof. MMA</h2>
                <div style={{ 
                  padding: "8px 12px", 
                  background: "rgba(255,255,255,0.2)", 
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                    <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Provided Schedule
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Emailtemplate theoryEmail={theoryEmail} scheduleEmail={scheduleEmail} sessionalEmail={sessionalEmail}/>

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
                    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="rgb(194, 137, 248)"/>
                  </svg>
                </span>
                Gmail Credentials
              </h4>
              <Alert 
                variant="info" 
                className="mb-4"
                style={{
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "rgba(104, 151, 255, 0.1)",
                  padding: "16px 20px"
                }}
              >
                <Alert.Heading style={{ color: "#3b7cff", fontSize: "1.1rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#3b7cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="#3b7cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="#3b7cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  How to get Gmail Credentials?
                </Alert.Heading>
                <ol style={{ color: "#555", marginBottom: "0" }}>
                  <li>
                    Go to{" "}
                    <a href="https://myaccount.google.com/lesssecureapps" style={{ color: "#3b7cff", fontWeight: "500" }}>
                      https://myaccount.google.com/lesssecureapps
                    </a>
                  </li>
                  <li>Turn on the option</li>
                  <li>Save the credentials</li>
                </ol>
              </Alert>
              <Form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="gmailInput" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "8px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          height: "48px",
                          borderRadius: "10px 0 0 10px",
                          border: "1px solid #d0d5dd",
                          borderRight: "none",
                          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                          fontWeight: "500",
                          color: "#333",
                          background: "linear-gradient(to bottom, #ffffff, #fdfaff)"
                        }}
                      />
                      <InputGroup.Text style={{
                        borderRadius: "0 10px 10px 0",
                        border: "1px solid #d0d5dd",
                        borderLeft: "none",
                        background: "linear-gradient(to bottom, #ffffff, #fdfaff)",
                        color: "#666",
                        fontWeight: "500"
                      }}>
                        @gmail.com
                      </InputGroup.Text>
                    </InputGroup>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="passwordInput" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "8px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          height: "48px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                          fontWeight: "500",
                          color: "#333",
                          background: "linear-gradient(to bottom, #ffffff, #fdfaff)"
                        }}
                      />
                    </InputGroup>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <Button 
                    variant="primary"
                    style={{
                      borderRadius: "10px",
                      padding: "10px 24px",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #c289f8, #ae75e4)",
                      border: "none",
                      boxShadow: "0 4px 8px rgba(174, 117, 228, 0.25)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
