import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useState } from "react";
import "../css/profile.css";
import ProfileCard from "../User/ProfileCard";
import PostCard from "../posts/PostCard";
import AddPost from "../posts/AddPost";
import ViewConnections from "../User/ViewConnections";

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState("posts");

  function ReelsPage() {
    return <AddPost />;
  }

  function PostsPage() {
    return <PostCard />;
  }

  function LikedPage() {
    return <ViewConnections />;
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="profile-container">
      <motion.div 
        className="profile-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProfileCard />
      </motion.div>

      <nav className="profile-nav">
        <motion.ul 
          className="tabs-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.li
            className={`tab ${selectedTab === "reels" ? "active" : ""}`}
            onClick={() => setSelectedTab("reels")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎞️ Add Post
            {selectedTab === "reels" && (
              <motion.div
                className="underline"
                layoutId="underline"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.li>
          
          <motion.li
            className={`tab ${selectedTab === "posts" ? "active" : ""}`}
            onClick={() => setSelectedTab("posts")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📝 Posts
            {selectedTab === "posts" && (
              <motion.div
                className="underline"
                layoutId="underline"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.li>
          
          <motion.li
            className={`tab ${selectedTab === "liked" ? "active" : ""}`}
            onClick={() => setSelectedTab("liked")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ❤️ Connections
            {selectedTab === "liked" && (
              <motion.div
                className="underline"
                layoutId="underline"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.li>
        </motion.ul>
      </nav>

      <main className="content-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            className="content-wrapper"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {selectedTab === "reels" && <ReelsPage />}
            {selectedTab === "posts" && <PostsPage />}
            {selectedTab === "liked" && <LikedPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Profile;