import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Pages/Home'
import './App.css'
import Login from './components/User/Login'
import Signup from './components/User/Signup'
import Profile from './components/Pages/Profile'
import PostCard from './components/posts/PostCard'
import AddPost from './components/posts/AddPost'
import PostFeed from './components/posts/PostFeed'
import ConnectUser from './components/User/ConnectUser'
import NavBar from './components/NavBar'
import Requests from './components/User/Requests'
import ViewConnections from './components/User/ViewConnections'
import ChatBox from './components/Chat/ChatBox'
import BulkUpload from './components/User/BulkUpload'
import PublicProfile from './components/User/PublicProfile'
import AdminDashboard from './components/Admin/AdminDashboard'
import AddFaculty from './components/Admin/AddFaculty'
import ManageFaculty from './components/Admin/ManageFaculty'

const App = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  return (
    <div>
      {storedUser && <NavBar />}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/bulkupload' element={<BulkUpload/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/publicprofile" element={<PublicProfile />} />
        <Route path='/postcard' element={<PostCard/>}/>
        <Route path='/addpost' element={<AddPost/>}/>
        <Route path='/viewpost' element={<PostFeed/>}/>
        <Route path='/connect' element={<ConnectUser/>}/>
        <Route path='/requests' element={<Requests/>}/>
        <Route path='/connections' element={<ViewConnections/>}/>
        <Route path='/chatpage' element={<ChatBox/>}/>

        <Route path='/admindashboard' element={<AdminDashboard/>}/>
        <Route path='/addFaculty' element={<AddFaculty/>}/>
        <Route path='/manageFaculty' element={<ManageFaculty/>}/>
      </Routes>
    </div>
  )
}

export default App