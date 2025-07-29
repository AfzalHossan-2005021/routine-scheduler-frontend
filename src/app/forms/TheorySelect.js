import { useEffect } from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { getTheoryPreferencesForm, submitTheoryPreferencesForm } from "../api/form";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Modal } from "react-bootstrap";

export default function TheorySelect() {
  const { initial } = useParams();

  const [teacher, setTeacher] = useState({
    initial: "...",
    name: "Loading...",
  });
  const [offeredCourse, setOfferedCourse] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getTheoryPreferencesForm(initial).then((form) => {
      console.log("Form data received:", form);
      setTeacher(form.teacher);
      setOfferedCourse(form.courses);
      setSelectedCourse([])
    });
  }, [initial]);

  // Drag and drop handler
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Reorder within Offered Courses
    if (source.droppableId === 'offered-list' && destination.droppableId === 'offered-list') {
      const reordered = Array.from(offeredCourse);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      setOfferedCourse(reordered);
      return;
    }
    // Reorder within Your Preference
    if (source.droppableId === 'preference-list' && destination.droppableId === 'preference-list') {
      const reordered = Array.from(selectedCourse);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      setSelectedCourse(reordered);
      return;
    }
    // Drag from Offered Courses to Your Preference
    if (source.droppableId === 'offered-list' && destination.droppableId === 'preference-list') {
      const offered = Array.from(offeredCourse);
      const [moved] = offered.splice(source.index, 1);
      setOfferedCourse(offered);
      setSelectedCourse([
        ...selectedCourse.slice(0, destination.index),
        moved,
        ...selectedCourse.slice(destination.index),
      ]);
      return;
    }
    // Drag from Your Preference to Offered Courses
    if (source.droppableId === 'preference-list' && destination.droppableId === 'offered-list') {
      const preference = Array.from(selectedCourse);
      const [moved] = preference.splice(source.index, 1);
      setSelectedCourse(preference);
      setOfferedCourse([
        ...offeredCourse.slice(0, destination.index),
        moved,
        ...offeredCourse.slice(destination.index),
      ]);
      return;
    }
  };

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
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 7H7V17H9V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 7H15V13H17V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Theory Course Preference
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
            <li className="breadcrumb-item" style={{ color: "rgba(255,255,255,0.8)" }}>
              <a href="!#" onClick={(event) => event.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                Forms
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
              Theory Selection
            </li>
          </ol>
        </nav>
      </div>

      <div className="row w-100 mx-0">
        <div className="col-lg-12 mx-auto">
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
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 6 15.9391 6 17V19" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {teacher.name} ({teacher.initial})
                </h4>
              </div>

              <form>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="row">
                    <div className="col-5">
                      <div style={{ 
                        padding: "16px", 
                        background: "rgba(174, 117, 228, 0.05)",
                        borderRadius: "12px",
                        marginBottom: "16px"
                      }}>
                        <h5 style={{ 
                          color: "rgb(154, 77, 226)", 
                          marginBottom: "16px", 
                          fontSize: "1.1rem",
                          fontWeight: "600"
                        }}>
                          Offered Courses
                        </h5>
                        <Droppable droppableId="offered-list">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{ 
                                minHeight: 400, 
                                borderRadius: "8px", 
                                background: "white", 
                                padding: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                                border: "1px solid rgba(154, 77, 226, 0.1)"
                              }}
                            >
                              {offeredCourse.map((course, idx) => (
                                <Draggable key={course.course_id} draggableId={course.course_id} index={idx}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        userSelect: 'none',
                                        padding: "12px 16px",
                                        margin: '0 0 10px 0',
                                        background: snapshot.isDragging ? "rgba(154, 77, 226, 0.1)" : "white",
                                        borderRadius: "8px",
                                        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
                                        border: "1px solid rgba(154, 77, 226, 0.2)",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        color: "rgb(75, 75, 75)",
                                        transition: "all 0.2s ease",
                                        ...provided.draggableProps.style
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center" }}>
                                        <span style={{ 
                                          marginRight: "10px", 
                                          color: "rgb(154, 77, 226)",
                                          fontSize: "1.2rem"
                                        }}>
                                          <i className="mdi mdi-drag-horizontal-variant"></i>
                                        </span>
                                        {course.course_id} - {course.name}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {offeredCourse.length === 0 && (
                                <div style={{ 
                                  padding: "20px", 
                                  textAlign: "center", 
                                  color: "#888",
                                  fontSize: "0.95rem" 
                                }}>
                                  All courses have been selected
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>

                    <div className="col-2 d-flex flex-column justify-content-center align-items-center">
                      <div style={{
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                      }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19" stroke="rgba(154, 77, 226, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 5L19 12L12 19" stroke="rgba(154, 77, 226, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p style={{ 
                          marginTop: "10px",
                          fontSize: "0.9rem",
                          color: "rgba(154, 77, 226, 0.7)",
                          textAlign: "center"
                        }}>
                          Drag & Drop
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-5">
                      <div style={{ 
                        padding: "16px", 
                        background: "rgba(174, 117, 228, 0.05)",
                        borderRadius: "12px",
                        marginBottom: "16px"
                      }}>
                        <h5 style={{ 
                          color: "rgb(154, 77, 226)", 
                          marginBottom: "16px", 
                          fontSize: "1.1rem",
                          fontWeight: "600"
                        }}>
                          Your Preference
                        </h5>
                        <Droppable droppableId="preference-list">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{ 
                                minHeight: 400, 
                                borderRadius: "8px", 
                                background: "white", 
                                padding: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                                border: "1px solid rgba(154, 77, 226, 0.1)"
                              }}
                            >
                              {selectedCourse.map((course, idx) => (
                                <Draggable key={course.course_id} draggableId={course.course_id} index={idx}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        userSelect: 'none',
                                        padding: "12px 16px",
                                        margin: '0 0 10px 0',
                                        background: snapshot.isDragging ? "rgba(154, 77, 226, 0.1)" : "white",
                                        borderRadius: "8px",
                                        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
                                        border: "1px solid rgba(154, 77, 226, 0.2)",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        color: "rgb(75, 75, 75)",
                                        transition: "all 0.2s ease",
                                        ...provided.draggableProps.style
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center" }}>
                                        <span style={{ 
                                          marginRight: "10px", 
                                          color: "rgb(154, 77, 226)",
                                          fontSize: "1.2rem"
                                        }}>
                                          <i className="mdi mdi-drag-horizontal-variant"></i>
                                        </span>
                                        <div>
                                          <strong style={{ color: "rgb(154, 77, 226)" }}>{idx + 1}. </strong>
                                          {course.course_id} - {course.name}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {selectedCourse.length === 0 && (
                                <div style={{ 
                                  padding: "20px", 
                                  textAlign: "center", 
                                  color: "#888",
                                  fontSize: "0.95rem" 
                                }}>
                                  Drag courses here to set your preferences
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  </div>
                </DragDropContext>

                <div className="mt-4 d-flex justify-content-end">
                  <Button
                    className="me-3"
                    style={{
                      borderRadius: "6px",
                      padding: "10px 20px",
                      fontWeight: "500",
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "1px solid rgba(220, 53, 69, 0.5)",
                      color: "rgb(220, 53, 69)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      window.close();
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = "rgb(220, 53, 69)";
                      e.target.style.color = "white";
                      e.target.style.borderColor = "rgb(220, 53, 69)";
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = "rgba(220, 53, 69, 0.1)";
                      e.target.style.color = "rgb(220, 53, 69)";
                      e.target.style.borderColor = "rgba(220, 53, 69, 0.5)";
                    }}
                  >
                    <i className="mdi mdi-close-circle" style={{ fontSize: "18px", marginRight: "6px" }}></i>
                    Cancel
                  </Button>
                  <Button
                    style={{
                      borderRadius: "6px",
                      padding: "10px 20px",
                      fontWeight: "500",
                      background: "rgba(154, 77, 226, 0.15)",
                      border: "1px solid rgba(154, 77, 226, 0.5)",
                      color: "rgb(154, 77, 226)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (offeredCourse.length !== 0) {
                        setSelectedCourse([
                          ...selectedCourse,
                          ...offeredCourse,
                        ]);
                        setOfferedCourse([]);
                      } else {
                        setShowConfirm(true);
                      }
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
                    <i className="mdi mdi-check-circle" style={{ fontSize: "18px", marginRight: "6px" }}></i>
                    {offeredCourse.length !== 0 ? "Add All Courses" : "Submit Preferences"}
                  </Button>
                </div>
              </form>

              {/* Confirm Modal with updated styling */}
              <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton style={{ 
                  borderBottom: "2px solid rgba(154, 77, 226, 0.2)",
                  background: "rgba(154, 77, 226, 0.05)",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px"
                }}>
                  <Modal.Title style={{ color: "rgb(154, 77, 226)", fontWeight: "600" }}>
                    <i className="mdi mdi-alert-circle-outline me-2" style={{ verticalAlign: "middle" }}></i>
                    Confirm Submission
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: "20px" }}>
                  <p style={{ fontSize: "1rem" }}>
                    Are you sure you want to submit your preferences? This action cannot be undone.
                  </p>
                  <div style={{ marginTop: "10px", background: "rgba(154, 77, 226, 0.05)", padding: "15px", borderRadius: "8px" }}>
                    <strong style={{ color: "rgb(154, 77, 226)" }}>Selected Preferences:</strong>
                    <ul style={{ marginTop: "10px", marginBottom: "0" }}>
                      {selectedCourse.slice(0, 5).map((course, idx) => (
                        <li key={course.course_id} style={{ marginBottom: "5px" }}>
                          {idx + 1}. {course.course_id} - {course.name}
                        </li>
                      ))}
                      {selectedCourse.length > 5 && (
                        <li>... and {selectedCourse.length - 5} more</li>
                      )}
                      {selectedCourse.length === 0 && (
                        <li style={{ color: "#888" }}>No courses selected</li>
                      )}
                    </ul>
                  </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: "2px solid rgba(154, 77, 226, 0.2)", padding: "15px 20px" }}>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => setShowConfirm(false)}
                    style={{
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: "500",
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "1px solid rgba(220, 53, 69, 0.5)",
                      color: "rgb(220, 53, 69)"
                    }}
                  >
                    <i className="mdi mdi-close-circle me-1"></i> Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setShowConfirm(false);
                      const preferences = selectedCourse.map(
                        (course) => course.course_id
                      );
                      submitTheoryPreferencesForm(initial, { preferences })
                        .then((res) => {
                          toast.success("Preferences saved successfully");
                          setTimeout(() => {
                            window.close();
                          }, 1500);
                        })
                        .catch(console.log);
                    }}
                    style={{
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: "500",
                      background: "rgb(154, 77, 226)",
                      border: "1px solid rgb(154, 77, 226)",
                      color: "white"
                    }}
                  >
                    <i className="mdi mdi-check-circle me-1"></i> Yes, Submit
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
