import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPanel.module.css";

function AdminPanel() {
  const navigate = useNavigate();
  useEffect(() => {
    const verificarAutenticacao = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:5000/admin_painel", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          alert("Sessão expirada. Faça login novamente.");
          localStorage.removeItem("token");
          navigate("/login");
        } else if (response.status === 403) {
          navigate("/pagina_inicial");
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        alert("Erro ao carregar a página.");
        navigate("/pagina_inicial");
      }
    };
    verificarAutenticacao();
  }, [navigate]);
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Erro ao realizar logout.");
      }
    } catch (error) {
      console.error("Erro no logout:", error);
      alert("Erro ao realizar logout.");
    }
  };
  return (
    <div className={styles.container}>
      <h1>Painel do Administrador</h1>
      <div className={styles.buttonContainer}>
        <button
          className={styles.button}
          onClick={() => navigate("/criar_curso")}
        >
          Adicionar Curso
        </button>
        <button
          className={styles.button}
          onClick={() => navigate("/criar_turma")}
        >
          Adicionar Turma
        </button>
        <button
          className={styles.button}
          onClick={() => navigate("/lista_de_alunos")}
        >
          Gerenciar Alunos
        </button>
        <button
          className={`${styles.button} ${styles.delete}`}
          onClick={() => navigate("/lista_de_turmas")}
        >
          Deletar Turma
        </button>
      </div>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}

export default AdminPanel;