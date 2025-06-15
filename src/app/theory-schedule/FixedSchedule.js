import { useEffect } from "react";
import { useState } from "react";
import { Button, ProgressBar } from "react-bootstrap";
import { Form} from "react-bootstrap";
import ScheduleSelectionTable from "../shared/ScheduleSelctionTable";
import { getCourses, getSections } from "../api/db-crud";
import { toast } from "react-hot-toast";
import {
  getSchedules,
  setSchedules as setSchedulesAPI,
} from "../api/theory-schedule";

export default function TheorySchedule() {
  const [selectedSlots, setSelectedSlots] = useState(new Set([]));
  const [schedules, setSchedules] = useState([]);
  const [onlyNonDept, setOnlyNonDept] = useState(true);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    getSections().then((sections) => {
      setSections(sections.filter((section) => section.type === 0));
    });
    getCourses().then((courses) => {
      courses.push({
        course_id: "CT",
        name: "CLass Test",
        type: 0,
        class_per_week: 3,
        sections: ["A", "B", "C"],
        batch: null,
      });
      setCourses(courses);
    });
  }, []);

  useEffect(() => {
    if (selectedSection) {
      const [batch, section, department] = selectedSection.split(" ");
      getSchedules(batch, section).then((res) => {        
        // Handle the new structure with main section and subsections
        let allSchedules = [];
        
        // Include main section schedules
        if (res.mainSection) {
          allSchedules = [
            ...res.mainSection.filter(s => s.department === department)
          ];
        }
        
        // Include subsection schedules
        if (res.subsections) {
          Object.values(res.subsections).forEach(subsection => {
            allSchedules = [
              ...allSchedules,
              ...subsection.filter(s => s.department === department)
            ];
          });
        }
        
        setSchedules(allSchedules);
      });
    }
  }, [selectedSection]);
  

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Theory Schedule Assign </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="!#" onClick={(event) => event.preventDefault()}>
                Theory Schedule
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Fixed Schedule
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-9 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Schedule </h4>
              <ScheduleSelectionTable
                filled={
                  new Set([
                    ...schedules
                      .filter((s) => !selectedCourse || s.course_id !== selectedCourse.course_id)
                      .map((slot) => `${slot.day} ${slot.time}`),
                  ])
                }
                labTimes={
                  // Create an array of slots that should be treated as lab times (merge 3 cells)
                  new Set(
                    schedules
                      .filter((s) => s.type === 1 && 
                                    (s.time === 2 || s.time === 8 || s.time === 11))
                      .map((slot) => `${slot.day} ${slot.time}`)
                  )
                }
                selected={selectedSlots}
                onChange={(day, time, checked) => {
                  if (!selectedCourse) {
                    toast.error("Select a course first");
                    return;
                  }

                  if (checked) {
                    if (selectedSlots.size >= selectedCourse.class_per_week) {
                      toast.error(
                        `You can only select ${selectedCourse.class_per_week} slots`
                      );
                      return;
                    }
                    setIsChanged(true);
                    setSelectedSlots(
                      new Set([...selectedSlots, `${day} ${time}`])
                    );
                  } else {
                    setIsChanged(true);
                    setSelectedSlots((selected) => {
                      const newSelected = new Set(selected);
                      newSelected.delete(`${day} ${time}`);
                      return newSelected;
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-3 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Select Course </h4>
              <Form>
                <Form.Select
                  className="form-control-sm btn-block"
                  value={selectedSection || ""}
                  onChange={(e) => {
                    if (
                      e.target.value !== selectedSection &&
                      isChanged &&
                      !window.confirm(
                        "You have unsaved changes. Are you sure you want to continue?"
                      )
                    ) {
                      return;
                    }
                    setSelectedSection(e.target.value);
                    setSelectedCourse(null);
                    setIsChanged(false);
                    setSelectedSlots(new Set([]));
                  }}
                >
                  <option value="" disabled={true}>
                    {" "}
                    Select Section{" "}
                  </option>
                  {sections.map((section) => (
                    <option
                      key={`${section.batch}-${section.section}-${section.department}`}
                      value={`${section.batch} ${section.section} ${section.department}`}
                    >
                      {section.level_term} {section.department} - Section {section.section}
                    </option>
                  ))}
                </Form.Select>
                <div className="form-check btn-block">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={onlyNonDept}
                    onChange={(e) => setOnlyNonDept(e.target.checked)}
                    id="flexCheckDefault"
                  />
                  <label
                    className="form-check-label mb-2"
                    htmlFor="flexCheckDefault"
                  >
                    Non-departmental only
                  </label>
                  <Form.Select
                    className="form-control-sm btn-block"
                    value={selectedCourse ? selectedCourse.course_id : ""}
                    onChange={(e) => {
                      if (
                        selectedCourse &&
                        e.target.value !== selectedCourse.course_id &&
                        isChanged &&
                        !window.confirm(
                          "You have unsaved changes. Are you sure you want to continue?"
                        )
                      ) {
                        return;
                      }
                      setSelectedCourse(
                        courses.find((c) => c.course_id === e.target.value)
                      );
                      setIsChanged(false);
                      setSelectedSlots(
                        new Set(
                          schedules
                            .filter((s) => s.course_id === e.target.value)
                            .map((slot) => `${slot.day} ${slot.time}`)
                        )
                      );
                    }}
                  >
                    <option value="" disabled={true}>
                      {" "}
                      Select Course{" "}
                    </option>
                    {selectedSection && (
                      <option key="CT" value={`CT`}>
                        {" "}
                        CT{" "}
                      </option>
                    )}
                    {courses &&
                      courses
                        .filter(
                          (c) =>
                            c.sections
                              .map((s) => `${c.batch} ${s} ${c.to}`)
                              .includes(selectedSection) &&
                            (!onlyNonDept || !c.course_id.startsWith("CSE"))
                        )
                        .map((course) => (
                          <option
                            key={course.course_id}
                            value={course.course_id}
                          >
                            {course.course_id}
                          </option>
                        ))}
                  </Form.Select>
                  {selectedCourse && (
                    <ProgressBar
                      variant="success"
                      now={selectedSlots.size}
                      max={selectedCourse.class_per_week}
                      label={`Selected ${selectedSlots.size} / ${selectedCourse.class_per_week}`}
                      className="my-3"
                      style={{ height: "2rem" }}
                    />
                  )}
                </div>
                <Button
                  variant="primary"
                  className="btn-sm btn-block"
                  onClick={() => {
                    if (!selectedCourse) {
                      toast.error("Select a course first");
                      return;
                    }
                    const [batch, section] = selectedSection.split(" ");
                    setSchedulesAPI(
                      batch,
                      section,
                      selectedCourse.course_id,
                      [...selectedSlots].map((slot) => {
                        const [day, time] = slot.split(" ");
                        return { day, time };
                      })
                    ).then((res) => {
                      toast.success("Schedule saved");
                      setIsChanged(false);
                      // Get the department from the selectedSection
                      const department = selectedSection.split(" ")[2];
                      getSchedules(batch, section).then((res) => {
                        // Handle the new structure with main section and subsections
                        let allSchedules = [];
                        
                        // Include main section schedules
                        if (res.mainSection) {
                          allSchedules = [
                            ...res.mainSection.filter(s => s.department === department)
                          ];
                        }
                        
                        // Include subsection schedules
                        if (res.subsections) {
                          Object.values(res.subsections).forEach(subsection => {
                            allSchedules = [
                              ...allSchedules,
                              ...subsection.filter(s => s.department === department)
                            ];
                          });
                        }
                        
                        setSchedules(allSchedules);
                      });
                    });
                  }}
                >
                  {" "}
                  Assign{" "}
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
