import { useEffect, useRef, useState } from "react";
import { Button, Badge } from "react-bootstrap";
import { toast } from "react-hot-toast";

import { getLabCourses, getLabRooms } from "../api/db-crud";
import { getRoomAssign, setRoomAssign } from "../api/theory-assign";
import { getAllSchedule } from "../api/theory-schedule";

export default function LabRoomAssign() {
  const [offeredCourse, setOfferedCourse] = useState([]);
  const [sessionalSchedule, setSessionalSchedule] = useState([]);

  const [savedConstraints, setSavedConstraints] = useState(false);
  const [viewRoomAssignment, setViewRoomAssignment] = useState(false);
  const [viewCourseAssignment, setViewCourseAssignment] = useState(false);
  const [viewLevelTermAssignment, setViewLevelTermAssignment] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [showAssignmentCard, setShowAssignmentCard] = useState(true);

  const [courseRoom, setCourseRoom] = useState([]);
  const [uniqueNamedCourses, setUniqueNamedCourses] = useState([]);
  const [fixedRoomAllocation, setFixedRoomAllocation] = useState([]);
  const [alreadySaved, setAlreadySaved] = useState(false);
  
  useEffect(() => {
    let rooms_, courses_;
    const labs = getLabRooms().then((res) => {
      rooms_ = res;
      setRooms(res);
    });
    const courses = getLabCourses().then((res) => {
      courses_ = res;
      console.log("Offered Courses: ", res);
      setOfferedCourse(res);
    });
    getAllSchedule().then((res) => {
      setSessionalSchedule(res);
      console.log("Sessional Schedule: ", res);
    });

    Promise.all([labs, courses]).then(() => {
      getRoomAssign().then((res) => {
        if (res.length > 0) {
          setAlreadySaved(true);
          const labRooms = rooms_.map((room) => {
            const courses = res
              .filter((obj) => obj.room === room.room)
              .map((obj) => {
                return courses_.find(
                  (course) => course.course_id === obj.course_id && course.section === obj.section
                );
              });
            return {
              room: room.room,
              count: courses.length,
              courses: courses,
            };
          });
          setFixedRoomAllocation(labRooms);
          setSavedConstraints(true);
        } else setAlreadySaved(false);
      });
    });
  }, []);

  useEffect(() => {
    const uniqueNames = {};
    const uniqueCourses = offeredCourse.filter((obj) => {
      if (!uniqueNames[obj.name]) {
        uniqueNames[obj.name] = true;
        return true;
      }
      return false;
    });
    setUniqueNamedCourses(uniqueCourses);
  }, [offeredCourse]);

  const selectedCourseRef = useRef(null);
  const selectedRoomRef = useRef(null);

  // Custom styles to match SessionalSchedule
  const cardStyle = {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(194, 137, 248, 0.1)",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    marginBottom: "24px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  };

  const cardHeaderStyle = {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
    color: "white",
    padding: "18px 24px",
    fontWeight: "600",
    borderBottom: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  };

  const cardBodyStyle = {
    padding: "24px"
  };

  const tableStyle = {
    borderCollapse: "separate", 
    borderSpacing: "0", 
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    boxShadow: "0 5px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(194, 137, 248, 0.1)",
    borderRadius: "10px",
    overflow: "hidden",
    width: "100%",
    margin: "0 auto",
    transition: "all 0.3s ease"
  };

  const tableHeaderStyle = {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
    color: "white",
    padding: "12px 16px",
    fontWeight: "600",
    borderBottom: "none"
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
    border: "none",
    padding: "10px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(174, 117, 228, 0.3)",
    transition: "all 0.3s ease"
  };

  const outlineButtonStyle = {
    background: "transparent",
    border: "1px solid rgb(194, 137, 248)",
    color: "rgb(174, 117, 228)",
    padding: "10px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "all 0.3s ease"
  };

  const levelTermAllocation = fixedRoomAllocation.reduce((map, room) => {
    room.courses.forEach((course) => {
      const { level_term } = course;
      if (!map[level_term]) map[level_term] = new Set();
      map[level_term].add(room.room);
    });
    return map;
  }, {});

  const levelTermAllocationArray = Object.keys(levelTermAllocation)
    .map((level_term) => {
      return {
        level_term,
        rooms: Array.from(levelTermAllocation[level_term]),
      };
    })
    .sort((a, b) => {
      return a.level_term.localeCompare(b.level_term);
    });

  // Check if a course has fixed room constraints from "Must Use" selection
  const hasFixedConstraint = (courseId) => {
    return courseRoom.some(item => item.course_id === courseId);
  };

  const generateRoomAssignments = () => {
    // Create a schedule grid to track room bookings
    // Format: roomBookings[day][time] = [{room: "roomName", course: courseObject}]
    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const timeSlots = Array.from({ length: 8 }, (_, i) => i + 1); // 1-8 timeslots
    
    const roomBookings = {};
    days.forEach(day => {
      roomBookings[day] = {};
      timeSlots.forEach(time => {
        roomBookings[day][time] = [];
      });
    });
    
    // Make a copy of rooms array for tracking availability
    const availableRooms = [...rooms];
    
    // Get courses that have schedules
    const scheduledCourses = [];
    
    // Process each scheduled course
    sessionalSchedule.forEach(schedule => {
      const { day, time, course_id, section } = schedule;
      
      // Find the matching course in offered courses
      const course = offeredCourse.find(c => 
        c.course_id === course_id && c.section === section
      );
      
      if (!course) {
        console.warn(`Course ${course_id} section ${section} not found in offered courses`);
        return;
      }
      
      scheduledCourses.push({
        ...course,
        day,
        time
      });
    });
    
    console.log("Scheduled courses with details:", scheduledCourses);
    
    // Sort courses by level_term (older batches get priority)
    scheduledCourses.sort((a, b) => {
      // Extract numeric values from level_term (e.g., "L-1 T-1" -> 1.1)
      const getNumericValue = (levelTerm) => {
        const level = parseInt(levelTerm.match(/L-(\d+)/)[1], 10);
        const term = parseInt(levelTerm.match(/T-(\d+)/)[1], 10);
        return level + term/10;
      };
      
      try {
        return getNumericValue(a.level_term) - getNumericValue(b.level_term);
      } catch (e) {
        return 0;
      }
    });
    
    // Create room assignments
    const roomAssignments = [];
    
    // Check if any course has fixed room allocation
    const coursesWithFixedRooms = new Map();
    
    // Add fixed rooms from previous assignments
    fixedRoomAllocation.forEach(room => {
      room.courses.forEach(course => {
        const key = `${course.course_id}_${course.section}`;
        if (!coursesWithFixedRooms.has(key)) {
          coursesWithFixedRooms.set(key, []);
        }
        coursesWithFixedRooms.get(key).push(room.room);
      });
    });
    
    // Add fixed rooms from the "Must Use" selections
    courseRoom.forEach(item => {
      // For each course_id in courseRoom, apply the constraint to all sections
      const matchingCourses = offeredCourse.filter(course => course.course_id === item.course_id);
      
      if (matchingCourses.length > 0) {
        console.log(`Setting fixed room constraints for ${item.course_id} (${matchingCourses.length} sections):`, item.rooms);
        
        matchingCourses.forEach(course => {
          const key = `${course.course_id}_${course.section}`;
          // Clear any existing assignments for this course+section
          coursesWithFixedRooms.set(key, []);
          
          // Add all specified rooms for this course
          item.rooms.forEach(roomName => {
            coursesWithFixedRooms.get(key).push(roomName);
          });
          
          console.log(`  Section ${course.section}: assigned to rooms ${coursesWithFixedRooms.get(key).join(', ')}`);
        });
      }
    });
    
    // Log all fixed room constraints for debugging
    console.log("All fixed room constraints:");
    coursesWithFixedRooms.forEach((rooms, courseKey) => {
      console.log(`  ${courseKey}: ${rooms.join(', ')}`);
    });
    
    console.log("Courses with fixed rooms:", Object.fromEntries(coursesWithFixedRooms));
    
    // Process each scheduled course for assignment
    scheduledCourses.forEach(course => {
      const { course_id, section, day, time } = course;
      const courseKey = `${course_id}_${section}`;
      
      // Check which rooms are available at this day and time
      const bookedRoomsAtThisTime = roomBookings[day][time].map(booking => booking.room);
      const availableRoomsAtThisTime = availableRooms.filter(room => 
        !bookedRoomsAtThisTime.includes(room.room)
      );
      
      console.log(`Available rooms for ${course_id}-${section} on ${day} at ${time}:`, 
        availableRoomsAtThisTime.map(r => r.room));
      
      let assignedRoom = null;
      
      // First try to assign to a fixed room if specified
      if (coursesWithFixedRooms.has(courseKey)) {
        const preferredRooms = coursesWithFixedRooms.get(courseKey);
        
        // Find the first available fixed room
        for (const roomName of preferredRooms) {
          const isAvailable = !bookedRoomsAtThisTime.includes(roomName);
          if (isAvailable) {
            assignedRoom = roomName;
            break;
          }
        }
      }
      
      // If no fixed room was available, assign to any available room
      if (!assignedRoom && availableRoomsAtThisTime.length > 0) {
        assignedRoom = availableRoomsAtThisTime[0].room;
      }
      
      // If a room was assigned, add it to bookings and assignments
      if (assignedRoom) {
        roomBookings[day][time].push({
          room: assignedRoom,
          course: course
        });
        
        roomAssignments.push({
          course_id,
          section,
          batch: course.batch,
          room: assignedRoom
        });
      } else {
        console.warn(`Failed to assign room for ${course_id}-${section} on ${day} at ${time}`);
      }
    });
    
    console.log("Final room assignments:", roomAssignments);
    
    // Create room allocation in the format expected by the UI
    const newRoomAllocation = rooms.map(room => {
      const assignedCourses = roomAssignments
        .filter(assignment => assignment.room === room.room)
        .map(assignment => {
          return offeredCourse.find(
            course => course.course_id === assignment.course_id && course.section === assignment.section
          );
        })
        .filter(Boolean); // Remove any undefined entries
      
      return {
        room: room.room,
        count: assignedCourses.length,
        courses: assignedCourses
      };
    });
    
    setSavedConstraints(true);
    setFixedRoomAllocation(newRoomAllocation);
    
    return roomAssignments;
  };

  // Function to update room assignment for a specific course
  const updateCourseRoomAssignment = (course, newRoomName) => {
    // Create a deep copy of the current room allocations
    const updatedAllocation = fixedRoomAllocation.map(roomAlloc => {
      // First remove this course from any room allocations it might be in
      const filteredCourses = roomAlloc.courses.filter(c => 
        !(c.course_id === course.course_id && c.section === course.section)
      );
      
      // Return the room with updated courses
      return {
        ...roomAlloc,
        courses: filteredCourses,
        count: filteredCourses.length
      };
    });
    
    // Now add the course to the newly selected room
    const targetRoomIndex = updatedAllocation.findIndex(r => r.room === newRoomName);
    
    if (targetRoomIndex !== -1) {
      updatedAllocation[targetRoomIndex] = {
        ...updatedAllocation[targetRoomIndex],
        courses: [
          ...updatedAllocation[targetRoomIndex].courses,
          course
        ],
        count: updatedAllocation[targetRoomIndex].count + 1
      };
    }
    
    // Update the fixedRoomAllocation state
    setFixedRoomAllocation(updatedAllocation);
    
    // Show success message
    toast.success(`${course.course_id} (Section ${course.section}) assigned to ${newRoomName}`);
  };

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title" style={{ 
          color: "rgb(174, 117, 228)", 
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <i className="mdi mdi-domain me-2"></i>
          Lab Room Assignment
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              Room Assign
            </li>
          </ol>
        </nav>
      </div>
      {!alreadySaved && showAssignmentCard && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card" style={cardStyle}>
              <div className="card-header" style={cardHeaderStyle}>
                <i className="mdi mdi-domain me-2"></i>
                <span>Lab Room Assignment</span>
              </div>
              <div className="card-body" style={cardBodyStyle}>
                {sessionalSchedule.length === 0 ? (
                  <div className="alert alert-warning mb-4" role="alert">
                    <i className="mdi mdi-alert-circle-outline me-2"></i>
                    <span>No sessional schedules found! Please create a sessional schedule before assigning lab rooms.</span>
                  </div>
                ) : (
                  <div className="alert alert-info mb-4" role="alert">
                    <i className="mdi mdi-information-outline me-2"></i>
                    <span>The system will automatically assign lab rooms based on the sessional schedule. Fixed room constraints (added with "MUST USE" button) will be respected when possible.</span>
                  </div>
                )}
                
                <div className="rounded btn-block p-3" style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid rgba(194, 137, 248, 0.2)",
                  borderRadius: "8px",
                  display: courseRoom.length > 0 ? 'block' : 'none'
                }}>
                  {courseRoom.map((item, index) => (
                    <span
                      className="d-inline-block m-1 p-2"
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        border: "1px solid #eee"
                      }}
                      key={index}
                    >
                      <Badge bg="info" text="light" className="me-2" style={{
                        fontSize: "0.9rem", 
                        padding: "7px 10px", 
                        borderRadius: "6px",
                        background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                        boxShadow: "0 2px 4px rgba(154, 77, 226, 0.2)"
                      }}>
                        {item.course_id}
                      </Badge>
                      {item.rooms.map((room, roomIndex) => (
                        <span key={roomIndex}>
                          <Badge bg="primary" text="light" className="me-1" style={{
                            fontSize: "0.85rem", 
                            padding: "5px 8px", 
                            borderRadius: "5px",
                            backgroundColor: "#6c7ae0",
                            border: "none"
                          }}>
                            {room}
                          </Badge>
                          <button
                            className="btn btn-sm p-0 me-2"
                            style={{
                              borderRadius: "50%", 
                              backgroundColor: "rgba(255, 92, 92, 0.1)", 
                              border: "none", 
                              width: "22px", 
                              height: "22px",
                              color: "#ff5c5c",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                              marginLeft: "2px"
                            }}
                            onClick={() => {
                              const updatedRoom = item.rooms.filter(
                                (r) => r !== room
                              );
                              if (updatedRoom.length === 0) {
                                setCourseRoom(
                                  courseRoom.filter(
                                    (course) =>
                                      course.course_id !== item.course_id
                                  )
                                );

                                setUniqueNamedCourses([
                                  ...uniqueNamedCourses,
                                  offeredCourse.find(
                                    (course) =>
                                      course.course_id === item.course_id
                                  ),
                                ]);
                              } else {
                                const index = courseRoom.findIndex(
                                  (course) =>
                                    course.course_id === item.course_id
                                );
                                const updatedCourseRoom = [...courseRoom];
                                updatedCourseRoom[index].rooms = updatedRoom;
                                setCourseRoom(updatedCourseRoom);
                              }
                            }}
                          >
                            <i className="mdi mdi-close mdi-14px"></i>
                          </button>
                        </span>
                      ))}

                      <button
                        className="btn btn-sm ms-2"
                        style={{
                          backgroundColor: "rgba(255, 92, 92, 0.1)", 
                          border: "none", 
                          borderRadius: "4px",
                          color: "#ff5c5c",
                          transition: "all 0.2s ease",
                          padding: "4px 8px"
                        }}
                        onClick={() => {
                          setUniqueNamedCourses([
                            ...uniqueNamedCourses,
                            offeredCourse.find(
                              (course) => course.course_id === item.course_id
                            ),
                          ]);
                          setCourseRoom(
                            courseRoom.filter(
                              (course) => course.course_id !== item.course_id
                            )
                          );
                        }}
                      >
                        <i className="mdi mdi-close mdi-14px"></i>
                      </button>
                    </span>
                  ))}
                </div>
                
                <form className="mt-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-5">
                      <label 
                        htmlFor="courseSelect" 
                        className="form-label mb-2" 
                        style={{ 
                          fontWeight: "600", 
                          color: "#444",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5 11.5V17L12 21L19 17V11.5" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Fixed Room Constraints (Optional)
                      </label>
                      <select
                        id="courseSelect"
                        className="form-select text-dark"
                        multiple
                        aria-label="multiple select example"
                        style={{ 
                          height: 200, 
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid rgba(194, 137, 248, 0.3)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          padding: "8px",
                          background: "linear-gradient(to bottom, #ffffff, #fdfaff)",
                          transition: "all 0.3s ease",
                          fontWeight: "500",
                          color: "#333"
                        }}
                        ref={selectedCourseRef}
                      >
                        {uniqueNamedCourses.map((course, index) => (
                          <option key={course.course_id || index} className="p-2" value={course.course_id}>
                            {course.course_id} - {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
                      <Button
                        variant="outline-success"
                        className="px-3 py-2"
                        style={{
                          fontWeight: "600", 
                          borderRadius: "8px",
                          borderColor: "rgb(194, 137, 248)",
                          color: "rgb(174, 117, 228)",
                          boxShadow: "0 2px 6px rgba(194, 137, 248, 0.15)",
                          transition: "all 0.3s ease"
                        }}
                        onClick={(e) => {
                          const selectedCourseOptions = Array.from(
                            selectedCourseRef.current.selectedOptions
                          )
                            .map((option) => option.value)
                            .map((course_id) =>
                              uniqueNamedCourses.find(
                                (course) => course.course_id === course_id
                              )
                            );

                          const selectedRoomOptions = Array.from(
                            selectedRoomRef.current.selectedOptions
                          )
                            .map((option) => option.value)
                            .map((room_id) =>
                              rooms.find((room) => room.room === room_id)
                            );

                          selectedCourseOptions.forEach((course) => {
                            setUniqueNamedCourses(
                              uniqueNamedCourses.filter(
                                (c) => c.course_id !== course.course_id
                              )
                            );

                            setCourseRoom([
                              ...courseRoom,
                              {
                                course_id: course.course_id,
                                rooms: selectedRoomOptions.map(
                                  (room) => room.room
                                ),
                              },
                            ]);
                          });
                        }}
                      >
                        MUST USE
                      </Button>
                    </div>

                    <div className="col-12 col-md-5">
                      <label 
                        htmlFor="roomSelect" 
                        className="form-label mb-2" 
                        style={{ 
                          fontWeight: "600", 
                          color: "#444",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 12L8 12" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 8L12 16" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Available Rooms
                      </label>
                      <select
                        id="roomSelect"
                        className="form-select text-dark"
                        multiple
                        aria-label="multiple select example"
                        style={{ 
                          height: 200, 
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid rgba(194, 137, 248, 0.3)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          padding: "8px",
                          background: "linear-gradient(to bottom, #ffffff, #fdfaff)",
                          transition: "all 0.3s ease",
                          fontWeight: "500",
                          color: "#333"
                        }}
                        ref={selectedRoomRef}
                      >
                        {rooms.map((room, index) => (
                          <option key={room.room || index} className="p-2" value={room.room}>
                            {room.room}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </form>
                <hr className="my-4" style={{ opacity: "0.1", borderColor: "rgb(194, 137, 248)" }} />
                <div className="d-flex justify-content-center">
                  <Button
                    style={{
                      ...buttonStyle,
                      fontSize: "1.1rem",
                      padding: "14px 32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px"
                    }}
                    onClick={() => {
                      generateRoomAssignments();
                      setShowAssignmentCard(false);
                    }}
                    size="lg"
                  >
                    <i className="mdi mdi-refresh-circle"></i>
                    Auto-Assign Lab Rooms
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Edit Constraints" button removed as requested */}

      {savedConstraints && (
        <div className="row">
          {!viewLevelTermAssignment &&
            !viewRoomAssignment &&
            !viewCourseAssignment && (
              <div className="col-9 grid-margin">
                <div className="card" style={cardStyle}>
                  <div className="card-header" style={cardHeaderStyle}>
                    <i className="mdi mdi-chart-bar me-2"></i>
                    Room Usage Statistics
                  </div>
                  <div className="card-body" style={cardBodyStyle}>
                    <div className="table-responsive">
                      <table className="table" style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={tableHeaderStyle}> Lab Room </th>
                            <th style={tableHeaderStyle}> Number of courses </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fixedRoomAllocation.map((room, index) => (
                            <tr key={index}>
                              <td style={{ padding: "12px", fontWeight: "500" }}> {room.room} </td>
                              <td style={{ padding: "12px" }}>
                                <Badge 
                                  bg={room.count > 0 ? "success" : "secondary"} 
                                  style={{ 
                                    fontSize: "0.9rem", 
                                    padding: "8px 12px", 
                                    borderRadius: "6px"
                                  }}
                                >
                                  {room.count}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {!viewLevelTermAssignment &&
            viewRoomAssignment &&
            !viewCourseAssignment && (
              <div className="col-9 grid-margin">
                <div className="card" style={cardStyle}>
                  <div className="card-header" style={cardHeaderStyle}>
                    <i className="mdi mdi-door me-2"></i>
                    Room Assignment Details
                  </div>
                  <div className="card-body" style={cardBodyStyle}>
                    <div className="table-responsive">
                      <table className="table" style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={tableHeaderStyle}> Lab Room </th>
                            <th style={tableHeaderStyle}> Assigned Courses </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fixedRoomAllocation.map((room, index) => (
                            <tr key={index}>
                              <td style={{ 
                                padding: "12px", 
                                fontWeight: "500",
                                verticalAlign: "middle",
                                borderRight: "1px solid #eee" 
                              }}> 
                                {room.room} 
                              </td>
                              {room.courses.length === 0 ? (
                                <td style={{ padding: "12px", color: "#888" }}> 
                                  <i>No courses assigned</i> 
                                </td>
                              ) : (
                                <td style={{ padding: "12px" }}>
                                  <ul style={{ 
                                    listStyle: "none", 
                                    padding: 0, 
                                    margin: 0 
                                  }}>
                                    {room.courses.map((course, index) => (
                                      <li key={index} style={{ 
                                        marginBottom: "8px",
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        backgroundColor: "#f8f9fa",
                                        border: "1px solid #eee"
                                      }}>
                                        <div style={{ 
                                          display: "flex", 
                                          alignItems: "center", 
                                          gap: "8px" 
                                        }}>
                                          <Badge style={{ 
                                            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                            padding: "5px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.85rem"
                                          }}>
                                            {course.course_id}
                                          </Badge>
                                          <span style={{ fontWeight: "500" }}>
                                            {course.name}
                                          </span>
                                          <Badge bg="info" style={{ 
                                            backgroundColor: "#e2f2ff", 
                                            color: "#0c63e4",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem"
                                          }}>
                                            {course.level_term}
                                          </Badge>
                                          <Badge bg="secondary" style={{ 
                                            backgroundColor: "#f0f0f0", 
                                            color: "#444",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem"
                                          }}>
                                            Section {course.section}
                                          </Badge>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {!viewLevelTermAssignment &&
            viewCourseAssignment &&
            !viewRoomAssignment && (
              <div className="col-9 grid-margin">
                <div className="card" style={cardStyle}>
                  <div className="card-header" style={cardHeaderStyle}>
                    <i className="mdi mdi-book-open-variant me-2"></i>
                    Course Assignment Details
                  </div>
                  <div className="card-body" style={cardBodyStyle}>
                    <div className="table-responsive">
                      <table className="table" style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={tableHeaderStyle}> Course ID </th>
                            <th style={tableHeaderStyle}> Course Name </th>
                            <th style={tableHeaderStyle}> Level-Term </th>
                            <th style={tableHeaderStyle}> Section </th>
                            <th style={tableHeaderStyle}> 
                              Assigned Room 
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {offeredCourse.map((course, index) => {
                            // Find the current room assignment for this course
                            const currentRoom = fixedRoomAllocation.find(room => 
                              room.courses.some(c => 
                                c.course_id === course.course_id && c.section === course.section
                              )
                            );
                              
                            return (
                              <tr key={index} style={{
                                backgroundColor: hasFixedConstraint(course.course_id)
                                  ? 'rgba(255, 143, 0, 0.05)'
                                  : 'inherit'
                              }}>
                                <td> {course.course_id} </td>
                                <td> {course.name} </td>
                                <td> {course.level_term} </td>
                                <td> {course.section} </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="d-flex position-relative">
                                      {hasFixedConstraint(course.course_id) && (
                                        <i className="mdi mdi-lock position-absolute" 
                                          style={{ 
                                            color: '#ff8f00',
                                            left: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2
                                          }} 
                                          title="Has fixed room constraint">
                                        </i>
                                      )}
                                      <select 
                                        className="form-select"
                                        value={currentRoom ? currentRoom.room : ''}
                                        onChange={(e) => updateCourseRoomAssignment(course, e.target.value)}
                                        style={{
                                          borderColor: hasFixedConstraint(course.course_id) 
                                            ? 'rgba(255, 143, 0, 0.5)' 
                                            : 'rgba(194, 137, 248, 0.5)',
                                          boxShadow: hasFixedConstraint(course.course_id)
                                            ? '0 0 0 0.1rem rgba(255, 143, 0, 0.25)'
                                            : '0 0 0 0.1rem rgba(194, 137, 248, 0.25)',
                                          fontSize: '0.9rem',
                                          width: '200px',
                                          backgroundColor: hasFixedConstraint(course.course_id) 
                                            ? 'rgba(255, 143, 0, 0.05)'
                                            : 'white',
                                          paddingLeft: hasFixedConstraint(course.course_id) ? '28px' : '12px',
                                          appearance: 'auto'
                                        }}
                                      >
                                        <option value="">Not Assigned</option>
                                        {rooms.map(room => (
                                          <option key={room.room} value={room.room}>
                                            {room.room}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {viewLevelTermAssignment && (
            <div className="col-9 grid-margin">
              <div className="card" style={cardStyle}>
                  <div className="card-header" style={cardHeaderStyle}>
                    <i className="mdi mdi-school me-2"></i>
                    Level-Term Assignment Details
                  </div>
                <div className="card-body" style={cardBodyStyle}>
                  <div className="table-responsive">
                    <table className="table" style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={tableHeaderStyle}> Level-Term </th>
                            <th style={tableHeaderStyle}> Used Labs </th>
                          </tr>
                        </thead>
                      <tbody>
                        {levelTermAllocationArray.map((lt, index) => (
                          <tr key={index}>
                            <td> {lt.level_term} </td>
                            {lt.rooms.length === 0 ? (
                              <td> None </td>
                            ) : (
                              <td>
                                <ul>
                                  {lt.rooms.map((room, index) => (
                                    <li key={index}>{room}</li>
                                  ))}
                                </ul>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="col-3 grid-margin">
            <div className="card" style={cardStyle}>
              <div className="card-header" style={cardHeaderStyle}>
                <i className="mdi mdi-view-dashboard me-2"></i>
                View Options
              </div>
              <div className="card-body" style={cardBodyStyle}>
                <div>
                  <div className="d-flex justify-content-center flex-column ">
                    <Button
                      style={!viewLevelTermAssignment && viewRoomAssignment ? buttonStyle : outlineButtonStyle}
                      className="btn-block mb-3"
                      onClick={() => {
                        setViewRoomAssignment(true);
                        setViewCourseAssignment(false);
                        setViewLevelTermAssignment(false);
                      }}
                    >
                      <i className="mdi mdi-door me-2"></i>
                      View Room Assignment
                    </Button>
                    <Button
                      style={!viewLevelTermAssignment && viewCourseAssignment ? buttonStyle : outlineButtonStyle}
                      className="btn-block mb-3"
                      onClick={() => {
                        setViewCourseAssignment(true);
                        setViewRoomAssignment(false);
                        setViewLevelTermAssignment(false);
                      }}
                    >
                      <i className="mdi mdi-book-open-variant me-2"></i>
                      View Course Assignment
                    </Button>
                    <Button
                      style={!viewLevelTermAssignment && !(viewCourseAssignment || viewRoomAssignment) ? buttonStyle : outlineButtonStyle}
                      className="btn-block mb-3"
                      onClick={() => {
                        setViewCourseAssignment(false);
                        setViewRoomAssignment(false);
                        setViewLevelTermAssignment(false);
                      }}
                    >
                      <i className="mdi mdi-chart-bar me-2"></i>
                      View Statistics
                    </Button>
                    <Button
                      style={viewLevelTermAssignment ? buttonStyle : outlineButtonStyle}
                      className="btn-block mb-3"
                      onClick={() => {
                        setViewLevelTermAssignment(true);
                        setViewCourseAssignment(false);
                        setViewRoomAssignment(false);
                      }}
                    >
                      View Level-Term Assignment
                    </Button>
                  </div>
                </div>
                {
                  !alreadySaved &&
                  <div className="mt-5">
                    <Button
                      variant="outline-secondary"
                      size="md"
                      className="btn-block btn-rounded mt-3"
                      onClick={() => {
                        // Initialize all states
                        setSavedConstraints(false);
                        setViewRoomAssignment(false);
                        setViewCourseAssignment(false);
                        setFixedRoomAllocation([]);
                        setShowAssignmentCard(true); // Show the assignment card again
                      }}
                      style={{
                        borderRadius: "8px",
                        padding: "10px",
                        fontWeight: "600"
                      }}
                    >
                      <i className="mdi mdi-refresh me-2"></i>
                      Clear Assignments
                    </Button>
                    <Button
                      variant="success"
                      size="md"
                      className="btn-block btn-rounded mt-3"
                      onClick={() => {
                        let data = [];
                        fixedRoomAllocation.forEach((room) => {
                          room.courses.forEach((course) => {
                            data.push({
                              course_id: course.course_id,
                              batch: course.batch,
                              section: course.section,
                              room: room.room,
                            });
                          });
                        });
                        setRoomAssign(data).then((res) => {
                          toast.success("Lab Room Assignment Saved");
                          setAlreadySaved(true);
                        });
                      }}
                      style={{
                        borderRadius: "8px",
                        padding: "10px",
                        fontWeight: "600",
                        background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)"
                      }}
                    >
                      <i className="mdi mdi-content-save me-2"></i>
                      Save Room Assignment
                    </Button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
