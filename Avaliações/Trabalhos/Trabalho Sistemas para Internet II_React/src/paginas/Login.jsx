import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, senha }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        if (data.administrador) {
          window.location.href = "/admin_painel";
        } else {
          window.location.href = "/pagina_inicial";
        }
      } else {
        setErro(data.message || "Erro ao fazer login.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErro("Erro ao fazer login.");
    }
  };
  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="matricula" className="form-label">
            Matrícula:
          </label>
          <input
            type="text"
            id="matricula"
            className="form-control"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="senha" className="form-label">
            Senha:
          </label>
          <input
            type="password"
            id="senha"
            className="form-control"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>
      <p className="text-center">
        Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </div>
  );
}

export default Login;