import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getRooms } from "../api/db-crud";
import {
  getAllNonDepartmentalLabRoomAssignment,
  updateNonDepartmentalLabRoomAssignment,
} from "../api/theory-room-assign";

export default function NonDepartmental() {
  const [allRooms, setAllRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    getRooms()
      .then((response) => {
        setAllRooms(
          response.filter((room) => {
            return room.active && room.type === 1;
          })
        );
      })
      .catch((error) => {
        toast.error("Failed to load rooms");
      });
    getAllNonDepartmentalLabRoomAssignment()
      .then((response) => {
        setAssignments(response);
      })
      .catch((error) => {
        toast.error("Failed to fetch assignments");
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title">
          <div className="page-title-icon-container mdi mdi-door"></div>
          Non-Departmental Lab Room Assignment
        </h3>
      </div>
      <div className="card">
        <div className="card-view">
          <div className="card-control-container">
            <h4 className="card-name">
              <div className="card-icon mdi mdi-door"></div>
              Non-Departmental Lab Room Management
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
                      <td>
                        <select
                          className="form-select"
                          value={assignment.room_no || ""}
                          onChange={(e) => {
                            const newAssignment = {
                              ...assignment,
                              room_no: e.target.value,
                            };
                            updateNonDepartmentalLabRoomAssignment(
                              newAssignment
                            )
                              .then(() => {
                                getAllNonDepartmentalLabRoomAssignment().then(
                                  (response) => {
                                    setAssignments(response);
                                    toast.success(
                                      "Assignment updated successfully"
                                    );
                                  }
                                );
                              })
                              .catch((error) => {
                                toast.error("Failed to update assignment");
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
