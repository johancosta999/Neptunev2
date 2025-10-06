import React from "react";
// import Nav from "../src/Component/Nav/nav";
import { Routes, Route, Navigate } from "react-router-dom"; // added Navigate
//
import LandingPage from "./Component/Pages/LandingPage";

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

        <Route path="/staffs" element={<StaffList />} />
        <Route path="/staffs/add" element={<AddStaff />} />
        <Route path="/staffs/edit/:id" element={<EditStaff />} />

        <Route path="/adduser" element={<AddUser />} />
        <Route path="/userdetails" element={<UserDetails />} />
        <Route path="/regi" element={<Register />} />
        <Route path="/userdetails/:id" element={<UpdateUser />} />
        
        {/* <Route path="/issue" element={<Navigate to="/issues" replace />} /> */}
        <Route path="/issues/:tankId" element={<IssueList />} />
        <Route path="/issues/new" element={<IssueForm />} />
        
        <Route path="/admin/issues/:tankId" element={<IssueListAdmin />} />
        <Route path="/invoice/:tankId" element={<Invoice />} />""

             

        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/statistics" element={<AdminStatistics />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/stock" element={<AdminStock />} />
        <Route path="/admin/offers" element={<AdminOffers />} />

        <Route path="/tanks" element={<Tanks />} />
        <Route path="/tank/:tankId/dashboard" element={<TankDashboard />} />

        <Route path="/water-quality" element={<WaterQualityList />} />
        <Route path="/water-quality/add/:tankId" element={<AddWaterQuality />} />
        <Route path="/water-quality/edit/:id" element={<EditWaterQuality />} />
        <Route path="/tank/:tankId/water-quality" element={<WaterQualityList />} />
        <Route path="/client/water-quality" element={<ClientWaterQuality />} />

        <Route path="/water-level/add/:tankId" element={<AddWaterLevel />} />
        <Route path="/water-level/edit/:id" element={<EditWaterlevel />} />
        <Route path="/tank/:tankId/tank-level" element={<Waterlevellist/>} />
        <Route path="/client/water-level" element={<ClientWaterLevel />} />

        <Route path="/sellers" element={<Tanks/ >} />
        <Route path="/add-tank" element={<AddTank/ >} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />

        <Route path="/home" element={<Home />} />
        <Route path="/users" element={<Users />} />
        

        <Route path="/tank/:tankId/billing" element={<BillingDashboard />} />
        <Route path="/client/billing" element={<ClientBill />} />

        <Route path="/water-level-chart/:tankId" element={<WaterLevelChart />} />
        <Route path="/water-quality-chart/:tankId" element={<WaterQualityChart />} />
        
        <Route path="/homepage" element={<Homepage />} />
      </Routes>
    </div>
  );
}

export default App;

