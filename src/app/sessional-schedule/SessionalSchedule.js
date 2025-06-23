import { useEffect, useMemo, useCallback, useState } from "react";
import { Button } from "react-bootstrap";
import { Form } from "react-bootstrap";
import {
  days,
  possibleLabTimes,
} from "../shared/ScheduleSelctionTable";
import { 
  getActiveDepartments, 
  getDepartmentalLevelTermBatches, 
  getSessionalSectionsByDeptAndLevelTerm, 
  getSessionalCoursesByDeptLevelTerm 
} from "../api/db-crud";
import { toast } from "react-hot-toast";
import {
  getSessionalSchedules,
  setSessionalSchedules
} from "../api/sessional-schedule";
import SectionScheduleTable from "./SectionScheduleTable";

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

          let validSchedulesCount = 0;
          
          results.forEach(({ sectionKey, schedules }) => {
            if (!sectionKey) return;
            
            // Store the schedules even if empty
            newLabSchedulesBySection[sectionKey] = schedules;
            
            if (schedules.length > 0) {
              validSchedulesCount++;
            }
          });

          setLabSchedulesBySection(newLabSchedulesBySection);
          
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
        <div className="col-12">
          <div className="card" style={{
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            border: "none",
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
                  <div className="col-md-6 mb-3">
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
                  
                  <div className="col-md-6 mb-3">
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
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c289f8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3Csvg%3E")`,
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
