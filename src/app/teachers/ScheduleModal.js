import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { times, days } from '../shared/ScheduleSelctionTable';
import { setSchedules } from '../api/theory-schedule';
import { toast } from 'react-hot-toast';

// Add some custom styles for the schedule table
const scheduleTableStyle = {
  table: {
    tableLayout: 'fixed',
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #dee2e6',
  },
  headerCell: {
    width: '80px',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: '8px 4px',
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
  },
  dayCell: {
    fontWeight: 'bold',
    background: '#f8f9fa',
    width: '100px',
    border: '1px solid #dee2e6',
  },
  availableCell: {
    cursor: 'pointer',
    height: '60px',
    transition: 'all 0.2s',
    border: '1px solid #dee2e6',
  },
  selectedCell: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    border: '2px solid rgba(40, 167, 69, 0.8)',
  },
  unavailableCell: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    color: '#6c757d',
    cursor: 'not-allowed',
    border: '1px solid #dee2e6',
  },
  // Add a new style for scheduled (saved) slots
  scheduledCell: {
    backgroundColor: 'rgba(40, 167, 69, 0.5)', // darker green
    border: '2px solid #28a745',
    color: '#155724',
  }
};

const ScheduleModal = ({ 
  show, 
  onHide, 
  courseId, 
  courseTitle,
  courseType, 
  courseBatch,
  courseSections, 
  courseCredits,
  existingSchedules, 
  teacherId,
  onScheduleComplete,
}) => {
  // State for selected section and class slots
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Track schedules for all sections - a map of section name to selected slots
  const [allSectionSchedules, setAllSectionSchedules] = useState({});
  
  // Create a mapping of unavailable slots (day and time combinations that are already scheduled)
  const [unavailableSlots, setUnavailableSlots] = useState({});
  
  useEffect(() => {
    setSelectedSlots([]);
    if (selectedSection && existingSchedules) {
      const unavailable = {};
      days.forEach(day => {
        unavailable[day] = {};
        times.forEach(time => {
          unavailable[day][time] = false;
        });
      });
      // Mark slots unavailable from existingSchedules
      existingSchedules.forEach(schedule => {
        if(schedule.day){
            if (schedule.section === selectedSection) {
              unavailable[schedule.day][schedule.time] = true;
            } else if (schedule.section.includes(selectedSection)) {
              unavailable[schedule.day][schedule.time] = true;
              unavailable[schedule.day][schedule.time+1] = true;
              unavailable[schedule.day][schedule.time+2] = true;
            }
        }
      });
      // Mark slots unavailable from allSectionSchedules (other sections)
      Object.entries(allSectionSchedules).forEach(([section, slots]) => {
        if (section !== selectedSection) {
          slots.forEach(slot => {
            if (slot.day && slot.time) {
              unavailable[slot.day][slot.time] = true;
            }
          });
        }
      });
      setUnavailableSlots(unavailable);
    }
  }, [selectedSection, existingSchedules, courseId, courseBatch, allSectionSchedules]);

  const handleSlotClick = (day, time) => {
    // Don't do anything if the slot is unavailable
    if (unavailableSlots[day] && unavailableSlots[day][time]) {
      return;
    }
    
    // Check if we already have enough slots selected (based on course credits)
    if (selectedSlots.length >= courseCredits && 
        !selectedSlots.some(slot => slot.day === day && slot.time === time)) {
      toast.error(`Cannot select more than ${courseCredits} slots for this course`);
      return;
    }
    
    // Check if this teacher already has a class at this time slot for any section or courseBatch
    const teacherHasClassAtThisTime = existingSchedules.some(schedule => 
      schedule.day === day && 
      schedule.time === time &&
      schedule.course_id.split('-')[0] === courseId.split('-')[0] // Same course prefix (e.g., CSE)
    );
    
    if (teacherHasClassAtThisTime) {
      toast.error(`You already have a class scheduled at ${day} ${time}:00 for another section or courseBatch`);
      return;
    }
    
    // Check if this time slot is already scheduled for the same courseBatch (any section)
    const batchHasClassAtThisTime = existingSchedules.some(schedule => 
      schedule.day === day && 
      schedule.time === time &&
      schedule.courseBatch === courseBatch
    );
    
    if (batchHasClassAtThisTime) {
      toast.error(`courseBatch ${courseBatch} already has a class scheduled at ${day} ${time}:00`);
      return;
    }
    
    // Check if we already have a slot for this day
    const existingDaySlot = selectedSlots.find(slot => slot.day === day);
    if (existingDaySlot) {
      // If clicking on the same slot, remove it
      if (existingDaySlot.time === time) {
        setSelectedSlots(selectedSlots.filter(
          slot => !(slot.day === day && slot.time === time)
        ));
      } else {
        // Otherwise, replace the existing slot for this day
        toast.error('Only one class per day is allowed for each section');
      }
    } else {
      // Add a new slot
      setSelectedSlots([...selectedSlots, { day, time }]);
    }
  };

  // Save only the current section's schedule (local state only)
  const handleSaveSection = () => {
    if (!selectedSection) return;
    if (selectedSlots.length !== courseCredits) {
      toast.error(`Section ${selectedSection} needs exactly ${courseCredits} time slots`);
      return;
    }
    setAllSectionSchedules(prev => ({
      ...prev,
      [selectedSection]: [...selectedSlots]
    }));
    toast.success(`Schedule saved locally for section ${selectedSection}`);
  };

  // Save all sections to the database
  const handleSaveAll = async () => {
    // Check if all sections have been scheduled properly
    const unscheduledSections = courseSections.filter(section => {
      return !allSectionSchedules[section] || allSectionSchedules[section].length !== courseCredits;
    });
    if (unscheduledSections.length > 0) {
      toast.error(`Please complete scheduling for all sections: ${unscheduledSections.join(', ')}`);
      return;
    }
    setSaving(true);
    try {
      for (const section of courseSections) {
        const formattedSection = section.toUpperCase();
        const sectionSlots = allSectionSchedules[section];
        const scheduleData = sectionSlots.map(slot => ({
          day: slot.day,
          time: slot.time,
          department: 'CSE',
          section: formattedSection,
          courseBatch: courseBatch
        }));
        await setSchedules(courseBatch, formattedSection, courseId, scheduleData);
      }
      toast.success('All sections scheduled successfully');
      onScheduleComplete && onScheduleComplete();
      onHide();
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Failed: ${error.response.data.message || 'Unknown error'}`);
      } else {
        toast.error('Failed to save schedule. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const isSlotSelected = (day, time) => {
    return selectedSlots.some(slot => slot.day === day && slot.time === time);
  };

  const isSlotAvailable = (day, time) => {
    return !(unavailableSlots[day] && unavailableSlots[day][time]);
  };
  
  // Calculate progress - how many sections have been fully scheduled (only count those saved with Save Section)
  const scheduledSectionsCount = courseSections.filter(section =>
    allSectionSchedules[section] && allSectionSchedules[section].length === courseCredits
  ).length;
  
  const schedulingProgress = courseSections.length > 0 
    ? Math.round((scheduledSectionsCount / courseSections.length) * 100)
    : 0;

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Schedule {courseId}: {courseTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <div>
              <h5>Course: {courseId} - {courseTitle}</h5>
              <p>Credits: {courseCredits} | Teacher: {teacherId}</p>
            </div>
            <div>
              <Form.Group>
                <Form.Label>Select Section</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedSection}
                  onChange={(e) => {
                    // Do not auto-save, just switch section
                    const newSection = e.target.value;
                    setSelectedSection(newSection);
                    if (allSectionSchedules[newSection]) {
                      setSelectedSlots(allSectionSchedules[newSection]);
                    } else {
                      setSelectedSlots([]);
                    }
                  }}
                >
                  <option value="">Select a section...</option>
                  {courseSections.slice().sort().map((section, index) => {
                    // Mark sections that have been scheduled
                    // const isScheduled = allSectionSchedules[section] && 
                    //                    allSectionSchedules[section].length === courseCredits;
                    return (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    );
                  })}
                </Form.Control>
                <Form.Text className="text-muted">
                  You must schedule all sections before saving.
                </Form.Text>
              </Form.Group>
            </div>
          </div>
          
          {/* Show all sections with tick for completed */}
          <div className="d-flex flex-wrap gap-2 mt-2">
            {courseSections.slice().sort().map(section => {
              const isScheduled = allSectionSchedules[section] && allSectionSchedules[section].length === courseCredits;
              return (
                <span key={section} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  background: isScheduled ? '#e6f9ed' : '#f8f9fa',
                  color: isScheduled ? '#28a745' : '#6c757d',
                  border: isScheduled ? '1.5px solid #28a745' : '1px solid #dee2e6',
                  fontWeight: isScheduled ? 'bold' : 'normal',
                  fontSize: '1rem',
                }}>
                  Section {section}
                  {isScheduled && <i className="mdi mdi-check-circle ms-1" style={{ color: '#28a745', fontSize: '1.1rem' }}></i>}
                </span>
              );
            })}
          </div>
          
          {selectedSection && (
            <div className="alert alert-info mt-3">
              <strong>Instructions:</strong> Please select {courseCredits} time slots for Section {selectedSection}.
              You can select at most one slot per day.
            </div>
          )}
          
          {courseSections.length === 0 && (
            <Alert variant="warning" className="mt-3">
              All sections for this course have been scheduled.
            </Alert>
          )}
        </div>
        
        {selectedSection && (
          <>
            <div className="table-responsive">
              <table className="table table-bordered" style={scheduleTableStyle.table}>
                <thead>
                  <tr>
                    <th style={scheduleTableStyle.dayCell}>Day / Time</th>
                    {times.map(time => (
                      <th key={time} style={scheduleTableStyle.headerCell}>
                        {time}:00 
                        {time === 12 && <span className="ms-1">(PM)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <th style={scheduleTableStyle.dayCell}>{day}</th>
                      {times.map(time => {
                        const isSelected = selectedSlots.some(slot => slot.day === day && slot.time === time);
                        const isAvailable = isSlotAvailable(day, time);
                        const isScheduled =
                          allSectionSchedules[selectedSection] &&
                          allSectionSchedules[selectedSection].some(slot => slot.day === day && slot.time === time);
                        // Disable selection if section is scheduled
                        const disableForScheduled = allSectionSchedules[selectedSection] && allSectionSchedules[selectedSection].length === courseCredits;
                        const cellStyle = {
                          ...scheduleTableStyle.availableCell,
                          ...(isScheduled ? scheduleTableStyle.scheduledCell : {}),
                          ...(isSelected && !isScheduled ? scheduleTableStyle.selectedCell : {}),
                          // Always mark truly unavailable slots as unavailable (red)
                          ...(!isAvailable ? scheduleTableStyle.unavailableCell : {}),
                        };
                        
                        return (
                          <td
                            key={`${day}-${time}`}
                            style={cellStyle}
                            onClick={() => {
                              if (!isAvailable) return;
                              if (disableForScheduled) {
                                toast.error('This section is already scheduled. No more changes allowed.');
                                return;
                              }
                              handleSlotClick(day, time);
                            }}
                            className="text-center"
                            title={
                              !isAvailable
                                ? 'This slot is not available'
                                : disableForScheduled
                                  ? 'Section is already scheduled'
                                  : isScheduled
                                    ? 'Scheduled (saved) slot'
                                    : isSelected
                                      ? 'Click to deselect'
                                      : 'Click to select'
                            }
                          >
                            {isScheduled ? (
                              <div className="d-flex justify-content-center align-items-center h-100">
                                <i className="mdi mdi-check-circle-outline" style={{ fontSize: '1.25rem', color: '#28a745' }}></i>
                              </div>
                            ) : isSelected ? (
                              <div className="d-flex justify-content-center align-items-center h-100">
                                <i className="mdi mdi-check-circle" style={{ fontSize: '1.25rem' }}></i>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <p className="mb-0">
                  <strong>Selected:</strong> {selectedSlots.length} of {courseCredits} required slots
                </p>
              </div>
              <div className="d-flex">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setSelectedSlots([])}
                  className="me-2"
                  disabled={allSectionSchedules[selectedSection] && allSectionSchedules[selectedSection].length === courseCredits}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveSection}
                  disabled={saving || selectedSlots.length !== courseCredits || (allSectionSchedules[selectedSection] && allSectionSchedules[selectedSection].length === courseCredits)}
                >
                  {saving ? 'Saving...' : `Save Section ${selectedSection}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSaveAll}
          disabled={
            saving || 
            !courseSections.length || 
            schedulingProgress < 100
          }
        >
          {saving ? 'Saving...' : 'Save All Schedules'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ScheduleModal;
