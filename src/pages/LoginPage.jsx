import Login from "../components/Login";
import "../styles/Login.css";
import logo from "../assets/logo.png"; 

export default function Loginpage() {
  return (
    <div className="register-page">
      <div className="app-header">
        <div className="logo-box">
          <img src={logo} alt="logo" />
        </div>
        <h2 className="app-name">Mabzo</h2>
      </div>
      <div className="form-container">
        <div className="register-card login-card">
          <Login />
        </div>
      </div>
    </div>
  );
}
