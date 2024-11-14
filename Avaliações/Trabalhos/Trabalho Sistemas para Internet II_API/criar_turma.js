document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
        return;
    }
    try {
        const adminCheckResponse = await fetch('http://127.0.0.1:5000/is_admin', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const adminData = await adminCheckResponse.json();
        if (!adminData.is_admin) {
            alert('Acesso restrito a administradores.');
            window.location.href = 'pagina_inicial.html';
            return;
        }
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        alert('Erro ao verificar permissões. Por favor, tente novamente.');
        window.location.href = 'pagina_inicial.html';
        return;
    }
    const criarTurmaBtn = document.getElementById('criar-turma-btn');
    const mensagem = document.getElementById('mensagem');

    criarTurmaBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        const nomeTurma = document.getElementById('nome_turma').value;
        const idCurso = document.getElementById('curso_id').value;
        
        if (!nomeTurma || !idCurso) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/criar_turma', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome_turma: nomeTurma, curso_id: idCurso })
            });

            const data = await response.json();
            if (data.success) {
                alert('Turma criada com sucesso.')
            } else {
                alert('Ocorreu um erro ao tentar criar a turma.')
            }
        } catch (error) {
            console.error('Erro ao tentar criar a turma:', error);
            mensagem.textContent = 'Erro ao tentar se comunicar com a API.';
            mensagem.style.color = 'red';
            mensagem.style.display = 'block';
        }
    });
});