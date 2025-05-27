// Armazenamento de dados no localStorage
const DB_NAME = 'biblioteca_laura';

// Função para exibir mensagens na tela
function mostrarMensagem(idElemento, mensagem, tipo) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.className = "resultado-message " + (tipo === "error" ? "error" : "success");
    setTimeout(() => {
        elemento.textContent = "";
        elemento.className = "resultado-message";
    }, 4000);
}

// Função para mostrar/esconder seções
function mostrarSecao(secaoId) {
    document.querySelectorAll('.secao').forEach(secao => {
        secao.classList.add('hidden');
    });
    
    const secaoSelecionada = document.getElementById(secaoId);
    if (secaoSelecionada) {
        secaoSelecionada.classList.remove('hidden');
    }
    
    if (secaoId === 'listagem') {
        carregarLivros();
    }
}

// Funções para manipular o "banco de dados" local
function getDatabase() {
    const db = localStorage.getItem(DB_NAME);
    return db ? JSON.parse(db) : { livros: [], emprestimos: [] };
}

function saveDatabase(db) {
    localStorage.setItem(DB_NAME, JSON.stringify(db));
}

// Função para carregar livros e mostrar na tabela
function carregarLivros() {
    const db = getDatabase();
    const corpoTabela = document.getElementById("corpo-tabela-livros");
    corpoTabela.innerHTML = "";

    if (db.livros.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum livro cadastrado</td></tr>';
        return;
    }

    db.livros.forEach(livro => {
        const emprestimoAtivo = db.emprestimos.find(e => 
            e.id_livro === livro.id && !e.data_devolucao
        );
        
        const linha = document.createElement("tr");
        const dataCadastro = new Date(livro.data_cadastro).toLocaleDateString();

        linha.innerHTML = `
            <td>${livro.id}</td>
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${livro.disciplina}</td>
            <td><span class="${!emprestimoAtivo ? "status-disponivel" : "status-emprestado"}">${!emprestimoAtivo ? "Disponível" : "Emprestado"}</span></td>
            <td>${emprestimoAtivo ? emprestimoAtivo.pessoa : "-"}</td>
            <td class="data-cell">${dataCadastro}</td>
        `;

        corpoTabela.appendChild(linha);
    });
}

// Função para cadastrar livro
function cadastrarLivro() {
    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const disciplina = document.getElementById("disciplina").value.trim();

    if (!titulo || !autor || !disciplina) {
        mostrarMensagem("cadastro-resultado", "Todos os campos são obrigatórios!", "error");
        return;
    }

    const db = getDatabase();
    const novoId = db.livros.length > 0 ? Math.max(...db.livros.map(l => l.id)) + 1 : 1;
    
    const novoLivro = {
        id: novoId,
        titulo,
        autor,
        disciplina,
        data_cadastro: new Date().toISOString()
    };

    db.livros.push(novoLivro);
    saveDatabase(db);

    mostrarMensagem(
        "cadastro-resultado",
        `Livro "${titulo}" cadastrado com sucesso! ID: ${novoId}`,
        "success"
    );
    
    document.getElementById("titulo").value = "";
    document.getElementById("autor").value = "";
    document.getElementById("disciplina").value = "";
    carregarLivros();
}

// Função para registrar empréstimo
function registrarEmprestimo() {
    const idLivro = parseInt(document.getElementById("id-livro-emprestimo").value.trim());
    const pessoa = document.getElementById("pessoa").value.trim();

    if (!idLivro || !pessoa) {
        mostrarMensagem("emprestimo-resultado", "Todos os campos são obrigatórios!", "error");
        return;
    }

    const db = getDatabase();
    const livro = db.livros.find(l => l.id === idLivro);
    
    if (!livro) {
        mostrarMensagem("emprestimo-resultado", "Livro não encontrado!", "error");
        return;
    }

    // Verifica se já está emprestado
    const emprestimoAtivo = db.emprestimos.find(e => 
        e.id_livro === idLivro && !e.data_devolucao
    );
    
    if (emprestimoAtivo) {
        mostrarMensagem("emprestimo-resultado", "Este livro já está emprestado!", "error");
        return;
    }

    const novoEmprestimo = {
        id_livro: idLivro,
        pessoa,
        data_emprestimo: new Date().toISOString(),
        data_devolucao: null
    };

    db.emprestimos.push(novoEmprestimo);
    saveDatabase(db);

    mostrarMensagem("emprestimo-resultado", "Empréstimo registrado com sucesso!", "success");
    document.getElementById("id-livro-emprestimo").value = "";
    document.getElementById("pessoa").value = "";
    carregarLivros();
}

// Função para registrar devolução
function registrarDevolucao() {
    const idLivro = parseInt(document.getElementById("id-livro-devolucao").value.trim());

    if (!idLivro) {
        mostrarMensagem("devolucao-resultado", "ID do livro é obrigatório!", "error");
        return;
    }

    const db = getDatabase();
    const emprestimo = db.emprestimos.find(e => 
        e.id_livro === idLivro && !e.data_devolucao
    );
    
    if (!emprestimo) {
        mostrarMensagem("devolucao-resultado", "Nenhum empréstimo ativo encontrado para este livro!", "error");
        return;
    }

    emprestimo.data_devolucao = new Date().toISOString();
    saveDatabase(db);

    mostrarMensagem("devolucao-resultado", "Devolução registrada com sucesso!", "success");
    document.getElementById("id-livro-devolucao").value = "";
    carregarLivros();
}

// Inicialização dos eventos
document.addEventListener("DOMContentLoaded", function () {
    // Mostra a seção de cadastro por padrão
    mostrarSecao('cadastro');
    
    // Associa os eventos aos botões
    document.getElementById("btnCadastrar").addEventListener("click", cadastrarLivro);
    
    // Adiciona eventos para os botões que estavam com onclick no HTML
    document.querySelector("button[onclick=\"registrarEmprestimo()\"]").addEventListener("click", registrarEmprestimo);
    document.querySelector("button[onclick=\"registrarDevolucao()\"]").addEventListener("click", registrarDevolucao);
    
    // Remove os atributos onclick do HTML
    document.querySelector("button[onclick=\"registrarEmprestimo()\"]").removeAttribute("onclick");
    document.querySelector("button[onclick=\"registrarDevolucao()\"]").removeAttribute("onclick");
    
    // Carrega os livros se estiver na seção de listagem
    if (!document.getElementById('listagem').classList.contains('hidden')) {
        carregarLivros();
    }
});