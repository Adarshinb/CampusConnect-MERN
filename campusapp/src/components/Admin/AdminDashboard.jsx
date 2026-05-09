// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./admindashboard.css";
import { Add } from "@mui/icons-material";
import AddFaculty from "./AddFaculty";
import ManageFaculty from "./ManageFaculty";
import ManageStudent from "./ManageStudent";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    faculty: 0,
    admins: 0,
    posts: 0
  });
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("home");
   const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const resp = await axios.get("http://localhost:3006/api/admin/stats"); // adjust base URL if needed
        if (resp.data && resp.data.success) {
          setStats(resp.data.data);
        } else {
          console.error("Failed to load stats", resp.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);



  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login"); // SPA navigation
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2 className="logo">Admin Panel</h2>
        <ul>
          <li className={active === "home" ? "active" : ""} onClick={() => setActive("home")}>Home</li>
          <li className={active === "add-faculty" ? "active" : ""} onClick={() => setActive("add-faculty")}>Add Faculty</li>
          <li className={active === "students" ? "active" : ""} onClick={() => setActive("students")}>Manage Students</li>
          <li className={active === "faculty" ? "active" : ""} onClick={() => setActive("faculty")}>Manage Faculty</li>
          <li>
            <Button onClick={handleLogout}>
                Logout
            </Button>
          </li>
        </ul>
      </div>

      <div className="main">
        {active === "home" && (
          <>
            <h1>Dashboard</h1>

            <div className="cards">
              <div className="card">
                <h3>Total Users</h3>
                <p>{loading ? "..." : stats.totalUsers}</p>
              </div>

              <div className="card">
                <h3>Students Enrolled</h3>
                <p>{loading ? "..." : stats.students}</p>
              </div>

              <div className="card">
                <h3>Total Faculty</h3>
                <p>{loading ? "..." : stats.faculty}</p>
              </div>

              <div className="card">
                <h3>No. of Posts</h3>
                <p>{loading ? "..." : stats.posts}</p>
              </div>
            </div>
          </>
        )}

        {active === "add-faculty" && (
          <div>
            <AddFaculty />
          </div>
        )}

        {active === "students" && (
          <div>
            <ManageStudent/>
          </div>
        )}

        {active === "faculty" && (
          <div>
            <ManageFaculty/>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
