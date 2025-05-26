// Configuração do banco de dados
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'biblioteca_laura'
};

// Funções para interação com o banco de dados
async function queryDatabase(sql, params = []) {
    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql, params })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarMensagem('error-message', 'Erro ao conectar com o servidor', 'error');
        return null;
    }
}

// Funções principais atualizadas
async function carregarLivros() {
    const loadingElement = document.getElementById('corpo-tabela-livros');
    loadingElement.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregando...</td></tr>';
    
    const result = await queryDatabase('SELECT l.*, e.pessoa_laura FROM livros_laura l LEFT JOIN emprestimos_laura e ON l.id_laura = e.id_livro_laura AND e.data_devolucao_laura IS NULL');
    
    if (!result || result.error) {
        mostrarMensagem('error-message', 'Erro ao carregar livros', 'error');
        return;
    }

    const corpoTabela = document.getElementById('corpo-tabela-livros');
    corpoTabela.innerHTML = '';
    
    if (result.data.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum livro cadastrado</td></tr>';
        return;
    }
    
    result.data.forEach(livro => {
        const linha = document.createElement('tr');
        const dataCadastro = new Date(livro.data_cadastro_laura).toLocaleDateString();
        
        linha.innerHTML = `
            <td>${livro.id_laura}</td>
            <td>${livro.titulo_laura}</td>
            <td>${livro.autor_laura}</td>
            <td>${livro.disciplina_laura}</td>
            <td><span class="${livro.disponivel_laura ? 'status-disponivel' : 'status-emprestado'}">
                ${livro.disponivel_laura ? 'Disponível' : 'Emprestado'}
            </span></td>
            <td>${livro.pessoa_laura || '-'}</td>
            <td class="data-cell">${dataCadastro}</td>
        `;
        
        corpoTabela.appendChild(linha);
    });
}

async function cadastrarLivro() {
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const disciplina = document.getElementById('disciplina').value;
    
    if (!titulo || !autor || !disciplina) {
        mostrarMensagem('cadastro-resultado', 'Todos os campos são obrigatórios!', 'error');
        return;
    }
    
    const btn = document.querySelector('#cadastro button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
    btn.disabled = true;
    
    const result = await queryDatabase(
        'INSERT INTO livros_laura (titulo_laura, autor_laura, disciplina_laura) VALUES (?, ?, ?)',
        [titulo, autor, disciplina]
    );
    
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    if (result && result.lastInsertId) {
        mostrarMensagem('cadastro-resultado', `Livro "${titulo}" cadastrado com sucesso! ID: ${result.lastInsertId}`, 'success');
        document.getElementById('titulo').value = '';
        document.getElementById('autor').value = '';
        document.getElementById('disciplina').value = '';
        carregarLivros();
    } else {
        mostrarMensagem('cadastro-resultado', 'Erro ao cadastrar livro', 'error');
    }
}

// Adicione funções similares para: registrarEmprestimo, registrarDevolucao, buscarLivros, gerarRelatorioEmprestimos

// Novas funções para edição e exclusão
async function editarLivro() {
    const id = document.getElementById('id-livro-edicao').value;
    const novoTitulo = document.getElementById('novo-titulo').value;
    const novoAutor = document.getElementById('novo-autor').value;
    const novaDisciplina = document.getElementById('nova-disciplina').value;
    
    if (!id) {
        mostrarMensagem('edicao-resultado', 'ID do livro é obrigatório!', 'error');
        return;
    }
    
    let updates = [];
    let params = [];
    
    if (novoTitulo) {
        updates.push('titulo_laura = ?');
        params.push(novoTitulo);
    }
    if (novoAutor) {
        updates.push('autor_laura = ?');
        params.push(novoAutor);
    }
    if (novaDisciplina) {
        updates.push('disciplina_laura = ?');
        params.push(novaDisciplina);
    }
    
    if (updates.length === 0) {
        mostrarMensagem('edicao-resultado', 'Nenhuma alteração fornecida', 'error');
        return;
    }
    
    params.push(id);
    const sql = `UPDATE livros_laura SET ${updates.join(', ')} WHERE id_laura = ?`;
    
    const result = await queryDatabase(sql, params);
    
    if (result && result.affectedRows > 0) {
        mostrarMensagem('edicao-resultado', 'Livro atualizado com sucesso!', 'success');
        carregarLivros();
    } else {
        mostrarMensagem('edicao-resultado', 'Erro ao atualizar livro', 'error');
    }
}

async function excluirLivro() {
    const id = document.getElementById('id-livro-edicao').value;
    
    if (!id) {
        mostrarMensagem('edicao-resultado', 'ID do livro é obrigatório!', 'error');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o livro ID ${id}? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    const result = await queryDatabase('DELETE FROM livros_laura WHERE id_laura = ?', [id]);
    
    if (result && result.affectedRows > 0) {
        mostrarMensagem('edicao-resultado', `Livro ID ${id} excluído com sucesso!`, 'success');
        document.getElementById('id-livro-edicao').value = '';
        document.getElementById('novo-titulo').value = '';
        document.getElementById('novo-autor').value = '';
        document.getElementById('nova-disciplina').value = '';
        carregarLivros();
    } else {
        mostrarMensagem('edicao-resultado', 'Erro ao excluir livro', 'error');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarLivros();
    setupBuscaInstantanea();
    setupTooltips();
});