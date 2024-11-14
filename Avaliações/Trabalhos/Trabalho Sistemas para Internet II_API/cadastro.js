const cadastroFormSubmit = document.getElementById('cadastro-form-submit');
if (cadastroFormSubmit) {
    cadastroFormSubmit.addEventListener('submit', async function(event) {
        event.preventDefault();
        const nome = document.getElementById('nome').value;
        const matricula = document.getElementById('matricula').value;
        const senha = document.getElementById('senha').value;
        const curso_id = document.getElementById('curso_id').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, matricula, senha, curso_id })
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Erro ao cadastrar.');
        }
    });
};