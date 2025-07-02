import React, { useMemo, useCallback } from "react";
import { Form } from "react-bootstrap";
import { days, times } from "../shared/ScheduleSelctionTable";
import { MultiSet } from "mnemonist";
import { toast } from "react-hot-toast";
import { mdiBookOpenVariant } from '@mdi/js';
import Icon from '@mdi/react';

/**
 * Custom component for displaying a theory schedule table with single dropdown per cell
 * Styles and structure match SectionScheduleTable.js exactly
 */
const TheoryScheduleTable = React.memo(function TheoryScheduleTable({
  filled = [],
  selected = [],
  onChange = () => { },
  theoryTimes = [],
  allTheoryCourses = [],
  theorySchedules = {},
  sectionName = "Section",
  isSessionalCourse = () => false,
}) {
  // Debug log to print allTheoryCourses for troubleshooting
  //console.log('allTheoryCourses:', allTheoryCourses);

  // Convert arrays to MultiSets for efficient lookup
  const filledSet = useMemo(() => MultiSet.from(filled), [filled]);
  const selectedSet = useMemo(() => MultiSet.from(selected), [selected]);
  const theoryTimesSet = useMemo(() =>
    MultiSet.from(theoryTimes.length ? theoryTimes : days.map((day) => `${day} 2`)),
    [theoryTimes]
  );

  // Prepare filtered courses - memoized to prevent unnecessary filtering
  const filteredCourses = useMemo(() => {
    return Array.isArray(allTheoryCourses) ? allTheoryCourses : [];
  }, [allTheoryCourses]);

  // Helper to get course for a slot
  const getCourse = useCallback((slotKey) => {
    if (!theorySchedules) return null;
    if (theorySchedules[slotKey] && theorySchedules[slotKey].course_id) {
      return theorySchedules[slotKey].course_id;
    }
    const filledObj = filled.find(f => f.day === slotKey.split(' ')[0] && f.time === slotKey.split(' ')[1]);
    if (filledObj && filledObj.course_id) return filledObj.course_id;
    const selectedObj = selected.find(f => f.day === slotKey.split(' ')[0] && f.time === slotKey.split(' ')[1]);
    if (selectedObj && selectedObj.course_id) return selectedObj.course_id;
    return null;
  }, [theorySchedules, filled, selected]);

  // Cell style calculation
  const getCellStyle = useCallback((day, time) => {
    const key = `${day} ${time}`;
    if (selectedSet.has(key)) return "selected-upper";
    if (filledSet.has(key)) return "filled-upper";
    return "";
  }, [selectedSet, filledSet]);

  // Event handler
  const handleCourseChange = useCallback((day, time, courseId) => {
    onChange(day, time, courseId);
  }, [onChange]);

  // Memoized table style for consistent rendering with improved appearance
  const tableStyle = useMemo(() => ({
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
  }), []);

  return (
    <div>
      <style jsx="true">{`
        .cell-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          overflow: hidden;
          padding: 0;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          border-radius: 6px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        }
        td:hover .cell-container {
          transform: scale(1.03);
          box-shadow: inset 0 0 0 1px rgba(194, 137, 248, 0.3);
        }
        .form-control {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          z-index: 1;
        }
        .form-control:hover {
          border-color: rgb(194, 137, 248) !important;
          box-shadow: 0 0 0 3px rgba(194, 137, 248, 0.1), 0 1px 3px rgba(16, 24, 40, 0.1) !important;
          transform: translateY(-1px);
        }
        .form-control:focus {
          border-color: rgb(194, 137, 248) !important;
          box-shadow: 0 0 0 4px rgba(194, 137, 248, 0.15), 0 1px 3px rgba(16, 24, 40, 0.1) !important;
          transform: translateY(-1px);
          background: linear-gradient(to bottom, #ffffff, #fcf9ff) !important;
          color: rgb(94, 37, 126) !important;
        }
        .form-control::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgba(194, 137, 248, 0.3);
          opacity: 0;
          border-radius: 100%;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
        }
        .form-control:focus::after {
          animation: form-ripple 1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        @keyframes form-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.4;
          }
          40% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(30);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(40);
          }
        }
        .form-label {
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        .form-label:hover {
          color: rgb(154, 77, 226) !important;
          transform: translateX(2px);
        }
        .form-label svg {
          transition: all 0.3s ease;
        }
        .form-label:hover svg {
          transform: scale(1.1);
        }
        .routine-table {
          border-spacing: 0;
          border-collapse: separate;
          overflow: hidden;
          font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        }
        .routine-table td {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          z-index: 1;
          border: 1px solid rgba(222, 226, 230, 0.8);
        }
        .routine-table td:hover {
          background-color: #f0e9ff !important;
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 16px rgba(154, 77, 226, 0.2);
          z-index: 3;
          border-color: rgba(194, 137, 248, 0.4);
        }
        .routine-table td:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(194, 137, 248, 0.05);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: none;
          z-index: -1;
          border-radius: inherit;
          transform: scale(0.97);
        }
        .routine-table td:hover:before {
          opacity: 1;
          transform: scale(1);
        }
        .dropdown-cell {
          width: 100%;
          height: 100%;
          min-height: 100%;
          min-width: 100%;
          box-sizing: border-box;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 8px;
          margin: 0;
          display: block;
          background: transparent !important;
          outline: none !important;
          box-shadow: none !important;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: none !important;
        }
        .dropdown-cell:focus, .dropdown-cell:hover, .dropdown-cell:active {
          background: transparent !important;
        }
        td {
          padding: 0 !important;
          height: 60px !important;
        }
        .dropdown-cell:focus, .dropdown-cell:hover {
          border-color: rgb(194, 137, 248) !important;
          outline: 0;
          box-shadow: 0 0 0 2px rgba(194, 137, 248, 0.25), 0 4px 8px rgba(194, 137, 248, 0.15);
          color: rgb(94, 37, 126);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235E257E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-color: #fcfaff;
          transform: translateY(-1px);
          letter-spacing: 0.01em;
        }
        .dropdown-cell:after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgba(194, 137, 248, 0.3);
          opacity: 0;
          border-radius: 100%;
          transform: scale(1, 1) translate(-50%);
          transform-origin: 50% 50%;
          pointer-events: none;
        }
        .dropdown-cell:focus:after {
          animation: ripple 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        .dropdown-cell:hover:after {
          animation: micro-ripple 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .dropdown-cell option {
          font-size: 0.9rem;
          padding: 8px;
        }
        .section-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .section-label {
          font-weight: bold;
          padding: 7px 14px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%);
          color: white;
          box-shadow: 0 4px 8px rgba(174, 117, 228, 0.18);
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-label:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(154, 77, 226, 0.4);
        }
        .section-label:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 70%);
          z-index: 1;
          transition: all 0.6s ease;
          transform: translateX(-100%);
        }
        .section-label:hover:after {
          transform: translateX(100%);
        }
        .selected-upper {
          font-weight: bold;
          border-color: rgb(194, 137, 248) !important;
          background-color: rgba(233, 245, 255, 0.8);
          box-shadow: 0 0 0 2px rgba(194, 137, 248, 0.3);
          animation: selected-pulse 2s infinite ease-in-out;
          position: relative;
          z-index: 2;
        }
        .selected-upper:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 10px 20px rgba(154, 77, 226, 0.25);
          z-index: 4;
        }
        @keyframes selected-pulse {
          0% {
            box-shadow: 0 0 0 2px rgba(194, 137, 248, 0.3);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(194, 137, 248, 0.2), 0 5px 15px rgba(154, 77, 226, 0.1);
          }
          100% {
            box-shadow: 0 0 0 2px rgba(194, 137, 248, 0.3);
          }
        }
        .filled-upper {
          color: #495057;
          font-style: italic;
          background-color: #f7f5fa;
          position: relative;
          transition: all 0.3s ease;
        }
        .filled-upper:hover {
          color: #333;
          background-color: #f0ebf7;
          box-shadow: 0 4px 12px rgba(154, 77, 226, 0.12);
        }
        .filled-upper:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 5px,
            rgba(194, 137, 248, 0.05) 5px,
            rgba(194, 137, 248, 0.05) 10px
          );
          transition: opacity 0.3s ease, transform 0.3s ease;
          transform-origin: center;
          pointer-events: none;
        }
        .routine-table td, .routine-table th {
          border: 1px solid rgba(222, 226, 238, 0.7);
          text-align: center;
          vertical-align: middle;
          background-color: #f8f9fa;
          position: relative;
          transition: all 0.3s ease;
        }
        .routine-table thead th {
          background: linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%);
          color: white;
          font-weight: 600;
          padding: 12px 8px;
          letter-spacing: 0.5px;
          text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.1);
          border: none;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .routine-table thead th:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 70%);
          z-index: -1;
          transition: all 0.6s ease;
          transform: translateX(-100%);
        }
        .routine-table thead tr:hover th:after {
          transform: translateX(100%);
        }
        .routine-table tbody th {
          background: linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%);
          color: white;
          font-weight: 600;
          padding: 8px;
          text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.1);
          border: none;
          transition: all 0.3s ease;
        }
        .routine-table tbody th:hover {
          transform: translateX(2px);
          box-shadow: -2px 0 8px rgba(154, 77, 226, 0.2);
        }
        .routine-table thead tr:hover th {
          box-shadow: 0 4px 6px -2px rgba(154, 77, 226, 0.2);
        }
        .lab-time-cell {
          background-color: rgba(233, 245, 255, 0.3) !important;
          transition: background-color 0.3s ease;
        }
        .lab-time-cell:hover {
          background-color: rgba(233, 245, 255, 0.6) !important;
        }
        .table-scroll-x {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          position: relative;
        }
        .table-scroll-x::-webkit-scrollbar {
          height: 8px;
        }
        .table-scroll-x::-webkit-scrollbar-thumb {
          background: rgba(194, 137, 248, 0.18);
          border-radius: 4px;
        }
        @media (max-width: 900px) {
          .routine-table {
            min-width: 600px;
          }
        }
        @media (max-width: 600px) {
          .routine-table {
            min-width: 480px;
          }
        }
        @media (max-width: 420px) {
          .routine-table {
            min-width: 340px;
          }
        }
      `}</style>
      <div className="table-scroll-x">
        <table className="table routine-table" style={tableStyle}>
          <thead>
            <tr>
              <th scope="col" className="col-2">Day \ Time</th>
              {times.map((time) => (
                <th key={time} scope="col">{time}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <th key={`${day}-header`} scope="row" className="col-2">{day}</th>
                {times.map((time) => {
                  const slotKey = `${day} ${time}`;
                  const cellClassName = getCellStyle(day, time);
                  return (
                    <td key={`${day}-${time}`} className={cellClassName} style={{ padding: 0, position: "relative", textAlign: "center" }}>
                      <Form.Select
                        className={`dropdown-cell ${cellClassName}`}
                        value={getCourse(slotKey) || ""}
                        onChange={e => handleCourseChange(day, time, e.target.value)}
                        title={`${sectionName} - ${day} ${time}`}
                        style={{ color: (getCourse(slotKey) || "") === "" ? 'transparent' : undefined }}
                      >
                        <option value="">None</option>
                        {filteredCourses.map(course => (
                          <option key={`${day}-${time}-${course.course_id}`} value={course.course_id}>
                            {course.course_id} - {course.name || 'Unknown'}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default TheoryScheduleTable;
