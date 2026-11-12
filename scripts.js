const formulario = document.getElementById('formCadastro');
const campoCep = document.getElementById('cep');
const mensagemCep = document.getElementById('mensagemCep');
const mensagemForm = document.getElementById('mensagemForm');
const chaveArmazenamento = 'cadastroUsuario';

const campos = [
  'nome', 'email', 'cep', 'logradouro', 'numero',
  'complemento', 'bairro', 'cidade', 'uf'
];

// Salva os valores do formulário no localStorage.
function salvarDados() {
  const dados = {};
  campos.forEach((id) => {
    dados[id] = document.getElementById(id).value;
  });
  localStorage.setItem(chaveArmazenamento, JSON.stringify(dados));
}

// Recupera os valores salvos quando a página abre.
function restaurarDados() {
  try {
    const dados = JSON.parse(localStorage.getItem(chaveArmazenamento));
    if (!dados || typeof dados !== 'object') return;

    campos.forEach((id) => {
      if (typeof dados[id] === 'string') {
        document.getElementById(id).value = dados[id];
      }
    });
  } catch (erro) {
    console.error('Não foi possível restaurar os dados:', erro);
  }
}

// Busca o endereço na API pública do ViaCEP.
async function buscarCep() {
  const cep = campoCep.value.replace(/\D/g, '');
  if (cep.length !== 8) {
    mensagemCep.textContent = 'Digite um CEP com 8 números.';
    return;
  }

  mensagemCep.textContent = 'Buscando endereço...';
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) throw new Error('Falha na consulta do CEP.');

    const endereco = await resposta.json();
    // Ignora uma resposta antiga caso o CEP tenha sido alterado durante a busca.
    if (campoCep.value.replace(/\D/g, '') !== cep) return;
    if (endereco.erro) {
      mensagemCep.textContent = 'CEP não encontrado. Confira e tente novamente.';
      return;
    }

    document.getElementById('logradouro').value = endereco.logradouro || '';
    document.getElementById('bairro').value = endereco.bairro || '';
    document.getElementById('cidade').value = endereco.localidade || '';
    document.getElementById('uf').value = endereco.uf || '';
    mensagemCep.textContent = 'Endereço encontrado! Complete o número, se necessário.';
    salvarDados();
  } catch (erro) {
    console.error('Erro ao buscar CEP:', erro);
    mensagemCep.textContent = 'Não foi possível consultar o CEP. Tente novamente.';
  }
}

// Ao digitar, salva os dados. Ao completar o CEP, faz a consulta.
formulario.addEventListener('input', (evento) => {
  mensagemForm.textContent = '';
  if (evento.target === campoCep) {
    const numeros = campoCep.value.replace(/\D/g, '').slice(0, 8);
    campoCep.value = numeros.length > 5
      ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
      : numeros;
    mensagemCep.textContent = '';
    if (numeros.length === 8) buscarCep();
  }
  salvarDados();
});

campoCep.addEventListener('blur', () => {
  if (campoCep.value && campoCep.value.replace(/\D/g, '').length !== 8) {
    mensagemCep.textContent = 'Digite um CEP com 8 números.';
  }
});

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  salvarDados();
  mensagemForm.textContent = 'Cadastro salvo neste navegador com sucesso!';
});

document.getElementById('limpar').addEventListener('click', () => {
  formulario.reset();
  localStorage.removeItem(chaveArmazenamento);
  mensagemCep.textContent = '';
  mensagemForm.textContent = 'Dados apagados deste navegador.';
});

restaurarDados();
