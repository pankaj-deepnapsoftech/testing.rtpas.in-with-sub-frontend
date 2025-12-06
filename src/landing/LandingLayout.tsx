// @ts-nocheck
import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

const LandingLayout = () => {
  return (
    <div className="overflow-hidden">
      <ScrollToTop />
      <Navbar/>
      <Outlet/>
      <Footer/>
    </div>
  )
}

export default LandingLayout
