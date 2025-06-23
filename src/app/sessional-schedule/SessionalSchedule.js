import React, { useEffect, useMemo, useCallback, useState } from "react";
import { Button } from "react-bootstrap";
import { Form } from "react-bootstrap";
import {
  days,
  possibleLabTimes,
  times,
} from "../shared/ScheduleSelctionTable";
import { 
  getActiveDepartments, 
  getDepartmentalLevelTermBatches, 
  getSessionalSectionsByDeptAndLevelTerm, 
  getSessionalCoursesByDeptLevelTerm 
} from "../api/db-crud";
import { toast } from "react-hot-toast";
import { MultiSet } from "mnemonist";
import {
  getSessionalSchedules,
  setSessionalSchedules
} from "../api/sessional-schedule";

// Custom component for displaying a table with divided cells for subsections
const SectionScheduleTable = React.memo(function SectionScheduleTable({
  filled = [],
  selectedUpper = [],
  selectedLower = [],
  onChangeUpper = () => {},
  onChangeLower = () => {},
  labTimes = [],
  dualCheck = [],
  upperSectionName,
  lowerSectionName,
  allSessionalCourses = [],
  upperSectionKey,
  lowerSectionKey,
  labSchedulesBySection = {}
}) {
  // Convert arrays to MultiSets for efficient lookup
  const filledSet = useMemo(() => MultiSet.from(filled), [filled]);
  const selectedUpperSet = useMemo(() => MultiSet.from(selectedUpper), [selectedUpper]);
  const selectedLowerSet = useMemo(() => MultiSet.from(selectedLower), [selectedLower]);
  const labTimesSet = useMemo(() => 
    MultiSet.from(labTimes.length ? labTimes : days.map((day) => `${day} 2`)),
    [labTimes]
  );
  
  // No need to extract section info since it's not used anywhere
  
  // Prepare filtered courses - memoized to prevent unnecessary filtering
  const filteredCourses = useMemo(() => {
    return Array.isArray(allSessionalCourses) ? allSessionalCourses : [];
  }, [allSessionalCourses]);
  
  // Generic helper function to get course ID for a specific slot in any section
  const getSectionCourse = useCallback((sectionKey, slotKey) => {
    if (!labSchedulesBySection[sectionKey]) return null;
    const slot = labSchedulesBySection[sectionKey].find(
      slot => `${slot.day} ${slot.time}` === slotKey
    );
    return slot ? slot.course_id : null;
  }, [labSchedulesBySection]);
  
  // Helper functions for specific sections that use the generic function
  const upperSectionCourse = useCallback((slotKey) => 
    getSectionCourse(upperSectionKey, slotKey), 
    [getSectionCourse, upperSectionKey]
  );
  
  const lowerSectionCourse = useCallback((slotKey) => 
    getSectionCourse(lowerSectionKey, slotKey), 
    [getSectionCourse, lowerSectionKey]
  );
  
  // Cell style calculation - memoized to prevent recalculation
  const getUpperCellStyle = useCallback((day, time) => {
    const key = `${day} ${time}`;
    if (selectedUpperSet.has(key)) return "selected-upper";
    if (filledSet.has(key)) return "filled-upper";
    return "";
  }, [selectedUpperSet, filledSet]);

  const getLowerCellStyle = useCallback((day, time) => {
    const key = `${day} ${time}`;
    if (selectedLowerSet.has(key)) return "selected-lower";
    if (filledSet.has(key)) return "filled-lower";
    return "";
  }, [selectedLowerSet, filledSet]);
  
  // Event handlers
  const handleUpperCourseChange = useCallback((day, time, courseId) => {
    onChangeUpper(day, time, courseId);
  }, [onChangeUpper]);
  
  const handleLowerCourseChange = useCallback((day, time, courseId) => {
    onChangeLower(day, time, courseId);
  }, [onChangeLower]);

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
      {/* CSS Styles */}
      <style jsx="true">{`
        .cell-container {
          display: flex;
          flex-direction: column;
          height: 90px; /* Increased height for more space */
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
        /* Select form styles */
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
        .upper-cell, .lower-cell {
          height: 50%;
          position: relative;
          font-size: 0.85rem;
          border: none;
          border-radius: 0;
          padding: 0.3rem 0.5rem;
          text-align: center;
          transition: all 0.2s ease;
        }
        .dropdown-cell {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-position: right 0.5rem center;
          background-size: 0.75em;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c289f8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          color: #333;
          text-align-last: center;
          background-color: #ffffff;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transform-origin: center;
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
        
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          20% {
            transform: scale(25, 25);
            opacity: 0.3;
          }
          100% {
            opacity: 0;
            transform: scale(40, 40);
          }
        }
        
        @keyframes micro-ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.4;
          }
          40% {
            transform: scale(10, 10);
            opacity: 0.2;
          }
          100% {
            opacity: 0;
            transform: scale(15, 15);
          }
        }
        .dropdown-cell option {
          font-size: 0.9rem;
          padding: 8px;
        }
        .dropdown-cell option:first-child {
          color: transparent;
          height: 0;
          padding: 0;
          margin: 0;
          display: none;
        }
        .upper-cell {
          border-bottom: 1px solid #dee2e6;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
        }
        .lower-cell {
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
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
          box-shadow: 0 4px 8px rgba(154, 77, 226, 0.3);
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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
        .selected-upper, .selected-lower {
          font-weight: bold;
          border-color: rgb(194, 137, 248) !important;
          background-color: rgba(233, 245, 255, 0.8);
          box-shadow: 0 0 0 2px rgba(194, 137, 248, 0.3);
          animation: selected-pulse 2s infinite ease-in-out;
          position: relative;
          z-index: 2;
        }
        .selected-upper:hover, .selected-lower:hover {
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
        .filled-upper, .filled-lower {
          color: #495057;
          font-style: italic;
          background-color: #f7f5fa;
          position: relative;
          transition: all 0.3s ease;
        }
        .filled-upper:hover, .filled-lower:hover {
          color: #333;
          background-color: #f0ebf7;
          box-shadow: 0 4px 12px rgba(154, 77, 226, 0.12);
        }
        .filled-upper:after, .filled-lower:after {
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
      `}</style>

      {/* Table Layout */}
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
              {times
                .filter((time) =>
                  !labTimesSet.has(`${day} ${(time - 1 + 12) % 12}`) &&
                  !labTimesSet.has(`${day} ${(time - 2 + 12) % 12}`)
                )
                .map((time) => {
                  const isLabTime = labTimesSet.has(`${day} ${time}`);
                  const cellClassName = isLabTime ? "lab-time-cell" : "";
                  const slotKey = `${day} ${time}`;
                  
                  return (
                    <td 
                      key={`${day}-${time}`} 
                      colSpan={isLabTime ? 3 : 1}
                      className={cellClassName}
                      style={{
                        padding: "0",
                        position: "relative",
                        textAlign: "center"
                      }}
                    >
                      <div className="cell-container">
                        <Form.Select
                          className={`upper-cell dropdown-cell ${getUpperCellStyle(day, time)}`}
                          value={upperSectionCourse(slotKey) || ""}
                          onChange={(e) => handleUpperCourseChange(day, time, e.target.value)}
                          title={`${upperSectionName} - ${day} ${time}`}
                        >
                          <option value=""></option>
                          {filteredCourses.map(course => (
                            <option 
                              key={`upper-${day}-${time}-${course.course_id}`}
                              value={course.course_id}
                            >
                              {course.course_id} - {course.name || 'Unknown'}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Select
                          className={`lower-cell dropdown-cell ${getLowerCellStyle(day, time)}`}
                          value={lowerSectionCourse(slotKey) || ""}
                          onChange={(e) => handleLowerCourseChange(day, time, e.target.value)}
                          title={`${lowerSectionName} - ${day} ${time}`}
                        >
                          <option value=""></option>
                          {filteredCourses.map(course => (
                            <option 
                              key={`lower-${day}-${time}-${course.course_id}`}
                              value={course.course_id}
                            >
                              {course.course_id} - {course.name || 'Unknown'} 
                            </option>
                          ))}
                        </Form.Select>
                      </div>
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

export default function SessionalSchedule() {
  // State variables grouped by functionality
  // Selection state
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedLevelTermBatch, setSelectedLevelTermBatch] = useState(null);
  const [selectedCourse] = useState(null); // Keep but don't use setter
  
  // Data state
  const [allDepartments, setAllDepartments] = useState([]);
  const [allLevelTermBatches, setAllLevelTermBatches] = useState([]);
  const [allSessionalSections, setAllSessionalSections] = useState([]);
  const [allSessionalCourses, setAllSessionalCourses] = useState([]);
  
  // Schedule state
  const [labSchedulesBySection, setLabSchedulesBySection] = useState({});
  const [dualCheck, setDualCheck] = useState(MultiSet.from([]));
  const [labSlots, setLabSlots] = useState(new Set());
  const [labTimes, setLabTimes] = useState([]);
  
  // UI state
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the custom hook for data loading
  const { loadData } = useLoadData();

  // Fetch all active departments on component mount
  useEffect(() => {
    loadData(
      getActiveDepartments,
      "Failed to load departments",
      setAllDepartments
    );
  }, [loadData]);

  // Fetch all level term batches when department changes
  useEffect(() => {
    if(selectedDepartment) {
      loadData(
        () => getDepartmentalLevelTermBatches(selectedDepartment),
        "Failed to load level terms",
        setAllLevelTermBatches
      );
    }
  }, [selectedDepartment, loadData]);

  // Fetch sections and courses when department or level term changes
  useEffect(() => {
    if (selectedDepartment && selectedLevelTermBatch) {
      // Load sessional sections
      loadData(
        () => getSessionalSectionsByDeptAndLevelTerm(selectedDepartment, selectedLevelTermBatch.level_term),
        "Failed to load sessional sections",
        setAllSessionalSections
      );
      
      // Load sessional courses
      loadData(
        () => getSessionalCoursesByDeptLevelTerm(selectedDepartment, selectedLevelTermBatch.level_term),
        "Failed to load sessional courses",
        setAllSessionalCourses
      );
    }
  }, [selectedDepartment, selectedLevelTermBatch, loadData]);

  // Group sections by main section and subsections - memoized to prevent unnecessary recalculation
  const groupedSections = useMemo(() => {
    if (!allSessionalSections || !allSessionalSections.length) {
      return {};
    }
    
    const groups = {};
    allSessionalSections.forEach(section => {
      // Extract main section letter and subsection number
      const mainSection = section.section.charAt(0);  // A, B, C
      const subSection = section.section.charAt(1);   // 1, 2
      
      if (!groups[mainSection]) {
        groups[mainSection] = { subsections: {} };
      }
      
      // Create a proper sectionKey with batch, section, and department
      let sectionKey;
      if (selectedLevelTermBatch && typeof selectedLevelTermBatch.batch !== 'undefined') {
        sectionKey = `${selectedDepartment} ${selectedLevelTermBatch.batch} ${section.section}`;
      } else {
        console.warn("Missing batch in selectedLevelTermBatch:", selectedLevelTermBatch);
        sectionKey = section.section;
      }
      
      groups[mainSection].subsections[subSection] = {
        ...section,
        sectionKey: sectionKey
      };
    });

    return groups;
  }, [allSessionalSections, selectedLevelTermBatch, selectedDepartment]);
  
  // Get all section keys from grouped sections structure - memoized
  const getAllSectionKeys = useMemo(() => {
    const keys = [];
    Object.keys(groupedSections).forEach(mainSection => {
      Object.keys(groupedSections[mainSection].subsections).forEach(subSection => {
        keys.push(groupedSections[mainSection].subsections[subSection].sectionKey);
      });
    });
    return keys;
  }, [groupedSections]);

  // Since we don't need to check theory schedules, simplify lab times computation
  const computedLabTimes = useMemo(() => {
    const result = [];
    days.forEach((day) => {
      possibleLabTimes.forEach((time) => {
        // Include all possible lab times without theory schedule constraints
        result.push(`${day} ${time}`);
      });
    });
    
    // Add any special lab time slots if needed
    return [...result, ...Array.from(labSlots)];
  }, [labSlots]);
  
  // Set lab times only once when computed lab times change
  useEffect(() => {
    setLabTimes(computedLabTimes);
  }, [computedLabTimes]);

  // Load schedules when sections, department or level term changes
  useEffect(() => {
    if (selectedLevelTermBatch && selectedLevelTermBatch.batch && selectedDepartment) {
      const batch = selectedLevelTermBatch.batch;
      const department = selectedDepartment;
      
      // Set up some default lab slots
      const defaultLabSlots = new Set();
      days.forEach(day => {
        [2, 5, 8, 11].forEach(time => {
          defaultLabSlots.add(`${day} ${time}`);
        });
      });
      
      // Store the lab slots
      setLabSlots(defaultLabSlots);

      // Safety check for sections
      if (!allSessionalSections || allSessionalSections.length === 0) {
        return;
      }
      
      // Show loading indicator
      const loadingSchedules = toast.loading("Loading schedules...");
      setIsLoading(true);
      
      // Create promises for fetching each section's schedule
      const loadScheduleForSection = async (section) => {
        // Create a proper section key
        const sectionKey = `${department} ${batch} ${section.section}`;
        
        // Validate the section key
        if (!validateSectionKey(sectionKey)) {
          return { sectionKey: null, schedules: [] };
        }
        
        try {
          const res = await getSessionalSchedules(batch, section.section);
          // Safety check - ensure res is an array
          const schedules = Array.isArray(res) ? res : [];
          
          // Filter by department and ensure exact section matches
          const filteredSchedules = schedules.filter(s => 
            s.department === department && s.section === section.section
          );
          
          return {
            sectionKey: sectionKey,
            schedules: filteredSchedules
          };
        } catch (error) {
          console.error(`Error fetching schedules for section ${section.section}:`, error);
          return {
            sectionKey: sectionKey,
            schedules: []
          };
        }
      };
      
      // Execute all schedule loading operations in parallel
      const schedulePromises = allSessionalSections.map(loadScheduleForSection);
      
      Promise.all(schedulePromises)
        .then((results) => {
          toast.dismiss(loadingSchedules);
          const newLabSchedulesBySection = {};
          const newDualCheck = MultiSet.from([]);

          let validSchedulesCount = 0;
          
          results.forEach(({ sectionKey, schedules }) => {
            if (!sectionKey) return;
            
            // Store the schedules even if empty
            newLabSchedulesBySection[sectionKey] = schedules;
            
            if (schedules.length > 0) {
              validSchedulesCount++;
            }
            
            // Check for dual courses (0.5 credit)
            schedules.forEach((slot) => {
              if (!slot || !slot.course_id) return;
              
              const course = allSessionalCourses.find((c) => c.course_id === slot.course_id);
              if (course && course.class_per_week === 0.5) {
                newDualCheck.add(`${slot.day} ${slot.time}`);
              }
            });
          });

          setLabSchedulesBySection(newLabSchedulesBySection);
          setDualCheck(newDualCheck);
          
          if (validSchedulesCount > 0) {
            toast.success(`Loaded schedules for ${validSchedulesCount} sections`);
          }
        })
        .catch((error) => {
          toast.dismiss(loadingSchedules);
          console.error("Error processing schedules:", error);
          toast.error("Failed to process schedules");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setLabSchedulesBySection({});
      setDualCheck(MultiSet.from([]));
    }
  }, [selectedLevelTermBatch, allSessionalCourses, allSessionalSections, selectedDepartment]);

  const getSelectedCourseSlots = useCallback((sectionKey) => {
    if (!labSchedulesBySection[sectionKey]) return [];
    return labSchedulesBySection[sectionKey]
      .filter((slot) => slot.course_id === selectedCourse?.course_id)
      .map((slot) => `${slot.day} ${slot.time}`);
  }, [labSchedulesBySection, selectedCourse]);

  // Handle slot changes efficiently
  const handleSlotChange = useCallback((day, time, courseId, sectionKey) => {
    // Parse the section key
    const { department, batch, section } = parseSectionKey(sectionKey);
    
    if (!department || !batch || !section) {
      console.error("Invalid section key format in handleSlotChange:", sectionKey);
      toast.error("Error processing section data");
      return;
    }

    // Mark as changed since we're modifying the schedule
    setIsChanged(true);
    
    // If courseId is empty, remove any existing assignment for this slot
    if (!courseId) {
      setLabSchedulesBySection(prev => ({
        ...prev,
        [sectionKey]: (prev[sectionKey] || []).filter(
          slot => !(slot.day === day && slot.time === time)
        )
      }));
      
      // Remove from dual check if needed
      setDualCheck(dualCheck => {
        const newDualCheck = MultiSet.from([...dualCheck]);
        if (newDualCheck.has(`${day} ${time}`)) {
          newDualCheck.remove(`${day} ${time}`);
        }
        return newDualCheck;
      });
      
      return;
    }

    // Find the course object
    const course = allSessionalCourses.find(c => c.course_id === courseId);
    if (!course) {
      toast.error("Invalid course selection");
      return;
    }

    // Check if there's already a different course in this slot
    const existingSlot = labSchedulesBySection[sectionKey]?.find(
      slot => slot.day === day && slot.time === time
    );
    
    if (existingSlot) {
      // Replace the existing course assignment
      setLabSchedulesBySection(prev => ({
        ...prev,
        [sectionKey]: [
          ...(prev[sectionKey] || []).filter(slot => !(slot.day === day && slot.time === time)),
          { day, time, course_id: courseId, section, department }
        ]
      }));
    } else {
      // Add a new assignment
      // Check if adding this assignment is valid based on credit hours
      const selectedSlotsForCourse = (labSchedulesBySection[sectionKey] || [])
        .filter(slot => slot.course_id === courseId)
        .length;
        
      if (selectedSlotsForCourse >= Math.ceil(course.class_per_week)) {
        toast.error(`You can only select ${Math.ceil(course.class_per_week)} slots for ${courseId}`);
        return;
      }

      // Handle dual check for 0.5 credit courses
      if (course.class_per_week === 0.5) {
        setDualCheck(dualCheck => {
          const newDualCheck = MultiSet.from([...dualCheck]);
          newDualCheck.add(`${day} ${time}`);
          return newDualCheck;
        });
      }

      setLabSchedulesBySection(prev => ({
        ...prev,
        [sectionKey]: [
          ...(prev[sectionKey] || []),
          { day, time, course_id: courseId, section, department }
        ]
      }));
    }
  }, [allSessionalCourses, labSchedulesBySection]);

  // Save all schedules efficiently
  const saveAllSchedules = useCallback(() => {
    if (!selectedLevelTermBatch || !selectedLevelTermBatch.batch) {
      toast.error("Select a batch first");
      return;
    }
    
    if (!selectedDepartment) {
      toast.error("Select a department first");
      return;
    }
    
    if (getAllSectionKeys.length === 0) {
      toast.warning("No sections found to save schedules for");
      return;
    }

    // Show saving indicator
    const savingToast = toast.loading("Saving all schedules...");

    // Save all section schedules in parallel
    const savePromises = getAllSectionKeys.map(sectionKey => {
      // Safely parse the section key
      if (!sectionKey) {
        return Promise.resolve({ success: false, section: null, error: "Invalid section key" });
      }
      
      // Parse the section key
      const { department, batch, section } = parseSectionKey(sectionKey);
      
      if (!department || !batch || !section) {
        return Promise.resolve({ success: false, section: null, error: "Invalid section key format" });
      }
      
      const schedules = labSchedulesBySection[sectionKey] || [];
      
      // Call the API to save the schedules
      return setSessionalSchedules(batch, section, department, schedules)
        .then(response => ({ success: true, section }))
        .catch(error => {
          console.error(`Failed to save schedules for section ${section}:`, error);
          return { success: false, section, error };
        });
    });

    // Process all save results
    Promise.all(savePromises)
      .then((results) => {
        toast.dismiss(savingToast);
        
        // Count failures and successes
        const failures = results.filter(r => !r.success);
        const totalCount = results.length;
        const successCount = totalCount - failures.length;
        
        if (failures.length === 0) {
          toast.success("All schedules saved successfully");
          setIsChanged(false);
        } else if (failures.length < totalCount) {
          toast.warning(`Saved ${successCount} out of ${totalCount} schedules`);
          setIsChanged(true);
        } else {
          toast.error("Failed to save any schedules");
        }
      })
      .catch(err => {
        toast.dismiss(savingToast);
        toast.error("Failed to save schedules");
        console.error("Unexpected error saving schedules:", err);
      });
  }, [selectedLevelTermBatch, selectedDepartment, getAllSectionKeys, labSchedulesBySection]);

  // JSX for rendering the component UI is unchanged
  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Sessional Schedule Assign </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              Sessional Schedule
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Control Panel */}
      <div className="row mb-4">
        <div className="col-md-10">
          <div className="card" style={{
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(154, 77, 226, 0.12), 0 2px 8px rgba(0,0,0,0.05)",
            border: "none",
            background: "linear-gradient(to right bottom, #ffffff, #f9f5ff)",
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
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="rgb(194, 137, 248)"/>
                    <path d="M7 12H9V17H7V12ZM11 7H13V17H11V7ZM15 9H17V17H15V9Z" fill="rgb(194, 137, 248)"/>
                  </svg>
                </span>
                Select Department and Level-Term
              </h4>
              <Form>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="departmentSelect" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "8px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 11.5V17L12 21L19 17V11.5" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Department
                    </label>
                    <Form.Select
                      id="departmentSelect"
                      className="form-control btn-block"
                      value={selectedDepartment || ""}
                      style={{
                        height: "48px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                        fontWeight: "500",
                        color: "#333",
                        padding: "0 14px",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c289f8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundPosition: "right 14px center",
                        backgroundSize: "16px",
                        transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        background: "linear-gradient(to bottom, #ffffff, #fdfaff)"
                      }}
                      onChange={(e) => {
                        if (
                          e.target.value !== selectedDepartment &&
                          isChanged &&
                          !window.confirm(
                            "You have unsaved changes. Are you sure you want to continue?"
                          )
                        ) {
                          e.target.value = selectedDepartment;
                          return;
                        }
                        setSelectedDepartment(e.target.value);
                      }}
                    >
                      <option value="">Select Department</option>
                      {allDepartments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  
                  <div className="col-md-8 mb-3">
                    <label htmlFor="levelTermSelect" className="form-label" style={{ 
                      fontWeight: "600", 
                      marginBottom: "8px",
                      color: "#444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 12L8 12" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8L12 16" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Level-Term
                    </label>
                    <Form.Select
                      id="levelTermSelect"
                      className="form-control btn-block"
                      value={selectedLevelTermBatch ? JSON.stringify(selectedLevelTermBatch) : ""}
                      style={{
                        height: "48px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                        fontWeight: "500",
                        color: "#333",
                        padding: "0 14px",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c289f8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundPosition: "right 14px center",
                        backgroundSize: "16px", 
                        transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        background: "linear-gradient(to bottom, #ffffff, #fdfaff)"
                      }}
                      onChange={(e) => {
                        try {
                          const newValue = e.target.value ? JSON.parse(e.target.value) : null;
                          
                          if (
                            newValue !== selectedLevelTermBatch &&
                            isChanged &&
                            !window.confirm(
                              "You have unsaved changes. Are you sure you want to continue?"
                            )
                          ) {
                            return;
                          }
                          
                          // Ensure both batch and level_term are present
                          if (newValue && (!newValue.batch || !newValue.level_term)) {
                            console.error("Invalid level term batch selected", newValue);
                            toast.error("Invalid level term batch data");
                            return;
                          }
                          
                          setSelectedLevelTermBatch(newValue);
                        } catch (error) {
                          console.error("Error parsing level term batch:", error);
                          toast.error("Failed to parse level term batch data");
                        }
                      }}
                      disabled={!selectedDepartment}
                    >
                      <option value="">
                        {selectedDepartment ? "Select Level-Term" : "First select a department"}
                      </option>
                      {allLevelTermBatches.map((levelTermBatch) => (
                        <option key={levelTermBatch.batch} value={JSON.stringify(levelTermBatch)}>
                          {levelTermBatch.level_term} ({levelTermBatch.batch} Batch)
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </div>
              </Form>
              <div className="d-flex justify-content-between align-items-center mt-3">
                {isLoading && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'rgb(154, 77, 226)',
                    fontWeight: '500',
                    background: 'rgba(194, 137, 248, 0.08)',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(194, 137, 248, 0.15)',
                    animation: 'pulse-light 2s infinite ease-in-out'
                  }}>
                    <span 
                      className="spinner-border spinner-border-sm" 
                      role="status" 
                      aria-hidden="true"
                      style={{
                        color: 'rgb(154, 77, 226)',
                        width: '20px',
                        height: '20px'
                      }}
                    ></span>
                    Loading data...
                    <style jsx="true">{`
                      @keyframes pulse-light {
                        0% { opacity: 1; }
                        50% { opacity: 0.85; }
                        100% { opacity: 1; }
                      }
                    `}</style>
                  </div>
                )}
                <div className="ml-auto">
                  <Button
                    variant="primary"
                    onClick={saveAllSchedules}
                    disabled={!isChanged || isLoading}
                    style={{
                      fontWeight: '600', 
                      padding: '10px 20px',
                      opacity: (isChanged && !isLoading) ? 1 : 0.7,
                      background: isChanged && !isLoading ? 'linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)' : '#e3d5f7',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: isChanged && !isLoading ? '0 4px 10px rgba(154, 77, 226, 0.25)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    className="save-button"
                    onMouseOver={(e) => {
                      if(isChanged && !isLoading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(154, 77, 226, 0.35)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if(isChanged && !isLoading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(154, 77, 226, 0.25)';
                      }
                    }}
                  >
                    {isChanged ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8.5 10.5L11.5 13.5L16 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save All Changes
                      </>
                    ) : "No Changes to Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Display grouped section tables */}
      {selectedLevelTermBatch && (Object.keys(groupedSections).length === 0 ? (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">No sections found</h4>
                <p>No sections were found for the selected department and level-term.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Render section tables
        Object.keys(groupedSections).map((mainSection) => {
          // Extract the two subsections
          const subsections = groupedSections[mainSection].subsections;
          const subsectionKeys = Object.keys(subsections);
          
          // If we don't have exactly 2 subsections, show alternative rendering
          if (subsectionKeys.length !== 2) {
            return (
              <div className="row mb-4" key={`section-${mainSection}`}>
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <h4 className="card-title">Section {mainSection} (Irregular Format)</h4>
                      <p>This section doesn't have exactly 2 subsections. Found: {subsectionKeys.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        
          // Get the subsection objects
          const upperSection = subsections[subsectionKeys[0]];
          const lowerSection = subsections[subsectionKeys[1]];
          
          // Get the section keys for each subsection
          const upperSectionKey = upperSection.sectionKey;
          const lowerSectionKey = lowerSection.sectionKey;
          
          // Get selected slots for each subsection
          const upperSelectedSlots = getSelectedCourseSlots(upperSectionKey);
          const lowerSelectedSlots = getSelectedCourseSlots(lowerSectionKey);
          
          return (
            <div className="row mb-4" key={`section-${mainSection}`}>
              <div className="col-12">
                <div className="card" style={{
                  borderRadius: "12px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  border: "none",
                  overflow: "hidden"
                }}>
                  <div className="card-body" style={{ padding: "1.5rem" }}>
                    <div className="mb-4">
                      <h4 className="card-title" style={{ 
                        color: "rgb(194, 137, 248)", 
                        borderBottom: "2px solid rgb(194, 137, 248)",
                        paddingBottom: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span style={{ 
                          backgroundColor: "rgb(194, 137, 248)", 
                          color: "white",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          marginRight: "8px",
                          boxShadow: "0 2px 4px rgba(154, 77, 226, 0.3)"
                        }}>{mainSection}</span>
                        Section {mainSection}
                      </h4>
                    </div>
                    
                    {/* Schedule table with divided cells */}
                    <SectionScheduleTable
                      filled={[]} // No theory slots to fill
                      selectedUpper={upperSelectedSlots}
                      selectedLower={lowerSelectedSlots}
                      onChangeUpper={(day, time, courseId) => handleSlotChange(day, time, courseId, upperSectionKey)}
                      onChangeLower={(day, time, courseId) => handleSlotChange(day, time, courseId, lowerSectionKey)}
                      labTimes={labTimes}
                      dualCheck={dualCheck}
                      upperSectionName={`Section ${upperSection.section}`}
                      lowerSectionName={`Section ${lowerSection.section}`}
                      allSessionalCourses={allSessionalCourses}
                      upperSectionKey={upperSectionKey}
                      lowerSectionKey={lowerSectionKey}
                      labSchedulesBySection={labSchedulesBySection}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ))}
    </div>
  );
}

// Utility functions

// Section key validation helper
const validateSectionKey = (sectionKey) => {
  if (!sectionKey) {
    return false;
  }
  
  const parts = sectionKey.split(" ");
  if (parts.length < 3) {
    return false;
  }
  
  // Format is "department batch section"
  const department = parts[0];
  const batch = parts[1];
  const section = parts[2];
  
  return !!(department && batch && section);
};

// Data loading hook for common async pattern
const useLoadData = () => {
  const loadData = useCallback(async (loadFn, errorMessage, setStateFn) => {
    try {
      const response = await loadFn();
      if (response && response.data) {
        setStateFn(response.data);
        return response.data;
      } else {
        toast.error(errorMessage);
        return [];
      }
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      toast.error(errorMessage);
      return [];
    }
  }, []);
  
  return { loadData };
};

// Parse section key into components
const parseSectionKey = (sectionKey) => {
  if (!sectionKey) return { department: null, batch: null, section: null };
  
  const parts = sectionKey.split(" ");
  if (parts.length >= 3) {
    return {
      department: parts[0],
      batch: parts[1],
      section: parts[2]
    };
  }
  
  console.error("Invalid section key format:", sectionKey);
  return {
    department: parts[0] || null,
    batch: parts[1] || null,
    section: null
  };
};
