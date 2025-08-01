import React, { useState } from 'react';
import { Icon } from "@mdi/react";
import { mdiDownload } from "@mdi/js";
import { toast } from 'react-hot-toast';
import TheoryDistribution from './TheoryDistribution';
import SessionalDistribution from './SessionalDistribution';
import CreditDistribution from './CreditDistribution';
import { 
  exportTheoryDistributionToCsv, 
  exportSessionalDistributionToCsv, 
  exportCreditDistributionToCsv
} from '../utils/csvExport';
import { getTheoryDistribution, getSessionalDistribution } from '../api/theory-assign';
import { getTeachers } from '../api/db-crud';
import { 
  getTeacherTheoryAssigments,
  getTeacherSessionalAssignment,
  getAllTeachersCredit,
} from '../api/theory-assign';


export default function LoadDistribution() {
  const [activeTab, setActiveTab] = useState('theory');
  const [downloading, setDownloading] = useState(false);

  const handleCsvDownload = async (type) => {
    setDownloading(true);
    try {
      switch (type) {
        case 'theory':
          const theoryData = await getTheoryDistribution();
          exportTheoryDistributionToCsv(theoryData || []);
          toast.success('Theory distribution CSV downloaded successfully!');
          break;
          
        case 'sessional':
          const sessionalData = await getSessionalDistribution();
          exportSessionalDistributionToCsv(sessionalData || []);
          toast.success('Sessional distribution CSV downloaded successfully!');
          break;
          
        case 'credit':
          // Get teachers and credit data for credit distribution
          const teachersData = await getTeachers();
          const activeTeachers = teachersData.filter(teacher => teacher.active === 1);
          const creditsData = await getAllTeachersCredit();
          
          const teacherAssignments = await Promise.all(
            activeTeachers.map(async (teacher) => {
              try {
                const [theoryAssignments, sessionalAssignments] = await Promise.all([
                  getTeacherTheoryAssigments(teacher.initial).catch(() => []),
                  getTeacherSessionalAssignment(teacher.initial).catch(() => [])
                ]);

                const creditInfo = creditsData.find(c => c.initial === teacher.initial) || {
                  totalCredit: 0,
                  breakdown: { thesis1: 0, thesis2: 0, msc: 0, sessionalCourses: 0, theoryCourses: 0 }
                };

                return {
                  teacher,
                  theoryAssignments: theoryAssignments || [],
                  sessionalAssignments: sessionalAssignments || [],
                  credits: creditInfo
                };
              } catch (error) {
                console.error(`Error fetching data for teacher ${teacher.initial}:`, error);
                return {
                  teacher,
                  theoryAssignments: [],
                  sessionalAssignments: [],
                  credits: {
                    totalCredit: 0,
                    breakdown: { thesis1: 0, thesis2: 0, msc: 0, sessionalCourses: 0, theoryCourses: 0 }
                  }
                };
              }
            })
          );
          
          exportCreditDistributionToCsv(teacherAssignments);
          toast.success('Credit distribution CSV downloaded successfully!');
          break;
          
        default:
          toast.error('Invalid download type');
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV file');
    } finally {
      setDownloading(false);
    }
  };

  // Modern page header style similar to the lab room assignment
  const pageHeaderStyle = {
    background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(154, 77, 226) 100%)",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 8px 32px rgba(174, 117, 228, 0.15)",
    color: "white"
  };

  const tabStyle = {
    backgroundColor: "transparent",
    color: "#fff",
    fontWeight: "600",
    padding: "20px 25px",
    borderRadius: "0",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease"
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    boxShadow: "0 -4px 0 rgba(255, 255, 255, 0.7) inset"
  };

  return (
    <div>
      {/* Modern Page Header */}
      <div style={pageHeaderStyle}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <h3 className="page-title" style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: 0,
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
              <i className="mdi mdi-account-group" style={{ fontSize: "22px" }}></i>
            </div>
            Teacher Load Distribution
          </h3>
          
          <button
            onClick={() => handleCsvDownload(activeTab)}
            disabled={downloading}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: downloading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              fontSize: "14px",
              opacity: downloading ? 0.7 : 1
            }}
            onMouseOver={e => {
              if (!downloading) {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseOut={e => {
              if (!downloading) {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <Icon path={mdiDownload} size={0.8} />
            {downloading ? 'Downloading...' : `Download ${activeTab === 'theory' ? 'Theory' : activeTab === 'sessional' ? 'Sessional' : 'Credit'} CSV`}
          </button>
        </div>
      </div>

      <div className="card" style={{
        borderRadius: "15px",
        border: "none",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(194, 137, 248, 0.1)",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        marginBottom: "24px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}>
        <div className="card-header" style={{
          background: "linear-gradient(135deg, rgb(194, 137, 248) 0%, rgb(174, 117, 228) 100%)",
          color: "white",
          padding: "0",
          overflow: "hidden",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11 100H89V0H11V100ZM0 0V100H100V0H0Z\" fill=\"white\" fill-opacity=\"0.05\"/%3E%3C/svg%3E'), url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"10\" cy=\"10\" r=\"2\" fill=\"white\" fill-opacity=\"0.08\"/%3E%3C/svg%3E')",
            backgroundSize: "80px 80px, 20px 20px",
            opacity: 0.15
          }}></div>
          
          <ul className="nav nav-tabs w-100" style={{
            margin: "0",
            borderBottom: "none",
            position: "relative",
            zIndex: 1
          }}>
            <li className="nav-item">
              <button
                style={activeTab === 'theory' ? activeTabStyle : tabStyle}
                onClick={() => setActiveTab('theory')}
                className="nav-link"
              >
                <i className="mdi mdi-book-open-variant me-2"></i>
                Theory Course Teacher
              </button>
            </li>
            <li className="nav-item">
              <button
                style={activeTab === 'sessional' ? activeTabStyle : tabStyle}
                onClick={() => setActiveTab('sessional')}
                className="nav-link"
              >
                <i className="mdi mdi-laptop me-2"></i>
                Sessional Course Teacher
              </button>
            </li>
            <li className="nav-item">
              <button
                style={activeTab === 'credit' ? activeTabStyle : tabStyle}
                onClick={() => setActiveTab('credit')}
                className="nav-link"
              >
                <i className="mdi mdi-chart-bar me-2"></i>
                Course Load
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body" style={{ padding: "24px" }}>
          {/* Theory Distribution Tab */}
          {activeTab === 'theory' && <TheoryDistribution />}

          {/* Sessional Distribution Tab */}
          {activeTab === 'sessional' && <SessionalDistribution />}

          {/* Credit Distribution Tab */}
          {activeTab === 'credit' && <CreditDistribution />}
        </div>
      </div>
    </div>
  );
}
