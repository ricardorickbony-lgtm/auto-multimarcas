/**
 * main.js - Lógica da Vitrine do Site e Atendimento WhatsApp
 * Auto Multimarcas - Padrão Ricardo & Severino
 */

let fotosModal = [];
let fotoIndexAtual = 0;

document.addEventListener('DOMContentLoaded', () => {
  const configLoja = ConfigLojaDB.obterConfig();

  // 1. Inicializa Atendimento WhatsApp Inteligente
  initWhatsAppStatus({
    numero: configLoja.whatsapp || '5511999999999',
    diasSemana: [1, 2, 3, 4, 5],
    horaInicio: 8.5, // 08:30
    horaFim: 18.5,   // 18:30
    sabadoAbre: true,
    sabadoHoraFim: 14 // 14:00
  });

  // 2. Aplica Identidade da Loja
  aplicarIdentidadeLoja(configLoja);

  // 3. Inicializa Vitrine de Veículos
  initVitrine();
});

let filtroAtual = {
  termo: '',
  marca: '',
  carroceria: '',
  status: 'todos'
};

function aplicarIdentidadeLoja(config) {
  if (!config) return;
  // Atualiza título da página e textos principais se houver
  const elLogo = document.querySelector('header h1, header .tracking-tight');
  if (elLogo && config.nome) {
    // Mantém badge PRO se houver
  }
}

function initVitrine() {
  povoarFiltroMarcas();
  renderizarEstoque();
  configurarEventosFiltros();
  configurarModal();

  // Escuta atualizações de estoque e configurações emitidas pelo painel
  window.addEventListener('estoque-atualizado', () => {
    povoarFiltroMarcas();
    renderizarEstoque();
  });

  window.addEventListener('config-loja-atualizada', (e) => {
    aplicarIdentidadeLoja(e.detail);
    renderizarEstoque();
  });

  // Escuta alterações de outras abas via storage
  window.addEventListener('storage', (e) => {
    if (e.key === 'auto_multimarcas_estoque_v2' || e.key === 'auto_multimarcas_config_loja_v1') {
      povoarFiltroMarcas();
      renderizarEstoque();
    }
  });
}

function povoarFiltroMarcas() {
  const selectMarca = document.getElementById('filtro-marca');
  if (!selectMarca) return;

  const veiculos = EstoqueDB.obterVeiculos();
  const marcas = [...new Set(veiculos.map(v => v.marca))].sort();

  const valorSelecionado = selectMarca.value;
  selectMarca.innerHTML = '<option value="">Todas as Marcas</option>';
  
  marcas.forEach(marca => {
    const opt = document.createElement('option');
    opt.value = marca;
    opt.textContent = marca;
    if (marca === valorSelecionado) opt.selected = true;
    selectMarca.appendChild(opt);
  });
}

function filtrarVeiculos() {
  const todos = EstoqueDB.obterVeiculos();

  return todos.filter(carro => {
    // Filtro por Status
    if (filtroAtual.status === 'disponivel' && carro.status !== 'disponivel') return false;
    if (filtroAtual.status === 'vendido' && carro.status !== 'vendido') return false;

    // Filtro por Termo (Marca, Modelo ou Opcionais)
    if (filtroAtual.termo) {
      const termoBusca = filtroAtual.termo.toLowerCase();
      const matchTexto = 
        carro.marca.toLowerCase().includes(termoBusca) ||
        carro.modelo.toLowerCase().includes(termoBusca) ||
        (carro.tags && carro.tags.some(t => t.toLowerCase().includes(termoBusca)));
      if (!matchTexto) return false;
    }

    // Filtro por Marca
    if (filtroAtual.marca && carro.marca.toLowerCase() !== filtroAtual.marca.toLowerCase()) {
      return false;
    }

    // Filtro por Carroceria
    if (filtroAtual.carroceria && carro.carroceria.toLowerCase() !== filtroAtual.carroceria.toLowerCase()) {
      return false;
    }

    return true;
  });
}

function renderizarEstoque() {
  const container = document.getElementById('grid-carros');
  const contador = document.getElementById('estoque-contador');
  const semResultados = document.getElementById('sem-resultados');
  if (!container) return;

  const veiculosFiltrados = filtrarVeiculos();
  const stats = EstoqueDB.obterEstatisticas();

  if (contador) {
    contador.innerHTML = `Mostrando <strong>${veiculosFiltrados.length}</strong> de <strong>${stats.total}</strong> veículos em catálogo (${stats.disponiveis} disponíveis / ${stats.vendidos} vendidos)`;
  }

  if (veiculosFiltrados.length === 0) {
    container.innerHTML = '';
    semResultados.classList.remove('hidden');
    return;
  }

  semResultados.classList.add('hidden');
  container.innerHTML = '';

  veiculosFiltrados.forEach(carro => {
    const card = criarCardCarro(carro);
    container.appendChild(card);
  });
}

function criarCardCarro(carro) {
  const div = document.createElement('div');
  div.className = 'car-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col relative';

  const precoFormatado = EstoqueDB.formatarPreco(carro.preco);
  const kmFormatado = EstoqueDB.formatarKm(carro.km);
  const configLoja = ConfigLojaDB.obterConfig();
  const waNumero = configLoja.whatsapp || '5511999999999';

  let statusBadgeClass = 'badge-disponivel';
  let statusTexto = 'Disponível';
  let isVendido = carro.status === 'vendido';

  if (carro.status === 'reservado') {
    statusBadgeClass = 'badge-reservado';
    statusTexto = 'Reservado';
  } else if (isVendido) {
    statusBadgeClass = 'badge-vendido';
    statusTexto = 'Vendido';
  }

  const tagsHtml = (carro.tags || []).slice(0, 2).map(tag => 
    `<span class="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">${tag}</span>`
  ).join('');

  const msgWhatsApp = encodeURIComponent(
    `Olá! Vi no site o veículo ${carro.marca} ${carro.modelo} (${carro.anoFabricacao}/${carro.anoModelo}) por ${precoFormatado} e gostaria de mais informações!`
  );
  const linkWhatsApp = `https://wa.me/${waNumero}?text=${msgWhatsApp}`;

  const listaFotos = carro.fotos && carro.fotos.length > 0 ? carro.fotos : [carro.foto];
  const fotoCapa = listaFotos[0];
  const totalFotos = listaFotos.length;

  div.innerHTML = `
    <!-- Imagem e Badges -->
    <div class="relative h-52 sm:h-56 w-full bg-slate-100 overflow-hidden">
      <img src="${fotoCapa}" alt="${carro.marca} ${carro.modelo}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy">
      
      <!-- Badges Superiores -->
      <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <span class="badge-status ${statusBadgeClass}">${statusTexto}</span>
        ${carro.destaque ? '<span class="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow">★ DESTAQUE</span>' : ''}
      </div>

      <!-- Badge de Quantidade de Fotos -->
      ${totalFotos > 1 ? `
        <div class="absolute bottom-2.5 right-2.5 bg-slate-950/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
          <svg class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span>${totalFotos} fotos</span>
        </div>
      ` : ''}

      <!-- Selo Carro Vendido -->
      ${isVendido ? `
        <div class="card-vendido-overlay">
          <div class="vendido-stamp">Vendido</div>
        </div>
      ` : ''}
    </div>

    <!-- Conteúdo do Card -->
    <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
      
      <div>
        <div class="flex items-center gap-1.5 mb-2">
          ${tagsHtml}
        </div>

        <h3 class="font-bold text-slate-900 text-base sm:text-lg line-clamp-1" title="${carro.marca} ${carro.modelo}">
          ${carro.marca} ${carro.modelo}
        </h3>
        <p class="text-xs text-slate-500 mt-0.5 font-medium">${carro.cor} • Placa final ${carro.placaFinal}</p>
      </div>

      <!-- Ficha Rápida (4 itens) -->
      <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span>${carro.anoFabricacao}/${carro.anoModelo}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span>${kmFormatado}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          <span>${carro.cambio}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span>${carro.combustivel}</span>
        </div>
      </div>

      <!-- Preço e Botões de Conversão -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span class="block text-[10px] text-slate-400 font-bold uppercase">Valor à Vista</span>
          <span class="text-xl font-extrabold text-slate-900">${precoFormatado}</span>
        </div>

        <div class="flex items-center gap-2">
          <button data-ver-detalhes="${carro.id}" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition" title="Ver Detalhes e Fotos">
            Ver Fotos
          </button>
          ${!isVendido ? `
            <a href="${linkWhatsApp}" target="_blank" rel="noopener noreferrer" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm" title="Proposta via WhatsApp">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
              <span>WhatsApp</span>
            </a>
          ` : `
            <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-2 rounded-lg">Vendido</span>
          `}
        </div>
      </div>

    </div>
  `;

  return div;
}

function configurarEventosFiltros() {
  const inputTermo = document.getElementById('filtro-termo');
  const selectMarca = document.getElementById('filtro-marca');
  const selectCarroceria = document.getElementById('filtro-carroceria');
  const btnBuscar = document.getElementById('btn-aplicar-busca');
  const btnLimpar = document.getElementById('btn-limpar-filtros');
  const statusBtns = document.querySelectorAll('.status-filter-btn');

  const aplicarFiltros = () => {
    filtroAtual.termo = inputTermo ? inputTermo.value.trim() : '';
    filtroAtual.marca = selectMarca ? selectMarca.value : '';
    filtroAtual.carroceria = selectCarroceria ? selectCarroceria.value : '';
    renderizarEstoque();
  };

  if (btnBuscar) btnBuscar.addEventListener('click', aplicarFiltros);
  if (inputTermo) {
    inputTermo.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') aplicarFiltros();
    });
  }
  if (selectMarca) selectMarca.addEventListener('change', aplicarFiltros);
  if (selectCarroceria) selectCarroceria.addEventListener('change', aplicarFiltros);

  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => {
        b.classList.remove('bg-slate-900', 'text-white');
        b.classList.add('bg-white', 'text-slate-700');
      });
      btn.classList.remove('bg-white', 'text-slate-700');
      btn.classList.add('bg-slate-900', 'text-white');

      filtroAtual.status = btn.dataset.statusFilter;
      renderizarEstoque();
    });
  });

  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      if (inputTermo) inputTermo.value = '';
      if (selectMarca) selectMarca.value = '';
      if (selectCarroceria) selectCarroceria.value = '';
      filtroAtual = { termo: '', marca: '', carroceria: '', status: 'todos' };
      statusBtns.forEach(b => {
        if (b.dataset.statusFilter === 'todos') {
          b.classList.add('bg-slate-900', 'text-white');
          b.classList.remove('bg-white', 'text-slate-700');
        } else {
          b.classList.remove('bg-slate-900', 'text-white');
          b.classList.add('bg-white', 'text-slate-700');
        }
      });
      renderizarEstoque();
    });
  }
}

function configurarModal() {
  const modal = document.getElementById('modal-veiculo');
  const btnFechar = document.getElementById('btn-fechar-modal');
  const btnPrev = document.getElementById('modal-btn-prev');
  const btnNext = document.getElementById('modal-btn-next');
  if (!modal || !btnFechar) return;

  btnFechar.addEventListener('click', () => modal.classList.add('hidden'));

  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      modal.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
      modal.classList.add('hidden');
    } else if (e.key === 'ArrowLeft') {
      navegarFoto(-1);
    } else if (e.key === 'ArrowRight') {
      navegarFoto(1);
    }
  });

  if (btnPrev) btnPrev.addEventListener('click', () => navegarFoto(-1));
  if (btnNext) btnNext.addEventListener('click', () => navegarFoto(1));

  document.addEventListener('click', (e) => {
    const btnDetalhes = e.target.closest('[data-ver-detalhes]');
    if (btnDetalhes) {
      const idCarro = btnDetalhes.dataset.verDetalhes;
      abrirModalCarro(idCarro);
    }
  });
}

function navegarFoto(direcao) {
  if (fotosModal.length <= 1) return;
  fotoIndexAtual = (fotoIndexAtual + direcao + fotosModal.length) % fotosModal.length;
  atualizarFotoModal(fotoIndexAtual);
}

function atualizarFotoModal(index) {
  const fotoEl = document.getElementById('modal-foto');
  const contadorEl = document.getElementById('modal-foto-contador');
  const thumbsContainer = document.getElementById('modal-thumbs-strip');

  if (fotoEl && fotosModal[index]) {
    fotoEl.style.opacity = '0.4';
    setTimeout(() => {
      fotoEl.src = fotosModal[index];
      fotoEl.style.opacity = '1';
    }, 120);
  }

  if (contadorEl) {
    contadorEl.textContent = `${index + 1} de ${fotosModal.length}`;
  }

  // Atualiza borda ativa das miniaturas
  if (thumbsContainer) {
    const thumbs = thumbsContainer.querySelectorAll('[data-thumb-idx]');
    thumbs.forEach((thumb, i) => {
      if (i === index) {
        thumb.className = 'w-16 h-12 rounded-lg object-cover cursor-pointer border-2 border-blue-500 scale-105 transition-all shadow-md';
      } else {
        thumb.className = 'w-16 h-12 rounded-lg object-cover cursor-pointer opacity-60 hover:opacity-100 transition-all border border-slate-700';
      }
    });
  }
}

function abrirModalCarro(id) {
  const carro = EstoqueDB.obterPorId(id);
  if (!carro) return;

  const modal = document.getElementById('modal-veiculo');
  const tituloEl = document.getElementById('modal-titulo');
  const subtituloEl = document.getElementById('modal-subtitulo');
  const precoEl = document.getElementById('modal-preco');
  const badgeStatus = document.getElementById('modal-badge-status');
  const anoEl = document.getElementById('modal-ano');
  const kmEl = document.getElementById('modal-km');
  const cambioEl = document.getElementById('modal-cambio');
  const combustivelEl = document.getElementById('modal-combustivel');
  const descEl = document.getElementById('modal-descricao');
  const opcEl = document.getElementById('modal-opcionais');
  const btnWa = document.getElementById('modal-btn-whatsapp');
  const sim36 = document.getElementById('modal-sim-36');
  const sim48 = document.getElementById('modal-sim-48');
  const thumbsStrip = document.getElementById('modal-thumbs-strip');
  const configLoja = ConfigLojaDB.obterConfig();
  const waNumero = configLoja.whatsapp || '5511999999999';

  tituloEl.textContent = `${carro.marca} ${carro.modelo}`;
  subtituloEl.textContent = `${carro.carroceria} • Cor ${carro.cor} • Placa Final ${carro.placaFinal}`;
  precoEl.textContent = EstoqueDB.formatarPreco(carro.preco);
  anoEl.textContent = `${carro.anoFabricacao}/${carro.anoModelo}`;
  kmEl.textContent = EstoqueDB.formatarKm(carro.km);
  cambioEl.textContent = carro.cambio;
  combustivelEl.textContent = carro.combustivel;
  descEl.textContent = carro.descricao || 'Veículo com laudo cautelar aprovado e garantia de procedência.';

  // Inicializa galeria
  fotosModal = carro.fotos && carro.fotos.length > 0 ? [...carro.fotos] : [carro.foto];
  fotoIndexAtual = 0;

  // Renderiza miniaturas
  if (thumbsStrip) {
    thumbsStrip.innerHTML = '';
    fotosModal.forEach((url, idx) => {
      const imgThumb = document.createElement('img');
      imgThumb.src = url;
      imgThumb.alt = `Miniatura ${idx + 1}`;
      imgThumb.dataset.thumbIdx = idx;
      imgThumb.className = idx === 0 
        ? 'w-16 h-12 rounded-lg object-cover cursor-pointer border-2 border-blue-500 scale-105 transition-all shadow-md'
        : 'w-16 h-12 rounded-lg object-cover cursor-pointer opacity-60 hover:opacity-100 transition-all border border-slate-700';
      
      imgThumb.addEventListener('click', () => {
        fotoIndexAtual = idx;
        atualizarFotoModal(fotoIndexAtual);
      });
      thumbsStrip.appendChild(imgThumb);
    });
  }

  atualizarFotoModal(0);

  // Status Badge
  if (carro.status === 'disponivel') {
    badgeStatus.className = 'badge-status badge-disponivel mb-2';
    badgeStatus.textContent = 'Disponível em Estoque';
  } else if (carro.status === 'reservado') {
    badgeStatus.className = 'badge-status badge-reservado mb-2';
    badgeStatus.textContent = 'Em Negociação / Reservado';
  } else {
    badgeStatus.className = 'badge-status badge-vendido mb-2';
    badgeStatus.textContent = 'Veículo Vendido';
  }

  // Opcionais
  opcEl.innerHTML = '';
  (carro.opcionais || []).forEach(item => {
    const span = document.createElement('span');
    span.className = 'inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium';
    span.innerHTML = `<svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> ${item}`;
    opcEl.appendChild(span);
  });

  // Simulação de Parcelas (Entrada 30%)
  const entrada = carro.preco * 0.30;
  const saldo = carro.preco - entrada;
  const parcela36 = Math.round((saldo * 1.35) / 36);
  const parcela48 = Math.round((saldo * 1.48) / 48);

  sim36.textContent = `36x de ${EstoqueDB.formatarPreco(parcela36)}`;
  sim48.textContent = `48x de ${EstoqueDB.formatarPreco(parcela48)}`;

  // Link WhatsApp com número dinâmico da loja
  const msgModal = encodeURIComponent(
    `Olá! Tenho muito interesse no veículo ${carro.marca} ${carro.modelo} (${carro.anoFabricacao}/${carro.anoModelo}) no valor de ${EstoqueDB.formatarPreco(carro.preco)}. Gostaria de agendar uma visita e simular as condições!`
  );
  btnWa.href = `https://wa.me/${waNumero}?text=${msgModal}`;

  modal.classList.remove('hidden');
}

/**
 * Gerenciador de Atendimento WhatsApp em Tempo Real
 */
function initWhatsAppStatus(config) {
  const {
    numero = '5511999999999',
    diasSemana = [1, 2, 3, 4, 5],
    horaInicio = 8.5,
    horaFim = 18.5,
    sabadoAbre = true,
    sabadoHoraFim = 14
  } = config;

  const agora = new Date();
  const diaSemana = agora.getDay();
  const hora = agora.getHours();
  const minutos = agora.getMinutes();
  const horaDecimal = hora + (minutos / 60);

  let isOnline = false;

  if (diasSemana.includes(diaSemana) && horaDecimal >= horaInicio && horaDecimal < horaFim) {
    isOnline = true;
  } else if (sabadoAbre && diaSemana === 6 && horaDecimal >= horaInicio && horaDecimal < sabadoHoraFim) {
    isOnline = true;
  }

  const linkEl = document.getElementById('wa-link');
  const dotEl = document.getElementById('wa-status-dot');
  const textEl = document.getElementById('wa-status-text');

  if (!linkEl || !dotEl || !textEl) return;

  if (isOnline) {
    dotEl.className = 'wa-status-dot online';
    textEl.textContent = 'Online Agora';
    const msg = encodeURIComponent('Olá! Vim pelo site da loja e gostaria de tirar uma dúvida sobre um veículo.');
    linkEl.href = `https://wa.me/${numero}?text=${msg}`;
  } else {
    linkEl.classList.add('offline-mode');
    dotEl.className = 'wa-status-dot offline';
    textEl.textContent = 'Fora do Expediente';
    const msg = encodeURIComponent('Olá! Vi o site fora do horário comercial e gostaria de deixar uma mensagem.');
    linkEl.href = `https://wa.me/${numero}?text=${msg}`;
  }
}
