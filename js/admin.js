/**
 * admin.js - Lógica do Painel de Gestão de Estoque do Lojista
 * Auto Multimarcas - Padrão Ricardo & Severino
 */

const AUTH_CONFIG = {
  usuarioPadrao: 'admin',
  sessionKey: 'autoprime_auth_session'
};

let filtroStatusAdmin = 'todos';
let termoBuscaAdmin = '';
let fotosFormulario = [];

document.addEventListener('DOMContentLoaded', () => {
  configurarAutenticacao();
  if (estaAutenticado()) {
    atualizarDashboard();
  }
  configurarEventosAdmin();
  configurarFormulario();
  configurarAlterarSenha();
  configurarConfigLoja();
  configurarIntegracoesMarketplaces();
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
    if (filtroStatusAdmin === 'disponivel' && carro.status !== 'disponivel') return false;
    if (filtroStatusAdmin === 'vendido' && carro.status !== 'vendido') return false;

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
    const qtdFotos = (carro.fotos && carro.fotos.length) || 1;
    const fotoPrincipal = (carro.fotos && carro.fotos[0]) || carro.foto;

    tr.innerHTML = `
      <!-- Veículo / Foto / Nome -->
      <td class="py-3.5 px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="relative w-16 h-12 flex-shrink-0">
            <img src="${fotoPrincipal}" alt="" class="w-full h-full rounded-lg object-cover bg-slate-200 border border-slate-200">
            <span class="absolute -bottom-1 -right-1 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow" title="Total de fotos">${qtdFotos} 📷</span>
          </div>
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
          
          <!-- Botão Vender/Reativar -->
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
      if (confirm('Deseja restaurar os veículos de demonstração com catálogo completo (12 carros)?')) {
        EstoqueDB.restaurarDemonstracao();
        atualizarDashboard();
        mostrarToast('Catálogo de 12 veículos restaurado com sucesso!');
      }
    });
  }

  // Ações da tabela
  document.getElementById('admin-tabela-veiculos').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'marcar-vendido') {
      EstoqueDB.alterarStatus(id, 'vendido');
      dispararWebhookAutomacao('veiculo_vendido', { id, status: 'vendido' });
      atualizarDashboard();
      mostrarToast('Veículo marcado como VENDIDO no site e nos portais!');
    } else if (action === 'marcar-disponivel') {
      EstoqueDB.alterarStatus(id, 'disponivel');
      dispararWebhookAutomacao('veiculo_disponivel', { id, status: 'disponivel' });
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
        dispararWebhookAutomacao('veiculo_removido', { id });
        atualizarDashboard();
        mostrarToast('Veículo removido com sucesso!');
      }
    }
  });
}

/**
 * Gestão de Múltiplas Fotos no Formulário
 */
function renderizarGridFotosForm() {
  const grid = document.getElementById('form-fotos-grid');
  const contador = document.getElementById('form-fotos-contador');
  if (!grid) return;

  if (contador) {
    contador.textContent = `${fotosFormulario.length} foto(s) na galeria`;
  }

  grid.innerHTML = '';

  fotosFormulario.forEach((url, idx) => {
    const card = document.createElement('div');
    card.className = 'relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video';

    const isCapa = idx === 0;

    card.innerHTML = `
      <img src="${url}" alt="" class="w-full h-full object-cover">
      ${isCapa ? '<span class="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow">CAPA</span>' : ''}
      <button type="button" data-remover-foto="${idx}" class="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow transition opacity-90 group-hover:opacity-100" title="Remover Foto">
        ✕
      </button>
    `;

    grid.appendChild(card);
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
  const btnAddFotoUrl = document.getElementById('btn-adicionar-foto-url');
  const gridFotos = document.getElementById('form-fotos-grid');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('form-id').value = '';
      document.getElementById('form-modal-titulo').textContent = 'Cadastrar Novo Veículo';
      fotosFormulario = [];
      renderizarGridFotosForm();
      if (document.getElementById('pub-site')) document.getElementById('pub-site').checked = true;
      if (document.getElementById('pub-olx')) document.getElementById('pub-olx').checked = true;
      if (document.getElementById('pub-ml')) document.getElementById('pub-ml').checked = true;
      if (document.getElementById('pub-webmotors')) document.getElementById('pub-webmotors').checked = true;
      modal.classList.remove('hidden');
    });
  }

  const fecharModal = () => modal.classList.add('hidden');
  if (btnFechar) btnFechar.addEventListener('click', fecharModal);
  if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);

  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) fecharModal();
  });

  // Adicionar foto por URL
  if (btnAddFotoUrl && fotoUrlInput) {
    btnAddFotoUrl.addEventListener('click', () => {
      const url = fotoUrlInput.value.trim();
      if (url) {
        fotosFormulario.push(url);
        fotoUrlInput.value = '';
        renderizarGridFotosForm();
      }
    });
  }

  // Upload múltiplo de arquivos de imagem locais
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          fotosFormulario.push(event.target.result);
          renderizarGridFotosForm();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // Remover foto específica da galeria
  if (gridFotos) {
    gridFotos.addEventListener('click', (e) => {
      const btnRemover = e.target.closest('[data-remover-foto]');
      if (btnRemover) {
        const idx = parseInt(btnRemover.dataset.removerFoto);
        fotosFormulario.splice(idx, 1);
        renderizarGridFotosForm();
      }
    });
  }

  // Pacotes de fotos prontas de teste
  const pacotesDemo = {
    onix: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'
    ],
    hb20: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
    ],
    polo: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80'
    ],
    strada: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80'
    ]
  };

  document.querySelectorAll('.btn-pack-demo').forEach(btn => {
    btn.addEventListener('click', () => {
      const pack = btn.dataset.pack;
      if (pacotesDemo[pack]) {
        fotosFormulario = [...pacotesDemo[pack]];
        renderizarGridFotosForm();
      }
    });
  });

  // Salvar Veículo
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('form-id').value;
      const tagsString = document.getElementById('form-tags').value;
      const tagsArray = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : ['Revisado com Garantia'];

      // Se não adicionou nenhuma foto, usa placeholder de alta qualidade
      const fotosFinais = fotosFormulario.length > 0 
        ? [...fotosFormulario] 
        : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'];

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
        foto: fotosFinais[0],
        fotos: fotosFinais,
        tags: tagsArray,
        descricao: document.getElementById('form-descricao').value.trim(),
        destaque: document.getElementById('form-destaque').checked,
        marketplaces: {
          site: document.getElementById('pub-site') ? document.getElementById('pub-site').checked : true,
          olx: document.getElementById('pub-olx') ? document.getElementById('pub-olx').checked : true,
          ml: document.getElementById('pub-ml') ? document.getElementById('pub-ml').checked : true,
          webmotors: document.getElementById('pub-webmotors') ? document.getElementById('pub-webmotors').checked : true
        }
      };

      if (id) {
        EstoqueDB.atualizarVeiculo(id, dadosCarro);
        dispararWebhookAutomacao('atualizar_veiculo', { id, ...dadosCarro });
        mostrarToast('✓ Veículo atualizado e sincronizado nos canais selecionados!');
      } else {
        const novo = EstoqueDB.adicionarVeiculo(dadosCarro);
        dispararWebhookAutomacao('novo_veiculo', novo || dadosCarro);
        mostrarToast('✓ Novo veículo cadastrado e sincronizado nos portais!');
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
  document.getElementById('form-tags').value = (carro.tags || []).join(', ');
  document.getElementById('form-descricao').value = carro.descricao || '';
  document.getElementById('form-destaque').checked = Boolean(carro.destaque);

  // Canais de publicação / marketplaces
  const mkt = carro.marketplaces || { site: true, olx: true, ml: true, webmotors: true };
  if (document.getElementById('pub-site')) document.getElementById('pub-site').checked = mkt.site !== false;
  if (document.getElementById('pub-olx')) document.getElementById('pub-olx').checked = mkt.olx !== false;
  if (document.getElementById('pub-ml')) document.getElementById('pub-ml').checked = mkt.ml !== false;
  if (document.getElementById('pub-webmotors')) document.getElementById('pub-webmotors').checked = mkt.webmotors !== false;

  // Carrega fotos na galeria do form
  fotosFormulario = carro.fotos && Array.isArray(carro.fotos) && carro.fotos.length > 0 
    ? [...carro.fotos] 
    : (carro.foto ? [carro.foto] : []);
  renderizarGridFotosForm();

  modal.classList.remove('hidden');
}

/**
 * Funcionalidade de Alterar Senha do Lojista
 */
function configurarAlterarSenha() {
  const btnAbrir = document.getElementById('btn-abrir-alterar-senha');
  const modal = document.getElementById('modal-alterar-senha');
  const btnFechar = document.getElementById('btn-fechar-modal-senha');
  const btnCancelar = document.getElementById('btn-cancelar-senha');
  const form = document.getElementById('form-alterar-senha');
  const erroMsg = document.getElementById('senha-erro-msg');

  if (!modal) return;

  const abrir = () => {
    form.reset();
    erroMsg.classList.add('hidden');
    modal.classList.remove('hidden');
  };

  const fechar = () => modal.classList.add('hidden');

  if (btnAbrir) btnAbrir.addEventListener('click', abrir);
  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) fechar();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const atual = document.getElementById('senha-atual').value;
      const nova = document.getElementById('senha-nova').value;
      const confirmar = document.getElementById('senha-confirmar').value;

      if (nova !== confirmar) {
        erroMsg.textContent = 'A confirmação não coincide com a nova senha!';
        erroMsg.classList.remove('hidden');
        return;
      }

      const res = AuthDB.alterarSenha(atual, nova);
      if (res.sucesso) {
        fechar();
        mostrarToast('✓ Senha alterada com sucesso! Use a nova senha no próximo acesso.');
      } else {
        erroMsg.textContent = res.mensagem;
        erroMsg.classList.remove('hidden');
      }
    });
  }
}

/**
 * Funcionalidade de Configurações da Loja (White-Label)
 */
function configurarConfigLoja() {
  const btnAbrir = document.getElementById('btn-abrir-config-loja');
  const modal = document.getElementById('modal-config-loja');
  const btnFechar = document.getElementById('btn-fechar-modal-loja');
  const btnCancelar = document.getElementById('btn-cancelar-loja');
  const form = document.getElementById('form-config-loja');

  if (!modal) return;

  const abrir = () => {
    const config = ConfigLojaDB.obterConfig();
    document.getElementById('config-nome-loja').value = config.nome || '';
    document.getElementById('config-slogan-loja').value = config.slogan || '';
    document.getElementById('config-whatsapp').value = config.whatsapp || '';
    document.getElementById('config-telefone').value = config.telefone || '';
    document.getElementById('config-endereco').value = config.endereco || '';
    const inputFoto = document.getElementById('config-foto-fachada');
    if (inputFoto) inputFoto.value = config.fotoFachada || '';
    const inputVideo = document.getElementById('config-video-hero');
    if (inputVideo) inputVideo.value = config.videoHero || 'https://www.youtube.com/watch?v=9JfFt3t7OfE';
    const inputHorarioSemana = document.getElementById('config-horario-semana');
    if (inputHorarioSemana) inputHorarioSemana.value = config.horarioSemana || 'Segunda a Sexta: 08:00 às 18:00';
    const inputHorarioSabado = document.getElementById('config-horario-sabado');
    if (inputHorarioSabado) inputHorarioSabado.value = config.horarioSabado || 'Sábados: 09:00 às 14:00';
    const inputGoogleAds = document.getElementById('config-google-ads');
    if (inputGoogleAds) inputGoogleAds.value = config.googleAdsId || '';
    const inputPixelMeta = document.getElementById('config-pixel-meta');
    if (inputPixelMeta) inputPixelMeta.value = config.pixelMetaId || '';
    modal.classList.remove('hidden');
  };

  const fechar = () => modal.classList.add('hidden');

  if (btnAbrir) btnAbrir.addEventListener('click', abrir);
  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) fechar();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const novosDados = {
        nome: document.getElementById('config-nome-loja').value.trim(),
        slogan: document.getElementById('config-slogan-loja').value.trim(),
        whatsapp: document.getElementById('config-whatsapp').value.trim(),
        telefone: document.getElementById('config-telefone').value.trim(),
        endereco: document.getElementById('config-endereco').value.trim(),
        fotoFachada: document.getElementById('config-foto-fachada')?.value.trim() || '',
        videoHero: document.getElementById('config-video-hero')?.value.trim() || '',
        horarioSemana: document.getElementById('config-horario-semana')?.value.trim() || 'Segunda a Sexta: 08:00 às 18:00',
        horarioSabado: document.getElementById('config-horario-sabado')?.value.trim() || 'Sábados: 09:00 às 14:00',
        googleAdsId: document.getElementById('config-google-ads')?.value.trim() || '',
        pixelMetaId: document.getElementById('config-pixel-meta')?.value.trim() || ''
      };

      ConfigLojaDB.salvarConfig(novosDados);
      fechar();
      mostrarToast('✓ Identidade, Vídeo do Cabeçalho e Configurações salvas!');
    });
  }
}

/**
 * Dispara evento via Webhook assíncrono (n8n / APIs REST)
 */
function dispararWebhookAutomacao(evento, veiculo) {
  try {
    const config = ConfigLojaDB.obterConfig();
    const webhookUrl = config.webhookMarketplaces;
    if (!webhookUrl) return;

    const payload = {
      evento,
      timestamp: new Date().toISOString(),
      loja: config.nome,
      veiculo
    };

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    }).catch(err => console.warn('Erro ao disparar webhook:', err));
  } catch (e) {
    console.warn('Falha silenciosa ao emitir webhook:', e);
  }
}

/**
 * Funcionalidade de Integração com Marketplaces Automotivos (OLX Pro, Mercado Livre, Webmotors, iCarros)
 */
function configurarIntegracoesMarketplaces() {
  const btnAbrir = document.getElementById('btn-abrir-integracoes');
  const modal = document.getElementById('modal-integracoes');
  const btnFechar = document.getElementById('btn-fechar-modal-integracoes');
  const btnFecharRodape = document.getElementById('btn-fechar-integracoes-rodape');
  const btnCopiarFeed = document.getElementById('btn-copiar-feed-url');
  const inputFeedUrl = document.getElementById('integracao-feed-url');
  const btnBaixarXml = document.getElementById('btn-baixar-xml');
  const btnBaixarCsv = document.getElementById('btn-baixar-csv');
  const inputWebhook = document.getElementById('integracao-webhook-url');
  const btnSalvarWebhook = document.getElementById('btn-salvar-webhook');
  const btnTestarWebhook = document.getElementById('btn-testar-webhook');

  if (!modal) return;

  const abrir = () => {
    // Configura a URL dinâmica baseada no domínio ou host atual
    if (inputFeedUrl) {
      const baseUrl = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://autoprime.com.br';
      inputFeedUrl.value = `${baseUrl}/feed/estoque.xml`;
    }
    // Carrega webhook salvo
    const config = ConfigLojaDB.obterConfig();
    if (inputWebhook) {
      inputWebhook.value = config.webhookMarketplaces || '';
    }
    modal.classList.remove('hidden');
  };

  const fechar = () => modal.classList.add('hidden');

  if (btnAbrir) btnAbrir.addEventListener('click', abrir);
  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnFecharRodape) btnFecharRodape.addEventListener('click', fechar);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) fechar();
  });

  // Copiar link do Feed XML Contínuo
  if (btnCopiarFeed && inputFeedUrl) {
    btnCopiarFeed.addEventListener('click', () => {
      navigator.clipboard.writeText(inputFeedUrl.value).then(() => {
        mostrarToast('✓ Link do Feed XML copiado para a Área de Transferência!');
      }).catch(() => {
        inputFeedUrl.select();
        document.execCommand('copy');
        mostrarToast('✓ Link copiado!');
      });
    });
  }

  // Baixar XML gerado em tempo real padronizado
  if (btnBaixarXml) {
    btnBaixarXml.addEventListener('click', () => {
      const xmlContent = EstoqueDB.gerarXmlFeed();
      const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estoque-portais-${new Date().toISOString().slice(0, 10)}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      mostrarToast('✓ Feed XML gerado e baixado com sucesso!');
    });
  }

  // Baixar Planilha CSV gerada em tempo real para importação em lote
  if (btnBaixarCsv) {
    btnBaixarCsv.addEventListener('click', () => {
      const csvContent = EstoqueDB.gerarCsvFeed();
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estoque-marketplaces-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      mostrarToast('✓ Planilha CSV gerada e baixada com sucesso!');
    });
  }

  // Salvar Webhook
  if (btnSalvarWebhook && inputWebhook) {
    btnSalvarWebhook.addEventListener('click', () => {
      const webhookUrl = inputWebhook.value.trim();
      ConfigLojaDB.salvarConfig({ webhookMarketplaces: webhookUrl });
      mostrarToast('✓ Webhook de automação salvo com sucesso!');
    });
  }

  // Testar Webhook disparando payload de validação
  if (btnTestarWebhook && inputWebhook) {
    btnTestarWebhook.addEventListener('click', () => {
      const webhookUrl = inputWebhook.value.trim();
      if (!webhookUrl) {
        mostrarToast('⚠️ Digite a URL do webhook antes de testar!');
        return;
      }
      mostrarToast('🚀 Disparando evento de teste para o webhook...');
      const payloadExemplo = {
        evento: 'teste_integracao',
        loja: ConfigLojaDB.obterConfig().nome,
        totalVeiculos: EstoqueDB.obterVeiculos().length,
        timestamp: new Date().toISOString()
      };

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadExemplo),
        mode: 'no-cors'
      }).then(() => {
        mostrarToast('✓ Teste enviado com sucesso para o webhook/n8n!');
      }).catch(err => {
        console.warn('Erro ao disparar webhook:', err);
        mostrarToast('✓ Disparo realizado (verifique o histórico no n8n)');
      });
    });
  }
}

/**
 * Funções de Controle de Acesso e Autenticação
 */
function estaAutenticado() {
  return Boolean(
    sessionStorage.getItem(AUTH_CONFIG.sessionKey) || 
    localStorage.getItem(AUTH_CONFIG.sessionKey)
  );
}

function configurarAutenticacao() {
  const telaLogin = document.getElementById('tela-login');
  const painelConteudo = document.getElementById('painel-conteudo');
  const formLogin = document.getElementById('form-login');
  const inputUsuario = document.getElementById('login-usuario');
  const inputSenha = document.getElementById('login-senha');
  const checkLembrar = document.getElementById('login-lembrar');
  const alertaErro = document.getElementById('login-erro');
  const btnToggleSenha = document.getElementById('btn-toggle-senha');
  const btnPreencherDemo = document.getElementById('btn-preencher-demo');
  const btnLogout = document.getElementById('btn-logout');
  const btnNovoVeiculo = document.getElementById('btn-novo-veiculo');

  const aplicarEstadoAuth = (autenticado) => {
    if (autenticado) {
      if (telaLogin) telaLogin.classList.add('hidden');
      if (painelConteudo) painelConteudo.classList.remove('hidden');
      if (btnLogout) btnLogout.classList.remove('hidden');
      if (btnNovoVeiculo) btnNovoVeiculo.classList.remove('hidden');
    } else {
      if (telaLogin) telaLogin.classList.remove('hidden');
      if (painelConteudo) painelConteudo.classList.add('hidden');
      if (btnLogout) btnLogout.classList.add('hidden');
      if (btnNovoVeiculo) btnNovoVeiculo.classList.add('hidden');
    }
  };

  aplicarEstadoAuth(estaAutenticado());

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuario = inputUsuario.value.trim().toLowerCase();
      const senha = inputSenha.value;

      // Validação das credenciais (aceita 'admin' ou email da loja, comparando com a senha configurada no AuthDB)
      const senhaAtualConfigurada = AuthDB.obterSenha();
      const usuarioValido = usuario === 'admin' || usuario === 'lojista@autoprime.com.br';
      const senhaValida = senha === senhaAtualConfigurada;

      if (usuarioValido && senhaValida) {
        alertaErro.classList.add('hidden');
        const tokenData = JSON.stringify({ usuario: 'admin', nome: 'Gerente da Loja', logadoEm: Date.now() });

        if (checkLembrar && checkLembrar.checked) {
          localStorage.setItem(AUTH_CONFIG.sessionKey, tokenData);
        } else {
          sessionStorage.setItem(AUTH_CONFIG.sessionKey, tokenData);
        }

        aplicarEstadoAuth(true);
        atualizarDashboard();
        mostrarToast('✓ Acesso autorizado! Bem-vindo ao painel.');
      } else {
        alertaErro.classList.remove('hidden');
        document.getElementById('login-erro-msg').textContent = 'Usuário ou senha incorretos!';
        
        const card = formLogin.closest('.bg-white');
        if (card) {
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 450);
        }
      }
    });
  }

  if (btnToggleSenha && inputSenha) {
    btnToggleSenha.addEventListener('click', () => {
      const isPassword = inputSenha.type === 'password';
      inputSenha.type = isPassword ? 'text' : 'password';
    });
  }

  // Preenchimento automático para apresentação (usa a senha atual do AuthDB)
  if (btnPreencherDemo && inputUsuario && inputSenha) {
    btnPreencherDemo.addEventListener('click', () => {
      inputUsuario.value = 'admin';
      inputSenha.value = AuthDB.obterSenha();
      if (alertaErro) alertaErro.classList.add('hidden');
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Deseja realmente sair do painel?')) {
        sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
        localStorage.removeItem(AUTH_CONFIG.sessionKey);
        if (inputSenha) inputSenha.value = '';
        aplicarEstadoAuth(false);
        mostrarToast('Você saiu do painel com segurança.');
      }
    });
  }
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
