import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3006/api/user") // This returns ALL users
      .then((res) => {
        const fac = res.data.filter((u) => u.userType === "faculty"); // 👉 filter faculty
        setFaculty(fac);
      })
      .catch((err) => console.log(err));
  }, []);

  const deleteFaculty = (id) => {
    axios
      .delete(`http://localhost:3006/api/user/${id}`)
      .then((res) => {
        alert("Faculty Deleted!");
        setFaculty(faculty.filter((f) => f._id !== id)); // No reload
      })
      .catch((err) => console.log(err));
  };

  return (
    <div style={{ margin: "2%" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Manage Faculty
      </Typography>

      <Grid container spacing={2}>
        {faculty.map((fac, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
                  {fac.name}
                </Typography>

                <Typography color="text.secondary">
                  Email: {fac.email}
                </Typography>

                <Typography color="text.secondary">
                  Phone: {fac.phone || "Not Provided"}
                </Typography>

                <Typography color="text.secondary">
                  Branch: {fac.branch || "Not Provided"}
                </Typography>

                <Typography color="text.secondary">
                  Year: {fac.year || "N/A"}
                </Typography>
              </CardContent>

              <CardActions>
                <Button color="error" onClick={() => deleteFaculty(fac._id)}>
                  Delete
                </Button>
                {/* If you want update→ add update route */}
                {/* <Button onClick={() => updateFaculty(fac)}>Update</Button> */}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ManageFaculty;
 