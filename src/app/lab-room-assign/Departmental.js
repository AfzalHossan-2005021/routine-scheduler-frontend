import { useEffect, useRef, useState } from "react";
import { Button, Badge } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { mdiLockCheck, mdiRefresh, mdiAlertCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import { getLabCourses, getLabRooms } from "../api/db-crud";
import { getRoomAssign, setRoomAssign } from "../api/theory-assign";
import { getAllSchedule } from "../api/theory-schedule";

export default function LabRoomAssign() {
  const [offeredCourse, setOfferedCourse] = useState([]);
  const [sessionalSchedule, setSessionalSchedule] = useState([]);

  const [savedConstraints, setSavedConstraints] = useState(false);
  const [viewRoomAssignment, setViewRoomAssignment] = useState(false);
  const [viewCourseAssignment, setViewCourseAssignment] = useState(true);
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
      setOfferedCourse(res);
    });
    getAllSchedule().then((res) => {
      // Additional validation - ensure we have an array
      const scheduleData = Array.isArray(res) ? res : [];
      // Filter out any entries that don't have required fields
      const validSchedules = scheduleData.filter(item =>
        item && item.day && item.time && item.course_id && item.section
      );
      setSessionalSchedule(validSchedules);
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

  const generateRoomAssignments = () => {
    // Create a schedule grid to track room bookings
    // Format: roomBookings[day][time] = [{room: "roomName", course: courseObject}]
    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
    const timeSlots = [8, 11, 2]

    // Log available schedule data for debugging
    console.log("Sessional Schedule Data:", sessionalSchedule);

    // Check if there are any scheduling issues
    // const schedulingIssues = sessionalSchedule.filter(schedule => 
    //   !days.includes(schedule.day) || !timeSlots.includes(Number(schedule.time))
    // );

    // if (schedulingIssues.length > 0) {
    //   console.warn("Found scheduling issues:", schedulingIssues);
    //   toast.error(`Found ${schedulingIssues.length} invalid schedule entries. Check console for details.`);
    // }

    // Initialize the roomBookings structure with a safer approach
    const roomBookings = {};
    days.forEach(day => {
      roomBookings[day] = {};
      timeSlots.forEach(time => {
        roomBookings[day][time] = [];
      });
    });

    // Add a safety method to access roomBookings without causing undefined errors
    const safeGetRoomBooking = (day, time) => {
      if (!roomBookings[day]) return [];
      if (!roomBookings[day][time]) return [];
      return roomBookings[day][time];
    };

    // Make a copy of rooms array for tracking availability
    const availableRooms = [...rooms];

    // Get courses that have schedules
    const scheduledCourses = [];

    // Process each scheduled course
    sessionalSchedule.forEach(schedule => {
      // Defensive programming - Handle cases where schedule might be malformed
      if (!schedule) {
        console.warn("Found undefined or null schedule entry");
        return;
      }

      const { day, time, course_id, section } = schedule;

      // Skip if day or time is missing or not valid
      if (!day || !time || !days.includes(day) || !timeSlots.includes(Number(time))) {
        console.warn(`Invalid day or time in schedule: ${day} - ${time}`);
        return;
      }

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

    // Sort courses by level_term (older batches get priority)
    scheduledCourses.sort((a, b) => {
      // Extract numeric values from level_term (e.g., "L-1 T-1" -> 1.1)
      const getNumericValue = (levelTerm) => {
        const level = parseInt(levelTerm.match(/L-(\d+)/)[1], 10);
        const term = parseInt(levelTerm.match(/T-(\d+)/)[1], 10);
        return level + term / 10;
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
        matchingCourses.forEach(course => {
          const key = `${course.course_id}_${course.section}`;
          // Clear any existing assignments for this course+section
          coursesWithFixedRooms.set(key, []);

          // Add all specified rooms for this course
          item.rooms.forEach(roomName => {
            coursesWithFixedRooms.get(key).push(roomName);
          });
        });
      }
    });

    // Process each scheduled course for assignment
    scheduledCourses.forEach(course => {
      const { course_id, section, day, time } = course;
      const courseKey = `${course_id}_${section}`;

      // Use our safe getter to avoid undefined errors
      // Check which rooms are available at this day and time
      const bookedRoomsAtThisTime = safeGetRoomBooking(day, time).map(booking => booking.room);
      const availableRoomsAtThisTime = availableRooms.filter(room =>
        !bookedRoomsAtThisTime.includes(room.room)
      );

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
        // Make sure the day and time slots exist in roomBookings before pushing
        if (!roomBookings[day]) roomBookings[day] = {};
        if (!roomBookings[day][time]) roomBookings[day][time] = [];

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
    if (newRoomName) {
      toast.success(`${course.course_id} (Section ${course.section}) assigned to ${newRoomName}`);
    } else {
      toast.error(`Room assignment cleared for ${course.course_id} (Section ${course.section})`);
    }
  };

  // Define a shared style object for modal action buttons (copied from Teachers.js)
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
            <Icon path={mdiLockCheck} size={1} color="white" />
          </div>
          Departmental Lab Room Assignment
        </h3>
      </div>
      {!alreadySaved && showAssignmentCard && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card" style={{
              ...cardStyle,
              boxShadow: "0 10px 30px rgba(194, 137, 248, 0.12), 0 0 0 1px rgba(194, 137, 248, 0.1)",
              transform: "translateY(0)",
              transition: "all 0.3s ease",
              border: "1px solid rgba(194, 137, 248, 0.1)"
            }}>
              <div className="card-header position-relative overflow-hidden" style={{
                ...cardHeaderStyle,
                background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
                height: "75px",
                display: "flex",
                alignItems: "center",
                position: "relative",
                padding: "0 30px",
                boxShadow: "0 4px 20px rgba(154, 77, 226, 0.2)",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11 100H89V0H11V100ZM0 0V100H100V0H0Z\" fill=\"white\" fill-opacity=\"0.05\"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"10\" cy=\"10\" r=\"2\" fill=\"white\" fill-opacity=\"0.08\"/%3E%3C/svg%3E')",
                  backgroundSize: "80px 80px, 20px 20px",
                  opacity: 0.15
                }}></div>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "15px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  zIndex: 1
                }}>
                  <i className="mdi mdi-domain" style={{ fontSize: "24px", color: "white" }}></i>
                </div>
                <span style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  zIndex: 1,
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
                }}>Lab Room Assignment</span>
              </div>
              <div className="card-body" style={{
                ...cardBodyStyle,
                padding: "30px",
                position: "relative",
                backgroundColor: "rgba(255, 255, 255, 0.9)"
              }}>
                {sessionalSchedule.length === 0 ? (
                  <div className="alert mb-5" role="alert" style={{
                    backgroundColor: "rgba(255, 193, 7, 0.1)",
                    border: "1px solid rgba(255, 193, 7, 0.2)",
                    borderRadius: "12px",
                    padding: "22px",
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    boxShadow: "0 8px 20px rgba(255, 193, 7, 0.08)",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "150px",
                      height: "150px",
                      background: "radial-gradient(circle at top right, rgba(255, 193, 7, 0.1), transparent 70%)",
                      zIndex: 0
                    }}></div>
                    <div style={{
                      minWidth: "45px",
                      height: "45px",
                      borderRadius: "12px",
                      background: "linear-gradient(45deg, #FFC107, #FFDB58)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(255, 193, 7, 0.3)",
                      zIndex: 1
                    }}>
                      <Icon path={mdiAlertCircleOutline} size={1} color="white" />
                    </div>
                    <div style={{ zIndex: 1 }}>
                      <h5 style={{ margin: "0 0 5px 0", color: "#664d03", fontWeight: "600" }}>Schedule Not Found</h5>
                      <span style={{ color: "#664d03", fontWeight: "400", opacity: 0.9 }}>Please create a sessional schedule before assigning lab rooms.</span>
                    </div>
                  </div>
                ) : (
                  <div className="alert mb-5" role="alert" style={{
                    backgroundColor: "rgba(13, 202, 240, 0.08)",
                    border: "1px solid rgba(13, 202, 240, 0.2)",
                    borderRadius: "12px",
                    padding: "22px",
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    boxShadow: "0 8px 20px rgba(13, 202, 240, 0.08)",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "150px",
                      height: "150px",
                      background: "radial-gradient(circle at top right, rgba(13, 202, 240, 0.1), transparent 70%)",
                      zIndex: 0
                    }}></div>
                    <div style={{
                      minWidth: "45px",
                      height: "45px",
                      borderRadius: "12px",
                      background: "linear-gradient(45deg, #0dcaf0, #79E2F2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(13, 202, 240, 0.3)",
                      zIndex: 1
                    }}>
                      <i className="mdi mdi-information-outline" style={{ color: "white", fontSize: "24px" }}></i>
                    </div>
                    <div style={{ zIndex: 1 }}>
                      <h5 style={{ margin: "0 0 5px 0", color: "#055160", fontWeight: "600" }}>Automatic Assignment</h5>
                      <span style={{ color: "#055160", fontWeight: "400", opacity: 0.9 }}>The system will automatically assign lab rooms based on the sessional schedule. Fixed room constraints (added with "MUST USE" button) will be respected when possible.</span>
                    </div>
                  </div>
                )}

                <div className="mb-4" style={{
                  display: courseRoom.length > 0 ? 'block' : 'none',
                  animation: courseRoom.length > 0 ? 'fadeIn 0.5s ease-out' : 'none'
                }}>
                  <div className="d-flex align-items-center mb-3">
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 16px rgba(154, 77, 226, 0.2)",
                      marginRight: "14px"
                    }}>
                      <i className="mdi mdi-lock-check" style={{ color: "white", fontSize: "20px" }}></i>
                    </div>
                    <h5 style={{
                      margin: 0,
                      fontWeight: "700",
                      color: "#333",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "18px"
                    }}>
                      Fixed Room Constraints
                      <span className="ms-2 badge" style={{
                        backgroundColor: "rgba(194, 137, 248, 0.1)",
                        color: "rgb(154, 77, 226)",
                        fontSize: "0.7rem",
                        padding: "5px 8px",
                        borderRadius: "20px",
                        fontWeight: "500"
                      }}>
                        {courseRoom.length} {courseRoom.length === 1 ? 'course' : 'courses'}
                      </span>
                    </h5>
                  </div>

                  <div className="rounded p-4" style={{
                    backgroundColor: "rgba(194, 137, 248, 0.04)",
                    border: "1px solid rgba(194, 137, 248, 0.15)",
                    borderRadius: "14px",
                    boxShadow: "0 6px 20px rgba(194, 137, 248, 0.08)"
                  }}>
                    <div className="d-flex flex-wrap">
                      {courseRoom.map((item, index) => (
                        <div
                          className="m-2"
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 4px 15px rgba(194, 137, 248, 0.12)",
                            border: "1px solid rgba(194, 137, 248, 0.1)",
                            transition: "all 0.3s ease",
                            padding: "12px 16px",
                            position: "relative",
                            overflow: "hidden"
                          }}
                          key={index}
                        >
                          <div style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "80px",
                            height: "80px",
                            background: "radial-gradient(circle at top right, rgba(194, 137, 248, 0.03), transparent 70%)"
                          }}></div>

                          <div className="d-flex flex-column">
                            <div className="mb-2">
                              <Badge bg="info" text="light" style={{
                                fontSize: "0.95rem",
                                padding: "7px 12px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                boxShadow: "0 3px 8px rgba(154, 77, 226, 0.2)",
                                fontWeight: "600",
                                letterSpacing: "0.3px"
                              }}>
                                {item.course_id}
                              </Badge>
                            </div>

                            <div className="mt-1">
                              <small style={{
                                color: "#555",
                                fontWeight: "500",
                                fontSize: "0.8rem",
                                display: "block",
                                marginBottom: "5px"
                              }}>
                                Must use rooms:
                              </small>
                              <div className="d-flex flex-wrap align-items-center" style={{ gap: "4px" }}>
                                {item.rooms.map((room, roomIndex) => (
                                  <span key={roomIndex} className="d-flex align-items-center">
                                    <Badge bg="primary" text="light" style={{
                                      fontSize: "0.85rem",
                                      padding: "6px 10px",
                                      borderRadius: "6px",
                                      background: "#6c7ae0",
                                      boxShadow: "0 2px 6px rgba(108, 122, 224, 0.2)",
                                      border: "none",
                                      fontWeight: "500"
                                    }}>
                                      {room}
                                    </Badge>
                                    <button
                                      className="btn btn-sm p-0 ms-1"
                                      style={{
                                        borderRadius: "6px",
                                        backgroundColor: "rgba(255, 92, 92, 0.08)",
                                        border: "none",
                                        color: "#ff5c5c",
                                        transition: "all 0.2s ease",
                                        marginLeft: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "26px",
                                        height: "26px"
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
                                      <i className="mdi mdi-delete-outline" style={{ fontSize: "14px" }}></i>
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <form className="mt-4">
                  <div className="row g-4">
                    {/* First Column */}
                    <div className="col-12 col-md-5">
                      <div style={{
                        backgroundColor: "rgba(194, 137, 248, 0.04)",
                        borderRadius: "15px",
                        padding: "24px",
                        height: "100%",
                        border: "1px solid rgba(194, 137, 248, 0.15)",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.03)"
                      }}>
                        <label
                          htmlFor="courseSelect"
                          className="form-label mb-3"
                          style={{
                            fontWeight: "700",
                            color: "#333",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "16px"
                          }}
                        >
                          <div style={{
                            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                            width: "35px",
                            height: "35px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 10px rgba(174, 117, 228, 0.2)"
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5 11.5V17L12 21L19 17V11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
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
                            borderRadius: "12px",
                            border: "1px solid rgba(194, 137, 248, 0.3)",
                            boxShadow: "0 8px 20px rgba(194, 137, 248, 0.08)",
                            padding: "12px",
                            background: "linear-gradient(to bottom, #ffffff, #fdfaff)",
                            transition: "all 0.3s ease",
                            fontWeight: "500",
                            color: "#333",
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(194, 137, 248, 0.3) rgba(194, 137, 248, 0.1)"
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
                    </div>

                    {/* Middle Column */}
                    <div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        padding: "20px 0"
                      }}>
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
                            setCourseRoom((prev) => [
                              ...prev,
                              {
                                course_id: selectedCourseRef.current.value,
                                rooms: Array.from(selectedRoomRef.current.selectedOptions).map((o) => o.value),
                              },
                            ]);
                          }}
                        >
                          <Icon path={mdiLockCheck} size={0.9} style={{ marginRight: 6 }} />
                          MUST USE
                        </Button>
                      </div>
                    </div>

                    {/* Third Column */}
                    <div className="col-12 col-md-5">
                      <div style={{
                        backgroundColor: "rgba(194, 137, 248, 0.04)",
                        borderRadius: "15px",
                        padding: "24px",
                        height: "100%",
                        border: "1px solid rgba(194, 137, 248, 0.15)",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.03)"
                      }}>
                        <label
                          htmlFor="roomSelect"
                          className="form-label mb-3"
                          style={{
                            fontWeight: "700",
                            color: "#333",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "16px"
                          }}
                        >
                          <div style={{
                            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                            width: "35px",
                            height: "35px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 10px rgba(174, 117, 228, 0.2)"
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M16 12L8 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 8L12 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
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
                            borderRadius: "12px",
                            border: "1px solid rgba(194, 137, 248, 0.3)",
                            boxShadow: "0 8px 20px rgba(194, 137, 248, 0.08)",
                            padding: "12px",
                            background: "linear-gradient(to bottom, #ffffff, #fdfaff)",
                            transition: "all 0.3s ease",
                            fontWeight: "500",
                            color: "#333",
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(194, 137, 248, 0.3) rgba(194, 137, 248, 0.1)"
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
                  </div>
                </form>
                <hr className="my-5" style={{ opacity: "0.1", borderColor: "rgb(194, 137, 248)", margin: "35px 0" }} />
                <div className="d-flex justify-content-center">
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
                      generateRoomAssignments();
                      setShowAssignmentCard(false);
                    }}
                  >
                    <Icon path={mdiRefresh} size={1.1} style={{ marginRight: 8 }} />
                    Assign Lab Rooms
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
          <div className="col-12 grid-margin">
            <div className="card" style={cardStyle}>
              <div className="card-header" style={{
                ...cardHeaderStyle,
                padding: "0",
                overflow: "hidden"
              }}>
                <ul className="nav nav-tabs w-100" style={{
                  margin: "0",
                  borderBottom: "none"
                }}>
                  <li className="nav-item">
                    <Button
                      variant={viewCourseAssignment ? "primary" : "light"}
                      className="rounded-0 border-0"
                      style={{
                        backgroundColor: viewCourseAssignment ?
                          "rgba(255, 255, 255, 0.3)" : "transparent",
                        boxShadow: viewCourseAssignment ?
                          "0 -4px 0 rgba(255, 255, 255, 0.7) inset" : "none",
                        color: "#fff",
                        fontWeight: "600",
                        padding: "20px 25px",
                        borderRadius: "0",
                        border: "none",
                        height: "100%"
                      }}
                      onClick={() => {
                        setViewCourseAssignment(true);
                        setViewRoomAssignment(false);
                        setViewLevelTermAssignment(false);
                      }}
                    >
                      <i className="mdi mdi-book-open-variant me-2"></i>
                      Course Assignment
                    </Button>
                  </li>
                  <li className="nav-item">
                    <Button
                      variant={!viewLevelTermAssignment && !viewRoomAssignment && !viewCourseAssignment ? "primary" : "light"}
                      className="rounded-0 border-0"
                      style={{
                        backgroundColor: !viewLevelTermAssignment && !viewRoomAssignment && !viewCourseAssignment ?
                          "rgba(255, 255, 255, 0.3)" : "transparent",
                        boxShadow: !viewLevelTermAssignment && !viewRoomAssignment && !viewCourseAssignment ?
                          "0 -4px 0 rgba(255, 255, 255, 0.7) inset" : "none",
                        color: "#fff",
                        fontWeight: "600",
                        padding: "20px 25px",
                        borderRadius: "0",
                        border: "none",
                        height: "100%"
                      }}
                      onClick={() => {
                        setViewCourseAssignment(false);
                        setViewRoomAssignment(false);
                        setViewLevelTermAssignment(false);
                      }}
                    >
                      <i className="mdi mdi-chart-bar me-2"></i>
                      Statistics
                    </Button>
                  </li>
                  <li className="nav-item">
                    <Button
                      variant={viewRoomAssignment ? "primary" : "light"}
                      className="rounded-0 border-0"
                      style={{
                        backgroundColor: viewRoomAssignment ?
                          "rgba(255, 255, 255, 0.3)" : "transparent",
                        boxShadow: viewRoomAssignment ?
                          "0 -4px 0 rgba(255, 255, 255, 0.7) inset" : "none",
                        color: "#fff",
                        fontWeight: "600",
                        padding: "20px 25px",
                        borderRadius: "0",
                        border: "none",
                        height: "100%"
                      }}
                      onClick={() => {
                        setViewRoomAssignment(true);
                        setViewCourseAssignment(false);
                        setViewLevelTermAssignment(false);
                      }}
                    >
                      <i className="mdi mdi-door me-2"></i>
                      Room Assignment
                    </Button>
                  </li>
                  <li className="nav-item">
                    <Button
                      variant={viewLevelTermAssignment ? "primary" : "light"}
                      className="rounded-0 border-0"
                      style={{
                        backgroundColor: viewLevelTermAssignment ?
                          "rgba(255, 255, 255, 0.3)" : "transparent",
                        boxShadow: viewLevelTermAssignment ?
                          "0 -4px 0 rgba(255, 255, 255, 0.7) inset" : "none",
                        color: "#fff",
                        fontWeight: "600",
                        padding: "20px 25px",
                        borderRadius: "0",
                        border: "none",
                        height: "100%"
                      }}
                      onClick={() => {
                        setViewLevelTermAssignment(true);
                        setViewCourseAssignment(false);
                        setViewRoomAssignment(false);
                      }}
                    >
                      <i className="mdi mdi-school me-2"></i>
                      Level-Term Assignment
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="card-body" style={{ ...cardBodyStyle, padding: "24px" }}>
                  {/* Statistics Tab */}
                  {!viewLevelTermAssignment && !viewRoomAssignment && !viewCourseAssignment && (
                    <div className="tab-pane fade show active">
                      <div className="table-responsive">
                        <table className="table" style={{ ...tableStyle, transition: 'all 0.3s ease' }}>
                          <thead>
                            <tr>
                              <th style={tableHeaderStyle}> Lab Room </th>
                              <th style={tableHeaderStyle}> Number of courses </th>
                            </tr>
                          </thead>
                          <style>
                            {`
                              .stats-row {
                                transition: all 0.2s ease;
                              }
                              .stats-row:hover {
                                background-color: rgba(194, 137, 248, 0.05) !important;
                              }
                            `}
                          </style>
                          <tbody>
                            {fixedRoomAllocation.map((room, index) => (
                              <tr key={index} className="stats-row">
                                <td style={{
                                  padding: "16px",
                                  verticalAlign: "middle",
                                  textAlign: "center"
                                }}>
                                  <div className="d-flex flex-column align-items-center">
                                    <div style={{
                                      width: "45px",
                                      height: "45px",
                                      borderRadius: "12px",
                                      background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: "0 4px 10px rgba(174, 117, 228, 0.2)",
                                      marginBottom: "10px"
                                    }}>
                                      <i className="mdi mdi-door" style={{ fontSize: "20px", color: "white" }}></i>
                                    </div>
                                    <span style={{ fontSize: "1.05rem", fontWeight: "600", color: "#333" }}>{room.room}</span>
                                  </div>
                                </td>
                                <td style={{
                                  padding: "16px",
                                  verticalAlign: "middle",
                                  textAlign: "center"
                                }}>
                                  <div style={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: room.count > 0 ? "rgba(40, 167, 69, 0.1)" : "rgba(108, 117, 125, 0.1)",
                                    color: room.count > 0 ? "#28a745" : "#6c757d",
                                    borderRadius: "50%",
                                    border: `2px solid ${room.count > 0 ? "rgba(40, 167, 69, 0.5)" : "rgba(108, 117, 125, 0.5)"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    boxShadow: room.count > 0 ? "0 4px 8px rgba(40, 167, 69, 0.15)" : "0 4px 8px rgba(108, 117, 125, 0.15)"
                                  }}>
                                    {room.count}
                                  </div>
                                  <div style={{
                                    marginTop: "8px",
                                    fontSize: "0.85rem",
                                    color: "#666",
                                    fontWeight: "500"
                                  }}>
                                    {room.count === 1 ? 'course' : 'courses'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Room Assignment Tab */}
                  {!viewLevelTermAssignment && viewRoomAssignment && !viewCourseAssignment && (
                    <div className="tab-pane fade show active">
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
                                  padding: "16px",
                                  fontWeight: "600",
                                  verticalAlign: "middle",
                                  borderRight: "1px solid rgba(194, 137, 248, 0.1)",
                                  textAlign: "center"
                                }}>
                                  <div className="d-flex flex-column align-items-center">
                                    <div style={{
                                      width: "45px",
                                      height: "45px",
                                      borderRadius: "12px",
                                      background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: "0 4px 10px rgba(174, 117, 228, 0.2)",
                                      marginBottom: "10px",
                                      transition: "transform 0.2s ease"
                                    }}>
                                      <i className="mdi mdi-door" style={{ fontSize: "20px", color: "white" }}></i>
                                    </div>
                                    <span style={{ fontSize: "1.05rem", fontWeight: "600", color: "#333", marginBottom: "4px" }}>{room.room}</span>
                                    <div style={{
                                      backgroundColor: "rgba(194, 137, 248, 0.08)",
                                      padding: "3px 10px",
                                      borderRadius: "12px",
                                      fontSize: "0.8rem",
                                      color: "rgb(106, 27, 154)",
                                      fontWeight: "500"
                                    }}>
                                      {room.count} {room.count === 1 ? 'course' : 'courses'}
                                    </div>
                                  </div>
                                </td>
                                {room.courses.length === 0 ? (
                                  <td style={{ padding: "20px", textAlign: "center", verticalAlign: "middle" }}>
                                    <div style={{
                                      padding: "20px",
                                      backgroundColor: "rgba(194, 137, 248, 0.05)",
                                      borderRadius: "12px",
                                      color: "#888",
                                      border: "1px dashed rgba(194, 137, 248, 0.3)",
                                      fontStyle: "italic"
                                    }}>
                                      <i className="mdi mdi-information-outline me-2" style={{ color: "rgb(174, 117, 228)" }}></i>
                                      No courses assigned
                                    </div>
                                  </td>
                                ) : (
                                  <td style={{ padding: "16px", textAlign: "center", verticalAlign: "middle" }}>
                                    <div className="d-flex flex-column align-items-center gap-3">
                                      {room.courses.map((course, index) => (
                                        <div
                                          key={index}
                                          className="course-item"
                                          style={{
                                            padding: "12px 16px",
                                            borderRadius: "10px",
                                            backgroundColor: "rgba(194, 137, 248, 0.05)",
                                            border: "1px solid rgba(194, 137, 248, 0.12)",
                                            width: "100%",
                                            maxWidth: "400px",
                                            boxShadow: "0 3px 8px rgba(0,0,0,0.03)",
                                            transition: "transform 0.2s ease, box-shadow 0.2s ease"
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 5px 12px rgba(0,0,0,0.06)";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.03)";
                                          }}
                                        >
                                          <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                            <Badge style={{
                                              background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                              padding: "5px 10px",
                                              borderRadius: "6px",
                                              fontSize: "0.85rem",
                                              fontWeight: "600",
                                              boxShadow: "0 2px 4px rgba(174, 117, 228, 0.2)"
                                            }}>
                                              {course.course_id}
                                            </Badge>
                                            <span style={{ fontWeight: "500" }}>
                                              {course.name}
                                            </span>
                                            <Badge bg="secondary" style={{
                                              backgroundColor: "#f0f0f0",
                                              color: "#444",
                                              padding: "3px 8px",
                                              borderRadius: "4px",
                                              fontSize: "0.75rem"
                                            }}>
                                              Section {course.section}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Course Assignment Tab */}
                  {!viewLevelTermAssignment && viewCourseAssignment && !viewRoomAssignment && (
                    <div className="tab-pane fade show active">
                      <div className="table-responsive">
                        <table className="table" style={{ ...tableStyle, transition: 'all 0.3s ease' }}>
                          <thead>
                            <tr>
                              <th style={tableHeaderStyle}> Course ID </th>
                              <th style={tableHeaderStyle}> Course Name </th>
                              <th style={tableHeaderStyle}> Level-Term </th>
                              <th style={tableHeaderStyle}> Section </th>
                              <th style={tableHeaderStyle}> Assigned Room </th>
                            </tr>
                          </thead>
                          <style>
                            {`
                              .table tbody tr {
                                transition: all 0.2s ease;
                              }
                              .table tbody tr:hover {
                                background-color: rgba(194, 137, 248, 0.05) !important;
                              }
                              .form-select:focus {
                                border-color: rgba(194, 137, 248, 0.8) !important;
                                box-shadow: 0 0 0 0.25rem rgba(194, 137, 248, 0.25) !important;
                              }
                            `}
                          </style>
                          <tbody>
                            {offeredCourse.map((course, index) => {
                              // Find the current room assignment for this course
                              const currentRoom = fixedRoomAllocation.find(room =>
                                room.courses.some(c =>
                                  c.course_id === course.course_id && c.section === course.section
                                )
                              );
                              return (
                                <tr key={index}>
                                  <td>{course.course_id}</td>
                                  <td>{course.name}</td>
                                  <td>{course.level_term}</td>
                                  <td>{course.section}</td>
                                  <td>
                                    <select
                                      className="form-select form-select-sm"
                                      value={currentRoom ? currentRoom.room : ''}
                                      onChange={(e) => updateCourseRoomAssignment(course, e.target.value)}
                                      style={{
                                        borderRadius: '8px',
                                        borderColor: 'rgba(194, 137, 248, 0.5)',
                                        background: currentRoom ? 'rgba(194, 137, 248, 0.1)' : '#fff',
                                        color: currentRoom ? '#6b38a6' : '#6c757d',
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.9rem',
                                        boxShadow: currentRoom ? '0 0 0 0.2rem rgba(194, 137, 248, 0.15)' : 'none',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <option value="">Select a room</option>
                                      {rooms.map((room) => (
                                        <option key={room.room} value={room.room}>
                                          {room.room}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Level-Term Assignment Tab */}
                  {viewLevelTermAssignment && (
                    <div className="tab-pane fade show active">
                      <div className="table-responsive">
                        <table className="table" style={{ ...tableStyle, transition: 'all 0.3s ease' }}>
                          <thead>
                            <tr>
                              <th style={tableHeaderStyle}> Level-Term </th>
                              <th style={tableHeaderStyle}> Used Labs </th>
                            </tr>
                          </thead>
                          <style>
                            {`
                              .level-term-row {
                                transition: all 0.2s ease;
                              }
                              .level-term-row:hover {
                                background-color: rgba(194, 137, 248, 0.05) !important;
                              }
                              .badge-room {
                                background-color: rgba(194, 137, 248, 0.1);
                                color: rgb(106, 27, 154);
                                border: 1px solid rgba(194, 137, 248, 0.2);
                                padding: 6px 12px;
                                margin: 3px;
                                border-radius: 8px;
                                display: inline-block;
                                font-weight: 500;
                                font-size: 0.9rem;
                                transition: all 0.2s ease;
                              }
                              .badge-room:hover {
                                background-color: rgba(194, 137, 248, 0.15);
                                transform: translateY(-1px);
                                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                              }
                            `}
                          </style>
                          <tbody>
                            {levelTermAllocationArray.map((lt, index) => (
                              <tr key={index} className="level-term-row">
                                <td style={{
                                  verticalAlign: "middle",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  fontSize: "1.05rem",
                                  color: "#333"
                                }}>
                                  <div className="d-flex flex-column align-items-center">
                                    <div style={{
                                      width: "45px",
                                      height: "45px",
                                      borderRadius: "12px",
                                      background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: "0 4px 10px rgba(174, 117, 228, 0.2)",
                                      marginBottom: "10px"
                                    }}>
                                      <i className="mdi mdi-school" style={{ fontSize: "20px", color: "white" }}></i>
                                    </div>
                                    {lt.level_term}
                                  </div>
                                </td>
                                {lt.rooms.length === 0 ? (
                                  <td style={{
                                    padding: "20px",
                                    textAlign: "center",
                                    verticalAlign: "middle"
                                  }}>
                                    <div style={{
                                      padding: "20px",
                                      backgroundColor: "rgba(194, 137, 248, 0.05)",
                                      borderRadius: "12px",
                                      color: "#888",
                                      border: "1px dashed rgba(194, 137, 248, 0.3)",
                                      fontStyle: "italic"
                                    }}>
                                      <i className="mdi mdi-information-outline me-2" style={{ color: "rgb(174, 117, 228)" }}></i>
                                      No rooms assigned
                                    </div>
                                  </td>
                                ) : (
                                  <td style={{
                                    padding: "16px",
                                    textAlign: "center",
                                    verticalAlign: "middle"
                                  }}>
                                    <div className="d-flex flex-wrap justify-content-center">
                                      {lt.rooms.map((room, index) => (
                                        <span key={index} className="badge-room">
                                          <i className="mdi mdi-door me-2"></i>
                                          {room}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with buttons */}
                {!alreadySaved && (
                  <div className="d-flex justify-content-end mt-5 pt-4" style={{
                    borderTop: "1px solid rgba(194, 137, 248, 0.2)",
                    gap: "20px"
                  }}>
                    <Button
                      variant="outline-secondary"
                      size="md"
                      className="py-2 px-4"
                      onClick={() => {
                        // Initialize all states
                        setSavedConstraints(false);
                        setViewRoomAssignment(false);
                        setViewCourseAssignment(false);
                        setFixedRoomAllocation([]);
                        setShowAssignmentCard(true); // Show the assignment card again
                      }}
                      style={{
                        borderRadius: "10px",
                        fontWeight: "600",
                        width: "200px",
                        borderColor: "rgba(194, 137, 248, 0.5)",
                        color: "rgb(174, 117, 228)",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(194, 137, 248, 0.05)";
                        e.currentTarget.style.borderColor = "rgba(194, 137, 248, 0.8)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(194, 137, 248, 0.15)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.borderColor = "rgba(194, 137, 248, 0.5)";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.05)";
                      }}
                    >
                      <i className="mdi mdi-refresh me-2"></i>
                      Clear Assignments
                    </Button>
                    <Button
                      variant="success"
                      size="md"
                      className="py-2 px-4"
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
                          toast.success("Lab Room Assignment Saved Successfully");
                          setAlreadySaved(true);
                        });
                      }}
                      style={{
                        borderRadius: "10px",
                        fontWeight: "600",
                        background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(174, 117, 228, 0.3)",
                        width: "200px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = "0 6px 15px rgba(174, 117, 228, 0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(174, 117, 228, 0.3)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <i className="mdi mdi-content-save me-2"></i>
                      Save Assignment
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
