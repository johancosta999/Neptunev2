import React from "react";
// import Nav from "../src/Component/Nav/nav";
import { Routes, Route, Navigate } from "react-router-dom"; // added Navigate
//
import LandingPage from "./Component/Pages/LandingPage";
import CheckAuth from "./Component/Auth/CheckAuth";
import UnauthorizedPage from "./Component/Pages/UnauthorizedPage";
import AuthTestPage from "./Component/Pages/AuthTestPage";

import WaterQualityList from "../src/Component/WaterQuality/WaterQualityList";
import AddWaterQuality from "../src/Component/WaterQuality/AddWaterQuality";
import EditWaterQuality from "./Component/WaterQuality/EditWaterQuality";
import Dashboard from "../src/Component/Home/TankDisplay"
import TankDashboard from "./Component/Pages/TankDashboard";
import ClientWaterQuality from "./Component/NeptuneClient/ClientWaterQualityDashboard";
import Invoice from "./Component/Billing/Invoice";
import AddWaterLevel from "./Component/WaterLevel/AddWater";
import EditWaterlevel from "./Component/WaterLevel/EditWaterlevel";
import Waterlevellist from "./Component/WaterLevel/Waterlevellist";
import ClientWaterLevel from "./Component/NeptuneClient/ClientWaterLevelDashboard";

import Tanks from "../src/Component/Seller/tanks"
import AddTank from "../src/Component/Seller/addSeller"

import Home from "./Component/Pages/Home";

import Users from "./Component/Pages/Users";
// import Staff from "./Component/Pages/Staff";
import BillingDashboard from "./Component/Pages/BillingDashboard";
import Homepage from "./Component/NeptuneClient/homepage";

import Login from "./Component/Pages/Login";
import AdminDashboard from "./Component/Pages/AdminDashboard";
import AdminOrders from "./Component/Pages/AdminOrders";
import AdminStatistics from "./Component/Pages/AdminStatistics";
import AdminProducts from "./Component/Pages/AdminProducts";
import AdminStock from "./Component/Pages/AdminStock";
import AdminOffers from "./Component/Pages/AdminOffers";
import SellerDashboard from "./Component/Pages/SellerDashboard";

import IssueForm from "./Component/Issues/IssueForm";
import IssueList from "./Component/Issues/IssuesList";
import IssueListAdmin from "./Component/Issues/IssueListAdmin";


import AddUser from "./Component/AddUser/AddUser";
import UserDetails from "./Component/UserDetails/UserDetails";
import UpdateUser from "./Component/UpdateUser/UpdateUser";
import Register from "./Component/Register/Register";

import WaterLevelChart from "./Component/WaterLevel/WaterLevelChart";
import WaterQualityChart from "./Component/WaterQuality/WaterQualityChart";

import AddStaff from "./Component/Staff/AddStaff";
import StaffList from "./Component/Staff/StaffList";
import EditStaff from "./Component/Staff/EditStaff";

import ClientBill from "./Component/NeptuneClient/ClientBillingDashboard";


function App() {
  return (
    <div>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/auth-test" element={<AuthTestPage />} />

        <Route path="/staffs" element={
          <CheckAuth>
            <StaffList />
          </CheckAuth>
        } />
        <Route path="/staffs/add" element={
          <CheckAuth>
            <AddStaff />
          </CheckAuth>
        } />
        <Route path="/staffs/edit/:id" element={
          <CheckAuth>
            <EditStaff />
          </CheckAuth>
        } />

        <Route path="/adduser" element={
          <CheckAuth>
            <AddUser />
          </CheckAuth>
        } />
        <Route path="/userdetails" element={
          <CheckAuth>
            <UserDetails />
          </CheckAuth>
        } />
        <Route path="/regi" element={<Register />} />
        <Route path="/userdetails/:id" element={
          <CheckAuth>
            <UpdateUser />
          </CheckAuth>
        } />
        
        {/* <Route path="/issue" element={<Navigate to="/issues" replace />} /> */}
        <Route path="/issues/:tankId" element={
          <CheckAuth>
            <IssueList />
          </CheckAuth>
        } />
        <Route path="/issues/new" element={
          <CheckAuth>
            <IssueForm />
          </CheckAuth>
        } />
        
        <Route path="/admin/issues/:tankId" element={
          <CheckAuth>
            <IssueListAdmin />
          </CheckAuth>
        } />
        <Route path="/invoice/:tankId" element={
          <CheckAuth>
            <Invoice />
          </CheckAuth>
        } />

             

        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={
          <CheckAuth>
            <AdminDashboard />
          </CheckAuth>
        } />
        <Route path="/admin/orders" element={
          <CheckAuth>
            <AdminOrders />
          </CheckAuth>
        } />
        <Route path="/admin/statistics" element={
          <CheckAuth>
            <AdminStatistics />
          </CheckAuth>
        } />
        <Route path="/admin/products" element={
          <CheckAuth>
            <AdminProducts />
          </CheckAuth>
        } />
        <Route path="/admin/stock" element={
          <CheckAuth>
            <AdminStock />
          </CheckAuth>
        } />
        <Route path="/admin/offers" element={
          <CheckAuth>
            <AdminOffers />
          </CheckAuth>
        } />

        <Route path="/tanks" element={
          <CheckAuth>
            <Tanks />
          </CheckAuth>
        } />
        <Route path="/tank/:tankId/dashboard" element={
          <CheckAuth>
            <TankDashboard />
          </CheckAuth>
        } />

        <Route path="/water-quality" element={
          <CheckAuth>
            <WaterQualityList />
          </CheckAuth>
        } />
        <Route path="/water-quality/add/:tankId" element={
          <CheckAuth>
            <AddWaterQuality />
          </CheckAuth>
        } />
        <Route path="/water-quality/edit/:id" element={
          <CheckAuth>
            <EditWaterQuality />
          </CheckAuth>
        } />
        <Route path="/tank/:tankId/water-quality" element={
          <CheckAuth>
            <WaterQualityList />
          </CheckAuth>
        } />
        <Route path="/client/water-quality" element={
          <CheckAuth>
            <ClientWaterQuality />
          </CheckAuth>
        } />

        <Route path="/water-level/add/:tankId" element={
          <CheckAuth>
            <AddWaterLevel />
          </CheckAuth>
        } />
        <Route path="/water-level/edit/:id" element={
          <CheckAuth>
            <EditWaterlevel />
          </CheckAuth>
        } />
        <Route path="/tank/:tankId/tank-level" element={
          <CheckAuth>
            <Waterlevellist/>
          </CheckAuth>
        } />
        <Route path="/client/water-level" element={
          <CheckAuth>
            <ClientWaterLevel />
          </CheckAuth>
        } />

        <Route path="/sellers" element={
          <CheckAuth>
            <Tanks />
          </CheckAuth>
        } />
        <Route path="/add-tank" element={
          <CheckAuth>
            <AddTank />
          </CheckAuth>
        } />
        <Route path="/seller/dashboard" element={
          <CheckAuth>
            <SellerDashboard />
          </CheckAuth>
        } />

        <Route path="/home" element={
          <CheckAuth>
            <Home />
          </CheckAuth>
        } />
        <Route path="/users" element={
          <CheckAuth>
            <Users />
          </CheckAuth>
        } />
        

        <Route path="/tank/:tankId/billing" element={
          <CheckAuth>
            <BillingDashboard />
          </CheckAuth>
        } />
        <Route path="/client/billing" element={
          <CheckAuth>
            <ClientBill />
          </CheckAuth>
        } />

        <Route path="/water-level-chart/:tankId" element={
          <CheckAuth>
            <WaterLevelChart />
          </CheckAuth>
        } />
        <Route path="/water-quality-chart/:tankId" element={
          <CheckAuth>
            <WaterQualityChart />
          </CheckAuth>
        } />
        
        <Route path="/homepage" element={
          <CheckAuth>
            <Homepage />
          </CheckAuth>
        } />
      </Routes>
    </div>
  );
}

export default App;

