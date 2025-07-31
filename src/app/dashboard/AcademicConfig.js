import { useState, useEffect } from "react";
import { Card, Form, Button, Table, Row, Col, Modal } from "react-bootstrap";
import {
  getDefaultAllSectionCount,
  setDefaultSectionCount,
  deleteDefaultSectionCount,
  getBatches,
  addBatch,
  deleteBatch,
  getAllSectionCount,
  setSectionCount,
  getHostedDepartments,
  addHostedDepartment,
  deleteHostedDepartment,
} from "../api/academic-config";
import { getConfiguration, setConfiguration } from "../api/config";
import { toast } from "react-hot-toast";
import {
  mdiPlus,
  mdiContentSave,
  mdiClose,
  mdiDelete,
  mdiPencil,
  mdiDomain,
  mdiSchool,
  mdiViewGrid,
  mdiViewGridPlus,
  mdiCog,
} from "@mdi/js";
import Icon from "@mdi/react";
import ConfirmationModal from "../shared/ConfirmationModal";

const AcademicConfig = () => {
  const [hostedDepartments, setHostedDepartments] = useState([]);
  const [showHostedDepartmentModal, setShowHostedDepartmentModal] =
    useState(false);
  const [currentHostedDepartment, setCurrentHostedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sectionCounts, setSectionCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSectionCountModal, setShowSectionCountModal] = useState(false);
  const [levelCount, setLevelCount] = useState(4); // Default value
  const [termCount, setTermCount] = useState(2); // Default value
  const [newBatch, setNewBatch] = useState("");
  const [newDepartment, setNewDepartment] = useState({
    department: "",
    section_count: 0,
    subsection_count_per_section: 0,
  });
  const [editSectionCount, setEditSectionCount] = useState({
    batch: "",
    department: "",
    section_count: 0,
    subsection_count_per_section: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [originalDept, setOriginalDept] = useState("");

  // Modal button styles
  const modalButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  };

  // Action button styles
  const actionButtonStyle = {
    padding: "0.4rem",
    borderRadius: "0.375rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "0.5rem",
  };

  // Validation
  const validateDepartmentForm = () => {
    if (!newDepartment.department || newDepartment.department.trim() === "") {
      toast.error("Department code cannot be empty");
      return false;
    }
    if (newDepartment.section_count < 0) {
      toast.error("Section count cannot be negative");
      return false;
    }
    if (newDepartment.subsection_count_per_section < 0) {
      toast.error("Subsection count cannot be negative");
      return false;
    }
    return true;
  };

  // Load hosted departments
  const loadHostedDepartments = async () => {
    try {
      setLoading(true);
      const data = await getHostedDepartments();
      setHostedDepartments(data);
    } catch (err) {
      console.error("Error loading offering from departments:", err);
      toast.error("Failed to load offering from departments");
      setHostedDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load departments with section counts
  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDefaultAllSectionCount();
      setDepartments(data);
    } catch (err) {
      console.error("Error loading departments:", err);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  // Load batches
  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await getBatches();
      setBatches(data);
    } catch (err) {
      console.error("Error loading batches:", err);
      toast.error("Failed to load batches");
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all section counts
  const loadSectionCounts = async () => {
    try {
      setLoading(true);
      const data = await getAllSectionCount();
      setSectionCounts(data);
    } catch (err) {
      console.error("Error loading section counts:", err);
      toast.error("Failed to load section counts");
      setSectionCounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load level and term counts from configuration
  const loadLevelTermConfig = async () => {
    try {
      const level = await getConfiguration("LEVEL_COUNT");
      const term = await getConfiguration("TERM_COUNT");

      if (level) {
        setLevelCount(parseInt(level));
      }

      if (term) {
        setTermCount(parseInt(term));
      }
    } catch (err) {
      console.error("Error loading level-term configuration:", err);
      toast.error("Failed to load level-term configuration");
    }
  };

  const handleAddHostedDepartment = (department) => {
    if (!department || department.trim() === "") {
      toast.error("Offering From Department is required");
      return;
    }

    addHostedDepartment({ department })
      .then(() => {
        toast.success("Offering From Department added successfully");
        loadHostedDepartments();
      })
      .catch((err) => {
        console.error("Error adding Offering From Department:", err);
        toast.error("Failed to add Offering From Department");
      });
  };

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({
    title: "",
    body: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
    onCancel: () => {},
    confirmIcon: "mdi-delete",
    red: 220,
    green: 53,
    blue: 69,
  });

  const handleShowConfirmation = (
    title,
    body,
    confirmText,
    cancelText,
    onConfirm,
    confirmIcon,
    red,
    green,
    blue
  ) => {
    setConfirmationDetails({
      title,
      body,
      confirmText,
      cancelText,
      onConfirm,
      confirmIcon,
      red,
      green,
      blue,
    });
    setShowConfirmation(true);
  };

  const handleHideConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleDeleteHostedDepartment = (department) => {
    handleShowConfirmation(
      "Delete Offering From Department",
      `Are you sure you want to delete offering from department ${department}?`,
      "Delete",
      "Cancel",
      async () => {
        try {
          await deleteHostedDepartment({ department });
          toast.success("Offering From Department deleted successfully");
          loadHostedDepartments();
        } catch (err) {
          console.error("Error deleting Offering From Department:", err);
          toast.error("Failed to delete Offering From Department");
        }
      },
      "mdi-delete",
      220,
      53,
      69
    );
  };

  // Save level and term count configuration
  const saveLevelTermConfig = async () => {
    try {
      setLoading(true);

      // Save level count
      const level = await setConfiguration(
        "LEVEL_COUNT",
        levelCount.toString()
      );

      // Save term count
      const term = await setConfiguration("TERM_COUNT", termCount.toString());

      if (!level.success || !term.success) {
        throw new Error("Failed to save level or term configuration");
      }

      toast.success("Level-Term configuration saved successfully");
    } catch (err) {
      console.error("Error saving level-term configuration:", err);
      toast.error("Failed to save level-term configuration");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert to number for numeric fields
    if (name === "section_count" || name === "subsection_count_per_section") {
      setNewDepartment({ ...newDepartment, [name]: parseInt(value) || 0 });
    } else {
      setNewDepartment({ ...newDepartment, [name]: value });
    }
  };

  // Handle batch input change
  const handleBatchInputChange = (e) => {
    setNewBatch(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateDepartmentForm()) return;

    try {
      setLoading(true);

      if (editMode) {
        // For editing, delete the old one and add new if department name changed
        if (originalDept !== newDepartment.department) {
          await deleteDefaultSectionCount({ department: originalDept });
        }
      }

      await setDefaultSectionCount(newDepartment);

      toast.success(
        `Department ${editMode ? "updated" : "added"} successfully`
      );
      setShowAddModal(false);
      setNewDepartment({
        department: "",
        section_count: 0,
        subsection_count_per_section: 0,
      });
      setEditMode(false);
      loadDepartments();
    } catch (err) {
      console.error(
        `Error ${editMode ? "updating" : "adding"} department:`,
        err
      );
      toast.error(`Failed to ${editMode ? "update" : "add"} department`);
    } finally {
      setLoading(false);
    }
  };

  // Handle department delete
  const handleDelete = async (department) => {
    handleShowConfirmation(
      "Delete Department",
      `Are you sure you want to delete ${department}?`,
      "Delete",
      "Cancel",
      async () => {
        try {
          setLoading(true);
          await deleteDefaultSectionCount({ department });
          toast.success(`Department ${department} deleted successfully`);
          loadDepartments();
        } catch (err) {
          console.error("Error deleting department:", err);
          toast.error(`Failed to delete department ${department}`);
        } finally {
          setLoading(false);
        }
      },
      "mdi-delete",
      220,
      53,
      69
    );
  };

  // Handle department edit
  const handleEdit = (dept) => {
    setNewDepartment({
      department: dept.department,
      section_count: dept.section_count,
      subsection_count_per_section: dept.subsection_count_per_section,
    });
    setOriginalDept(dept.department);
    setEditMode(true);
    setShowAddModal(true);
  };

  // Handle add batch
  const handleAddBatch = async () => {
    if (!newBatch || newBatch.trim() === "") {
      toast.error("Batch name cannot be empty");
      return;
    }
    try {
      setLoading(true);
      await addBatch({ batch: newBatch });
      toast.success("Batch added successfully");
      setShowBatchModal(false);
      setNewBatch("");
      await loadBatches();
      await loadSectionCounts(); // Reload section counts as they will be updated for the new batch
    } catch (err) {
      console.error("Error adding batch:", err);
      toast.error("Failed to add batch");
    } finally {
      setLoading(false);
    }
  };

  // Handle batch delete
  const handleDeleteBatch = async (batch) => {
    handleShowConfirmation(
      "Delete Batch",
      `Are you sure you want to delete batch ${batch}? This will delete all section count data for this batch.`,
      "Delete",
      "Cancel",
      async () => {
        try {
          setLoading(true);
          await deleteBatch({ batch });
          toast.success(`Batch ${batch} deleted successfully`);
          await loadBatches();
          await loadSectionCounts();
        } catch (err) {
          console.error("Error deleting batch:", err);
          toast.error(`Failed to delete batch ${batch}`);
        } finally {
          setLoading(false);
        }
      },
      "mdi-delete",
      220,
      53,
      69
    );
  };

  // Handle section count edit modal
  const handleEditSectionCount = (sectionCount) => {
    setEditSectionCount({
      batch: sectionCount.batch,
      department: sectionCount.department,
      section_count: sectionCount.section_count,
      subsection_count_per_section: sectionCount.subsection_count_per_section,
    });
    setShowSectionCountModal(true);
  };

  // Handle section count input change
  const handleSectionCountInputChange = (e) => {
    const { name, value } = e.target;

    // Convert to number for numeric fields
    if (name === "section_count" || name === "subsection_count_per_section") {
      setEditSectionCount({
        ...editSectionCount,
        [name]: parseInt(value) || 0,
      });
    } else {
      setEditSectionCount({ ...editSectionCount, [name]: value });
    }
  };

  // Handle section count update
  const handleUpdateSectionCount = async () => {
    try {
      setLoading(true);
      await setSectionCount(editSectionCount);
      toast.success("Section count updated successfully");
      setShowSectionCountModal(false);
      await loadSectionCounts();
    } catch (err) {
      console.error("Error updating section count:", err);
      toast.error("Failed to update section count");
    } finally {
      setLoading(false);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadHostedDepartments(),
          loadDepartments(),
          loadBatches(),
          loadSectionCounts(),
          loadLevelTermConfig(),
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load some data");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  return (
    <div className="academic-config-container">
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "none",
          overflow: "hidden",
          marginBottom: "2rem",
        }}
      >
        <Card.Body style={{ padding: "2rem" }}>
          <div
            style={{
              borderBottom: "3px solid rgb(194, 137, 248)",
              paddingBottom: "16px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4
              className="card-title"
              style={{
                color: "rgb(174, 117, 228)",
                marginBottom: 0,
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.3px",
              }}
            >
              <span style={{ marginRight: "12px" }}>
                <Icon
                  path={mdiViewGrid}
                  size={1.2}
                  color="rgb(194, 137, 248)"
                />
              </span>
              Level-Term Configuration
            </h4>
          </div>
          <div className="level-term-config" style={{ padding: "0 1.25rem" }}>
            <Row>
              <Col md={5}>
                <div
                  style={{
                    background: "rgba(194, 137, 248, 0.05)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(194, 137, 248, 0.2)",
                  }}
                >
                  <h5
                    style={{
                      color: "rgb(174, 117, 228)",
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      path={mdiCog}
                      size={0.9}
                      color="rgb(194, 137, 248)"
                      style={{ marginRight: "8px" }}
                    />
                    System Configuration
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "rgb(154, 77, 226)",
                        fontWeight: "500",
                      }}
                    >
                      <Icon
                        path={mdiSchool}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Number of Levels
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="10"
                      value={levelCount}
                      onChange={(e) =>
                        setLevelCount(parseInt(e.target.value) || 1)
                      }
                      style={{
                        borderRadius: "8px",
                        border: "1.5px solid rgba(194, 137, 248, 0.3)",
                        boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
                      }}
                    />
                    <Form.Text style={{ color: "#6c757d" }}>
                      Total number of levels in the academic program (e.g., 4
                      for undergraduate)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "rgb(154, 77, 226)",
                        fontWeight: "500",
                      }}
                    >
                      <Icon
                        path={mdiViewGrid}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Number of Terms per Level
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="4"
                      value={termCount}
                      onChange={(e) =>
                        setTermCount(parseInt(e.target.value) || 1)
                      }
                      style={{
                        borderRadius: "8px",
                        border: "1.5px solid rgba(194, 137, 248, 0.3)",
                        boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
                      }}
                    />
                    <Form.Text style={{ color: "#6c757d" }}>
                      Number of terms in each level (e.g., 2 for semester
                      system)
                    </Form.Text>
                  </Form.Group>

                  <Button
                    onClick={saveLevelTermConfig}
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "500",
                      marginTop: "0.5rem",
                    }}
                    disabled={loading}
                  >
                    <Icon path={mdiContentSave} size={0.9} />
                    Save Configuration
                  </Button>
                </div>
              </Col>
              <Col md={7}>
                <div
                  style={{
                    background: "rgba(194, 137, 248, 0.05)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(194, 137, 248, 0.2)",
                    height: "100%",
                  }}
                >
                  <h5
                    style={{
                      color: "rgb(174, 117, 228)",
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      path={mdiSchool}
                      size={0.9}
                      color="rgb(194, 137, 248)"
                      style={{ marginRight: "8px" }}
                    />
                    Level-Term Structure
                  </h5>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "1rem",
                    }}
                  >
                    {Array.from({ length: levelCount }, (_, levelIndex) => (
                      <div
                        key={levelIndex}
                        style={{
                          marginBottom: "1rem",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "600",
                            color: "rgb(154, 77, 226)",
                            marginBottom: "8px",
                          }}
                        >
                          Level {levelIndex + 1}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {Array.from({ length: termCount }, (_, termIndex) => (
                            <div
                              key={termIndex}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                background: "rgba(154, 77, 226, 0.1)",
                                border: "1px solid rgba(154, 77, 226, 0.3)",
                                color: "rgb(154, 77, 226)",
                              }}
                            >
                              {levelIndex + 1}-{termIndex + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Hosted Departments Card */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "none",
          overflow: "hidden",
          marginBottom: "2rem",
        }}
      >
        <Card.Body style={{ padding: "2rem" }}>
          <div
            style={{
              borderBottom: "3px solid rgb(194, 137, 248)",
              paddingBottom: "16px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4
              className="card-title"
              style={{
                color: "rgb(174, 117, 228)",
                marginBottom: 0,
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.3px",
              }}
            >
              <span style={{ marginRight: "12px" }}>
                <Icon
                  path={mdiViewGrid}
                  size={1.2}
                  color="rgb(194, 137, 248)"
                />
              </span>
              Offering From Departments
            </h4>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                style={{
                  borderRadius: "6px",
                  padding: "7px 14px",
                  fontWeight: "500",
                  background: "rgba(154, 77, 226, 0.15)",
                  border: "1px solid rgba(154, 77, 226, 0.5)",
                  color: "rgb(154, 77, 226)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  minWidth: "auto",
                  justifyContent: "center",
                }}
                onClick={() => setShowHostedDepartmentModal(true)}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgb(154, 77, 226)";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(154, 77, 226, 0.15)";
                  e.target.style.color = "rgb(154, 77, 226)";
                }}
              >
                <Icon path={mdiPlus} size={1} />
                Add New Department
              </button>
            </div>
          </div>
          <div className="batch-list" style={{ padding: "0 1.25rem" }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !Array.isArray(hostedDepartments) ||
              hostedDepartments.length === 0 ? (
              <div className="text-center py-4">
                No Offering from departments found
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {hostedDepartments.map((department) => (
                  <div
                    key={department}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      background: "rgba(154, 77, 226, 0.1)",
                      border: "1px solid rgba(154, 77, 226, 0.3)",
                      color: "rgb(154, 77, 226)",
                      position: "relative",
                      paddingRight: "36px",
                    }}
                  >
                    {department}
                    <button
                      onClick={() => handleDeleteHostedDepartment(department)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        color: "rgba(220, 53, 69, 0.7)",
                      }}
                      title="Delete Batch"
                    >
                      <Icon path={mdiDelete} size={0.7} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
      {/* Hosted Department Modal */}
      <Modal
        show={showHostedDepartmentModal}
        onHide={() => setShowHostedDepartmentModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          style={{
            background:
              "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
            color: "white",
            borderBottom: "none",
          }}
        >
          <Modal.Title>Add Offering From Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="hostedDepartment" className="mb-3">
              <Form.Label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(154, 77, 226)",
                }}
              >
                Offering From Department
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Offering from department"
                name="hostedDepartment"
                value={currentHostedDepartment || ""}
                onChange={(e) => setCurrentHostedDepartment(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowHostedDepartmentModal(false);
              setCurrentHostedDepartment("");
            }}
            style={{
              ...modalButtonStyle,
              background: "#f8f9fa",
              color: "#6c757d",
              border: "1px solid #dee2e6",
            }}
          >
            <Icon path={mdiClose} size={0.8} />
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleAddHostedDepartment(currentHostedDepartment);
              setCurrentHostedDepartment("");
              setShowHostedDepartmentModal(false);
            }}
            style={{
              ...modalButtonStyle,
              background:
                "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
              border: "none",
            }}
            disabled={
              !currentHostedDepartment || currentHostedDepartment.trim() === ""
            }
          >
            <Icon path={mdiPlus} size={0.8} />
            Add Department
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Department Section Count Table Card */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "none",
          overflow: "hidden",
          marginBottom: "2rem",
        }}
      >
        <Card.Body style={{ padding: "2rem" }}>
          <div
            style={{
              borderBottom: "3px solid rgb(194, 137, 248)",
              paddingBottom: "16px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4
              className="card-title"
              style={{
                color: "rgb(174, 117, 228)",
                marginBottom: 0,
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.3px",
              }}
            >
              <span style={{ marginRight: "12px" }}>
                <Icon path={mdiDomain} size={1.2} color="rgb(194, 137, 248)" />
              </span>
              Offering To Departments & Default Section Count
            </h4>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                style={{
                  borderRadius: "6px",
                  padding: "7px 14px",
                  fontWeight: "500",
                  background: "rgba(154, 77, 226, 0.15)",
                  border: "1px solid rgba(154, 77, 226, 0.5)",
                  color: "rgb(154, 77, 226)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  minWidth: "auto",
                  justifyContent: "center",
                }}
                onClick={() => {
                  setNewDepartment({
                    department: "",
                    section_count: 0,
                    subsection_count_per_section: 0,
                  });
                  setEditMode(false);
                  setShowAddModal(true);
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgb(154, 77, 226)";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(154, 77, 226, 0.15)";
                  e.target.style.color = "rgb(154, 77, 226)";
                }}
              >
                <Icon path={mdiPlus} size={1} />
                Add New Department
              </button>
            </div>
          </div>
          <div className="table-responsive" style={{ padding: "0 1.25rem" }}>
            <Table style={{ marginBottom: "1.25rem" }} hover>
              <thead style={{ background: "rgba(194, 137, 248, 0.08)" }}>
                <tr>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon
                        path={mdiSchool}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Department
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        path={mdiViewGrid}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Sections
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        path={mdiViewGridPlus}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Subsections per Section
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon
                        path={mdiCog}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No departments found
                    </td>
                  </tr>
                ) : (
                  departments.map((dept, index) => (
                    <tr key={dept.department}>
                      <td style={{ padding: "1rem" }}>{dept.department}</td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        {dept.section_count}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        {dept.subsection_count_per_section}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          style={{
                            ...actionButtonStyle,
                            borderColor: "rgba(154, 77, 226, 0.5)",
                            color: "rgb(154, 77, 226)",
                          }}
                          onClick={() => handleEdit(dept)}
                        >
                          <Icon path={mdiPencil} size={0.8} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          style={{
                            ...actionButtonStyle,
                            borderColor: "rgba(220, 53, 69, 0.5)",
                            color: "#dc3545",
                          }}
                          onClick={() => handleDelete(dept.department)}
                        >
                          <Icon path={mdiDelete} size={0.8} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Department Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          style={{
            background:
              "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
            color: "white",
            borderBottom: "none",
          }}
        >
          <Modal.Title>
            {editMode ? "Edit Department" : "Add New Department"}
          </Modal.Title>
          <Button
            variant="link"
            onClick={() => setShowAddModal(false)}
            style={{
              color: "white",
              textDecoration: "none",
              padding: 0,
              fontSize: "1.5rem",
            }}
          >
            &times;
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(154, 77, 226)",
                }}
              >
                <Icon
                  path={mdiSchool}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                Department Code
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter department code (e.g. CSE)"
                name="department"
                value={newDepartment.department}
                onChange={handleInputChange}
                disabled={editMode} // Disable editing department code in edit mode
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(154, 77, 226)",
                }}
              >
                <Icon
                  path={mdiViewGrid}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                Section Count
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter section count"
                name="section_count"
                value={newDepartment.section_count}
                onChange={handleInputChange}
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(154, 77, 226)",
                }}
              >
                <Icon
                  path={mdiViewGridPlus}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                Subsections per Section
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter subsections per section"
                name="subsection_count_per_section"
                value={newDepartment.subsection_count_per_section}
                onChange={handleInputChange}
                min="0"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}>
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(false)}
            style={{
              ...modalButtonStyle,
              background: "#f8f9fa",
              color: "#6c757d",
              border: "1px solid #dee2e6",
            }}
          >
            <Icon path={mdiClose} size={0.8} />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            style={{
              ...modalButtonStyle,
              background:
                "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
              border: "none",
            }}
          >
            <Icon path={mdiContentSave} size={0.8} />
            {editMode ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Batch Modal */}
      <Modal
        show={showBatchModal}
        onHide={() => setShowBatchModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          style={{
            background:
              "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
            color: "white",
            borderBottom: "none",
          }}
        >
          <Modal.Title>Add New Batch</Modal.Title>
          <Button
            variant="link"
            onClick={() => setShowBatchModal(false)}
            style={{
              color: "white",
              textDecoration: "none",
              padding: 0,
              fontSize: "1.5rem",
            }}
          >
            &times;
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(154, 77, 226)",
                }}
              >
                <Icon
                  path={mdiViewGrid}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                Batch Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter batch (e.g. 25)"
                name="batch"
                value={newBatch}
                onChange={handleBatchInputChange}
              />
              <Form.Text className="text-muted">
                Adding a new batch will automatically create section counts for
                all departments using the default values.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}>
          <Button
            variant="secondary"
            onClick={() => setShowBatchModal(false)}
            style={{
              ...modalButtonStyle,
              background: "#f8f9fa",
              color: "#6c757d",
              border: "1px solid #dee2e6",
            }}
          >
            <Icon path={mdiClose} size={0.8} />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddBatch}
            style={{
              ...modalButtonStyle,
              background:
                "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
              border: "none",
            }}
          >
            <Icon path={mdiContentSave} size={0.8} />
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Section Count Modal */}
      <Modal
        show={showSectionCountModal}
        onHide={() => setShowSectionCountModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          style={{
            background:
              "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
            color: "white",
            borderBottom: "none",
          }}
        >
          <Modal.Title>Edit Section Count</Modal.Title>
          <Button
            variant="link"
            onClick={() => setShowSectionCountModal(false)}
            style={{
              color: "white",
              textDecoration: "none",
              padding: 0,
              fontSize: "1.5rem",
            }}
          >
            &times;
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <Icon
                  path={mdiViewGrid}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                <strong style={{ color: "rgb(154, 77, 226)" }}>Batch:</strong>
                <span style={{ marginLeft: "8px" }}>
                  {editSectionCount.batch}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Icon
                  path={mdiSchool}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                <strong style={{ color: "rgb(154, 77, 226)" }}>
                  Department:
                </strong>
                <span style={{ marginLeft: "8px" }}>
                  {editSectionCount.department}
                </span>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(154, 77, 226)",
                }}
              >
                <Icon
                  path={mdiViewGrid}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                Section Count
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter section count"
                name="section_count"
                value={editSectionCount.section_count}
                onChange={handleSectionCountInputChange}
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(154, 77, 226)",
                }}
              >
                <Icon
                  path={mdiViewGridPlus}
                  size={0.8}
                  color="rgb(194, 137, 248)"
                  style={{ marginRight: "8px" }}
                />
                Subsections per Section
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter subsections per section"
                name="subsection_count_per_section"
                value={editSectionCount.subsection_count_per_section}
                onChange={handleSectionCountInputChange}
                min="0"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}>
          <Button
            variant="secondary"
            onClick={() => setShowSectionCountModal(false)}
            style={{
              ...modalButtonStyle,
              background: "#f8f9fa",
              color: "#6c757d",
              border: "1px solid #dee2e6",
            }}
          >
            <Icon path={mdiClose} size={0.8} />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateSectionCount}
            style={{
              ...modalButtonStyle,
              background:
                "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
              border: "none",
            }}
          >
            <Icon path={mdiContentSave} size={0.8} />
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Batch Management Card */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "none",
          overflow: "hidden",
          marginBottom: "2rem",
        }}
      >
        <Card.Body style={{ padding: "2rem" }}>
          <div
            style={{
              borderBottom: "3px solid rgb(194, 137, 248)",
              paddingBottom: "16px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4
              className="card-title"
              style={{
                color: "rgb(174, 117, 228)",
                marginBottom: 0,
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.3px",
              }}
            >
              <span style={{ marginRight: "12px" }}>
                <Icon
                  path={mdiViewGrid}
                  size={1.2}
                  color="rgb(194, 137, 248)"
                />
              </span>
              Batches
            </h4>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                style={{
                  borderRadius: "6px",
                  padding: "7px 14px",
                  fontWeight: "500",
                  background: "rgba(154, 77, 226, 0.15)",
                  border: "1px solid rgba(154, 77, 226, 0.5)",
                  color: "rgb(154, 77, 226)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  minWidth: "auto",
                  justifyContent: "center",
                }}
                onClick={() => setShowBatchModal(true)}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgb(154, 77, 226)";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(154, 77, 226, 0.15)";
                  e.target.style.color = "rgb(154, 77, 226)";
                }}
              >
                <Icon path={mdiPlus} size={1} />
                Add New Batch
              </button>
            </div>
          </div>
          <div className="batch-list" style={{ padding: "0 1.25rem" }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !Array.isArray(batches) || batches.length === 0 ? (
              <div className="text-center py-4">No batches found</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {batches.map((batch) => (
                  <div
                    key={batch}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      background: "rgba(154, 77, 226, 0.1)",
                      border: "1px solid rgba(154, 77, 226, 0.3)",
                      color: "rgb(154, 77, 226)",
                      position: "relative",
                      paddingRight: "36px",
                    }}
                  >
                    {batch}
                    <button
                      onClick={() => handleDeleteBatch(batch)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        color: "rgba(220, 53, 69, 0.7)",
                      }}
                      title="Delete Batch"
                    >
                      <Icon path={mdiDelete} size={0.7} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Section Counts Table Card */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "none",
          overflow: "hidden",
          marginBottom: "2rem",
        }}
      >
        <Card.Body style={{ padding: "2rem" }}>
          <div
            style={{
              borderBottom: "3px solid rgb(194, 137, 248)",
              paddingBottom: "16px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4
              className="card-title"
              style={{
                color: "rgb(174, 117, 228)",
                marginBottom: 0,
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.3px",
              }}
            >
              <span style={{ marginRight: "12px" }}>
                <Icon
                  path={mdiViewGridPlus}
                  size={1.2}
                  color="rgb(194, 137, 248)"
                />
              </span>
              Section Counts by Batch & Department
            </h4>
          </div>
          <div className="table-responsive" style={{ padding: "0 1.25rem" }}>
            <Table style={{ marginBottom: "1.25rem" }} hover>
              <thead style={{ background: "rgba(194, 137, 248, 0.08)" }}>
                <tr>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon
                        path={mdiSchool}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Department
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon
                        path={mdiViewGrid}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Batch
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        path={mdiViewGrid}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Sections
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        path={mdiViewGridPlus}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Subsections per Section
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "rgb(154, 77, 226)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon
                        path={mdiCog}
                        size={0.8}
                        color="rgb(194, 137, 248)"
                        style={{ marginRight: "8px" }}
                      />
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : !Array.isArray(sectionCounts) ||
                  sectionCounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No section counts found
                    </td>
                  </tr>
                ) : (
                  sectionCounts.map((sectionCount, index) => (
                    <tr
                      key={`${sectionCount.batch}-${sectionCount.department}`}
                    >
                      <td style={{ padding: "1rem" }}>
                        {sectionCount.department}
                      </td>
                      <td style={{ padding: "1rem" }}>{sectionCount.batch}</td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        {sectionCount.section_count}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        {sectionCount.subsection_count_per_section}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          style={{
                            ...actionButtonStyle,
                            borderColor: "rgba(154, 77, 226, 0.5)",
                            color: "rgb(154, 77, 226)",
                          }}
                          onClick={() => handleEditSectionCount(sectionCount)}
                        >
                          <Icon path={mdiPencil} size={0.8} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmation}
        onHide={handleHideConfirmation}
        title={confirmationDetails.title}
        body={confirmationDetails.body}
        confirmText={confirmationDetails.confirmText}
        cancelText={confirmationDetails.cancelText}
        onConfirm={() => {
          confirmationDetails.onConfirm();
          handleHideConfirmation();
        }}
        onCancel={handleHideConfirmation}
        confirmIcon={confirmationDetails.confirmIcon}
        red={confirmationDetails.red}
        green={confirmationDetails.green}
        blue={confirmationDetails.blue}
      />
    </div>
  );
};

export default AcademicConfig;
