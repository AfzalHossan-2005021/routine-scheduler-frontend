import { getAllTeachers } from "../api/online";
import { useEffect, useState } from "react";

export default function Online() {
    const [teachers, setTeachers] = useState([]);
    const [sampleData, setSampleData] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const data = await getAllTeachers();
            setTeachers(data);
            if (data.length > 0) {
                setSampleData(data[0]);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };

    if (!sampleData) {
        return <div>Nothing to show.</div>;
    }

    return (
        <div className="online-container">
            <style jsx>{`
        .online-container {
          padding: 20px;
        }
        .table-header {
          display: flex;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .table-header-item {
          flex: 1;
          padding: 10px;
          border-bottom: 1px solid #ccc;
          mergin-right: 20px;
        }
        .table-header-item:nth-child(1) {
          flex: 0.2;
        }
        .table-header-item:nth-child(2) {
          flex: 0.5;
        }
        .table-header-item:nth-child(3) {
          flex: 0.3;
        }
      `}</style>
            <style jsx>{`
        .online-container ul {
          list-style-type: none;
          padding: 0;
        }
        .online-container li {
          padding: 10px;
          border-bottom: 1px solid #ccc;
        }
        .online-container li:hover {
          background-color: #f0f0f0;
        }
      `}</style>
            <style jsx>{`
        .online-container li a {
          text-decoration: none;
          color: #333;
        }
        .online-container li a:hover {
          color: #007bff;
        }
      `}</style>
            <style jsx>{`
        .online-container li {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #ccc;
        }
        .online-container li:nth-child(odd) {
          background-color: #f9f9f9;
        }
        .online-container li:nth-child(even) {
          background-color: #fff;
        }
      `}</style>
            <style jsx>{`
        .online-container li span {
          flex: 1;
          padding: 10px;
          text-align: center;
        }
        .online-container li span:nth-child(1) {
          flex: 0.2;
        }
        .online-container li span:nth-child(2) {
          flex: 0.5;
        }
        .online-container li span:nth-child(3) {
          flex: 0.3;
        }
      `}</style>
            <h1>Theory Course Teachers</h1>
            <div className="table-header">
                {Object.keys(sampleData).map((key, index) => (
                    <div key={index} className="table-header-item" style={{ flex: 1, padding: '5px', textAlign: 'left' }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                ))}
            </div>
            <ul>
                {teachers.map((teacher) => (
                    // show data for all columns in the sampleData
                    <li key={teacher.initial}>
                        {Object.keys(sampleData).map((key, index) => (
                            <div key={index} className="table-item" style={{ flex: 1, padding: '5px', textAlign: 'left' }}>
                                {teacher[key] !== undefined ? teacher[key] : 'N/A'}
                            </div>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
}