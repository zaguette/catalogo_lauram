// Função para mostrar apenas a seção selecionada
function mostrarSecao(secaoId) {
    // Esconde todas as seções
    document.querySelectorAll('.secao').forEach(secao => {
        secao.classList.add('hidden');
    });
    
    // Mostra apenas a seção selecionada
    document.getElementById(secaoId).classList.remove('hidden');
}

// Inicializa mostrando a seção de cadastro
mostrarSecao('cadastro');

// Dados simulados para demonstração
let livros = [
    { id: 1, titulo: "Python para Iniciantes", autor: "Ana Silva", disciplina: "Programação", disponivel: false, pessoa: "João da Silva" },
    { id: 2, titulo: "Matemática Avançada", autor: "Carlos Souza", disciplina: "Matemática", disponivel: true, pessoa: "" },
    { id: 3, titulo: "Literatura Brasileira", autor: "Ana Paula", disciplina: "Português", disponivel: true, pessoa: "" },
    { id: 4, titulo: "Introdução à Programação", autor: "Laura Silva", disciplina: "Computação", disponivel: false, pessoa: "Maria Santos" }
];

let emprestimos = [
    { id: 1, idLivro: 1, livro: "Python para Iniciantes", pessoa: "João da Silva", dataEmprestimo: "2023-05-10", dataDevolucao: "" },
    { id: 2, idLivro: 4, livro: "Introdução à Programação", pessoa: "Maria Santos", dataEmprestimo: "2023-05-15", dataDevolucao: "" },
    { id: 3, idLivro: 2, livro: "Matemática Avançada", pessoa: "Carlos Oliveira", dataEmprestimo: "2023-04-20", dataDevolucao: "2023-05-05" }
];

function cadastrarLivro() {
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const disciplina = document.getElementById('disciplina').value;
    
    if (!titulo || !autor || !disciplina) {
        document.getElementById('cadastro-resultado').innerHTML = 
            '<p style="color: red;">Todos os campos são obrigatórios!</p>';
        return;
    }
    
    // Cria novo livro
    const novoLivro = {
        id: livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1,
        titulo: titulo,
        autor: autor,
        disciplina: disciplina,
        disponivel: true,
        pessoa: ""
    };
    
    livros.push(novoLivro);
    
    document.getElementById('cadastro-resultado').innerHTML = 
        `<p style="color: green;">Livro "${titulo}" cadastrado com sucesso! ID: ${novoLivro.id}</p>`;
    
    // Limpa os campos
    document.getElementById('titulo').value = '';
    document.getElementById('autor').value = '';
    document.getElementById('disciplina').value = '';
}

function registrarEmprestimo() {
    const idLivro = parseInt(document.getElementById('id-livro-emprestimo').value);
    const pessoa = document.getElementById('pessoa').value;
    
    if (!idLivro || !pessoa) {
        document.getElementById('emprestimo-resultado').innerHTML = 
            '<p style="color: red;">Todos os campos são obrigatórios!</p>';
        return;
    }
    
    // Encontra o livro
    const livro = livros.find(l => l.id === idLivro);
    
    if (!livro) {
        document.getElementById('emprestimo-resultado').innerHTML = 
            '<p style="color: red;">Livro não encontrado!</p>';
        return;
    }
    
    if (!livro.disponivel) {
        document.getElementById('emprestimo-resultado').innerHTML = 
            `<p style="color: red;">Livro já está emprestado para ${livro.pessoa}!</p>`;
        return;
    }
    
    // Atualiza status do livro
    livro.disponivel = false;
    livro.pessoa = pessoa;
    
    // Registra empréstimo
    const novoEmprestimo = {
        id: emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1,
        idLivro: idLivro,
        livro: livro.titulo,
        pessoa: pessoa,
        dataEmprestimo: new Date().toISOString().split('T')[0],
        dataDevolucao: ""
    };
    
    emprestimos.push(novoEmprestimo);
    
    document.getElementById('emprestimo-resultado').innerHTML = 
        `<p style="color: green;">Empréstimo registrado com sucesso! Livro ID ${idLivro} emprestado para ${pessoa}</p>`;
    
    // Limpa os campos
    document.getElementById('id-livro-emprestimo').value = '';
    document.getElementById('pessoa').value = '';
}

function registrarDevolucao() {
    const idLivro = parseInt(document.getElementById('id-livro-devolucao').value);
    
    if (!idLivro) {
        document.getElementById('devolucao-resultado').innerHTML = 
            '<p style="color: red;">O ID do livro é obrigatório!</p>';
        return;
    }
    
    // Encontra o livro
    const livro = livros.find(l => l.id === idLivro);
    
    if (!livro) {
        document.getElementById('devolucao-resultado').innerHTML = 
            '<p style="color: red;">Livro não encontrado!</p>';
        return;
    }
    
    if (livro.disponivel) {
        document.getElementById('devolucao-resultado').innerHTML = 
            '<p style="color: red;">Este livro já está disponível!</p>';
        return;
    }
    
    // Atualiza status do livro
    livro.disponivel = true;
    livro.pessoa = "";
    
    // Atualiza empréstimo
    const emprestimo = emprestimos.find(e => e.idLivro === idLivro && !e.dataDevolucao);
    if (emprestimo) {
        emprestimo.dataDevolucao = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('devolucao-resultado').innerHTML = 
        `<p style="color: green;">Devolução registrada com sucesso! Livro ID ${idLivro} foi devolvido.</p>`;
    
    // Limpa o campo
    document.getElementById('id-livro-devolucao').value = '';
}

function carregarLivros() {
    const corpoTabela = document.getElementById('corpo-tabela-livros');
    corpoTabela.innerHTML = '';
    
    livros.forEach(livro => {
        const linha = document.createElement('tr');
        
        linha.innerHTML = `
            <td>${livro.id}</td>
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${livro.disciplina}</td>
            <td class="${livro.disponivel ? 'status-disponivel' : 'status-emprestado'}">
                ${livro.disponivel ? 'Disponível' : 'Emprestado'}
            </td>
            <td>${livro.pessoa || '-'}</td>
        `;
        
        corpoTabela.appendChild(linha);
    });
}

function buscarLivros() {
    const termo = document.getElementById('termo-busca').value.toLowerCase();
    
    // Filtra os livros pelo termo de busca
    const resultados = livros.filter(livro => 
        livro.titulo.toLowerCase().includes(termo) || 
        livro.autor.toLowerCase().includes(termo) || 
        livro.disciplina.toLowerCase().includes(termo)
    );
    
    const corpoTabela = document.getElementById('corpo-tabela-busca');
    corpoTabela.innerHTML = '';
    
    if (resultados.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum livro encontrado</td></tr>';
        return;
    }
    
    resultados.forEach(livro => {
        const linha = document.createElement('tr');
        
        linha.innerHTML = `
            <td>${livro.id}</td>
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${livro.disciplina}</td>
            <td class="${livro.disponivel ? 'status-disponivel' : 'status-emprestado'}">
                ${livro.disponivel ? 'Disponível' : 'Emprestado'}
            </td>
        `;
        
        corpoTabela.appendChild(linha);
    });
}

function gerarRelatorioEmprestimos() {
    const corpoTabela = document.getElementById('corpo-tabela-relatorios');
    corpoTabela.innerHTML = '';
    
    emprestimos.forEach(emp => {
        const linha = document.createElement('tr');
        
        linha.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.livro}</td>
            <td>${emp.pessoa}</td>
            <td>${emp.dataEmprestimo}</td>
            <td>${emp.dataDevolucao || 'Pendente'}</td>
        `;
        
        corpoTabela.appendChild(linha);
    });
}