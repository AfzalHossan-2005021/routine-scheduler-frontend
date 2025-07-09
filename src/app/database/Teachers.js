import { useEffect } from "react";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form, Row, Col, FormControl, FormGroup } from "react-bootstrap";
import { toast } from "react-hot-toast";
import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher,
} from "../api/db-crud";

import { mdiContentSave, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';

const initial_regex = /^[A-Z]{2,6}$/;
const email_regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

const validate = (teacher) => {
  if (teacher.initial === "") {
    return "Initial cannot be empty";
  }
  if (teacher.name === "") {
    return "Name cannot be empty";
  }
  if (teacher.surname === "") {
    return "Surname cannot be empty";
  }
  if (teacher.email === "") {
    return "Email cannot be empty";
  }
  if (teacher.seniority_rank === "") {
    return "Seniority Rank cannot be empty";
  }
  if (teacher.theory_courses === "") {
    return "Theory Courses cannot be empty";
  }
  if (teacher.sessional_courses === "") {
    return "Sessional Courses cannot be empty";
  }
  if (!email_regex.test(teacher.email)) {
    return "Invalid email";
  }
  if (!initial_regex.test(teacher.initial)) {
    return "Invalid initial";
  }
  return null;
};

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

const DESIGNATION_SUGGESTIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Adjunct Lecturer"
];

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    getTeachers().then((res) => {
      // Sort teachers by seniority rank (lower rank means more senior)
      const sortedTeachers = [...res].sort((a, b) => a.seniority_rank - b.seniority_rank);
      setTeachers(sortedTeachers);
    });
  }, []);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleteTeacherSelected, setDeleteTeacherSelected] = useState(null);
  const [showMapCredit, setShowMapCredit] = useState(false);
  const [mapDesignation, setMapDesignation] = useState("");
  const [mapCredit, setMapCredit] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState(DESIGNATION_SUGGESTIONS);

  // Handler for Map Credit Apply
  const handleMapCreditApply = () => {
    if (!mapDesignation.trim() || !mapCredit || isNaN(mapCredit)) {
      toast.error("Please enter a valid designation and credit hour");
      return;
    }
    
    // Find all teachers with the matching designation
    const teachersToUpdate = teachers.filter(
      t => t.designation?.toLowerCase() === mapDesignation.trim().toLowerCase()
    );
    
    if (teachersToUpdate.length === 0) {
      toast.error(`No teachers found with designation '${mapDesignation}'`);
      return;
    }
    
    // Update local state first
    setTeachers(prev => prev.map(t =>
      t.designation?.toLowerCase() === mapDesignation.trim().toLowerCase()
        ? { ...t, teacher_credits_offered: Number(mapCredit) }
        : t
    ));
    
    // Save each teacher to the database
    const updatePromises = teachersToUpdate.map(teacher => 
      updateTeacher(teacher.initial, {
        ...teacher,
        teacher_credits_offered: Number(mapCredit)
      })
    );
    
    // Wait for all updates to complete
    Promise.all(updatePromises)
      .then(() => {
        setShowMapCredit(false);
        setMapDesignation("");
        setMapCredit("");
        toast.success(`Updated credit hours for all '${mapDesignation}' teachers`);
      })
      .catch(error => {
        console.error("Error updating teachers:", error);
        toast.error("Failed to update some teachers. Please try again.");
      });
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
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
                  </div>
                    Teacher Information
                  </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ marginBottom: "0", background: "transparent" }}>
            <li className="breadcrumb-item" style={{ color: "rgba(255,255,255,0.8)" }}>
              <a href="!#" onClick={(event) => event.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                Database
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
              Teachers
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
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="rgb(194, 137, 248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  Teacher Management
                </h4>
                <div style={{ display: 'flex', gap: '12px' }}>
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
                    onClick={() => setShowMapCredit(true)}
                  >
                    <i className="mdi mdi-cash-multiple" style={{ fontSize: "18px", marginRight: "8px" }}></i>
                    Map Credit
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
                    onClick={(e) => {
                      setSelectedTeacher({
                        initial: "",
                        name: "",
                        surname: "",
                        email: "",
                        seniority_rank: 0,
                        active: 1,
                        theory_courses: 0,
                        sessional_courses: 0,
                        designation: "",
                        full_time_status: false,
                        offers_thesis_1: false,
                        offers_thesis_2: false,
                        offers_msc: false,
                        teacher_credits_offered: 0,
                        prev_initial: "",
                      });
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
                  >
                    <i className="mdi mdi-plus-circle" style={{ fontSize: "18px", marginRight: "8px" }}></i>
                    Add New Teacher
                  </button>
                </div>
              </div>
              <div className="table-responsive">
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
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 6 15.9391 6 17V19" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Initial
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Name
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 3 15.9391 3 17V19" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Surname
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 6L12 13L2 6" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Email
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Seniority Rank
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 12L11 14L15 10" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Active
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M2 3H6A2 2 0 0 1 8 5V19A2 2 0 0 1 6 21H2V3Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 3H20A2 2 0 0 1 22 5V19A2 2 0 0 1 20 21H16V3Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 7H15" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 11H15" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 15H15" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Theory Courses
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M14.7 6.3A1 1 0 0 0 14 7H9V21H7V7H2A1 1 0 0 0 1.3 6.3L6.3 1.3A1 1 0 0 1 7.7 1.3L12.7 6.3A1 1 0 0 0 14.7 6.3Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 19H2" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 15H2" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Sessional Courses
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Designation
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Full Time Status
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H8" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Offer Thesis 1
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H8" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Offer Thesis 2
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M22 10V6A2 2 0 0 0 20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V14" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 15L12 10L17 15" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 10V18" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Offer MSC
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <circle cx="12" cy="12" r="10" stroke="rgb(174, 117, 228)" strokeWidth="2" fill="none"/>
                          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="rgb(174, 117, 228)" fontWeight="bold">CR</text>
                        </svg>
                        Teacher Credits Offered
                      </th>
                      <th style={{
                        padding: "18px 20px",
                        color: "rgb(174, 117, 228)",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        border: "none"
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                          <path d="M12 20H21" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10217 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10217 19.5 6.5L12 14L6 15L7 9L14.5 1.5C14.8978 1.10217 15.4374 0.87868 16 0.87868C16.5626 0.87868 17.1022 1.10217 17.5 1.5L16.5 3.5Z" stroke="rgb(174, 117, 228)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, idx) => (
                      <tr key={teacher.initial} style={{
                        borderBottom: "1px solid #f0f0f0",
                        transition: "all 0.2s ease",
                        backgroundColor: "#ffffff",
                        cursor: "pointer"
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f3eaff"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ffffff"}
                      >
                        <td style={{ minWidth: "120px" }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ minWidth: "110px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.initial}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].initial = e.target.value;
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  initial: e.target.value
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "140px" }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ minWidth: "130px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.name}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].name = e.target.value;
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  name: e.target.value
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "140px" }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ minWidth: "130px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.surname}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].surname = e.target.value;
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  surname: e.target.value
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "200px" }}>
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            style={{ minWidth: "190px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.email}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].email = e.target.value;
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  email: e.target.value
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "80px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ minWidth: "70px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.seniority_rank}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].seniority_rank = Number(e.target.value);
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  seniority_rank: Number(e.target.value)
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "60px", textAlign: "center" }}>
                          <div 
                            className="custom-checkbox-wrapper d-flex align-items-center justify-content-center"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              const newChecked = !(teacher.active === 1 || teacher.active === true);
                              const newTeachers = [...teachers];
                              newTeachers[idx].active = newChecked ? 1 : 0;
                              setTeachers(newTeachers);
                              updateTeacher(teacher.prev_initial || teacher.initial, {
                                ...teacher,
                                active: newChecked ? 1 : 0
                              })
                                .then(() => toast.success("Teacher updated successfully"))
                                .catch(console.log);
                            }}
                          >
                            {/* Custom Checkbox */}
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                border: (teacher.active === 1 || teacher.active === true) ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                                background: (teacher.active === 1 || teacher.active === true)
                                  ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" 
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: (teacher.active === 1 || teacher.active === true) ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                              }}
                            >
                              {(teacher.active === 1 || teacher.active === true) && (
                                <i 
                                  className="mdi mdi-check"
                                  style={{ 
                                    color: "white", 
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    marginTop: "1px" 
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: "80px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ minWidth: "70px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.theory_courses}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].theory_courses = Number(e.target.value);
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  theory_courses: Number(e.target.value)
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "80px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ minWidth: "70px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.sessional_courses}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].sessional_courses = Number(e.target.value);
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  sessional_courses: Number(e.target.value)
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "120px" }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ minWidth: "110px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.designation}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].designation = e.target.value;
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  designation: e.target.value
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "90px", textAlign: "center" }}>
                          <div 
                            className="custom-checkbox-wrapper d-flex align-items-center justify-content-center"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              const newChecked = !teacher.full_time_status;
                              const newTeachers = [...teachers];
                              newTeachers[idx].full_time_status = newChecked;
                              setTeachers(newTeachers);
                              updateTeacher(teacher.prev_initial || teacher.initial, {
                                ...teacher,
                                full_time_status: newChecked
                              })
                                .then(() => toast.success("Teacher updated successfully"))
                                .catch(console.log);
                            }}
                          >
                            {/* Custom Checkbox */}
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                border: teacher.full_time_status ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                                background: teacher.full_time_status
                                  ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" 
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: teacher.full_time_status ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                              }}
                            >
                              {teacher.full_time_status && (
                                <i 
                                  className="mdi mdi-check"
                                  style={{ 
                                    color: "white", 
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    marginTop: "1px" 
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: "90px", textAlign: "center" }}>
                          <div 
                            className="custom-checkbox-wrapper d-flex align-items-center justify-content-center"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              const newChecked = !teacher.offers_thesis_1;
                              const newTeachers = [...teachers];
                              newTeachers[idx].offers_thesis_1 = newChecked;
                              setTeachers(newTeachers);
                              updateTeacher(teacher.prev_initial || teacher.initial, {
                                ...teacher,
                                offers_thesis_1: newChecked
                              })
                                .then(() => toast.success("Teacher updated successfully"))
                                .catch(console.log);
                            }}
                          >
                            {/* Custom Checkbox */}
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                border: teacher.offers_thesis_1 ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                                background: teacher.offers_thesis_1
                                  ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" 
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: teacher.offers_thesis_1 ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                              }}
                            >
                              {teacher.offers_thesis_1 && (
                                <i 
                                  className="mdi mdi-check"
                                  style={{ 
                                    color: "white", 
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    marginTop: "1px" 
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: "90px", textAlign: "center" }}>
                          <div 
                            className="custom-checkbox-wrapper d-flex align-items-center justify-content-center"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              const newChecked = !teacher.offers_thesis_2;
                              const newTeachers = [...teachers];
                              newTeachers[idx].offers_thesis_2 = newChecked;
                              setTeachers(newTeachers);
                              updateTeacher(teacher.prev_initial || teacher.initial, {
                                ...teacher,
                                offers_thesis_2: newChecked
                              })
                                .then(() => toast.success("Teacher updated successfully"))
                                .catch(console.log);
                            }}
                          >
                            {/* Custom Checkbox */}
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                border: teacher.offers_thesis_2 ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                                background: teacher.offers_thesis_2
                                  ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" 
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: teacher.offers_thesis_2 ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                              }}
                            >
                              {teacher.offers_thesis_2 && (
                                <i 
                                  className="mdi mdi-check"
                                  style={{ 
                                    color: "white", 
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    marginTop: "1px" 
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: "90px", textAlign: "center" }}>
                          <div 
                            className="custom-checkbox-wrapper d-flex align-items-center justify-content-center"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              const newChecked = !teacher.offers_msc;
                              const newTeachers = [...teachers];
                              newTeachers[idx].offers_msc = newChecked;
                              setTeachers(newTeachers);
                              updateTeacher(teacher.prev_initial || teacher.initial, {
                                ...teacher,
                                offers_msc: newChecked
                              })
                                .then(() => toast.success("Teacher updated successfully"))
                                .catch(console.log);
                            }}
                          >
                            {/* Custom Checkbox */}
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                border: teacher.offers_msc ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                                background: teacher.offers_msc
                                  ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" 
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: teacher.offers_msc ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                              }}
                            >
                              {teacher.offers_msc && (
                                <i 
                                  className="mdi mdi-check"
                                  style={{ 
                                    color: "white", 
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    marginTop: "1px" 
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: "100px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ minWidth: "90px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                            value={teacher.teacher_credits_offered}
                            onChange={e => {
                              const newTeachers = [...teachers];
                              newTeachers[idx].teacher_credits_offered = Number(e.target.value);
                              setTeachers(newTeachers);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateTeacher(teacher.prev_initial || teacher.initial, {
                                  ...teacher,
                                  teacher_credits_offered: Number(e.target.value)
                                })
                                  .then(() => toast.success("Teacher updated successfully"))
                                  .catch(console.log);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "120px" }}>
                          <div className="d-flex">
                            <button
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
                              className="btn"
                              onClick={() => setDeleteTeacherSelected(teacher.initial)}
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTeacher !== null && (
        <Modal
          show={true}
          onHide={() => setSelectedTeacher(null)}
          size="md"
          centered
          contentClassName="border-0 shadow add-teacher-modal-content"
          backdrop="static"
        >
          <style>{`
            .add-teacher-modal-content {
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
            .add-teacher-modal-header-bg {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M11 100H89V0H11V100ZM0 0V100H100V0H0Z" fill="white" fill-opacity="0.05"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="2" fill="white" fill-opacity="0.08"/%3E%3C/svg%3E');
              background-size: 80px 80px, 20px 20px;
              opacity: 0.15;
              z-index: 0;
            }
            .add-teacher-modal-header-content {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
            }
            .add-teacher-modal-header-icon {
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
            .add-teacher-modal-title {
              margin: 0;
              font-weight: 600;
              font-size: 18px;
              letter-spacing: 0.5px;
              color: white;
            }
            .add-teacher-modal-divider {
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
            <div className="add-teacher-modal-header-bg"></div>
            <div className="add-teacher-modal-header-content">
              <div className="add-teacher-modal-header-icon">
                <i className="mdi mdi-account-plus-outline" style={{ fontSize: "20px", color: "white" }}></i>
              </div>
              <h4 className="add-teacher-modal-title">
                {selectedTeacher.prev_initial === "" ? "Add" : "Edit"} Teacher
              </h4>
            </div>
          </Modal.Header>
          <Modal.Body style={{ background: "#f8f9fa", borderRadius: "0 0 20px 20px", padding: "2rem 2rem 0 2rem" }}>
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(174, 117, 228, 0.08)", padding: "2rem 1.5rem", marginBottom: "1.5rem" }}>
              <Form>
              <Row>
                <Col md={4} className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Initial</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Initial"
                      value={selectedTeacher.initial}
                        style={{ minWidth: "110px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, initial: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Name</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Name"
                      value={selectedTeacher.name}
                        style={{ minWidth: "130px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, name: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={4} className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Surname</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Surname"
                      value={selectedTeacher.surname}
                        style={{ minWidth: "130px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, surname: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Email</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Email"
                      value={selectedTeacher.email}
                        style={{ minWidth: "190px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, email: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Seniority Rank</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Seniority Rank"
                      value={selectedTeacher.seniority_rank}
                        style={{ minWidth: "110px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, seniority_rank: Number.parseInt(e.target.value || "0") })}
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1 d-flex align-items-center">
                  {/* Currently Active Checkbox */}
                    <div className="form-check d-flex align-items-center">
                    <div
                      className="custom-checkbox-wrapper d-flex align-items-center"
                        style={{ cursor: "pointer", transition: "all 0.3s ease", marginRight: "8px" }}
                        onClick={() => setSelectedTeacher({ ...selectedTeacher, active: !selectedTeacher.active ? 1 : 0 })}
                    >
                      {/* Custom Checkbox */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                            borderRadius: "5px",
                            border: selectedTeacher.active ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                            background: selectedTeacher.active ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                            boxShadow: selectedTeacher.active ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none"
                          }}
                        >
                          {selectedTeacher.active && (
                            <i className="mdi mdi-check" style={{ color: "white", fontSize: "16px", fontWeight: "bold", marginTop: "1px" }} />
                        )}
                      </div>
                    </div>
                      <label className="form-check-label mb-0" style={{ cursor: "pointer", fontWeight: "500", color: "#333", marginLeft: 0 }}>
                        Active
                      </label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Theory Courses</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Number Theory Courses to take"
                      value={selectedTeacher.theory_courses}
                        style={{ minWidth: "110px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, theory_courses: Number.parseInt(e.target.value || "0") })}
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Sessional Courses</Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter Number Sessional Courses to take"
                      value={selectedTeacher.sessional_courses}
                        style={{ minWidth: "130px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, sessional_courses: Number.parseInt(e.target.value || "0") })}
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1">
                  <FormGroup>
                      <Form.Label style={{ fontWeight: 600, color: "#7c4fd5" }}>Full Time Status</Form.Label>
                      <div className="d-flex align-items-center mt-2">
                        {/* Custom Checkbox */}
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "5px",
                            border: selectedTeacher.full_time_status ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                            background: selectedTeacher.full_time_status
                              ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            boxShadow: selectedTeacher.full_time_status ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                          }}
                        >
                          {selectedTeacher.full_time_status && (
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
                        <label className="form-check-label mb-0" style={{ cursor: "pointer", fontWeight: "500", color: "#333", marginLeft: 10 }}>
                          Full Time Status : {selectedTeacher.full_time_status ? "FULL" : "PART"}
                        </label>
                      </div>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col className="px-2 py-1 d-flex align-items-center">
                    {/* Currently Active Checkbox */}
                    <div className="form-check d-flex align-items-center">
                    <div
                      className="custom-checkbox-wrapper d-flex align-items-center"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        marginRight: "8px",
                      }}
                      onClick={(e) => {
                        setSelectedTeacher({
                          ...selectedTeacher,
                          offers_thesis_1: !selectedTeacher.offers_thesis_1,
                        });
                      }}
                    >
                      {/* Custom Checkbox */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "5px",
                          border: selectedTeacher.offers_thesis_1 ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                          background: selectedTeacher.offers_thesis_1
                            ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          boxShadow: selectedTeacher.offers_thesis_1 ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                        }}
                      >
                        {selectedTeacher.offers_thesis_1 && (
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
                      <label className="form-check-label mb-0" style={{ cursor: "pointer", fontWeight: "500", color: "#333", marginLeft: 0 }}>
                        Offer Thesis 1 : {selectedTeacher.offers_thesis_1 ? "YES" : "NO"}
                      </label>
                  </div>
                </Col>
                <Col className="px-2 py-1 d-flex align-items-center">
                    {/* Currently Active Checkbox */}
                    <div className="form-check d-flex align-items-center">
                    <div
                      className="custom-checkbox-wrapper d-flex align-items-center"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                          marginRight: "8px",
                      }}
                        onClick={(e) => {
                        setSelectedTeacher({
                          ...selectedTeacher,
                            offers_thesis_2: !selectedTeacher.offers_thesis_2,
                        });
                      }}
                    >
                      {/* Custom Checkbox */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                            borderRadius: "5px",
                          border: selectedTeacher.offers_thesis_2 ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                          background: selectedTeacher.offers_thesis_2
                            ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          boxShadow: selectedTeacher.offers_thesis_2 ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                        }}
                      >
                        {selectedTeacher.offers_thesis_2 && (
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
                      <label className="form-check-label mb-0" style={{ cursor: "pointer", fontWeight: "500", color: "#333", marginLeft: 0 }}>
                        Offer Thesis 2: {selectedTeacher.offers_thesis_2 ? "YES" : "NO"}
                      </label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="px-2 py-1">
                  <FormGroup>
                    <Form.Label style={{ fontWeight: 600, color: "#7c4fd5", display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Teacher Credits Offered
                    </Form.Label>
                    <FormControl
                      type="text"
                      placeholder="Enter credits"
                      value={selectedTeacher.teacher_credits_offered}
                      onChange={(e) =>
                        setSelectedTeacher({
                          ...selectedTeacher,
                          teacher_credits_offered: Number(e.target.value) || 0,
                        })
                      }
                      style={{ minWidth: "110px", width: "100%", borderRadius: "12px", border: "1.5px solid rgba(194, 137, 248, 0.3)", boxShadow: "0 2px 5px rgba(194, 137, 248, 0.05)", backgroundColor: "#f8faff", padding: "8px 12px", fontSize: "15px", transition: "all 0.3s ease" }}
                    />
                  </FormGroup>
                </Col>
                <Col className="px-2 py-1 d-flex align-items-center">
                    {/* Currently Active Checkbox */}
                    <div className="form-check d-flex align-items-center">
                    <div
                      className="custom-checkbox-wrapper d-flex align-items-center"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                          marginRight: "8px",
                      }}
                        onClick={(e) => {
                        setSelectedTeacher({
                          ...selectedTeacher,
                            offers_msc: !selectedTeacher.offers_msc,
                        });
                      }}
                    >
                      {/* Custom Checkbox */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                            borderRadius: "5px",
                          border: selectedTeacher.offers_msc ? "2px solid rgb(174, 117, 228)" : "2px solid rgba(194, 137, 248, 0.4)",
                          background: selectedTeacher.offers_msc
                            ? "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          boxShadow: selectedTeacher.offers_msc ? "0 2px 8px rgba(174, 117, 228, 0.3)" : "none",
                        }}
                      >
                        {selectedTeacher.offers_msc && (
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
                      <label className="form-check-label mb-0" style={{ cursor: "pointer", fontWeight: "500", color: "#333", marginLeft: 0 }}>
                        Offer MSC : {selectedTeacher.offers_msc ? "YES" : "NO"}
                      </label>
                  </div>
                </Col>
              </Row>
            </Form>
            </div>
            <div className="add-teacher-modal-divider"></div>
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
              onClick={() => setSelectedTeacher(null)}
            >
              <Icon path={mdiClose} size={0.9} style={{ marginRight: 6 }} />
              Close
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
              onClick={(e) => {
                e.preventDefault();
                const result = validate(selectedTeacher);
                if (result === null) {
                  if (selectedTeacher.prev_initial === "") {
                    createTeacher(selectedTeacher)
                      .then((res) => {
                        // Fetch updated teacher list from backend
                        getTeachers().then((updated) => {
                          setTeachers(updated.sort((a, b) => a.seniority_rank - b.seniority_rank));
                          toast.success("Teacher added successfully");
                        });
                      })
                      .catch(console.log);
                  } else {
                    updateTeacher(selectedTeacher.prev_initial, selectedTeacher)
                      .then((res) => {
                        const index = teachers.findIndex(
                          (t) => t.initial === selectedTeacher.prev_initial
                        );
                        const newTeachers = [...teachers];
                        newTeachers[index] = selectedTeacher;
                        setTeachers(newTeachers.sort((a, b) => a.seniority_rank - b.seniority_rank));
                        toast.success("Teacher updated successfully");
                      })
                      .catch(console.log);
                  }
                  setSelectedTeacher(null);
                } else toast.error(result);
              }}
            >
              <Icon path={mdiContentSave} size={0.9} style={{ marginRight: 6 }} />
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}

        <Modal
        show={deleteTeacherSelected !== null}
          onHide={() => setDeleteTeacherSelected(null)}
        size="md"
          centered
          contentClassName="border-0 shadow"
          backdrop="static"
        >
        <Modal.Header 
          closeButton
          style={{
            background: "linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.1) 100%)",
            borderBottom: "1px solid rgba(220, 53, 69, 0.2)",
            paddingTop: "16px",
            paddingBottom: "16px"
          }}
        >
            <div className="d-flex align-items-center">
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
              backgroundColor: "rgba(220, 53, 69, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              marginRight: "10px"
              }}>
              <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "18px", color: "#dc3545" }}></i>
              </div>
            <Modal.Title style={{ fontSize: "18px", fontWeight: "600", color: "#444" }}>Delete Teacher</Modal.Title>
            </div>
          </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <p style={{ fontSize: "15px", color: "#555" }}>
            Are you sure you want to delete this teacher? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid rgba(220, 53, 69, 0.2)", padding: "16px" }}>
              <Button
                style={{
                  background: "rgba(154, 77, 226, 0.15)",
                  color: "rgb(154, 77, 226)",
                  border: "1.5px solid rgba(154, 77, 226, 0.5)",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  fontWeight: "500",
                  fontSize: "1rem",
                  marginRight: "10px",
                  transition: "all 0.3s ease"
                }}
                onClick={() => setDeleteTeacherSelected(null)}
                onMouseOver={e => {
                  e.currentTarget.style.background = "rgb(154, 77, 226)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "rgb(154, 77, 226)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "rgba(154, 77, 226, 0.15)";
                  e.currentTarget.style.color = "rgb(154, 77, 226)";
                  e.currentTarget.style.borderColor = "rgba(154, 77, 226, 0.5)";
                }}
              >
                Cancel
              </Button>
              <Button
            style={{
              background: "rgba(220, 53, 69, 0.1)",
              color: "#dc3545",
              border: "1.5px solid rgba(220, 53, 69, 0.3)",
              borderRadius: "8px",
              padding: "8px 20px",
              fontWeight: "500",
              marginLeft: "10px",
              transition: "all 0.3s ease"
            }}
            onClick={e => {
                  deleteTeacher(deleteTeacherSelected)
                .then(res => {
                  setDeleteTeacherSelected(null);
                  // Fetch updated teacher list from backend
                  getTeachers().then((updated) => {
                    setTeachers(updated.sort((a, b) => a.seniority_rank - b.seniority_rank));
                    toast.success("Teacher deleted successfully");
                  });
                })
                .catch(console.log);
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
              </Button>
        </Modal.Footer>
        </Modal>

      {/* Map Credit Modal */}
      <Modal show={showMapCredit} onHide={() => setShowMapCredit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Map Credit by Designation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FormGroup style={{ position: 'relative' }}>
              <Form.Label>Designation</Form.Label>
              <FormControl
                type="text"
                value={mapDesignation}
                onChange={e => {
                  setMapDesignation(e.target.value);
                  if (e.target.value) {
                    setFilteredSuggestions(
                      DESIGNATION_SUGGESTIONS.filter(s =>
                        s.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                    );
                  } else {
                    setFilteredSuggestions(DESIGNATION_SUGGESTIONS);
                  }
                }}
                placeholder="Enter designation"
                autoComplete="off"
              />
              {mapDesignation && filteredSuggestions.length > 0 && (
                <div style={{ border: '1px solid #eee', borderRadius: 6, marginTop: 2, background: '#fff', zIndex: 10, position: 'absolute', width: '90%' }}>
                  {filteredSuggestions.slice(0, 5).map((suggestion, idx) => (
                    <div
                      key={idx}
                      style={{ padding: '6px 12px', cursor: 'pointer', color: '#9a4de2' }}
                      onClick={() => {
                        setMapDesignation(suggestion);
                        setFilteredSuggestions([]); // Hide suggestions after selection
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </FormGroup>
            <FormGroup className="mt-3">
              <Form.Label>Credit Hour</Form.Label>
              <FormControl
                type="number"
                value={mapCredit}
                onChange={e => setMapCredit(e.target.value)}
                placeholder="Enter credit hour"
              />
            </FormGroup>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Button
                style={{ minWidth: 100, maxWidth: 140, ...modalButtonStyle }}
                onClick={handleMapCreditApply}
              >
                Apply
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}