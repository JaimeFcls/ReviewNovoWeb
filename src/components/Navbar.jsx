import { useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { getUser } from "./getUser";


const Navbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!search) return;

    navigate(`/search?q=${search}`, { replace: true });
    setSearch("");
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  const user = getUser();
  return (
    <nav id="navbar">
      <Link to={"/"}>
        <img src="/logorvw2.png" alt="logo" />
      </Link>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Busque um filme ou série"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <button type="submit">
          <BiSearchAlt2 />
        </button>
      </form>
      
      {user ? (
        <div>
        <div className="user-info">
            <p className="ola" style={{ color: "#fff" }}>Olá,<a className="usuario" href="/profile" alt="Perfil">{user.nome}</a></p>  
            <p><a className="sair" onClick={handleLogout}> Sair</a> <a className="lista" href="/lista">Meus Favoritos</a></p>
        </div>
      
        </div>
      ) : (
        <div>
            <a href="/cadastro" className="cadastrar" >Cadastro</a>
            <a href="/login" className="logar" >Login</a>
        </div>
      )}
    </nav>
  
  );
  
};

export default Navbar;
