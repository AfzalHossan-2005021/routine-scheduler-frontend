import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getRooms } from "../api/db-crud";
import {
  getAllTheoryRoomAssignment,
  updateTheoryRoomAssignment,
  getAllSectionRoomAllocation,
  updateSectionRoomAllocation,
} from "../api/theory-room-assign";

export default function TheoryRoomAssign() {
  const [allRooms, setAllRooms] = useState([]);
  const [allSectionRoomAllocation, setAllSectionRoomAllocation] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    getRooms()
      .then((response) => {
        setAllRooms(response.filter((room) => room.active));
      })
      .catch((error) => {
        toast.error("Failed to load rooms");
      });

    getAllSectionRoomAllocation()
      .then((response) => {
        setAllSectionRoomAllocation(response);
      })
      .catch((error) => {
        toast.error("Failed to load section room allocations");
      });

    getAllTheoryRoomAssignment()
      .then((response) => {
        setAssignments(response);
      })
      .catch((error) => {
        toast.error("Failed to load theory room assignments");
      });
  }, []);

  return (
    <div>
      {/* Modern Page Header */}
      <div className="page-header">
        <h3 className="page-title">
          <div className="page-title-icon-container mdi mdi-door"></div>
          Theory Room Assignment
        </h3>
      </div>
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-view">
          <div className="card-control-container">
            <h4 className="card-name">
              <div className="card-icon mdi mdi-door"></div>
              Section Room Management
            </h4>
          </div>
          <div className="card-table-container table-responsive">
            <table className="card-table table">
              <thead className="card-table-header">
                <tr style={{ textAlign: "center" }}>
                  <th>
                    <i className="mdi mdi-domain"></i>
                    Department
                  </th>
                  <th>
                    <i className="mdi mdi-format-list-bulleted-type"></i>
                    Level-Term
                  </th>
                  <th>
                    <i className="mdi mdi-book"></i>
                    Section
                  </th>
                  <th>
                    <i className="mdi mdi-door"></i>
                    Room No
                  </th>
                </tr>
              </thead>
              <tbody className="card-table-body">
                {Array.isArray(allSectionRoomAllocation) &&
                  allSectionRoomAllocation.map(
                    (theoryRoomAllocation, index) => (
                      <tr key={index} style={{ textAlign: "center" }}>
                        <td>{theoryRoomAllocation.department}</td>
                        <td>{theoryRoomAllocation.level_term}</td>
                        <td>{theoryRoomAllocation.section}</td>
                        <td>
                          <select
                            className="form-select"
                            value={theoryRoomAllocation.room_no || ""}
                            onChange={(e) => {
                              const alreadyAllocated =
                                allSectionRoomAllocation.some(
                                  (allocation) =>
                                    allocation.room_no === e.target.value &&
                                    allocation.section !==
                                      theoryRoomAllocation.section
                                );
                              if (alreadyAllocated) {
                                toast.error(
                                  "This room is already allocated to another section"
                                );
                              }
                              const newAllocation = {
                                ...theoryRoomAllocation,
                                room_no: e.target.value,
                              };
                              updateSectionRoomAllocation(newAllocation)
                                .then((res) => {
                                  getAllSectionRoomAllocation()
                                    .then((response) => {
                                      setAllSectionRoomAllocation(response);
                                      toast.success(
                                        "Section room updated successfully"
                                      );
                                    })
                                    .catch((error) => {
                                      toast.error(
                                        "Error refreshing section rooms"
                                      );
                                    });
                                  getAllTheoryRoomAssignment()
                                    .then((response) => {
                                      setAssignments(response);
                                    })
                                    .catch((error) => {
                                      toast.error(
                                        "Failed to refresh assignments"
                                      );
                                    });
                                })
                                .catch((error) => {
                                  toast.error("Failed to update section room");
                                });
                            }}
                          >
                            <option value="">Select Room</option>
                            {allRooms.map((room) => (
                              <option key={room.room} value={room.room}>
                                {room.room}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-view">
          <div className="card-control-container">
            <h4 className="card-name">
              <div className="card-icon mdi mdi-book-open-page-variant"></div>
              Course Room Management
            </h4>
          </div>
          <div className="card-table-container table-responsive">
            <table className="card-table table">
              <thead className="card-table-header">
                <tr style={{ textAlign: "center" }}>
                  <th>
                    <i className="mdi mdi-book-open-page-variant"></i>
                    Course ID
                  </th>
                  <th>
                    <i className="mdi mdi-format-list-bulleted-type"></i>
                    Section
                  </th>
                  <th>
                    <i className="mdi mdi-calendar"></i>
                    Day
                  </th>
                  <th>
                    <i className="mdi mdi-clock"></i>
                    Time
                  </th>
                  <th>
                    <i className="mdi mdi-door"></i>
                    Room No
                  </th>
                </tr>
              </thead>
              <tbody className="card-table-body">
                {Array.isArray(assignments) &&
                  assignments.map((assignment, index) => (
                    <tr key={index} style={{ textAlign: "center" }}>
                      <td> {assignment.course_id} </td>
                      <td> {assignment.section} </td>
                      <td> {assignment.day} </td>
                      <td> {assignment.time} </td>
                      <td>
                        <select
                          className="form-select"
                          value={assignment.room_no || ""}
                          onChange={(e) => {
                            const alreadyAssigned = assignments.some(
                              (a) =>
                                a.room_no === e.target.value &&
                                a.day === assignment.day &&
                                a.time === assignment.time &&
                                a.section !== assignment.section
                            );
                            if (alreadyAssigned) {
                              toast.error(
                                "This room is already assigned to another section"
                              );
                            }
                            const newAssignment = {
                              ...assignment,
                              room_no: e.target.value,
                            };
                            updateTheoryRoomAssignment(newAssignment)
                              .then((res) => {
                                getAllTheoryRoomAssignment()
                                  .then((response) => {
                                    const assignmentData =
                                      response.data || response;
                                    setAssignments(
                                      Array.isArray(assignmentData)
                                        ? assignmentData
                                        : []
                                    );
                                    toast.success(
                                      "Assignment updated successfully"
                                    );
                                  })
                                  .catch((error) => {
                                    toast.success(
                                      "Error refreshing assignments"
                                    );
                                  });
                              })
                              .catch((error) => {
                                console.error(
                                  "Error saving assignment:",
                                  error
                                );
                                toast.error("Failed to save assignment");
                              });
                          }}
                        >
                          <option value="">Select Room</option>
                          {allRooms.map((room) => (
                            <option key={room.room} value={room.room}>
                              {room.room}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
