import React, { useState } from "react";
import axios from "axios";
import { Button, Typography, Box, LinearProgress, List, ListItem, ListItemText } from "@mui/material";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = [".xls", ".xlsx"];

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null); // { added, failed, successes, failures }

  const handleFileChange = (e) => {
    setResults(null);
    setMessage("");
    const f = e.target.files[0];
    if (!f) return setFile(null);

    const name = f.name.toLowerCase();
    const isAllowed = ALLOWED_EXT.some(ext => name.endsWith(ext));
    if (!isAllowed) {
      setMessage("Please select an Excel file (.xls or .xlsx).");
      setFile(null);
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      setMessage("File too large. Max allowed size is 5 MB.");
      setFile(null);
      return;
    }

    setFile(f);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file, file.name);

    setLoading(true);
    setProgress(0);
    setMessage("");

    try {
      const token = localStorage.getItem("token"); // backend auth if required
      const res = await axios.post("http://localhost:3006/api/user/bulkupload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
        timeout: 2 * 60 * 1000 // 2 minutes
      });

      // backend expected: { message, added, failed, successes, failures }
      const data = res.data;
      setResults({
        added: data.added ?? null,
        failed: data.failed ?? null,
        successes: data.successes ?? [],
        failures: data.failures ?? []
      });
      setMessage(data.message || "Upload completed");
    } catch (err) {
      console.error("Bulk upload error:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Upload failed";
      setMessage(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h5" gutterBottom>Bulk Upload Users</Typography>

      <input
        id="bulkupload-file"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ marginTop: 12 }}
      />

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ width: "60%", mx: "auto", mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" sx={{ mt: 1 }}>{progress}%</Typography>
        </Box>
      )}

      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}

      {results && (
        <Box sx={{ mt: 3, textAlign: "left", width: "80%", mx: "auto" }}>
          <Typography variant="subtitle1">Summary</Typography>
          <Typography>Added: {results.added ?? "—"}</Typography>
          <Typography>Failed: {results.failed ?? "—"}</Typography>

          {Array.isArray(results.successes) && results.successes.length > 0 && (
            <>
              <Typography sx={{ mt: 2 }}><strong>Successes</strong></Typography>
              <List dense>
                {results.successes.map((s, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`Row ${s.row}: ${s.user?.email || s.user?.name || "User added"}`} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {Array.isArray(results.failures) && results.failures.length > 0 && (
            <>
              <Typography sx={{ mt: 2 }}><strong>Failures</strong></Typography>
              <List dense>
                {results.failures.map((f, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`Row ${f.row}: ${f.error}`} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BulkUpload;
