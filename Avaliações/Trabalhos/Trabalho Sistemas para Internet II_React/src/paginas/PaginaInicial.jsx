import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PaginaInicial.module.css";

function PaginaInicial() {
    const [aluno, setAluno] = useState(null);
    const [turmas, setTurmas] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        } else {
            carregarDados(token);
        }
    }, [navigate]);

    const carregarDados = async (token) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/pagina_inicial", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                alert("Sua sessão expirou. Por favor, faça login novamente.");
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            const data = await response.json();
            if (!data.success) {
                alert(data.message);
                return;
            }
            setAluno(data.aluno);
            setTurmas(data.aluno.turmas);
        } catch (error) {
            console.error("Erro ao carregar os dados do aluno:", error);
            alert("Erro ao carregar os dados.");
        }
    };
    const sairDaTurma = async (turmaId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você precisa estar logado para sair da turma.");
            return;
        }
        try {
            const response = await fetch("http://127.0.0.1:5000/sair_turma", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ turma_id: turmaId }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setTurmas((prevTurmas) => prevTurmas.filter((turma) => turma.id !== turmaId));
            } else {
                alert(data.message || "Erro ao sair da turma");
            }
        } catch (error) {
            console.error("Erro ao sair da turma:", error);
            alert("Erro ao tentar sair da turma.");
        }
    };
    const logout = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch("http://127.0.0.1:5000/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            localStorage.removeItem("token");
            navigate("/login");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            alert("Erro ao sair.");
        }
    };
    if (!aluno) {
        return <div>Carregando...</div>;
    }
    return (
        <div className={styles.container}>
            <h1>Bem-vindo, {aluno.nome}</h1>
            <h3>Você está matriculado nas seguintes turmas:</h3>
            <ul>
                {turmas.map((turma) => (
                    <li key={turma.id}>
                        {turma.nome_turma} - {aluno.curso}
                        <button className={styles.btnDanger} onClick={() => sairDaTurma(turma.id)}>
                            Sair da Turma
                        </button>
                    </li>
                ))}
            </ul>
            <button className={styles.inscreverButton} onClick={() => navigate("/inscrever")}>
                Matricular-se em uma turma
            </button>
            <button className={styles.logoutButton} onClick={logout}>
                Sair
            </button>
        </div>
    );
}

export default PaginaInicial;