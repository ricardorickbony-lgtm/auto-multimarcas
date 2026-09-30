/**
 * admin.js - Lógica do Painel de Gestão de Estoque do Lojista
 * Auto Multimarcas - Padrão Ricardo & Severino
 */

let filtroStatusAdmin = 'todos';
let termoBuscaAdmin = '';

document.addEventListener('DOMContentLoaded', () => {
  atualizarDashboard();
  configurarEventosAdmin();
  configurarFormulario();
});

function atualizarDashboard() {
  renderizarMetricas();
  renderizarTabela();
}

function renderizarMetricas() {
  const stats = EstoqueDB.obterEstatisticas();

  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-disponiveis').textContent = stats.disponiveis;
  document.getElementById('stat-vendidos').textContent = stats.vendidos;
  document.getElementById('stat-valor').textContent = EstoqueDB.formatarPreco(stats.valorEstoque);

  // Contadores nas abas
  document.getElementById('tab-count-todos').textContent = stats.total;
  document.getElementById('tab-count-disp').textContent = stats.disponiveis;
  document.getElementById('tab-count-vend').textContent = stats.vendidos;
}

function renderizarTabela() {
  const tbody = document.getElementById('admin-tabela-veiculos');
  const semCarros = document.getElementById('admin-sem-carros');
  if (!tbody) return;

  const todos = EstoqueDB.obterVeiculos();

  const filtrados = todos.filter(carro => {
    // Filtro de status da aba
    if (filtroStatusAdmin === 'disponivel' && carro.status !== 'disponivel') return false;
    if (filtroStatusAdmin === 'vendido' && carro.status !== 'vendido') return false;

    // Filtro de busca textual
    if (termoBuscaAdmin) {
      const termo = termoBuscaAdmin.toLowerCase();
      const match = 
        carro.marca.toLowerCase().includes(termo) ||
        carro.modelo.toLowerCase().includes(termo) ||
        (carro.placaFinal && carro.placaFinal.includes(termo));
      if (!match) return false;
    }

    return true;
  });

  if (filtrados.length === 0) {
    tbody.innerHTML = '';
    semCarros.classList.remove('hidden');
    return;
  }

  semCarros.classList.add('hidden');
  tbody.innerHTML = '';

  filtrados.forEach(carro => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors';

    let badgeClass = 'badge-disponivel';
    let badgeTexto = 'Disponível';
    if (carro.status === 'reservado') {
      badgeClass = 'badge-reservado';
      badgeTexto = 'Reservado';
    } else if (carro.status === 'vendido') {
      badgeClass = 'badge-vendido';
      badgeTexto = 'Vendido';
    }

    const precoFmt = EstoqueDB.formatarPreco(carro.preco);
    const kmFmt = EstoqueDB.formatarKm(carro.km);

    tr.innerHTML = `
      <!-- Veículo / Foto / Nome -->
      <td class="py-3.5 px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <img src="${carro.foto}" alt="" class="w-14 h-11 rounded-lg object-cover bg-slate-200 border border-slate-200 flex-shrink-0">
          <div>
            <div class="font-bold text-slate-900">${carro.marca} ${carro.modelo}</div>
            <div class="text-xs text-slate-500 font-medium">Placa final ${carro.placaFinal} • ${carro.cor} • ${carro.carroceria}</div>
          </div>
        </div>
      </td>

      <!-- Ano / Km -->
      <td class="py-3.5 px-4 text-xs text-slate-600">
        <div class="font-semibold text-slate-800">${carro.anoFabricacao}/${carro.anoModelo}</div>
        <div>${kmFmt}</div>
      </td>

      <!-- Valor -->
      <td class="py-3.5 px-4">
        <span class="font-black text-slate-900">${precoFmt}</span>
      </td>

      <!-- Status Atual -->
      <td class="py-3.5 px-4">
        <span class="badge-status ${badgeClass}">${badgeTexto}</span>
      </td>

      <!-- Destaque Toggle -->
      <td class="py-3.5 px-4 text-center">
        <button data-action="toggle-destaque" data-id="${carro.id}" class="text-lg hover:scale-125 transition-transform" title="${carro.destaque ? 'Remover dos Destaques' : 'Destacar na Vitrine'}">
          ${carro.destaque ? '⭐' : '☆'}
        </button>
      </td>

      <!-- Ações Rápidas -->
      <td class="py-3.5 px-4 sm:px-6 text-right">
        <div class="inline-flex items-center gap-1.5">
          
          <!-- Botão Vender/Reativar em 1 Clique -->
          ${carro.status === 'disponivel' ? `
            <button data-action="marcar-vendido" data-id="${carro.id}" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs px-2.5 py-1.5 rounded-lg transition" title="Marcar como Vendido">
              ✓ Marcar Vendido
            </button>
          ` : `
            <button data-action="marcar-disponivel" data-id="${carro.id}" class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 font-bold text-xs px-2.5 py-1.5 rounded-lg transition" title="Reativar como Disponível">
              ↻ Reativar
            </button>
          `}

          <!-- Botão Editar -->
          <button data-action="editar" data-id="${carro.id}" class="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs font-semibold transition" title="Editar Veículo">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>

          <!-- Botão Excluir -->
          <button data-action="excluir" data-id="${carro.id}" class="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg text-xs font-semibold transition" title="Remover do Estoque">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>

        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function configurarEventosAdmin() {
  const buscaInput = document.getElementById('admin-busca');
  const tabs = document.querySelectorAll('.admin-tab-btn');
  const btnRestaurar = document.getElementById('btn-restaurar-dados');

  if (buscaInput) {
    buscaInput.addEventListener('input', (e) => {
      termoBuscaAdmin = e.target.value.trim();
      renderizarTabela();
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-slate-900', 'text-white');
        t.classList.add('bg-white', 'text-slate-700');
      });
      tab.classList.remove('bg-white', 'text-slate-700');
      tab.classList.add('bg-slate-900', 'text-white');

      filtroStatusAdmin = tab.dataset.adminFiltro;
      renderizarTabela();
    });
  });

  if (btnRestaurar) {
    btnRestaurar.addEventListener('click', () => {
      if (confirm('Deseja restaurar os veículos de demonstração iniciais?')) {
        EstoqueDB.restaurarDemonstracao();
        atualizarDashboard();
        mostrarToast('Veículos de demonstração restaurados com sucesso!');
      }
    });
  }

  // Delegação de eventos nas ações da tabela
  document.getElementById('admin-tabela-veiculos').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'marcar-vendido') {
      EstoqueDB.alterarStatus(id, 'vendido');
      atualizarDashboard();
      mostrarToast('Veículo marcado como VENDIDO no site!');
    } else if (action === 'marcar-disponivel') {
      EstoqueDB.alterarStatus(id, 'disponivel');
      atualizarDashboard();
      mostrarToast('Veículo reativado como DISPONÍVEL na vitrine!');
    } else if (action === 'toggle-destaque') {
      EstoqueDB.alternarDestaque(id);
      atualizarDashboard();
      mostrarToast('Status de destaque atualizado!');
    } else if (action === 'editar') {
      abrirFormularioEditar(id);
    } else if (action === 'excluir') {
      if (confirm('Tem certeza que deseja remover este veículo permanentemente do estoque?')) {
        EstoqueDB.excluirVeiculo(id);
        atualizarDashboard();
        mostrarToast('Veículo removido com sucesso!');
      }
    }
  });
}

function configurarFormulario() {
  const modal = document.getElementById('modal-form-veiculo');
  const btnNovo = document.getElementById('btn-novo-veiculo');
  const btnFechar = document.getElementById('btn-fechar-form-modal');
  const btnCancelar = document.getElementById('btn-cancelar-form');
  const form = document.getElementById('form-veiculo');
  const fileInput = document.getElementById('form-foto-file');
  const fotoUrlInput = document.getElementById('form-foto-url');
  const previewImg = document.getElementById('form-foto-preview');
  const previewContainer = document.getElementById('form-foto-preview-container');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('form-id').value = '';
      document.getElementById('form-modal-titulo').textContent = 'Cadastrar Novo Veículo';
      previewContainer.classList.add('hidden');
      modal.classList.remove('hidden');
    });
  }

  const fecharModal = () => modal.classList.add('hidden');
  if (btnFechar) btnFechar.addEventListener('click', fecharModal);
  if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);

  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) fecharModal();
  });

  // Upload de arquivo de imagem com conversão para Base64
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          fotoUrlInput.value = event.target.result;
          previewImg.src = event.target.result;
          previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Preenchimento de foto demo ao clicar nos botões rápidos
  document.querySelectorAll('.btn-foto-demo').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      fotoUrlInput.value = url;
      previewImg.src = url;
      previewContainer.classList.remove('hidden');
    });
  });

  // Atualiza preview ao digitar URL
  if (fotoUrlInput) {
    fotoUrlInput.addEventListener('input', () => {
      if (fotoUrlInput.value.trim()) {
        previewImg.src = fotoUrlInput.value.trim();
        previewContainer.classList.remove('hidden');
      } else {
        previewContainer.classList.add('hidden');
      }
    });
  }

  // Submissão do Formulário
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('form-id').value;
      const tagsString = document.getElementById('form-tags').value;
      const tagsArray = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : ['Revisado'];

      const dadosCarro = {
        marca: document.getElementById('form-marca').value.trim(),
        modelo: document.getElementById('form-modelo').value.trim(),
        anoFabricacao: parseInt(document.getElementById('form-ano-fab').value) || new Date().getFullYear(),
        anoModelo: parseInt(document.getElementById('form-ano-mod').value) || new Date().getFullYear(),
        preco: parseFloat(document.getElementById('form-preco').value) || 0,
        km: parseInt(document.getElementById('form-km').value) || 0,
        cor: document.getElementById('form-cor').value.trim() || 'Branco',
        cambio: document.getElementById('form-cambio').value,
        combustivel: document.getElementById('form-combustivel').value,
        carroceria: document.getElementById('form-carroceria').value,
        status: document.getElementById('form-status').value,
        foto: document.getElementById('form-foto-url').value.trim() || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
        tags: tagsArray,
        descricao: document.getElementById('form-descricao').value.trim(),
        destaque: document.getElementById('form-destaque').checked
      };

      if (id) {
        // Atualização
        EstoqueDB.atualizarVeiculo(id, dadosCarro);
        mostrarToast('Veículo atualizado com sucesso no site!');
      } else {
        // Novo Cadastro
        EstoqueDB.adicionarVeiculo(dadosCarro);
        mostrarToast('Novo veículo publicado na vitrine!');
      }

      fecharModal();
      atualizarDashboard();
    });
  }
}

function abrirFormularioEditar(id) {
  const carro = EstoqueDB.obterPorId(id);
  if (!carro) return;

  const modal = document.getElementById('modal-form-veiculo');
  document.getElementById('form-modal-titulo').textContent = 'Editar Veículo';
  document.getElementById('form-id').value = carro.id;
  document.getElementById('form-marca').value = carro.marca;
  document.getElementById('form-modelo').value = carro.modelo;
  document.getElementById('form-ano-fab').value = carro.anoFabricacao;
  document.getElementById('form-ano-mod').value = carro.anoModelo;
  document.getElementById('form-preco').value = carro.preco;
  document.getElementById('form-km').value = carro.km;
  document.getElementById('form-cor').value = carro.cor;
  document.getElementById('form-cambio').value = carro.cambio;
  document.getElementById('form-combustivel').value = carro.combustivel;
  document.getElementById('form-carroceria').value = carro.carroceria;
  document.getElementById('form-status').value = carro.status;
  document.getElementById('form-foto-url').value = carro.foto;
  document.getElementById('form-tags').value = (carro.tags || []).join(', ');
  document.getElementById('form-descricao').value = carro.descricao || '';
  document.getElementById('form-destaque').checked = Boolean(carro.destaque);

  const previewImg = document.getElementById('form-foto-preview');
  const previewContainer = document.getElementById('form-foto-preview-container');
  if (carro.foto) {
    previewImg.src = carro.foto;
    previewContainer.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
}

function mostrarToast(mensagem) {
  const toast = document.getElementById('toast-aviso');
  const texto = document.getElementById('toast-texto');
  if (!toast || !texto) return;

  texto.textContent = mensagem;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3500);
}
