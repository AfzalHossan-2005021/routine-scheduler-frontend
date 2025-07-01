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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Dashboard
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
              Overview
            </li>
          </ol>
        </nav>
      </div>

      {/* Modern Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 stretch-card grid-margin">
          <div className="card" style={{
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "none",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            overflow: "hidden",
            position: "relative"
          }}>
            <div className="card-body" style={{ padding: "2rem", position: "relative", zIndex: "2" }}>
              <div style={{ position: "relative" }}>
                <h4 className="font-weight-normal mb-3" style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "1.1rem",
                  fontWeight: "600"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
                      <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Current Session
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  </div>
                </h4>
                <h2 className="mb-4" style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "1.5rem" }}>January 2023</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h6 className="card-text mb-0" style={{ fontWeight: "500", opacity: "0.9" }}>Progress</h6>
                  <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>20%</span>
                </div>
                <div style={{ 
                  height: "8px", 
                  background: "rgba(255,255,255,0.2)", 
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    width: "20%", 
                    height: "100%", 
                    background: "white",
                    borderRadius: "4px",
                    transition: "width 0.6s ease"
                  }}></div>
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              zIndex: "1"
            }}></div>
          </div>
        </div>
        
        <div className="col-md-4 stretch-card grid-margin">
          <div className="card" style={{
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "none",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, #c289f8, #ae75e4)",
            color: "white",
            overflow: "hidden",
            position: "relative"
          }}>
            <div className="card-body" style={{ padding: "2rem", position: "relative", zIndex: "2" }}>
              <div style={{ position: "relative" }}>
                <h4 className="font-weight-normal mb-3" style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "1.1rem",
                  fontWeight: "600"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
                      <path d="M18 20V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20V4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 20V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Current Progress
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 7L21 12L16 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  </div>
                </h4>
                <h2 className="mb-4" style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "1.5rem" }}>Schedule Collection</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h6 className="card-text mb-0" style={{ fontWeight: "500", opacity: "0.9" }}>Progress</h6>
                  <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>35%</span>
                </div>
                <div style={{ 
                  height: "8px", 
                  background: "rgba(255,255,255,0.2)", 
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    width: "35%", 
                    height: "100%", 
                    background: "white",
                    borderRadius: "4px",
                    transition: "width 0.6s ease"
                  }}></div>
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              zIndex: "1"
            }}></div>
          </div>
        </div>
        
        <div className="col-md-4 stretch-card grid-margin">
          <div className="card" style={{
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "none",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            overflow: "hidden",
            position: "relative"
          }}>
            <div className="card-body" style={{ padding: "2rem", position: "relative", zIndex: "2" }}>
              <div style={{ position: "relative" }}>
                <h4 className="font-weight-normal mb-3" style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "1.1rem",
                  fontWeight: "600"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Last Activity
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  </div>
                </h4>
                <h2 className="mb-4" style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "1.5rem" }}>Prof. MMA</h2>
                <div style={{ 
                  padding: "12px 16px", 
                  background: "rgba(255,255,255,0.15)", 
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  backdropFilter: "blur(10px)"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "10px" }}>
                    <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontWeight: "500" }}>Provided Schedule</span>
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              zIndex: "1"
            }}></div>
          </div>
        </div>
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
