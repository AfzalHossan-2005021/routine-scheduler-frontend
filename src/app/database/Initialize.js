import { useEffect, useState } from "react"
import { toast } from "react-hot-toast";
import {
    getLevelTerms,
    setLevelTermsDB
} from "../api/db-crud"

export default function Initialize(){
    const [levelTerms, setLevelTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        setIsLoading(true);
        getLevelTerms()
            .then((res) => {
                setLevelTerms(res.data);
            })
            .catch((error) => {
                console.error("Error fetching level terms:", error);
                // Display a user-friendly error message
                toast.error("Failed to load level terms. Please try again later.");
                // Initialize with empty array to prevent rendering errors
                setLevelTerms([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [])

    const handleToggle = (index) => {
        setLevelTerms(prev => {
            return prev.map((lt, i) => {
                if(i === index){
                    if(lt.active){
                        return {
                            ...lt,
                            active: !lt.active,
                            batch: 0,
                            section_count: "0" 
                        }
                    }else{
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
                if(i === index){
                    return {
                        ...lt,
                        batch: batch
                    }
                }
                return lt;
            })
        })
    }

    const handleSection = (sections, index) => {
        setLevelTerms(prev => {
            return prev.map((lt, i) => {
                if(i === index){
                    return {
                        ...lt,
                        section_count: sections
                    }
                }
                return lt;
            })
        })
    }

    const handleSubmit = () => {
        // Validate data before submission
        const invalidEntries = levelTerms.filter(lt => lt.active && (!lt.batch || !lt.section_count || lt.batch === 0 || lt.section_count === "0"));
        
        if (invalidEntries.length > 0) {
            toast.error("Please fill batch and section count for all active level terms");
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
    }

    return (
        <div>
            <div className="page-header">
                <h3 className="page-title"> Active Level Terms </h3>
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                    <a href="!#" onClick={(event) => event.preventDefault()}>
                        Database
                    </a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                    Initialize
                    </li>
                </ol>
                </nav>
            </div>
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
                                        <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M13 3H11C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5C15 3.89543 14.1046 3 13 3Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 12H15" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 16H15" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                                Level Term Initialization
                            </h4>
                            
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
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                        marginBottom: "20px"
                                    }}>
                                        <table className="table" style={{ margin: 0 }}>
                                            <thead>
                                                <tr style={{ 
                                                    backgroundColor: "#f9f4ff",
                                                    borderBottom: "2px solid #f0e6ff"
                                                }}>
                                                    <th style={{ 
                                                        padding: "15px 20px",
                                                        color: "#6b38af",
                                                        fontWeight: "600",
                                                        fontSize: "0.9rem"
                                                    }}>Department</th>
                                                    <th style={{ 
                                                        padding: "15px 20px",
                                                        color: "#6b38af",
                                                        fontWeight: "600",
                                                        fontSize: "0.9rem"
                                                    }}>Level-Term</th>
                                                    <th style={{ 
                                                        padding: "15px 20px",
                                                        color: "#6b38af",
                                                        fontWeight: "600",
                                                        fontSize: "0.9rem"
                                                    }}>Status</th>
                                                    <th style={{ 
                                                        padding: "15px 20px",
                                                        color: "#6b38af",
                                                        fontWeight: "600",
                                                        fontSize: "0.9rem"
                                                    }}>Batch</th>
                                                    <th style={{ 
                                                        padding: "15px 20px",
                                                        color: "#6b38af",
                                                        fontWeight: "600",
                                                        fontSize: "0.9rem"
                                                    }}>Sections</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {levelTerms?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" style={{
                                                            padding: "30px 20px",
                                                            textAlign: "center",
                                                            color: "#777"
                                                        }}>
                                                            No level terms found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    levelTerms?.map((levelTerm, index) => (
                                                        <tr key={index} style={{
                                                            borderBottom: "1px solid #f0e6ff",
                                                            transition: "all 0.2s ease"
                                                        }}>
                                                            <td style={{ 
                                                                padding: "15px 20px",
                                                                color: "#444",
                                                                fontWeight: "500"
                                                            }}>{levelTerm.department}</td>
                                                            <td style={{ 
                                                                padding: "15px 20px",
                                                                color: "#444",
                                                                fontWeight: "500"
                                                            }}>{levelTerm.level_term}</td>
                                                            <td style={{ padding: "15px 20px" }}>
                                                                <div 
                                                                    onClick={() => handleToggle(index)}
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "6px",
                                                                        padding: "6px 12px",
                                                                        borderRadius: "8px",
                                                                        fontSize: "0.9rem",
                                                                        fontWeight: "500",
                                                                        cursor: "pointer",
                                                                        backgroundColor: levelTerm.active ? "rgba(25, 135, 84, 0.1)" : "rgba(220, 53, 69, 0.1)",
                                                                        color: levelTerm.active ? "#198754" : "#dc3545",
                                                                        transition: "all 0.2s ease",
                                                                        border: `1px solid ${levelTerm.active ? "rgba(25, 135, 84, 0.2)" : "rgba(220, 53, 69, 0.2)"}`,
                                                                    }}
                                                                >
                                                                    {levelTerm.active ? (
                                                                        <>
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            </svg>
                                                                            Active
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            </svg>
                                                                            Inactive
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: "15px 20px" }}>
                                                                {levelTerm.active ? (
                                                                    <input 
                                                                        placeholder="Enter batch number"
                                                                        value={levelTerm.batch}
                                                                        onChange={(e) => handleBatch(e.target.value, index)}
                                                                        style={{
                                                                            height: "40px",
                                                                            borderRadius: "8px",
                                                                            border: "1px solid #d0d5dd",
                                                                            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                                                                            padding: "0 14px",
                                                                            width: "100%",
                                                                            background: "linear-gradient(to bottom, #ffffff, #fdfaff)",
                                                                            color: "#333",
                                                                            fontWeight: "500",
                                                                            outline: "none"
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ color: "#777" }}>—</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: "15px 20px" }}>
                                                                {levelTerm.active ? (
                                                                    <input 
                                                                        placeholder="Enter section count"
                                                                        value={levelTerm.section_count}
                                                                        onChange={(e) => handleSection(e.target.value, index)}
                                                                        style={{
                                                                            height: "40px",
                                                                            borderRadius: "8px",
                                                                            border: "1px solid #d0d5dd",
                                                                            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
                                                                            padding: "0 14px",
                                                                            width: "100%",
                                                                            background: "linear-gradient(to bottom, #ffffff, #fdfaff)",
                                                                            color: "#333",
                                                                            fontWeight: "500",
                                                                            outline: "none"
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ color: "#777" }}>—</span>
                                                                )}
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
                                                gap: '10px',
                                                color: '#4b4b4b',
                                                fontWeight: '500',
                                            }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 10H3" stroke="rgb(154, 77, 226)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M21 6H3" stroke="rgb(154, 77, 226)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M21 14H3" stroke="rgb(154, 77, 226)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M21 18H3" stroke="rgb(154, 77, 226)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                {levelTerms.length} level terms found
                                            </div>
                                        )}
                                        
                                        <button 
                                            type="button"
                                            onClick={handleSubmit}
                                            style={{
                                                borderRadius: "10px",
                                                padding: "10px 24px",
                                                fontWeight: "600",
                                                background: isSubmitting ? "#b8a2d8" : "linear-gradient(135deg, #c289f8, #ae75e4)",
                                                border: "none",
                                                boxShadow: isSubmitting ? "none" : "0 4px 8px rgba(174, 117, 228, 0.25)",
                                                color: "white",
                                                transition: "all 0.3s ease",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px"
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Initializing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    Initialize System
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}