import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Cadastro.module.css";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [cursos, setCursos] = useState([]);
  const [alerta, setAlerta] = useState("");
  useEffect(() => {
    const carregarCursos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/listar_cursos");
        if (!response.ok) {
          throw new Error("Erro ao carregar os cursos.");
        }
        const data = await response.json();
        setCursos(data);
      } catch (error) {
        console.error("Erro ao carregar cursos:", error);
      }
    };
    carregarCursos();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !matricula || !senha || !cursoId) {
      setAlerta("Por favor, preencha todos os campos.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, matricula, senha, curso_id: cursoId }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message || "Cadastro realizado com sucesso!");
        setNome("");
        setMatricula("");
        setSenha("");
        setCursoId("");
        setAlerta("");
      } else {
        setAlerta(data.message || "Erro ao realizar o cadastro.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      setAlerta("Erro ao realizar o cadastro.");
    }
  };
  return (
    <div className={styles.containerCadastro}>
      <h1>Cadastro</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nome" className="form-label">
            Nome:
          </label>
          <input
            type="text"
            id="nome"
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
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
        <div className="mb-3">
          <label htmlFor="curso_id" className="form-label">
            Curso:
          </label>
          <select
            id="curso_id"
            className="form-select"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            required
          >
            <option value="">Selecione o curso</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nome_curso}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Cadastrar
        </button>
      </form>
      <p className="text-center">
        Já tem uma conta? <Link to="/login">Faça login</Link>
      </p>
      {alerta && <div className="alert alert-danger mt-3">{alerta}</div>}
    </div>
  );
}

export default Cadastro;