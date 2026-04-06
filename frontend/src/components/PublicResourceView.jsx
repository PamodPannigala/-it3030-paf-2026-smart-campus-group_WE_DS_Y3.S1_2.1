import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PublicResourceView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const userRole = localStorage.getItem("userRole"); 

    useEffect(() => {
        // මෙතන IP එක හරියටම තියෙනවා (10.187.244.1)
        axios.get(`http://10.187.244.1:8080/api/resources/${id}`)
            .then(res => {
                setResource(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Backend Error:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="text-center mt-5">Loading Resource Details...</div>;
    if (!resource) return <div className="text-center mt-5 text-danger">Resource Not Found!</div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                <div className="bg-primary p-4 text-white text-center">
                    <h2 className="fw-bold mb-0">{resource.name}</h2>
                    <span className="badge bg-light text-primary mt-2">{resource.type}</span>
                </div>

                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-6 mb-3">
                            <label className="text-muted small d-block">Location</label>
                            <span className="fw-bold">{resource.location}</span>
                        </div>
                        <div className="col-6 mb-3">
                            <label className="text-muted small d-block">Capacity</label>
                            <span className="fw-bold">{resource.capacity} Students</span>
                        </div>
                        <div className="col-6">
                            <label className="text-muted small d-block">Status</label>
                            <span className={`badge ${resource.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                                {resource.status}
                            </span>
                        </div>
                        <div className="col-6">
                            <label className="text-muted small d-block">Availability</label>
                            <span className="fw-bold text-primary">{resource.openTime} - {resource.closeTime}</span>
                        </div>
                    </div>

                    <div className="d-grid gap-3 mt-4">
                        <button className="btn btn-primary btn-lg py-3 fw-bold">📅 Book Now</button>
                        <button className="btn btn-outline-danger btn-lg py-3 fw-bold">🛠️ Report Issue</button>

                        {/* --- Admin ට විතරක් පේන Edit Section එක --- */}
                        {/* {localStorage.getItem("userRole") === "ADMIN" && ( */}
                            <div className="mt-4 pt-3 border-top">
                                <p className="text-muted small">Admin Controls:</p>
                                <button 
                                    className="btn btn-dark w-100 py-3 fw-bold shadow"
                                    // මෙතනින් තමයි ?editId= කියන එක URL එකට දාලා යවන්නේ
                                    onClick={() => navigate(`/inventory?editId=${id}`)}
                                >
                                    ⚙️ Edit this Resource
                                </button>
                            </div>
                        {/* )} */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicResourceView;