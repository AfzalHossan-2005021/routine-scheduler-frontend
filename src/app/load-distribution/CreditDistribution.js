import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CreditDistribution() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (totalCredits) => {
    const creditMin = 9;
    const creditMax = 15;
    
    if (totalCredits < creditMin) {
      return (
        <span className="badge" style={{ 
          backgroundColor: 'rgba(255, 193, 7, 0.1)', 
          color: '#ffc107',
          padding: '8px 12px',
          fontWeight: '500',
          borderRadius: '6px',
          border: '1px solid rgba(255, 193, 7, 0.3)'
        }}>
          <i className="mdi mdi-alert-circle-outline me-1"></i>
          Underload
        </span>
      );
    } else if (totalCredits > creditMax) {
      return (
        <span className="badge" style={{ 
          backgroundColor: 'rgba(220, 53, 69, 0.1)', 
          color: '#dc3545',
          padding: '8px 12px',
          fontWeight: '500',
          borderRadius: '6px',
          border: '1px solid rgba(220, 53, 69, 0.3)'
        }}>
          <i className="mdi mdi-alert-circle me-1"></i>
          Overload
        </span>
      );
    } else {
      return (
        <span className="badge" style={{ 
          backgroundColor: 'rgba(25, 135, 84, 0.1)', 
          color: '#198754',
          padding: '8px 12px',
          fontWeight: '500',
          borderRadius: '6px',
          border: '1px solid rgba(25, 135, 84, 0.3)'
        }}>
          <i className="mdi mdi-check-circle me-1"></i>
          Balanced
        </span>
      );
    }
  };

  const tableStyle = {
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
  };

  const tableHeaderStyle = {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
    color: "white",
    padding: "12px 16px",
    fontWeight: "600",
    borderBottom: "none"
  };

  return (
    <div>
      <div className="alert mb-4" role="alert" style={{
        backgroundColor: "rgba(13, 202, 240, 0.08)",
        border: "1px solid rgba(13, 202, 240, 0.2)",
        borderRadius: "12px",
        padding: "22px",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        boxShadow: "0 8px 20px rgba(13, 202, 240, 0.08)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          minWidth: "45px",
          height: "45px",
          borderRadius: "12px",
          background: "linear-gradient(45deg, #0dcaf0, #79E2F2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(13, 202, 240, 0.3)"
        }}>
          <i className="mdi mdi-information-outline" style={{ color: "white", fontSize: "24px" }}></i>
        </div>
        <div>
          <h5 style={{ margin: "0 0 5px 0", color: "#055160", fontWeight: "600" }}>Credit Summary</h5>
          <span style={{ color: "#055160", fontWeight: "400" }}>This tab shows the total credit hours assigned to each teacher across all courses.</span>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table" style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Teacher</th>
              <th style={tableHeaderStyle}>Designation</th>
              <th style={tableHeaderStyle}>Theory Credits</th>
              <th style={tableHeaderStyle}>Sessional Credits</th>
              <th style={tableHeaderStyle}>Total Credits</th>
              <th style={tableHeaderStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : teachers && teachers.length > 0 ? (
              teachers.map((teacher, index) => (
                <tr key={index}>
                  <td>{teacher.name}</td>
                  <td>{teacher.designation}</td>
                  <td>{teacher.theoryCredits.toFixed(1)}</td>
                  <td>{teacher.sessionalCredits.toFixed(1)}</td>
                  <td>{teacher.totalCredits.toFixed(1)}</td>
                  <td>{getStatusBadge(teacher.totalCredits)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
                  <div style={{ padding: "20px", backgroundColor: "rgba(194, 137, 248, 0.05)", borderRadius: "12px", color: "#888", border: "1px dashed rgba(194, 137, 248, 0.3)" }}>
                    <i className="mdi mdi-information-outline me-2" style={{ color: "rgb(174, 117, 228)" }}></i>
                    No credit distribution data available
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
