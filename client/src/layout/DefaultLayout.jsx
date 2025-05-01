import React from 'react'
// import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/coreui/index' // AppContent no longer needed
import { AppSidebar, AppFooter, AppHeader } from '../components/coreui/index' // Corrected path

const DefaultLayout = ({ children }) => { // Added children prop
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          {/* <AppBreadcrumb /> Component removed/commented out as it depends on template routes */}
          {children} { /* Renders the page component directly */}
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
