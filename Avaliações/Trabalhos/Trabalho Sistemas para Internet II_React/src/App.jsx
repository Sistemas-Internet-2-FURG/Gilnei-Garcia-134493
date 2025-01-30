import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./paginas/Login";
import Cadastro from "./paginas/Cadastro";
import AdminPanel from "./paginas/AdminPanel";
import PaginaInicial from "./paginas/PaginaInicial";
import ListarTurmas from "./paginas/ListarTurmas";
import ListarAlunos from "./paginas/ListarAlunos";
import CriarTurma from './paginas/CriarTurma';
import CriarCurso from './paginas/CriarCurso';
import Matricular from './paginas/Matricular';
import EditarAluno from './paginas/EditarAluno';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/admin_painel" element={<AdminPanel />} />
        <Route path="/pagina_inicial" element={<PaginaInicial />} />
        <Route path="/lista_de_turmas" element={<ListarTurmas />} />
        <Route path="/lista_de_alunos" element={<ListarAlunos />} />
        <Route path="/criar_turma" element={<CriarTurma />} />
        <Route path="/criar_curso" element={<CriarCurso />} />
        <Route path="/inscrever" element={<Matricular />} />
        <Route path="/editar" element={<EditarAluno />} />
      </Routes>
    </Router>
  );
}

export default App;