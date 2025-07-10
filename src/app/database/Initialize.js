import { useEffect, useState } from "react"
import { toast } from "react-hot-toast";
import {
    getLevelTerms,
    setLevelTermsDB,
    addLevelTerm,
    deleteLevelTerm
} from "../api/db-crud"
import { setTheoryAssignStatus } from "../api/theory-assign";
import { getBatches, getDepartments, getAllLevelTermsName } from "../api/academic-config";
import { Button, Modal, Form, Row, Col, FormGroup } from "react-bootstrap";
import { mdiContentSave, mdiClose, mdiPlusCircleOutline, mdiArrowRightCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

// Define a shared style object for modal action buttons
const modalButtonStyle = {
    borderRadius: "6px",
    padding: "7px 14px",
    fontWeight: "500",
    background: "rgba(154, 77, 226, 0.15)",
    border: "1px solid rgba(154, 77, 226, 0.5)",
    color: "rgb(154, 77, 226)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.9rem"
};

export default function Initialize() {
    const [levelTerms, setLevelTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLevelTerms, setSelectedLevelTerms] = useState([]);
    const [batchInputs, setBatchInputs] = useState({});
    const [allBatches, setAllBatches] = useState([]);
    const [newLevelTerm, setNewLevelTerm] = useState({ department: "", level_term: "" });
    const [departments, setDepartments] = useState([]);
    const [allLevelTermNames, setAllLevelTermNames] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        getLevelTerms()
            .then((res) => {
                setLevelTerms(res.data);
            })
            .catch((error) => {
                toast.error("Failed to load level terms. Please try again later.");
                setLevelTerms([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
        getBatches()
            .then((res) => {
                setAllBatches(res);
            })
            .catch((error) => {
                toast.error("Failed to load batches. Please try again later.");
                setAllBatches([]);
            });
        getDepartments()
            .then((res) => {
                setDepartments(res);
            })
            .catch((error) => {
                toast.error("Failed to load departments. Please try again later.");
                setDepartments([]);
            });
        getAllLevelTermsName()
            .then((res) => {
                setAllLevelTermNames(res);
            })
            .catch((error) => {
                toast.error("Failed to load level term names. Please try again later.");
                setAllLevelTermNames([]);
            });
    }, [])

    const handleToggle = (index) => {
        setLevelTerms(prev => {
            return prev.map((lt, i) => {
                if (i === index) {
                    if (lt.active) {
                        return {
                            ...lt,
                            active: !lt.active,
                            batch: 0
                        }
                    } else {
                        return {
                            ...lt,
                            active: !lt.active
                        }
                    }
                }
                return lt;
            })
        })
    }

    const handleBatch = (batch, index) => {
        setLevelTerms(prev => {
            return prev.map((lt, i) => {
                if (i === index) {
                    return {
                        ...lt,
                        batch: batch
                    }
                }
                return lt;
            })
        })
    }

    const handleAddLevelTerm = () => {
        if (!newLevelTerm.department || !newLevelTerm.level_term) {
            toast.error("Please select a department and enter a level-term");
            return;
        }

        const addToast = toast.loading("Adding level term...");
        addLevelTerm(newLevelTerm)
            .then(res => {
                toast.dismiss(addToast);
                toast.success(`Successfully added ${newLevelTerm.level_term} for ${newLevelTerm.department}`);
                // Add the new level term to the state
                setLevelTerms(prev => [...prev, {
                    ...newLevelTerm,
                    active: false,
                    batch: 0
                }]);
                // Reset form
                setNewLevelTerm({ department: "", level_term: "" });
                setShowAddModal(false);
            })
            .catch(error => {
                toast.dismiss(addToast);
                console.error("Error adding level term:", error);
                toast.error(`Failed to add level term. ${error.response?.data?.message || ''}`);
            });
    }

    const handleDelete = (level_term, department) => {
        if (window.confirm(`Are you sure you want to delete ${level_term} for ${department}?`)) {
            const deleteToast = toast.loading(`Deleting ${level_term} for ${department}...`);

            deleteLevelTerm({ level_term, department })
                .then(() => {
                    toast.dismiss(deleteToast);
                    toast.success(`Successfully deleted ${level_term} for ${department}`);
                    // Update the state to remove the deleted item
                    setLevelTerms(prev => prev.filter(lt =>
                        !(lt.level_term === level_term && lt.department === department)
                    ));
                })
                .catch(error => {
                    toast.dismiss(deleteToast);
                    console.error("Error deleting level term:", error);
                    toast.error(`Failed to delete ${level_term} for ${department}`);
                });
        }
    }

    const handleSubmit = () => {
        // Validate data before submission
        const invalidEntries = levelTerms.filter(lt => lt.active && (lt.batch < 0 || lt.batch === ""));

        if (invalidEntries.length > 0) {
            toast.error("Please select batch for all active level terms");
            return;
        }

        setIsSubmitting(true);
        const submittingToast = toast.loading("Initializing system...");

        setLevelTermsDB(levelTerms)
            .then(res => {
                toast.dismiss(submittingToast);
                toast.success("System successfully initialized");
            })
            .catch(error => {
                toast.dismiss(submittingToast);
                console.error("Error initializing system:", error);
                toast.error("Failed to initialize system. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
        setTheoryAssignStatus(0);
    }

    // Get unique, sorted level-terms for dropdown
    const uniqueLevelTerms = [...new Set(levelTerms.map(lt => lt.level_term))].sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true });
    });

    // Handler for activating selected level-terms for all departments
    const handleActivateLevelTerms = () => {
        if (!selectedLevelTerms.length) {
            toast.error("Please select at least one level-term");
            return;
        }
        // Validate batch inputs
        for (const lt of selectedLevelTerms) {
            if (!batchInputs[lt] || batchInputs[lt] === "") {
                toast.error(`Please select a batch for ${lt}`);
                return;
            }
        }
        setLevelTerms(prev => prev.map(lt =>
            selectedLevelTerms.includes(lt.level_term)
                ? { ...lt, active: true, batch: batchInputs[lt.level_term] }
                : lt
        ));
        setShowActivateModal(false);
        setSelectedLevelTerms([]);
        setBatchInputs({});
        toast.success(`Activated ${selectedLevelTerms.join(", ")} for all departments`);
    };

    return (
        <div>
            {/* Modern Page Header */}
            <div className="page-header" style={{
                background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
                borderRadius: "16px",
                padding: "1.5rem",
                marginBottom: "2rem",
                boxShadow: "0 8px 32px rgba(174, 117, 228, 0.15)",
                color: "white"
            }}>
                <h3 className="page-title" style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "white"
                }}>
                    <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13 3H11C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5C15 3.89543 14.1046 3 13 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 12H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 16H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    Active Level Terms
                </h3>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
                        <li className="breadcrumb-item" style={{ color: "rgba(255,255,255,0.8)" }}>
                            <a href="!#" onClick={(event) => event.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                                Database
                            </a>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
                            Initialize
                        </li>
                    </ol>
                </nav>
            </div>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card" style={{
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        border: "none",
                        transition: "all 0.3s ease",
                        background: "white"
                    }}>
                        <div className="card-body" style={{ padding: "2rem" }}>
                            <div style={{ borderBottom: "3px solid rgb(194, 137, 248)", paddingBottom: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h4 className="card-title" style={{
                                    color: "rgb(174, 117, 228)",
                                    marginBottom: 0,
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "1.5rem",
                                    letterSpacing: "0.3px"
                                }}>
                                    <span style={{ marginRight: "12px" }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M13 3H11C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5C15 3.89543 14.1046 3 13 3Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9 12H15" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9 16H15" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    Level Term Initialization
                                </h4>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
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
                                            justifyContent: "center"
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.background = "rgb(154, 77, 226)";
                                            e.target.style.color = "white";
                                            e.target.style.borderColor = "rgb(154, 77, 226)";
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                            e.target.style.color = "rgb(154, 77, 226)";
                                            e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                                        }}
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        <i className="mdi mdi-plus-circle" style={{ fontSize: "18px", marginRight: "8px" }}></i>
                                        Add Level-Term
                                    </button>
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
                                            justifyContent: "center"
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.background = "rgb(154, 77, 226)";
                                            e.target.style.color = "white";
                                            e.target.style.borderColor = "rgb(154, 77, 226)";
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                            e.target.style.color = "rgb(154, 77, 226)";
                                            e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                                        }}
                                        onClick={() => setShowActivateModal(true)}
                                    >
                                        <i className="mdi mdi-check-circle" style={{ fontSize: "18px", marginRight: "8px" }}></i>
                                        Activate Level-Term
                                    </button>
                                </div>
                            </div>

                            {/* Add loading state */}
                            {isLoading ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '40px 0',
                                    color: 'rgb(154, 77, 226)',
                                    fontWeight: '500',
                                    flexDirection: 'column',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'rgba(194, 137, 248, 0.08)',
                                        padding: '12px 20px',
                                        borderRadius: '20px',
                                        boxShadow: '0 2px 8px rgba(194, 137, 248, 0.15)',
                                        animation: 'pulse-light 2s infinite ease-in-out'
                                    }}>
                                        <span
                                            className="spinner-border"
                                            role="status"
                                            aria-hidden="true"
                                            style={{
                                                color: 'rgb(154, 77, 226)',
                                                width: '24px',
                                                height: '24px'
                                            }}
                                        ></span>
                                        Loading level terms...
                                    </div>
                                    <style jsx="true">{`
                                        @keyframes pulse-light {
                                            0% { opacity: 1; }
                                            50% { opacity: 0.7; }
                                            100% { opacity: 1; }
                                        }
                                    `}</style>
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive" style={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                                        marginBottom: "24px",
                                        border: "1px solid #f0f0f0"
                                    }}>
                                        <table className="table" style={{ margin: 0 }}>
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: "rgba(174, 117, 228, 0.08)",
                                                    borderBottom: "2px solid rgba(174, 117, 228, 0.1)"
                                                }}>
                                                    <th style={{
                                                        padding: "18px 20px",
                                                        color: "rgb(174, 117, 228)",
                                                        fontWeight: "700",
                                                        fontSize: "0.95rem",
                                                        border: "none"
                                                    }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                                                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M2 17L12 22L22 17" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M2 12L12 17L22 12" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Department
                                                    </th>
                                                    <th style={{
                                                        padding: "18px 20px",
                                                        color: "rgb(174, 117, 228)",
                                                        fontWeight: "700",
                                                        fontSize: "0.95rem",
                                                        border: "none"
                                                    }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                                                            <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M13 3H11C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5C15 3.89543 14.1046 3 13 3Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Level-Term
                                                    </th>
                                                    <th style={{
                                                        padding: "18px 20px",
                                                        color: "rgb(174, 117, 228)",
                                                        fontWeight: "700",
                                                        fontSize: "0.95rem",
                                                        border: "none"
                                                    }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M12 8V12" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M12 16H12.01" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Status
                                                    </th>
                                                    <th style={{
                                                        padding: "18px 20px",
                                                        color: "rgb(174, 117, 228)",
                                                        fontWeight: "700",
                                                        fontSize: "0.95rem",
                                                        border: "none"
                                                    }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                                                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 3 15.9391 3 17V19" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Batch
                                                    </th>
                                                    <th style={{
                                                        padding: "18px 20px",
                                                        color: "rgb(174, 117, 228)",
                                                        fontWeight: "700",
                                                        fontSize: "0.95rem",
                                                        border: "none"
                                                    }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                                                            <path d="M12 15V3M12 15L8 11M12 15L16 11M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {levelTerms?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" style={{
                                                            padding: "40px 20px",
                                                            textAlign: "center",
                                                            color: "#777",
                                                            fontSize: "1rem",
                                                            fontWeight: "500"
                                                        }}>
                                                            <div style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                gap: "12px"
                                                            }}>
                                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
                                                                    <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13 3H11C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5C15 3.89543 14.1046 3 13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                No level terms found
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    levelTerms?.map((levelTerm, index) => (
                                                        <tr key={index} style={{
                                                            borderBottom: "1px solid #f0f0f0",
                                                            transition: "all 0.2s ease",
                                                            backgroundColor: "#ffffff",
                                                            cursor: "pointer"
                                                        }}
                                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f3eaff"}
                                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ffffff"}
                                                        >
                                                            <td style={{
                                                                padding: "18px 20px",
                                                                color: "#333",
                                                                fontWeight: "600",
                                                                fontSize: "0.95rem"
                                                            }}>{levelTerm.department}</td>
                                                            <td style={{
                                                                padding: "18px 20px",
                                                                color: "#333",
                                                                fontWeight: "600",
                                                                fontSize: "0.95rem"
                                                            }}>{levelTerm.level_term}</td>
                                                            <td style={{ padding: "18px 20px" }}>
                                                                <div
                                                                    onClick={() => handleToggle(index)}
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "8px",
                                                                        padding: "7px 14px",
                                                                        borderRadius: "6px",
                                                                        fontSize: "0.9rem",
                                                                        fontWeight: "500",
                                                                        cursor: "pointer",
                                                                        backgroundColor: levelTerm.active ? "rgba(25, 135, 84, 0.1)" : "rgba(220, 53, 69, 0.1)",
                                                                        color: levelTerm.active ? "#198754" : "#dc3545",
                                                                        transition: "all 0.3s ease",
                                                                        border: `1px solid ${levelTerm.active ? "rgba(25, 135, 84, 0.3)" : "rgba(220, 53, 69, 0.3)"}`,
                                                                        position: "relative",
                                                                        width: "100px",
                                                                        justifyContent: "center"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (levelTerm.active) {
                                                                            e.target.style.backgroundColor = "#198754";
                                                                            e.target.style.color = "white";
                                                                            e.target.style.borderColor = "#198754";
                                                                        } else {
                                                                            e.target.style.backgroundColor = "#dc3545";
                                                                            e.target.style.color = "white";
                                                                            e.target.style.borderColor = "#dc3545";
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (levelTerm.active) {
                                                                            e.target.style.backgroundColor = "rgba(25, 135, 84, 0.1)";
                                                                            e.target.style.color = "#198754";
                                                                            e.target.style.borderColor = "rgba(25, 135, 84, 0.3)";
                                                                        } else {
                                                                            e.target.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
                                                                            e.target.style.color = "#dc3545";
                                                                            e.target.style.borderColor = "rgba(220, 53, 69, 0.3)";
                                                                        }
                                                                    }}
                                                                >
                                                                    {levelTerm.active ? (
                                                                        <>
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                            Active
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                            Inactive
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: "18px 20px" }}>
                                                                {levelTerm.active ? (
                                                                    <select
                                                                        value={levelTerm.batch}
                                                                        onChange={(e) => handleBatch(e.target.value, index)}
                                                                        style={{
                                                                            height: "44px",
                                                                            borderRadius: "12px",
                                                                            border: "2px solid #e1e5e9",
                                                                            boxShadow: "0 2px 8px rgba(16, 24, 40, 0.06)",
                                                                            padding: "0 16px",
                                                                            width: "100%",
                                                                            background: "#ffffff",
                                                                            color: "#333",
                                                                            fontWeight: "500",
                                                                            fontSize: "0.95rem",
                                                                            outline: "none",
                                                                            transition: "all 0.3s ease",
                                                                            appearance: "auto"
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            e.target.style.borderColor = "rgb(174, 117, 228)";
                                                                            e.target.style.boxShadow = "0 4px 12px rgba(174, 117, 228, 0.15)";
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            e.target.style.borderColor = "#e1e5e9";
                                                                            e.target.style.boxShadow = "0 2px 8px rgba(16, 24, 40, 0.06)";
                                                                        }}
                                                                    >
                                                                        <option value="">Select Batch</option>
                                                                        {allBatches && allBatches.length > 0 ?
                                                                            allBatches.map((batch, i) => (
                                                                                <option key={i} value={batch}>{batch}</option>
                                                                            )) :
                                                                            <option disabled>No batches available</option>
                                                                        }
                                                                    </select>
                                                                ) : (
                                                                    <span style={{ color: "#999", fontSize: "0.9rem" }}>—</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: "18px 20px" }}>
                                                                <button
                                                                    onClick={() => handleDelete(levelTerm.level_term, levelTerm.department)}
                                                                    className="btn"
                                                                    type="button"
                                                                    style={{
                                                                        background: "rgba(220, 53, 69, 0.1)",
                                                                        color: "#dc3545",
                                                                        border: "1px solid rgba(220, 53, 69, 0.3)",
                                                                        borderRadius: "6px",
                                                                        padding: "7px 14px",
                                                                        transition: "all 0.3s ease",
                                                                        fontWeight: "500",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "6px"
                                                                    }}
                                                                    onMouseOver={e => {
                                                                        e.currentTarget.style.background = "#dc3545";
                                                                        e.currentTarget.style.color = "white";
                                                                    }}
                                                                    onMouseOut={e => {
                                                                        e.currentTarget.style.background = "rgba(220, 53, 69, 0.1)";
                                                                        e.currentTarget.style.color = "#dc3545";
                                                                    }}
                                                                >
                                                                    <i className="mdi mdi-delete-outline mr-1"></i>
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        {levelTerms && levelTerms.length > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                color: '#555',
                                                fontWeight: '600',
                                                fontSize: '1rem',
                                                padding: '12px 16px',
                                                background: 'rgba(174, 117, 228, 0.08)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(174, 117, 228, 0.1)'
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 10H3" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M21 6H3" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M21 14H3" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M21 18H3" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span style={{ color: 'rgb(174, 117, 228)' }}>{levelTerms.length}</span> level terms found
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            style={{
                                                borderRadius: "6px",
                                                padding: "7px 14px",
                                                fontWeight: "500",
                                                background: isSubmitting ? "#b8a2d8" : "rgba(154, 77, 226, 0.15)",
                                                border: "1px solid rgba(154, 77, 226, 0.5)",
                                                color: "rgb(154, 77, 226)",
                                                transition: "all 0.3s ease",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                fontSize: "0.9rem",
                                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                                position: "relative",
                                                overflow: "hidden",
                                                minWidth: "auto",
                                                justifyContent: "center"
                                            }}
                                            disabled={isSubmitting}
                                            onMouseEnter={(e) => {
                                                if (!isSubmitting) {
                                                    e.target.style.background = "rgb(154, 77, 226)";
                                                    e.target.style.color = "white";
                                                    e.target.style.borderColor = "rgb(154, 77, 226)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSubmitting) {
                                                    e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                                    e.target.style.color = "rgb(154, 77, 226)";
                                                    e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                                                }
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Initializing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    Initialize System
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <Modal
                                        show={showActivateModal}
                                        onHide={() => setShowActivateModal(false)}
                                        size="md"
                                        centered
                                        contentClassName="border-0 shadow activate-term-modal-content"
                                        backdrop="static"
                                    >
                                        <style>{`
                                            .activate-term-modal-content {
                                                border-radius: 20px !important;
                                                box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(194, 137, 248, 0.1) !important;
                                                animation: fadeInModal 0.3s ease;
                                                overflow: hidden;
                                                border: none;
                                            }
                                            @keyframes fadeInModal {
                                                from { opacity: 0; transform: translateY(20px); }
                                                to { opacity: 1; transform: translateY(0); }
                                            }
                                            .activate-term-modal-header-bg {
                                                position: absolute;
                                                top: 0; left: 0; right: 0; bottom: 0;
                                                background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M11 100H89V0H11V100ZM0 0V100H100V0H0Z" fill="white" fill-opacity="0.05"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="2" fill="white" fill-opacity="0.08"/%3E%3C/svg%3E');
                                                background-size: 80px 80px, 20px 20px;
                                                opacity: 0.15;
                                                z-index: 0;
                                            }
                                            .activate-term-modal-header-content {
                                                position: relative;
                                                z-index: 1;
                                                display: flex;
                                                align-items: center;
                                            }
                                            .activate-term-modal-header-icon {
                                                width: 32px;
                                                height: 32px;
                                                border-radius: 8px;
                                                background-color: rgba(255, 255, 255, 0.15);
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                margin-right: 12px;
                                                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                                            }
                                            .activate-term-modal-title {
                                                margin: 0;
                                                font-weight: 600;
                                                font-size: 18px;
                                                letter-spacing: 0.5px;
                                                color: white;
                                            }
                                            .activate-term-modal-divider {
                                                border-top: 1px solid #e1e5e9;
                                                margin: 0 -2rem 1.5rem -2rem;
                                            }
                                        `}</style>
                                        <Modal.Header style={{
                                            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                            color: "white",
                                            borderBottom: "none",
                                            borderRadius: "20px 20px 0 0",
                                            padding: "24px 30px 24px 30px",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}>
                                            <div className="activate-term-modal-header-bg"></div>
                                            <div className="activate-term-modal-header-content">
                                                <div className="activate-term-modal-header-icon">
                                                    <i className="mdi mdi-check-circle-outline" style={{ fontSize: "20px", color: "white" }}></i>
                                                </div>
                                                <h4 className="activate-term-modal-title">
                                                    Activate Level-Term
                                                </h4>
                                            </div>
                                        </Modal.Header>
                                        <Modal.Body style={{ background: "#f8f9fa", borderRadius: "0 0 20px 20px", padding: "2rem 2rem 0 2rem" }}>
                                            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
                                                <Form>
                                                    {uniqueLevelTerms.map(lt => (
                                                        <Row key={lt} className="mb-3 align-items-center">
                                                            <Col xs={1} className="pl-3 pr-0">
                                                                <div
                                                                    className="custom-checkbox-wrapper"
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        transition: "all 0.3s ease"
                                                                    }}
                                                                    onClick={() => {
                                                                        if (selectedLevelTerms.includes(lt)) {
                                                                            setSelectedLevelTerms(prev => prev.filter(x => x !== lt));
                                                                        } else {
                                                                            setSelectedLevelTerms(prev => [...prev, lt]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: "20px",
                                                                            height: "20px",
                                                                            borderRadius: "5px",
                                                                            border: selectedLevelTerms.includes(lt) ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                                                                            background: selectedLevelTerms.includes(lt)
                                                                                ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)"
                                                                                : "transparent",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            transition: "all 0.3s ease",
                                                                            boxShadow: selectedLevelTerms.includes(lt) ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                                                                        }}
                                                                    >
                                                                        {selectedLevelTerms.includes(lt) && (
                                                                            <i
                                                                                className="mdi mdi-check"
                                                                                style={{
                                                                                    color: "white",
                                                                                    fontSize: "16px",
                                                                                    fontWeight: "bold",
                                                                                    marginTop: "1px"
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col xs={4}>
                                                                <span style={{ fontWeight: "600", color: "#444" }}>{lt}</span>
                                                            </Col>
                                                            <Col xs={7}>
                                                                <Form.Select
                                                                    value={batchInputs[lt] || ""}
                                                                    onChange={e => setBatchInputs(prev => ({ ...prev, [lt]: e.target.value }))}
                                                                    disabled={!selectedLevelTerms.includes(lt)}
                                                                    style={{
                                                                        minWidth: "130px",
                                                                        width: "100%",
                                                                        borderRadius: "12px",
                                                                        border: "1.5px solid rgba(194, 137, 248, 0.3)",
                                                                        boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
                                                                        backgroundColor: selectedLevelTerms.includes(lt) ? "#f8faff" : "#f8f9fa",
                                                                        padding: "8px 12px",
                                                                        fontSize: "15px",
                                                                        transition: "all 0.3s ease"
                                                                    }}
                                                                >
                                                                    <option value="">Select Batch</option>
                                                                    {allBatches && allBatches.length > 0 ?
                                                                        allBatches.map((batch, i) => (
                                                                            <option key={i} value={batch}>{batch}</option>
                                                                        )) :
                                                                        <option disabled>No batches available</option>
                                                                    }
                                                                </Form.Select>
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                </Form>
                                            </div>
                                            <div className="activate-term-modal-divider"></div>
                                        </Modal.Body>
                                        <Modal.Footer style={{ borderTop: "none", padding: "0 2rem 1.5rem 2rem", background: "#f8f9fa" }}>
                                            <Button
                                                style={modalButtonStyle}
                                                className="d-flex align-items-center justify-content-center"
                                                onMouseEnter={e => {
                                                    e.target.style.background = "rgb(154, 77, 226)";
                                                    e.target.style.color = "white";
                                                    e.target.style.borderColor = "rgb(154, 77, 226)";
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                                    e.target.style.color = "rgb(154, 77, 226)";
                                                    e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                                                }}
                                                onClick={() => setShowActivateModal(false)}
                                            >
                                                <Icon path={mdiClose} size={0.9} style={{ marginRight: 6 }} />
                                                Cancel
                                            </Button>
                                            <Button
                                                style={modalButtonStyle}
                                                className="d-flex align-items-center justify-content-center"
                                                onMouseEnter={e => {
                                                    e.target.style.background = "rgb(154, 77, 226)";
                                                    e.target.style.color = "white";
                                                    e.target.style.borderColor = "rgb(154, 77, 226)";
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                                    e.target.style.color = "rgb(154, 77, 226)";
                                                    e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                                                }}
                                                onClick={handleActivateLevelTerms}
                                            >
                                                <Icon path={mdiArrowRightCircleOutline} size={0.9} style={{ marginRight: 6 }} />
                                                Activate
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                    <Modal
                                        show={showAddModal}
                                        onHide={() => setShowAddModal(false)}
                                        size="md"
                                        centered
                                        contentClassName="border-0 shadow add-term-modal-content"
                                        backdrop="static"
                                    >
                                        <style>{`
                                            .add-term-modal-content {
                                                border-radius: 20px !important;
                                                box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(194, 137, 248, 0.1) !important;
                                                animation: fadeInModal 0.3s ease;
                                                overflow: hidden;
                                                border: none;
                                            }
                                            @keyframes fadeInModal {
                                                from { opacity: 0; transform: translateY(20px); }
                                                to { opacity: 1; transform: translateY(0); }
                                            }
                                            .add-term-modal-header-bg {
                                                position: absolute;
                                                top: 0; left: 0; right: 0; bottom: 0;
                                                background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M11 100H89V0H11V100ZM0 0V100H100V0H0Z" fill="white" fill-opacity="0.05"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="2" fill="white" fill-opacity="0.08"/%3E%3C/svg%3E');
                                                background-size: 80px 80px, 20px 20px;
                                                opacity: 0.15;
                                                z-index: 0;
                                            }
                                            .add-term-modal-header-content {
                                                position: relative;
                                                z-index: 1;
                                                display: flex;
                                                align-items: center;
                                            }
                                            .add-term-modal-header-icon {
                                                width: 32px;
                                                height: 32px;
                                                border-radius: 8px;
                                                background-color: rgba(255, 255, 255, 0.15);
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                margin-right: 12px;
                                                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                                            }
                                            .add-term-modal-title {
                                                margin: 0;
                                                font-weight: 600;
                                                font-size: 18px;
                                                letter-spacing: 0.5px;
                                                color: white;
                                            }
                                            .add-term-modal-divider {
                                                border-top: 1px solid #e1e5e9;
                                                margin: 0 -2rem 1.5rem -2rem;
                                            }
                                        `}</style>
                                        <Modal.Header style={{
                                            background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
                                            color: "white",
                                            borderBottom: "none",
                                            borderRadius: "20px 20px 0 0",
                                            padding: "24px 30px 24px 30px",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}>
                                            <div className="add-term-modal-header-bg"></div>
                                            <div className="add-term-modal-header-content">
                                                <div className="add-term-modal-header-icon">
                                                    <i className="mdi mdi-plus-circle-outline" style={{ fontSize: "20px", color: "white" }}></i>
                                                </div>
                                                <h4 className="add-term-modal-title">
                                                    Add New Level-Term
                                                </h4>
                                            </div>
                                        </Modal.Header>
                                        <Modal.Body style={{ background: "#f8f9fa", borderRadius: "0 0 20px 20px", padding: "2rem 2rem 0 2rem" }}>
                                            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
                                                <Form>
                                                    <Row>
                                                        <Col>
                                                            <FormGroup className="mb-3">
                                                                <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Department</Form.Label>
                                                                <Form.Select
                                                                    value={newLevelTerm.department}
                                                                    onChange={(e) => setNewLevelTerm(prev => ({ ...prev, department: e.target.value }))}
                                                                    style={{
                                                                        minWidth: "130px",
                                                                        width: "100%",
                                                                        borderRadius: "12px",
                                                                        border: "1.5px solid rgba(194, 137, 248, 0.3)",
                                                                        boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
                                                                        backgroundColor: "#f8faff",
                                                                        padding: "8px 12px",
                                                                        fontSize: "15px",
                                                                        transition: "all 0.3s ease"
                                                                    }}
                                                                >
                                                                    <option value="">Select Department</option>
                                                                    {departments && departments.length > 0 ?
                                                                        departments.map((dept, i) => (
                                                                            <option key={i} value={dept}>{dept}</option>
                                                                        )) :
                                                                        <option disabled>No departments available</option>
                                                                    }
                                                                </Form.Select>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <FormGroup>
                                                                <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Level-Term</Form.Label>
                                                                <Form.Select
                                                                    value={newLevelTerm.level_term}
                                                                    onChange={(e) => setNewLevelTerm(prev => ({ ...prev, level_term: e.target.value }))}
                                                                    style={{
                                                                        minWidth: "130px",
                                                                        width: "100%",
                                                                        borderRadius: "12px",
                                                                        border: "1.5px solid rgba(194, 137, 248, 0.3)",
                                                                        boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)",
                                                                        backgroundColor: "#f8faff",
                                                                        padding: "8px 12px",
                                                                        fontSize: "15px",
                                                                        transition: "all 0.3s ease"
                                                                    }}
                                                                >
                                                                    <option value="">Select Level-Term</option>
                                                                    {allLevelTermNames && allLevelTermNames.length > 0 ?
                                                                        allLevelTermNames.map((lt, i) => (
                                                                            <option key={i} value={lt}>{lt}</option>
                                                                        )) :
                                                                        <option disabled>No level terms available</option>
                                                                    }
                                                                </Form.Select>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            </div>
                                            <div className="add-term-modal-divider"></div>
                                        </Modal.Body>
                                        <Modal.Footer style={{ borderTop: "none", padding: "0 2rem 1.5rem 2rem", background: "#f8f9fa" }}>
                                            <Button
                                                style={modalButtonStyle}
                                                className="d-flex align-items-center justify-content-center"
                                                onMouseEnter={e => {
                                                    e.target.style.background = "rgb(154, 77, 226)";
                                                    e.target.style.color = "white";
                                                    e.target.style.borderColor = "rgb(154, 77, 226)";
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                                    e.target.style.color = "rgb(154, 77, 226)";
                                                    e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                                                }}
                                                onClick={() => setShowAddModal(false)}
                                            >
                                                <Icon path={mdiClose} size={0.9} style={{ marginRight: 6 }} />
                                                Cancel
                                            </Button>
                                            <Button
                                                style={modalButtonStyle}
                                                className="d-flex align-items-center justify-content-center"
                                                onMouseEnter={e => {
                                                    e.target.style.background = "rgb(154, 77, 226)";
                                                    e.target.style.color = "white";
                                                    e.target.style.borderColor = "rgb(154, 77, 226)";
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.background = "rgba(154, 77, 226, 0.15)";
                                                    e.target.style.color = "rgb(154, 77, 226)";
                                                    e.target.style.borderColor = "rgba(154, 77, 226, 0.5)";
                                                }}
                                                onClick={handleAddLevelTerm}
                                            >
                                                <Icon path={mdiContentSave} size={0.9} style={{ marginRight: 6 }} />
                                                Save Level Term
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}