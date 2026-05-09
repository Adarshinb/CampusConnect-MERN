const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  signup,
  bulkUploadUsers,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  sendRequest,
  acceptRequest,
  getReceivedRequests,
  getSentRequests,
  rejectRequest,
  cancelRequest,
  getConnections,
  getFilteredUsers,
  getChatHistory,
  countUsers
} = require("../controller/userController");



// file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


router.post("/signup", signup);
// new bulk upload route
router.post("/bulkupload", upload.single("file"), bulkUploadUsers);
router.post("/login", login);
router.get("/countUsers", countUsers);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/send-request", sendRequest);
router.post("/accept-request", acceptRequest);

router.get('/requests/:userId', getReceivedRequests);
router.get('/sent-requests/:userId',getSentRequests);
router.post('/reject-request', rejectRequest);
router.post('/cancel-request', cancelRequest);
router.get('/connections/:userId', getConnections);

router.get('/connections/:userId', getConnections);
router.get('/chat/:userId1/:userId2', getChatHistory);

router.get("/filtered/:userId", getFilteredUsers);

module.exports = router;
