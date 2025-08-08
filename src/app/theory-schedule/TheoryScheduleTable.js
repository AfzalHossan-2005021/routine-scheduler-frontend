import React, { useMemo, useCallback, useState } from "react";
import { useConfig } from "../shared/ConfigContext";
import { MultiSet, set } from "mnemonist";
import { Form } from "react-bootstrap";

/**
 * Custom component for displaying a theory schedule table with single dropdown per cell
 * Styles and structure match SectionScheduleTable.js exactly
 */
const TheoryScheduleTable = React.memo(function TheoryScheduleTable(props) {
  const {
    filled = [],
    selected = [],
    allTheoryCourses = [],
    theorySchedules = {},
    sectionName,
    isDisabledTimeSlot = () => false,
    setSelectedSection,
    setSelectedCell,
    setShowCoursesModal,
    setSelectedCourse,
    setShowDeleteConfirmation,
  } = props;

  // Memoized values for configuration settings
  const { days, times, possibleLabTimes } = useConfig();

  // Convert arrays to MultiSets for efficient lookup
  const filledSet = useMemo(() => MultiSet.from(filled), [filled]);
  const selectedSet = useMemo(() => MultiSet.from(selected), [selected]);

  // Prepare filtered courses - memoized to prevent unnecessary filtering
  const filteredCourses = useMemo(() => {
    return Array.isArray(allTheoryCourses) ? allTheoryCourses : [];
  }, [allTheoryCourses]);

  // Helper to get courses for a slot
  const getCourses = useCallback(
    (slotKey) => {
      if (!theorySchedules) return [];

      // Extract day and time from slot key
      const [day, time] = slotKey.split(" ");

      // Get courses from theorySchedules
      let courses = [];

      // Check if the slot exists in theorySchedules
      if (theorySchedules[slotKey]) {
        // Extract course_ids safely, handling both array and single course_id formats
        const courseIds = Array.isArray(theorySchedules[slotKey].course_ids)
          ? theorySchedules[slotKey].course_ids
          : theorySchedules[slotKey].course_id
          ? [theorySchedules[slotKey].course_id]
          : [];

        // Map course IDs to select options
        if (courseIds.length > 0) {
          courses = courseIds
            .map((id) => {
              if (!id) return null; // Skip empty IDs

              const courseObj = filteredCourses.find((c) => c.course_id === id);
              const result = {
                value: id,
                label: `${id} - ${courseObj?.name || "Unknown"}`,
              };
              return result;
            })
            .filter(Boolean); // Remove null entries
        }
      }

      // If no courses in schedules, check filled and selected
      if (courses.length === 0) {
        const filledObj = filled.find((f) => f.day === day && f.time === time);
        if (filledObj && filledObj.course_id) {
          const courseObj = filteredCourses.find(
            (c) => c.course_id === filledObj.course_id
          );
          courses.push({
            value: filledObj.course_id,
            label: `${filledObj.course_id} - ${courseObj?.name || "Unknown"}`,
          });
        }

        const selectedObj = selected.find(
          (f) => f.day === day && f.time === time
        );
        if (selectedObj && selectedObj.course_id) {
          const courseObj = filteredCourses.find(
            (c) => c.course_id === selectedObj.course_id
          );
          courses.push({
            value: selectedObj.course_id,
            label: `${selectedObj.course_id} - ${courseObj?.name || "Unknown"}`,
          });
        }
      }

      return courses;
    },
    [theorySchedules, filled, selected, filteredCourses]
  );

  return (
    <div className="table-responsive">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Day \ Time</th>
            {times.map((time) => (
              <th key={time} scope="col">
                {time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <th key={`${day}`}>{day}</th>
              {times.map((time) => {
                const slotKey = `${day} ${time}`;
                const isDisabled = isDisabledTimeSlot(day, time);
                if (!possibleLabTimes.includes(time)) {
                  if (isDisabled.isDisabled) {
                    return null;
                  }
                }

                return (
                  <td
                    className={`${isDisabled.isDisabled ? "blocked-cell" : ""}`}
                    key={`${day}-${time}`}
                    colSpan={isDisabled.isDisabled ? 3 : 1}
                  >
                    {isDisabled.isDisabled ? (
                      <div className="sessional-assignment">
                        <div
                          style={{ fontWeight: "bold", marginBottom: "2px" }}
                        >
                          {isDisabled.sessionalAssignment[0]}
                        </div>
                        <div
                          style={{ fontWeight: "bold", marginBottom: "2px" }}
                        >
                          {isDisabled.sessionalAssignment[1]}
                        </div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                          <i className="mdi mdi-flask"></i> Lab
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>
                          <div className="cell-edit-button">
                            <i
                              className="mdi mdi-pencil"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSection(sectionName);
                                setSelectedCell({ day, time });
                                setShowCoursesModal(true);
                              }}
                            />
                          </div>
                        </div>
                        {getCourses(slotKey).length > 0 &&
                          getCourses(slotKey).map((course) => (
                            <div
                              key={course.value}
                              className="item"
                              title={`${day} ${time}`}
                            >
                              <i
                                className="mdi mdi-close-circle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(sectionName, day, time);
                                  setSelectedSection(sectionName);
                                  setSelectedCourse({
                                    course_id: course.value,
                                    day: day,
                                    time: time,
                                  });
                                  setShowDeleteConfirmation(true);
                                }}
                              />
                              <span>{course.value}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default TheoryScheduleTable;
