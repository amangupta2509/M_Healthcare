import React from "react";
import "../../physio/components/Navbar.css";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../../ThemeProvider";

const DoctorNavbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
     <a href="/counselor"> <div className="navbar-logo">Counselor</div></a>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </nav>
  );
};

export default DoctorNavbar;