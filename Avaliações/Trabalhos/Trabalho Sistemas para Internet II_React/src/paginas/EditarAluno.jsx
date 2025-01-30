import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./EditarAluno.module.css";

const EditarAluno = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [cursos, setCursos] = useState([]);
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };
  const alunoId = getQueryParam("id");
  useEffect(() => {
    if (!alunoId) {
      alert("ID do aluno não fornecido!");
      navigate("/admin_painel");
    } else {
      carregarCursos();
    }
  }, [alunoId, navigate]);
  const carregarCursos = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/listar_cursos");
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const alunoData = {
      nome,
      matricula,
      curso_id: cursoId,
    };
    try {
      const response = await fetch(`http://127.0.0.1:5000/editar_aluno/${alunoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(alunoData),
      });

      if (response.ok) {
        alert("Aluno editado com sucesso!");
        navigate("/admin_painel");
      } else {
        const result = await response.json();
        alert(result.message || "Erro ao editar aluno.");
      }
    } catch (error) {
      console.error("Erro ao editar aluno:", error);
      alert("Erro ao editar aluno.");
    }
  };
  return (
    <div className={styles["container-cadastro"]}>
      <h1>Editar Aluno</h1>
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
            <option value="" disabled>
              Selecione um curso
            </option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nome_curso}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Editar
        </button>
      </form>
      <a href="/admin_painel">Voltar ao Painel do Administrador</a>
    </div>
  );
};
export default EditarAluno;