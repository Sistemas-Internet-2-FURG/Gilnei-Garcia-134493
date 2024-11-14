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
    const criarCursoBtn = document.getElementById('criar-curso-btn');
    const mensagem = document.getElementById('mensagem');

    criarCursoBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        const nomeCurso = document.getElementById('nome_curso').value;
        const idCurso = document.getElementById('id_curso').value;

        if (!nomeCurso || !idCurso) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/criar_curso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome_curso: nomeCurso, id_curso: idCurso })
            });

            const data = await response.json();
            if (data.success) {
                alert('Curso criado com sucesso!');
            } else {
                alert('Ocorreu um erro ao tentar criar o curso.');
            }
        } catch (error) {
            console.error('Erro ao tentar criar o curso:', error);
            mensagem.textContent = 'Erro ao tentar se comunicar com a API.';
            mensagem.style.color = 'red';
            mensagem.style.display = 'block';
        }
    });
});
