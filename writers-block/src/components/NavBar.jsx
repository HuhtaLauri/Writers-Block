import { Link } from "react-router-dom";
import "../css/NavBar.css"


function NavBar() {
  return <nav className="navbar">
    <div className='navbar-title'>
      <Link to="/">Hemingway</Link>
    </div>
    <div className="navbar-links">
      <Link to="/files" className="nav-link">Files</Link>
      <Link to="/content" className="nav-link">Content</Link>
    </div>
    </nav>
}

export default NavBar;
