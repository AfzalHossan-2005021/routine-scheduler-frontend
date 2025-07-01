import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import TheoryScheduleTable from "./TheoryScheduleTable";
import { getActiveDepartments, getDepartmentalLevelTermBatches, getTheorySectionsByDeptAndLevelTerm, getTheoryCoursesByDeptLevelTerm } from "../api/db-crud";
import { setSchedules, getSchedules } from "../api/theory-schedule";
import { toast } from "react-hot-toast";

export default function TheoryScheduleDashboardSection(props) {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLevelTermBatch, setSelectedLevelTermBatch] = useState("");
  const [allDepartments, setAllDepartments] = useState([]);
  const [allLevelTermBatches, setAllLevelTermBatches] = useState([]);
  const [allTheorySections, setAllTheorySections] = useState([]);
  const [allTheoryCourses, setAllTheoryCourses] = useState([]);
  const [theorySchedulesBySection, setTheorySchedulesBySection] = useState({});

  // Load departments on mount
  useEffect(() => {
    getActiveDepartments()
      .then((res) => setAllDepartments(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        setAllDepartments([]);
        toast.error("Failed to load departments");
      });
  }, []);

  // Load level-term batches when department changes
  useEffect(() => {
    if (selectedDepartment) {
      getDepartmentalLevelTermBatches(selectedDepartment)
        .then((res) => setAllLevelTermBatches(Array.isArray(res.data) ? res.data : []))
        .catch(() => {
          setAllLevelTermBatches([]);
          toast.error("Failed to load level-terms");
        });
    } else {
      setAllLevelTermBatches([]);
      setSelectedLevelTermBatch("");
    }
  }, [selectedDepartment]);

  // Load theory sections when department or level-term changes
  useEffect(() => {
    if (selectedDepartment && selectedLevelTermBatch) {
      // Use string value for API call
      const levelTermValue = typeof selectedLevelTermBatch === 'object' && selectedLevelTermBatch.level_term
        ? selectedLevelTermBatch.level_term
        : selectedLevelTermBatch;
      getTheorySectionsByDeptAndLevelTerm(selectedDepartment, levelTermValue)
        .then((res) => setAllTheorySections(Array.isArray(res.data) ? res.data : []))
        .catch(() => setAllTheorySections([]));
    } else {
      setAllTheorySections([]);
    }
  }, [selectedDepartment, selectedLevelTermBatch]);

  // Load theory courses when department or level-term changes
  useEffect(() => {
    if (selectedDepartment && selectedLevelTermBatch) {
      const levelTermValue = typeof selectedLevelTermBatch === 'object' && selectedLevelTermBatch.level_term
        ? selectedLevelTermBatch.level_term
        : selectedLevelTermBatch;
      getTheoryCoursesByDeptLevelTerm(selectedDepartment, levelTermValue)
        .then((res) => setAllTheoryCourses(Array.isArray(res.data) ? res.data : []))
        .catch(() => setAllTheoryCourses([]));
    } else {
      setAllTheoryCourses([]);
    }
  }, [selectedDepartment, selectedLevelTermBatch]);

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedLevelTermBatch("");
  };

  // Fix: Level-Term selector should store the full batch object, not just the string
  const handleLevelTermChange = (e) => {
    const value = e.target.value;
    const found = allLevelTermBatches.find(lt => lt.level_term === value);
    setSelectedLevelTermBatch(found || value);
  };

  // Handler to update schedule for a section, with cross-section cell warning
  const handleTheoryCellChange = (sectionKey) => (day, time, courseId) => {
    if (courseId) {
      // Check all other sections for same course in same cell
      const slotKey = `${day} ${time}`;
      for (const otherSection of allTheorySections) {
        const otherSectionKey = `${selectedDepartment} ${otherSection.batch} ${otherSection.section}`;
        if (otherSectionKey !== sectionKey) {
          const otherSchedule = theorySchedulesBySection[otherSectionKey] || {};
          if (otherSchedule[slotKey] && otherSchedule[slotKey].course_id === courseId) {
            toast("You have selected this course in another section at the same time.", { icon: "⚠️", duration: 4000 });
            break;
          }
        }
      }
    }
    setTheorySchedulesBySection(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [`${day} ${time}`]: { course_id: courseId }
      }
    }));
  };

  // Helper to determine if a course_id is sessional (even)
  const isSessionalCourse = (course_id) => {
    // Consider course_id as string, check if last char is even digit
    if (!course_id) return false;
    const lastDigit = course_id.match(/\d+/g)?.pop()?.slice(-1);
    return lastDigit && parseInt(lastDigit) % 2 === 0;
  };

  // Fetch and populate already scheduled courses for all sections when loaded
  useEffect(() => {
    if (selectedDepartment && selectedLevelTermBatch && allTheorySections.length > 0) {
      const batchValue = typeof selectedLevelTermBatch === 'object' && selectedLevelTermBatch.batch
        ? selectedLevelTermBatch.batch
        : null;
      allTheorySections.forEach((section) => {
        const sectionKey = `${selectedDepartment} ${section.batch} ${section.section}`;
        const batchInt = parseInt(batchValue, 10); // Use batch from level-term selector
        if (!isNaN(batchInt)) {
          getSchedules(batchInt, section.section).then((res) => {
            let allSchedules = [];
            if (res.mainSection) allSchedules = [...res.mainSection];
            if (res.subsections) Object.values(res.subsections).forEach(sub => { allSchedules = [...allSchedules, ...sub]; });
            const cellMap = {};
            allSchedules.forEach(sch => {
              cellMap[`${sch.day} ${sch.time}`] = { course_id: sch.course_id, type: sch.type };
            });
            setTheorySchedulesBySection(prev => ({ ...prev, [sectionKey]: cellMap }));
          });
        }
      });
    }
    // eslint-disable-next-line
  }, [selectedDepartment, selectedLevelTermBatch, allTheorySections]);

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h4 className="card-title mb-4">Theory Schedule</h4>
        <div className="mb-4 p-3" style={{ background: "#faf6ff", borderRadius: 12, boxShadow: "0 2px 8px #e9e0f7" }}>
          <div className="d-flex align-items-center mb-2" style={{ fontWeight: 600, color: "#a14be7", fontSize: 18 }}>
            <i className="mdi mdi-school-outline mr-2"></i>
            Select Department And Level-Term
          </div>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label style={{ fontWeight: 500, color: "#7a3ee6" }}>
                <i className="mdi mdi-domain"></i> Department
              </label>
              <Form.Select className="form-control" value={selectedDepartment} onChange={handleDepartmentChange}>
                <option value="">Select Department</option>
                {allDepartments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-6 mb-2">
              <label style={{ fontWeight: 500, color: "#7a3ee6" }}>
                <i className="mdi mdi-plus-box-outline"></i> Level-Term
              </label>
              <Form.Select
                className="form-control"
                value={typeof selectedLevelTermBatch === 'object' && selectedLevelTermBatch.level_term ? selectedLevelTermBatch.level_term : ""}
                onChange={handleLevelTermChange}
                disabled={!selectedDepartment}
              >
                <option value="">{selectedDepartment ? "Select Level-Term" : "First select a department"}</option>
                {Array.isArray(allLevelTermBatches) && allLevelTermBatches.map((lt) => (
                  <option key={lt.batch} value={lt.level_term}>{lt.level_term} ({lt.batch} Batch)</option>
                ))}
              </Form.Select>
            </div>
          </div>
        </div>
        {/* Show section tables after both department and level-term are selected */}
        {selectedDepartment && selectedLevelTermBatch && (
          allTheorySections.length === 0 ? (
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
            allTheorySections.map((section) => {
              const sectionKey = `${selectedDepartment} ${section.batch} ${section.section}`;
              // Helper to get the schedule for this section in the format expected by setSchedules
              const getSectionSchedules = () => {
                const scheduleObj = theorySchedulesBySection[sectionKey] || {};
                // Map: { 'Saturday 8': {course_id: 'CSE101'}, ... } => { course_id: [ {day, time}, ... ] }
                const courseSlotMap = {};
                Object.entries(scheduleObj).forEach(([slot, val]) => {
                  if (!val.course_id) return;
                  const [day, time] = slot.split(" ");
                  if (!courseSlotMap[val.course_id]) courseSlotMap[val.course_id] = [];
                  courseSlotMap[val.course_id].push({ day, time });
                });
                return courseSlotMap;
              };

              // Save handler for this section
              const handleSaveSection = async () => {
                const courseSlotMap = getSectionSchedules();
                const batchValue = typeof selectedLevelTermBatch === 'object' && selectedLevelTermBatch.batch
                  ? selectedLevelTermBatch.batch
                  : null;
                const batch = parseInt(batchValue, 10); // Use batch from level-term selector
                const sectionName = section.section;
                let anySuccess = false;
                let anyFail = false;
                let failCourses = [];
                if (isNaN(batch)) {
                  toast.error("Invalid batch value for this section. Cannot save schedule.");
                  return;
                }
                for (const [course_id, slots] of Object.entries(courseSlotMap)) {
                  try {
                    await setSchedules(batch, sectionName, course_id, slots);
                    anySuccess = true;
                  } catch (err) {
                    anyFail = true;
                    failCourses.push(course_id);
                  }
                }
                if (anySuccess && !anyFail) {
                  toast.success(`Schedule saved for section ${sectionName}`);
                } else if (anySuccess && anyFail) {
                  toast.error(`Some courses failed to save: ${failCourses.join(", ")}`);
                } else {
                  toast.error("Failed to save schedule for this section");
                }
              };

              return (
                <div className="row mb-4" key={sectionKey}>
                  <div className="col-12">
                    <div className="card" style={{ borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.1)", border: "none", overflow: "hidden" }}>
                      <div className="card-body" style={{ padding: "1.5rem" }}>
                        <div className="mb-4">
                          <h4 className="card-title" style={{ color: "rgb(194, 137, 248)", borderBottom: "2px solid rgb(194, 137, 248)", paddingBottom: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ backgroundColor: "rgb(194, 137, 248)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", marginRight: "8px", boxShadow: "0 2px 4px rgba(154, 77, 226, 0.3)" }}>{section.section}</span>
                            Section {section.section}
                          </h4>
                        </div>
                        <TheoryScheduleTable
                          {...props}
                          department={selectedDepartment}
                          levelTerm={selectedLevelTermBatch}
                          section={section.section}
                          batch={section.batch}
                          allTheoryCourses={allTheoryCourses}
                          theorySchedules={theorySchedulesBySection[sectionKey] || {}}
                          onChange={handleTheoryCellChange(sectionKey)}
                          isSessionalCourse={isSessionalCourse}
                        />
                        <div className="d-flex justify-content-end mt-3">
                          <Button variant="primary" onClick={handleSaveSection}>
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
