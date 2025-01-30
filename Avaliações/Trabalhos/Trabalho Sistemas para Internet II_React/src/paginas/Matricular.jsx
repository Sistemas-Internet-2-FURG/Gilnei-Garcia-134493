import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Matricular.module.css";
function Matricular() {
    const [turmas, setTurmas] = useState([]);
    const [turmaId, setTurmaId] = useState("");
    const [flashMessage, setFlashMessage] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const carregarTurmas = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Você precisa estar logado para acessar as turmas.");
                navigate("/login");
                return;
            }
            try {
                const response = await fetch("http://127.0.0.1:5000/inscrever", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Erro ao carregar as turmas.");
                }
                const data = await response.json();
                setTurmas(data);
            } catch (error) {
                console.error(error);
                alert("Não foi possível carregar as turmas.");
            }
        };
        carregarTurmas();
    }, [navigate]);
    const handleInscricao = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você precisa estar logado para se inscrever.");
            navigate("/login");
            return;
        }
        if (!turmaId) {
            alert("Por favor, selecione uma turma.");
            return;
        }
        try {
            const response = await fetch("http://127.0.0.1:5000/inscrever", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ turma_id: turmaId }),
            });

            if (!response.ok) {
                throw new Error("Erro ao realizar inscrição.");
            }
            const data = await response.json();
            setFlashMessage({ type: "success", text: data.message });
            setTurmaId("");
        } catch (error) {
            console.error(error);
            setFlashMessage({
                type: "error",
                text: "Erro ao realizar inscrição.",
            });
        }
    };
    return (
        <div className={styles.container}>
            <h1>Matricular-se em uma Turma</h1>
            {flashMessage && (
                <div
                    className={`${styles.flashMessage} ${
                        flashMessage.type === "error"
                            ? styles.error
                            : styles.success
                    }`}
                >
                    {flashMessage.text}
                </div>
            )}
            <form onSubmit={handleInscricao}>
                <label htmlFor="turma_id">Selecione a Turma:</label>
                <select
                    id="turma_id"
                    value={turmaId}
                    onChange={(e) => setTurmaId(e.target.value)}
                    required
                >
                    <option value="">Selecione uma turma</option>
                    {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                            {turma.nome_turma}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="btn btn-primary w-100">Inscrever-se</button>
            </form>
            <a href="/pagina_inicial">Voltar à Página Inicial</a>
        </div>
    );
}
export default Matricular;