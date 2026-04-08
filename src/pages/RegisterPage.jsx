import Register from "../components/Register";
import "../styles/Register.css";
import deliveryImg from "../assets/Scootyedit.jpeg";
import logo from "../assets/logo.png"; 

export default function Registerpage() {
  return (
    <div
      className="register-page"
      style={{ backgroundImage: `url(${deliveryImg})` }}
    >
      <div className="app-header">
  <div className="logo-box">
    <img src={logo} alt="logo" />
  </div>
  <h2 className="app-name">Mabzo</h2>
</div>
      <div className="form-container">
        <Register />
      </div>
    </div>
  );
}
