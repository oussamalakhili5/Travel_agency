import Footer from './components/Footer'
import Navbar from './components/Navbar'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Navbar />

      <main className="site-main flex-grow-1 py-4 py-lg-5">
        <AppRoutes />
      </main>

      <Footer />
    </div>
  )
}

export default App
