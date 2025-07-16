import { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } from "../api";
import { useEffect, useState } from "react";

export default function Online() {
    const [teachers, setTeachers] = useState([]);
    const [sampleData, setSampleData] = useState(null);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [addFormData, setAddFormData] = useState({});

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const data = await getTeachers();
            setTeachers(data);
            if (data.length > 0) {
                setSampleData(data[0]);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };


    const update = async (initial, updatedTeacher) => {
        try {
            const response = await updateTeacher(initial, updatedTeacher);
            console.log("Teacher updated:", response);
            setEditingTeacher(null);
            setFormData({});
            fetchTeachers(); // Refresh the list after update
        } catch (error) {
            console.error("Error updating teacher:", error);
        }
    };


    const create = async (newTeacher) => {
        try {
            const response = await createTeacher(newTeacher);
            console.log("Teacher created:", response);
            setShowAddForm(false);
            setAddFormData({});
            fetchTeachers(); // Refresh the list after creation
        } catch (error) {
            console.error("Error creating teacher:", error);
        }
    };

    const handleAddClick = () => {
        setShowAddForm(true);
        setAddFormData({});
    };

    const handleAddInputChange = (key, value) => {
        setAddFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAddFormSubmit = (e) => {
        e.preventDefault();
        create(addFormData);
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
        setAddFormData({});
    };

    const handleEditClick = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({ ...teacher });
    };

    const handleInputChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        update(editingTeacher.initial, formData);
    };

    const handleCancelEdit = () => {
        setEditingTeacher(null);
        setFormData({});
    };

    const handleDelete = async (initial) => {
        try {
            await deleteTeacher(initial);
            console.log("Teacher deleted:", initial);
            fetchTeachers(); // Refresh the list after deletion
        } catch (error) {
            console.error("Error deleting teacher:", error);
        }
    };

    if (!sampleData) {
        return <div>Nothing to show.</div>;
    }

    return (
        <div className="online-container">
            <h1>Teachers</h1>
            {/* Add button */}
            <button
                onClick={handleAddClick}
                style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                Add Teacher
            </button>
            <div className="table-header">
                {Object.keys(sampleData).map((key, index) => (
                    <div key={index} className="table-header-item">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                ))}
                <div className="table-header-item">Actions</div>
            </div>

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
          padding: 5px;
          border-bottom: 1px solid #ccc;
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
          padding: 5px;
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
            <ul>
                {teachers.map((teacher) => (
                    // show data for all columns in the sampleData
                    <li key={teacher.initial}>
                        {Object.keys(sampleData).map((key, index) => (
                            <div key={index} className="table-item" style={{ flex: 1, padding: '5px', textAlign: 'center' }}>
                                {teacher[key] !== undefined ? teacher[key] : 'N/A'}
                            </div>
                        ))}
                        {/* Add update and delete buttons for each teacher */}
                        <div className="table-item" style={{ flex: 1, padding: '5px', textAlign: 'center' }}>
                            <button
                                onClick={() => handleEditClick(teacher)}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    marginRight: '5px'
                                }}
                            >
                                Update
                            </button>
                            <button
                                onClick={() => handleDelete(teacher.initial)}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Update Teacher Form Modal */}
            {editingTeacher && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        minWidth: '400px',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '20px', color: '#333' }}>
                            Update Teacher: {editingTeacher.name}
                        </h2>
                        <form onSubmit={handleFormSubmit}>
                            {Object.keys(sampleData).map((key) => (
                                <div key={key} style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: 'bold',
                                        color: '#555'
                                    }}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                                    </label>
                                    <input
                                        type="text"
                                        value={formData[key] || ''}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        disabled={key === 'initial' || key === 'name'} // Disable editing initial as it's the primary key
                                    />
                                </div>
                            ))}
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '10px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Teacher Form Modal */}
            {showAddForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        minWidth: '400px',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '20px', color: '#333' }}>
                            Add New Teacher
                        </h2>
                        <form onSubmit={handleAddFormSubmit}>
                            {Object.keys(sampleData).map((key) => (
                                <div key={key} style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: 'bold',
                                        color: '#555'
                                    }}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                                    </label>
                                    <input
                                        type="text"
                                        value={addFormData[key] || ''}
                                        onChange={(e) => handleAddInputChange(key, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder={`Enter ${key}`}
                                        required
                                    />
                                </div>
                            ))}
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <button
                                    type="button"
                                    onClick={handleCancelAdd}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '10px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Teacher
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}