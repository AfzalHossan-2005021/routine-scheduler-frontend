import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import TheoryScheduleTable from "./TheoryScheduleTable";
import { getActiveDepartments, getDepartmentalLevelTermBatches, getTheorySectionsByDeptAndLevelTerm, getTheoryCoursesByDeptLevelTerm } from "../api/db-crud";
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
                        />
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
