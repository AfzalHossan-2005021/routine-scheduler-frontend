import { useEffect, useState } from "react"
import { ToggleButton } from "react-bootstrap"
import { toast } from "react-hot-toast";
import {
    getLevelTerms,
    setLevelTermsDB
} from "../api/db-crud"

export default function Initialize(){
    const [levelTerms, setLevelTerms] = useState([]);
    
    useEffect(() => {
        getLevelTerms()
            .then((res) => {
                console.log(res.message);
                setLevelTerms(res.data);
                // Removed console.log(levelTerms) as it would show stale data
            })
            .catch((error) => {
                console.error("Error fetching level terms:", error);
                // Display a user-friendly error message
                toast.error("Failed to load level terms. Please try again later.");
                // Initialize with empty array to prevent rendering errors
                setLevelTerms([]);
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
        setLevelTermsDB(levelTerms).then(res => {
            toast.success("Initiated");
        })
        .catch(console.log)
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
            <div className="row">
                <div className="col-12 grid-margin">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Level-Term</th>
                                            <th>Status</th>
                                            <th>Batch</th>
                                            <th>Sections</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {levelTerms?.map((levelTerm, index) => (
                                            <tr key={index}>
                                                <td>{levelTerm.department}</td>
                                                <td>{levelTerm.level_term}</td>
                                                <td>
                                                    <ToggleButton
                                                        className="mb-2"
                                                        id={`toggle-${index}`}
                                                        type="checkbox"
                                                        variant={levelTerm.active ? "success" : "danger"}
                                                        checked={levelTerm.active}
                                                        onChange={() => handleToggle(index)}
                                                    >
                                                        {levelTerm.active ? "Active" : "Inactive"}
                                                    </ToggleButton>
                                                </td>
                                                {levelTerm.active && (
                                                    <td>
                                                        <input 
                                                            placeholder="Enter batch number"
                                                            value={levelTerm.batch}
                                                            onChange={(e) => handleBatch(e.target.value, index)}
                                                        />
                                                    </td>
                                                )}
                                                {levelTerm.active && (
                                                    <td>
                                                        <input 
                                                            placeholder="Enter section count"
                                                            value={levelTerm.section_count}
                                                            onChange={(e) => handleSection(e.target.value, index)}
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <h4 className="card-title float-right">
                                <button 
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={handleSubmit}
                                >
                                    Initialize
                                </button>
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}