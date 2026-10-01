/**
 * main.js - Lógica da Vitrine do Site e Atendimento WhatsApp
 * Auto Multimarcas - Padrão Ricardo & Severino
 */

let fotosModal = [];
let fotoIndexAtual = 0;

document.addEventListener('DOMContentLoaded', () => {
  const configLoja = ConfigLojaDB.obterConfig();

  // 1. Inicializa Atendimento WhatsApp Inteligente Sincronizado com a Ficha do Google
  initWhatsAppStatus(configLoja);
  setInterval(() => initWhatsAppStatus(configLoja), 60000);

  // 2. Aplica Identidade da Loja
  aplicarIdentidadeLoja(configLoja);

  // 3. Inicializa Vitrine de Veículos
  initVitrine();

  // 4. Inicializa Gestão de Cookies LGPD e Remarketing
  initCookiesERemarketing();
});

let filtroAtual = {
  termo: '',
  marca: '',
  carroceria: '',
  status: 'todos'
};

function aplicarIdentidadeLoja(config) {
  if (!config) return;

  // Atualiza nome da loja
  const elBrand = document.getElementById('brand-name');
  if (elBrand && config.nome) {
    elBrand.innerHTML = `${config.nome} <span class="text-xs bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded">PRO</span>`;
  }

  const elFooter = document.getElementById('footer-brand-name');
  if (elFooter && config.nome) {
    elFooter.textContent = config.nome;
  }

  const elShowroom = document.getElementById('showroom-store-name');
  if (elShowroom && config.nome) {
    elShowroom.textContent = config.nome;
  }

  // Endereço no Showroom e Mapa
  const mapaEnd = document.getElementById('mapa-endereco-texto');
  if (mapaEnd && config.endereco) {
    mapaEnd.innerHTML = `${config.endereco}${config.cidade ? ' - ' + config.cidade : ''}`;
  }

  // Link Rota Maps
  const queryMaps = encodeURIComponent(`${config.endereco || ''} ${config.cidade || ''}`);
  const urlMaps = `https://www.google.com/maps/search/?api=1&query=${queryMaps}`;
  const btnRota = document.getElementById('btn-rota-maps');
  const pillMaps = document.getElementById('pill-maps-link');
  if (btnRota && (config.endereco || config.cidade)) btnRota.href = urlMaps;
  if (pillMaps && (config.endereco || config.cidade)) pillMaps.href = urlMaps;

  // Contatos rápidos (Pills)
  const pillTelLink = document.getElementById('pill-tel-link');
  const pillTelLabel = document.getElementById('pill-tel-label');
  if (pillTelLink && (config.telefone || config.whatsapp)) {
    const tel = config.telefone || config.whatsapp;
    pillTelLink.href = `tel:${tel.replace(/\D/g, '')}`;
    if (pillTelLabel) pillTelLabel.textContent = tel;
  }

  const pillWaLink = document.getElementById('pill-wa-link');
  if (pillWaLink && config.whatsapp) {
    const wa = config.whatsapp.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Vim pelo site da ${config.nome || 'loja'} e gostaria de falar com um consultor.`);
    pillWaLink.href = `https://wa.me/${wa}?text=${msg}`;
  }

  const pillMailLink = document.getElementById('pill-mail-link');
  if (pillMailLink && config.email) {
    pillMailLink.href = `mailto:${config.email}`;
  }

  // Foto de fundo da loja (Hero e Showroom)
  if (config.fotoFachada) {
    const heroBg = document.getElementById('hero-bg-img');
    if (heroBg) {
      heroBg.style.backgroundImage = `url('${config.fotoFachada}')`;
    }
    const showroomFoto = document.getElementById('showroom-foto-loja');
    if (showroomFoto) {
      showroomFoto.src = config.fotoFachada;
    }
  }

  // 3. Vídeo Hero da Loja / Showroom em Alta Resolução
  aplicarVideoHero(config);

  // 4. Redes Sociais Oficiais da Loja (Instagram, Facebook, TikTok, YouTube)
  aplicarRedesSociais(config);
}

function aplicarRedesSociais(config) {
  if (!config) return;
  const mapa = {
    instagram: config.instagram || '#',
    facebook: config.facebook || '#',
    tiktok: config.tiktok || '#',
    youtube: config.youtube || '#'
  };

  Object.entries(mapa).forEach(([rede, url]) => {
    const elementos = document.querySelectorAll(`[data-rede="${rede}"], .rede-${rede}`);
    elementos.forEach(el => {
      el.href = url;
      if (url === '#' || !url) {
        el.setAttribute('target', '_self');
      } else {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    });
  });
}

function extrairIdYoutube(urlOuId) {
  if (!urlOuId) return null;
  const str = urlOuId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

let videoHeroMuted = true;

function aplicarVideoHero(config) {
  const container = document.getElementById('hero-video-container');
  if (!container) return;

  const videoParam = (config && config.videoHero) ? config.videoHero.trim() : 'https://www.youtube.com/watch?v=9JfFt3t7OfE';
  
  if (!videoParam) {
    container.innerHTML = '';
    return;
  }

  const ytId = extrairIdYoutube(videoParam);

  if (ytId) {
    const iframeExistente = document.getElementById('hero-yt-iframe');
    if (iframeExistente && iframeExistente.src.includes(ytId)) {
      configurarControleSomVideo();
      return;
    }
    container.innerHTML = `
      <iframe id="hero-yt-iframe" class="hero-video-element"
        src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&playsinline=1&rel=0&iv_load_policy=3"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        frameborder="0"
        title="Vídeo Showroom da Loja">
      </iframe>
    `;
  } else if (videoParam.includes('.mp4') || videoParam.includes('.webm') || videoParam.includes('blob:')) {
    container.innerHTML = `
      <video id="hero-native-video" class="hero-video-element" autoplay muted loop playsinline>
        <source src="${videoParam}" type="video/mp4">
      </video>
    `;
  }

  configurarControleSomVideo();
}

function configurarControleSomVideo() {
  const btn = document.getElementById('btn-toggle-video-sound');
  if (!btn || btn.dataset.configured === 'true') return;
  btn.dataset.configured = 'true';

  btn.addEventListener('click', () => {
    const iframe = document.getElementById('hero-yt-iframe');
    const nativeVid = document.getElementById('hero-native-video');
    const icon = document.getElementById('video-sound-icon');
    const label = document.getElementById('video-sound-label');

    videoHeroMuted = !videoHeroMuted;

    if (nativeVid) {
      nativeVid.muted = videoHeroMuted;
    }

    if (iframe && iframe.contentWindow) {
      const comando = videoHeroMuted ? 'mute' : 'unMute';
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: comando,
        args: []
      }), '*');
    }

    if (icon) icon.textContent = videoHeroMuted ? '🔇' : '🔊';
    if (label) label.textContent = videoHeroMuted ? 'Vídeo da Loja' : 'Áudio Ativado';
  });

  // Proteção contra Erro 153 / Bloqueios de Incorporação:
  // Se o YouTube relatar erro de reprodução, oculta o leitor e mantém o fundo automotivo suavemente
  window.addEventListener('message', (e) => {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data && (data.event === 'onError' || (data.info && data.info.errorCode))) {
        const c = document.getElementById('hero-video-container');
        if (c) c.style.display = 'none';
        const badge = document.getElementById('btn-toggle-video-sound');
        if (badge) badge.style.display = 'none';
      }
    } catch (err) {}
  });
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
    if (e.key === 'auto_multimarcas_estoque_v4' || e.key === 'auto_multimarcas_config_loja_v4' || e.key === 'auto_multimarcas_config_loja_v3' || e.key === 'auto_multimarcas_config_loja_v2') {
      const novaConfig = ConfigLojaDB.obterConfig();
      aplicarIdentidadeLoja(novaConfig);
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

    // Filtro por Termo (Marca, Modelo, Cor ou Tags)
    if (filtroAtual.termo) {
      const termoBusca = filtroAtual.termo.toLowerCase();
      const matchTexto = 
        carro.marca.toLowerCase().includes(termoBusca) ||
        carro.modelo.toLowerCase().includes(termoBusca) ||
        (carro.cor && carro.cor.toLowerCase().includes(termoBusca)) ||
        (carro.tags && carro.tags.some(t => t.toLowerCase().includes(termoBusca)));
      if (!matchTexto) return false;
    }

    // Filtro por Marca
    if (filtroAtual.marca && carro.marca.toLowerCase() !== filtroAtual.marca.toLowerCase()) {
      return false;
    }

    // Filtro por Carroceria / Categoria Especial (ex: luxo)
    if (filtroAtual.carroceria) {
      if (filtroAtual.carroceria.toLowerCase() === 'luxo') {
        const marcasLuxo = ['bmw', 'porsche', 'audi', 'mercedes', 'mercedes-benz', 'volvo', 'land rover', 'jaguar'];
        const isLuxo = carro.destaque || 
                       carro.preco >= 180000 || 
                       marcasLuxo.some(m => carro.marca.toLowerCase().includes(m)) ||
                       (carro.tags && carro.tags.some(t => t.toLowerCase().includes('luxo') || t.toLowerCase().includes('premium')));
        if (!isLuxo) return false;
      } else if (carro.carroceria.toLowerCase() !== filtroAtual.carroceria.toLowerCase()) {
        return false;
      }
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
    if (semResultados) semResultados.classList.remove('hidden');
    return;
  }

  if (semResultados) semResultados.classList.add('hidden');
  container.innerHTML = '';

  veiculosFiltrados.forEach(carro => {
    const card = criarCardCarro(carro);
    container.appendChild(card);
  });
}

function criarCardCarro(carro) {
  const isDark = document.documentElement.classList.contains('dark');
  const isMotors = document.body.dataset.template === 'motors';
  const div = document.createElement('div');

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

  const msgWhatsApp = encodeURIComponent(
    `Olá! Vi no site o veículo ${carro.marca} ${carro.modelo} (${carro.anoFabricacao}/${carro.anoModelo}) por ${precoFormatado} e gostaria de mais informações!`
  );
  const linkWhatsApp = `https://wa.me/${waNumero}?text=${msgWhatsApp}`;

  const listaFotos = carro.fotos && carro.fotos.length > 0 ? carro.fotos : [carro.foto];
  const fotoCapa = listaFotos[0];
  const totalFotos = listaFotos.length;

  // LAYOUT MOTORS / PORTAL CONCESSIONÁRIA (Estilo Valen Motors)
  if (isMotors) {
    div.className = 'motors-card bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group cursor-pointer shadow-sm hover:shadow-lg transition-all';
    div.setAttribute('data-ver-detalhes', carro.id);

    div.innerHTML = `
      <!-- Imagem do Veículo com Aspect Ratio 16:10 -->
      <div class="relative w-full aspect-[16/10] bg-slate-900 overflow-hidden">
        <img src="${fotoCapa}" alt="${carro.marca} ${carro.modelo}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
        
        <!-- Badges Superiores -->
        <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span class="badge-status ${statusBadgeClass} text-[10px] py-0.5 px-2 font-bold shadow-sm">${statusTexto}</span>
          ${carro.destaque ? '<span class="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow">★ DESTAQUE</span>' : ''}
        </div>

        <!-- Badge Contador de Fotos -->
        ${totalFotos > 1 ? `
          <div class="absolute bottom-2.5 right-2.5 bg-slate-950/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/20">
            <svg class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>${totalFotos} fotos</span>
          </div>
        ` : ''}

        <!-- Selo de Vendido -->
        ${isVendido ? `
          <div class="card-vendido-overlay">
            <div class="vendido-stamp">Vendido</div>
          </div>
        ` : ''}
      </div>

      <!-- Conteúdo do Card Concessionária -->
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <!-- Bloco de Preço Promocional (De / Por) -->
          <div class="mb-2 flex items-baseline justify-between">
            <div class="flex flex-col">
              <span class="text-[11px] text-slate-400 line-through font-medium">De R$ ${EstoqueDB.formatarPreco(Math.round(carro.preco * 1.05))}</span>
              <span class="text-xl font-black text-blue-700 tracking-tight leading-none">${precoFormatado}</span>
            </div>
            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">À Vista</span>
          </div>

          <!-- Título e Versão -->
          <h3 class="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition line-clamp-1" title="${carro.marca} ${carro.modelo}">
            ${carro.marca} ${carro.modelo}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
            ${carro.cor} • Placa final ${carro.placaFinal}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100">
          <!-- Grade 2x2 de Especificações com Ícones (Câmbio, Combustível, Ano, Km) -->
          <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3.5">
            <div class="flex items-center gap-1.5" title="Câmbio">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
              <span class="truncate">${carro.cambio}</span>
            </div>
            <div class="flex items-center gap-1.5" title="Combustível">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span class="truncate">${carro.combustivel}</span>
            </div>
            <div class="flex items-center gap-1.5" title="Ano">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span class="truncate">${carro.anoFabricacao}/${carro.anoModelo}</span>
            </div>
            <div class="flex items-center gap-1.5" title="Quilometragem">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span class="truncate">${kmFormatado}</span>
            </div>
          </div>

          <!-- Ações Rápidas -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button data-ver-detalhes="${carro.id}" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-lg text-center transition">
              Ver Detalhes
            </button>
            ${!isVendido ? `
              <a href="${linkWhatsApp}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg text-center transition flex items-center justify-center gap-1 shadow-sm">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
                <span>WhatsApp</span>
              </a>
            ` : `
              <span class="w-full bg-slate-100 text-slate-400 text-xs font-semibold py-2 rounded-lg text-center">Vendido</span>
            `}
          </div>
        </div>
      </div>
    `;

    return div;
  }

  // LAYOUT PADRÃO (Moderno & Luxo)
  if (isDark) {
    div.className = 'luxury-card rounded-2xl overflow-hidden flex flex-col relative text-slate-200';
  } else {
    div.className = 'car-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col relative';
  }

  const tagsHtml = (carro.tags || []).slice(0, 2).map(tag => 
    isDark 
      ? `<span class="bg-white/10 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-white/10">${tag}</span>`
      : `<span class="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">${tag}</span>`
  ).join('');

  div.innerHTML = `
    <!-- Imagem e Badges -->
    <div class="relative h-52 sm:h-56 w-full bg-slate-900 overflow-hidden">
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

        <h3 class="font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-base sm:text-lg line-clamp-1" title="${carro.marca} ${carro.modelo}">
          ${carro.marca} ${carro.modelo}
        </h3>
        <p class="text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5 font-medium">${carro.cor} • Placa final ${carro.placaFinal}</p>
        
        <!-- Selo de Garantia e Laudo Cautelar Aprovado -->
        <div class="mt-2.5 inline-flex items-center gap-1.5 ${isDark ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'} text-[10px] font-bold px-2 py-0.5 rounded">
          <svg class="w-3 h-3 ${isDark ? 'text-amber-400' : 'text-emerald-600'}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
          <span>Laudo Cautelar 100% Aprovado</span>
        </div>
      </div>

      <!-- Ficha Rápida (4 itens) -->
      <div class="grid grid-cols-2 gap-2 text-xs ${isDark ? 'text-slate-300 bg-white/5 border border-white/10' : 'text-slate-600 bg-slate-50 border border-slate-100'} p-2.5 rounded-xl">
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span>${carro.anoFabricacao}/${carro.anoModelo}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span>${kmFormatado}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          <span>${carro.cambio}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span>${carro.combustivel}</span>
        </div>
      </div>

      <!-- Preço e Botões de Conversão -->
      <div class="pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-100'} flex items-center justify-between gap-2">
        <div>
          <span class="block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-400'} font-bold uppercase">Valor à Vista</span>
          <span class="text-xl font-extrabold ${isDark ? 'text-amber-400 font-serif-luxury' : 'text-slate-900'}">${precoFormatado}</span>
        </div>

        <div class="flex items-center gap-2">
          <button data-ver-detalhes="${carro.id}" class="${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} px-3 py-2 rounded-lg text-xs font-semibold transition" title="Ver Detalhes e Fotos">
            Ver Fotos
          </button>
          ${!isVendido ? `
            <a href="${linkWhatsApp}" target="_blank" rel="noopener noreferrer" class="${isDark ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold' : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'} px-3 py-2 rounded-lg text-xs transition flex items-center gap-1 shadow-sm" title="Proposta via WhatsApp">
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
    let debounceTimer;
    inputTermo.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(aplicarFiltros, 200);
    });
    inputTermo.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') aplicarFiltros();
    });
  }
  if (selectMarca) selectMarca.addEventListener('change', aplicarFiltros);
  if (selectCarroceria) selectCarroceria.addEventListener('change', aplicarFiltros);

  // Filtro por botões de status (Todos / Disponíveis / Vendidos)
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => {
        b.classList.remove('bg-slate-900', 'text-white', 'bg-amber-400', 'text-black');
        b.classList.add('bg-white', 'text-slate-700');
      });
      btn.classList.remove('bg-white', 'text-slate-700');
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        btn.classList.add('bg-amber-400', 'text-black');
      } else {
        btn.classList.add('bg-slate-900', 'text-white');
      }

      filtroAtual.status = btn.dataset.statusFilter;
      renderizarEstoque();
    });
  });

  // Cards de Categoria em Destaque (Seminovos / SUVs / Importados)
  const categoryCards = document.querySelectorAll('.category-feature-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.filtroCategoria;
      filtroAtual.carroceria = cat || '';

      if (selectCarroceria) {
        if (cat === 'Sedan' || cat === 'SUV' || cat === 'Picape' || cat === 'Hatch') {
          selectCarroceria.value = cat;
        } else {
          selectCarroceria.value = '';
        }
      }

      renderizarEstoque();

      const secEstoque = document.getElementById('estoque');
      if (secEstoque) {
        secEstoque.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Botões de Categoria Rápida (Pills do Template Motors)
  const categoriaBtns = document.querySelectorAll('.btn-categoria-filtro');
  categoriaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoriaBtns.forEach(b => {
        b.classList.remove('bg-slate-900', 'text-white', 'active');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      btn.classList.remove('bg-slate-100', 'text-slate-700');
      btn.classList.add('bg-slate-900', 'text-white', 'active');

      const cat = btn.dataset.categoria || '';
      filtroAtual.carroceria = cat;
      if (selectCarroceria) selectCarroceria.value = cat;
      renderizarEstoque();
    });
  });

  // Botão Limpar Filtros
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      if (inputTermo) inputTermo.value = '';
      if (selectMarca) selectMarca.value = '';
      if (selectCarroceria) selectCarroceria.value = '';
      filtroAtual = { termo: '', marca: '', carroceria: '', status: 'todos' };
      statusBtns.forEach(b => {
        const isTodos = b.dataset.statusFilter === 'todos';
        const isDark = document.documentElement.classList.contains('dark');
        b.classList.remove('bg-slate-900', 'text-white', 'bg-amber-400', 'text-black', 'bg-white', 'text-slate-700');
        if (isTodos) {
          b.classList.add(isDark ? 'bg-amber-400' : 'bg-slate-900', isDark ? 'text-black' : 'text-white');
        } else {
          b.classList.add('bg-white', 'text-slate-700');
        }
      });
      categoriaBtns.forEach(b => {
        const isTodos = !b.dataset.categoria;
        b.classList.remove('bg-slate-900', 'text-white', 'active', 'bg-slate-100', 'text-slate-700');
        if (isTodos) {
          b.classList.add('bg-slate-900', 'text-white', 'active');
        } else {
          b.classList.add('bg-slate-100', 'text-slate-700');
        }
      });
      renderizarEstoque();
    });
  }

  // Formulário de Avaliação Express do Usado na Troca
  const formTroca = document.getElementById('form-avaliacao-usado');
  if (formTroca) {
    formTroca.addEventListener('submit', (e) => {
      e.preventDefault();
      const modelo = document.getElementById('troca-modelo')?.value.trim() || '';
      const anoKm = document.getElementById('troca-ano-km')?.value.trim() || '';
      const interesse = document.getElementById('troca-interesse')?.value.trim() || '';
      const config = ConfigLojaDB.obterConfig();
      const waNumero = config.whatsapp || '5511999999999';

      let msg = `Olá! Gostaria de simular a avaliação do meu veículo na troca:\n\n` +
                `🚗 *Meu Veículo:* ${modelo}\n` +
                `📅 *Ano/Km:* ${anoKm}\n`;
      if (interesse) {
        msg += `🎯 *Interesse no Veículo:* ${interesse}\n`;
      }
      msg += `\nPoderia me passar uma pré-avaliação e as condições de pagamento?`;

      const btnSubmit = formTroca.querySelector('button[type="submit"]');
      if (btnSubmit) {
        const originalContent = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `<span>Redirecionando para WhatsApp... ✓</span>`;
        setTimeout(() => { btnSubmit.innerHTML = originalContent; }, 2500);
      }

      window.open(`https://wa.me/${waNumero}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  // Botão Voltar ao Topo
  const btnBackToTop = document.getElementById('back-to-top');
  if (btnBackToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        btnBackToTop.classList.add('show');
      } else {
        btnBackToTop.classList.remove('show');
      }
    }, { passive: true });

    btnBackToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
 * Gerenciador de Atendimento WhatsApp em Tempo Real (Sincronizado com a Ficha do Google Meu Negócio)
 */
function initWhatsAppStatus(config) {
  const cfg = config || ConfigLojaDB.obterConfig();
  const numero = (cfg.whatsapp || '5511999999999').replace(/\D/g, '');

  // Horários oficiais sincronizados com a Ficha do Google
  const horaInicioSemana = typeof cfg.horaInicioSemana === 'number' ? cfg.horaInicioSemana : 8; // 08:00
  const horaFimSemana = typeof cfg.horaFimSemana === 'number' ? cfg.horaFimSemana : 18;       // 18:00
  const horaInicioSabado = typeof cfg.horaInicioSabado === 'number' ? cfg.horaInicioSabado : 8; // 08:00
  const horaFimSabado = typeof cfg.horaFimSabado === 'number' ? cfg.horaFimSabado : 15;       // 15:00

  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  const horaDecimal = agora.getHours() + (agora.getMinutes() / 60);

  let isOnline = false;
  let statusTexto = '';
  let statusBadgeGoogle = '';

  // Segunda a Sexta-feira (dias 1 a 5): das 08h às 18h
  if (diaSemana >= 1 && diaSemana <= 5) {
    if (horaDecimal >= horaInicioSemana && horaDecimal < horaFimSemana) {
      isOnline = true;
      statusTexto = 'Estamos online agora';
      statusBadgeGoogle = 'Ficha Google: Seg-Sex 08h-18h | Sáb 08h-15h';
    } else {
      isOnline = false;
      statusTexto = 'Fora do Expediente';
      statusBadgeGoogle = 'Plantão WhatsApp • Seg-Sex 08h-18h | Sáb 08h-15h';
    }
  } 
  // Sábado (dia 6): das 08h às 15h
  else if (diaSemana === 6) {
    if (horaDecimal >= horaInicioSabado && horaDecimal < horaFimSabado) {
      isOnline = true;
      statusTexto = 'Estamos online agora';
      statusBadgeGoogle = 'Ficha Google: Sábados das 08h às 15h';
    } else {
      isOnline = false;
      statusTexto = 'Fora do Expediente';
      statusBadgeGoogle = 'Plantão WhatsApp • Sáb 08h-15h';
    }
  } 
  // Domingo e Feriados (dia 0)
  else {
    isOnline = false;
    statusTexto = 'Plantão WhatsApp';
    statusBadgeGoogle = 'Ficha Google: Retorno Segunda às 08h';
  }

  // 1. Atualiza todos os textos de status do WhatsApp no DOM
  document.querySelectorAll('#wa-status-text, .wa-status-text, #header-wa-status-text').forEach(el => {
    el.textContent = statusTexto;
  });

  // 2. Atualiza badge de horários do Google
  document.querySelectorAll('#wa-google-horario, .wa-google-horario').forEach(el => {
    el.textContent = statusBadgeGoogle;
  });

  // 3. Atualiza pontos luminosos de status (pulsante verde / cinza)
  document.querySelectorAll('#wa-status-dot, .wa-status-dot').forEach(el => {
    el.className = isOnline ? 'wa-status-dot online' : 'wa-status-dot offline';
  });

  // 4. Atualiza horário institucional no topo
  const topbarHorario = document.getElementById('topbar-horario');
  if (topbarHorario) {
    topbarHorario.textContent = 'Seg a Sex: 08:00 às 18:00 • Sáb: 08:00 às 15:00';
  }

  // 5. Atualiza todos os links do WhatsApp
  const msgPadrao = encodeURIComponent(
    isOnline 
      ? `Olá! Vim pelo site da ${cfg.nome || 'loja'} e gostaria de falar com um consultor.` 
      : `Olá! Vi os veículos no site fora do horário comercial da loja e gostaria de receber mais informações.`
  );
  const waUrl = `https://wa.me/${numero}?text=${msgPadrao}`;

  document.querySelectorAll('#wa-link, #btn-floating-wa, #btn-wa-header').forEach(el => {
    el.href = waUrl;
    el.title = `Ficha do Google: Seg-Sex 08h às 18h | Sáb 08h às 15h (${statusTexto})`;
    if (isOnline) {
      el.classList.remove('offline-mode');
    } else {
      el.classList.add('offline-mode');
    }
  });

  // 6. Atualiza badges 'Estamos Online' no cabeçalho
  document.querySelectorAll('.live-online-badge').forEach(el => {
    if (isOnline) {
      el.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span> <span>Estamos online agora</span>`;
      el.className = 'live-online-badge text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm';
    } else {
      el.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> <span>Fora do Expediente</span>`;
      el.className = 'live-online-badge text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm';
    }
  });

  const titleEl = document.querySelector('.wa-title');
  if (titleEl) {
    titleEl.textContent = isOnline ? 'Falar no WhatsApp' : 'Plantão WhatsApp';
  }
}

/**
 * Gestão de Cookies, Consentimento LGPD e Remarketing (Google Ads & Meta Pixel)
 */
function initCookiesERemarketing() {
  const STORAGE_COOKIE_KEY = 'autoprime_cookie_consent_v1';
  const banner = document.getElementById('cookie-consent-banner');
  const btnAceitarTodos = document.getElementById('btn-cookie-aceitar-todos');
  const btnEssenciais = document.getElementById('btn-cookie-essenciais');
  const btnAbrirPolitica = document.querySelectorAll('[data-abrir-politica]');
  const modalPolitica = document.getElementById('modal-politica-privacidade');
  const btnFecharPolitica = document.getElementById('btn-fechar-politica');
  const btnFecharPoliticaRodape = document.getElementById('btn-fechar-politica-rodape');

  // Inicializa o dataLayer para remarketing e mensuração
  window.dataLayer = window.dataLayer || [];

  // Função global de disparo de conversão para o Ricardo usar no Google Ads / Meta Ads
  window.registrarConversao = function(tipo, dados = {}) {
    try {
      const eventoData = {
        event: tipo,
        timestamp: new Date().toISOString(),
        ...dados
      };
      window.dataLayer.push(eventoData);

      // Salva no histórico de sessão para remarketing inteligente
      const historico = JSON.parse(sessionStorage.getItem('autoprime_eventos_sessao') || '[]');
      historico.push({ tipo, timestamp: Date.now(), dados });
      sessionStorage.setItem('autoprime_eventos_sessao', JSON.stringify(historico.slice(-20)));

      // Se existir o pixel do Facebook/Meta
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', tipo, dados);
      }
      // Se existir o Google Tag / Google Ads
      if (typeof window.gtag === 'function') {
        window.gtag('event', tipo, dados);
      }

      console.log('🎯 [Remarketing / Conversão Registrada]:', tipo, dados);
    } catch (e) {
      console.warn('Erro ao registrar conversão:', e);
    }
  };

  // Verifica consentimento prévio
  const consentimentoSalvo = localStorage.getItem(STORAGE_COOKIE_KEY);

  if (!consentimentoSalvo && banner) {
    // Exibe após 1 segundo de forma elegante
    setTimeout(() => {
      banner.classList.add('show');
    }, 1000);
  } else if (consentimentoSalvo) {
    try {
      const prefs = JSON.parse(consentimentoSalvo);
      if (prefs.marketing) {
        window.registrarConversao('consentimento_ativo', { modo: 'remarketing_permitido' });
      }
    } catch (e) {}
  }

  // Ações de Aceite
  if (btnAceitarTodos) {
    btnAceitarTodos.addEventListener('click', () => {
      const consentimento = {
        aceito: true,
        essenciais: true,
        marketing: true,
        analiticos: true,
        data: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_COOKIE_KEY, JSON.stringify(consentimento));
      if (banner) banner.classList.remove('show');
      window.registrarConversao('cookie_consent_aceito', { tipo: 'todos_cookies_remarketing' });
    });
  }

  if (btnEssenciais) {
    btnEssenciais.addEventListener('click', () => {
      const consentimento = {
        aceito: true,
        essenciais: true,
        marketing: false,
        analiticos: false,
        data: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_COOKIE_KEY, JSON.stringify(consentimento));
      if (banner) banner.classList.remove('show');
      window.registrarConversao('cookie_consent_aceito', { tipo: 'apenas_essenciais' });
    });
  }

  // Abertura e Fechamento do Modal de Política de Privacidade
  btnAbrirPolitica.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalPolitica) modalPolitica.classList.remove('hidden');
    });
  });

  const fecharModal = () => {
    if (modalPolitica) modalPolitica.classList.add('hidden');
  };

  if (btnFecharPolitica) btnFecharPolitica.addEventListener('click', fecharModal);
  if (btnFecharPoliticaRodape) btnFecharPoliticaRodape.addEventListener('click', fecharModal);
  if (modalPolitica) {
    modalPolitica.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) fecharModal();
    });
  }

  // Monitora cliques em botões de conversão chave (WhatsApp e Simulação)
  const waBtn = document.getElementById('wa-link');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      window.registrarConversao('clique_whatsapp_flutuante', {
        origem: 'widget_flutuante',
        horario: new Date().toLocaleTimeString('pt-BR')
      });
    });
  }
}
