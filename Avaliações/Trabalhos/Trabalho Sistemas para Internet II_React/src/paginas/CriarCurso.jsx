import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CriarCurso.module.css";
function CriarCurso() {
    const [nomeCurso, setNomeCurso] = useState("");
    const [idCurso, setIdCurso] = useState("");
    const [mensagem, setMensagem] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const verificarPermissao = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Você precisa estar logado para acessar esta página.");
                navigate("/login");
                return;
            }
            try {
                const response = await fetch("http://127.0.0.1:5000/is_admin", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (!data.is_admin) {
                    alert("Acesso restrito a administradores.");
                    navigate("/pagina_inicial");
                }
            } catch (error) {
                console.error("Erro ao verificar admin:", error);
                alert("Erro ao verificar permissões. Por favor, tente novamente.");
                navigate("/pagina_inicial");
            }
        };
        verificarPermissao();
    }, [navigate]);
    const handleCriarCurso = async (e) => {
        e.preventDefault();
        if (!nomeCurso || !idCurso) {
            alert("Por favor, preencha todos os campos!");
            return;
        }
        try {
            const response = await fetch("http://127.0.0.1:5000/criar_curso", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nome_curso: nomeCurso, id_curso: idCurso }),
            });
            const data = await response.json();
            if (data.success) {
                alert("Curso criado com sucesso!");
                setNomeCurso("");
                setIdCurso("");
                setMensagem("");
            } else {
                alert("Ocorreu um erro ao tentar criar o curso.");
            }
        } catch (error) {
            console.error("Erro ao tentar criar o curso:", error);
            setMensagem("Erro ao tentar se comunicar com a API.");
        }
    };
    return (
        <div className={styles.container}>
            <h1>Criar Curso</h1>
            <form onSubmit={handleCriarCurso}>
                <label htmlFor="nome_curso">Nome do Curso:</label>
                <input
                    type="text"
                    id="nome_curso"
                    value={nomeCurso}
                    onChange={(e) => setNomeCurso(e.target.value)}
                    required
                />
                <label htmlFor="id_curso">ID do Curso:</label>
                <input
                    type="text"
                    id="id_curso"
                    value={idCurso}
                    onChange={(e) => setIdCurso(e.target.value)}
                    required
                />
                <button type="submit" className="btn btn-primary w-100">Criar Curso</button>
            </form>
            {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
            <a href="/admin_painel">Voltar ao Painel do Administrador</a>
        </div>
    );
}
export default CriarCurso;