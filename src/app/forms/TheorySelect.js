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

  // Removed unused refs

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
      <div className="d-flex align-items-center auth px-0">
        <div className="row w-100 mx-0">
          <div className="col-lg-8 mx-auto">
            <div className="auth-form-light text-left py-5 px-4 px-sm-5">
              <div className="brand-logo">
                <img
                  src={require("../../assets/images/logo.svg").default}
                  alt="logo"
                />
              </div>
              <h4>Theory Course Preference</h4>
              <h6 className="font-weight-light">
                {teacher.name} ({teacher.initial})
              </h6>
              <form>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="row">
                    <div className="col-5" style={{ padding: 10 }}>
                      <Droppable droppableId="offered-list">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ minHeight: 400, border: '1px solid #aaa', borderRadius: 4, background: '#fff', padding: 4 }}
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
                                      padding: 8,
                                      margin: '0 0 6px 0',
                                      background: snapshot.isDragging ? '#e0e0e0' : '#fafafa',
                                      border: '1px solid #ccc',
                                      borderRadius: 4,
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    {course.course_id} - {course.name}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <h5 className="text-end m-2">Offered Courses</h5>
                    </div>
                    <div className="col-2 d-flex flex-column justify-content-center align-items-center" style={{ padding: 10 }}>
                      {/* No move buttons, just drag and drop */}
                      <span style={{ fontSize: 24, color: '#bbb' }}>&#8596;</span>
                    </div>
                    <div className="col-5" style={{ padding: 10 }}>
                      <Droppable droppableId="preference-list">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ minHeight: 400, border: '1px solid #aaa', borderRadius: 4, background: '#fff', padding: 4 }}
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
                                      padding: 8,
                                      margin: '0 0 6px 0',
                                      background: snapshot.isDragging ? '#e0e0e0' : '#fafafa',
                                      border: '1px solid #ccc',
                                      borderRadius: 4,
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    {course.course_id} - {course.name}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <h5 className="text-start m-2">Your Preference</h5>
                    </div>
                  </div>
                </DragDropContext>
                <div className="mt-3 pb-5 d-flex justify-content-end">
                  <Button
                    className="btn btn-danger btn-lg font-weight-medium me-2"
                    onClick={(e) => {
                      e.preventDefault();
                      window.close();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="btn btn-primary btn-lg font-weight-medium auth-form-btn"
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
                  >
                    {offeredCourse.length !== 0 ? "Confirm" : "SUBMIT"}
                  </Button>
                </div>
                <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Confirm Submission</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    Are you sure you want to submit your preferences?
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowConfirm(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => {
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
                    }}>
                      Yes, Submit
                    </Button>
                  </Modal.Footer>
                </Modal>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
