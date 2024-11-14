async function carregarCursos() {
    const selectElement = document.getElementById('curso_id');
    if (selectElement) {
        try {
            const response = await fetch('http://127.0.0.1:5000/listar_cursos');
            if (!response.ok) {
                throw new Error('Erro ao carregar os cursos');
            }
            const cursos = await response.json();
            
            cursos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.id;
                option.textContent = curso.nome_curso;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(error);
        }
    }
}
document.addEventListener('DOMContentLoaded', function() {
    carregarCursos();
});