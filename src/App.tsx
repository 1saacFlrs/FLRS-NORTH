/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductPage } from './pages/ProductPage';
import { Cart } from './pages/Cart';
import { Invoice } from './pages/Invoice';
import { AdminDashboard } from './pages/AdminDashboard';
import { Favorites } from './pages/Favorites';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { ApplyAdmin } from './pages/ApplyAdmin';
import { AuthSync } from './components/AuthSync';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthSync />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/apply-admin" element={<ApplyAdmin />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
