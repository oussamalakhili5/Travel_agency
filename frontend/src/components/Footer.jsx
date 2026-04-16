function Footer() {
  return (
    <footer className="site-footer py-4">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <p className="mb-0 small">
          &copy; {new Date().getFullYear()} Atlas Travel Agency. Designed for modern trip
          planning.
        </p>
        <span className="small">Hotels, transport, and traveler support in one place.</span>
      </div>
    </footer>
  )
}

export default Footer
