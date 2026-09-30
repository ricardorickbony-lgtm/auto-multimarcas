/**
 * db.js - Camada de Dados, Autenticação, Configurações e Estoque
 * Auto Multimarcas - Padrão Ricardo & Severino
 */

const STORAGE_KEY = 'auto_multimarcas_estoque_v3';
const STORAGE_CONFIG_KEY = 'auto_multimarcas_config_loja_v2';
const STORAGE_SENHA_KEY = 'auto_multimarcas_senha_admin';

// Configurações Padrão de Identidade Visual da Loja (White-Label)
const CONFIG_LOJA_PADRAO = {
  nome: 'AutoPrime Multimarcas',
  slogan: 'Seminovos e Populares Selecionados com Laudo Cautelar 100% Aprovado',
  logoTexto: 'AUTOPRIME',
  logoBadge: 'PRO',
  telefone: '(11) 4438-0000',
  whatsapp: '5511999999999',
  endereco: 'Av. Dom Pedro I, 1553 - Vila Pires, Santo André - SP',
  cidade: 'Santo André - SP',
  horarioSemana: 'Segunda a Sexta: 08:30 às 18:30',
  horarioSabado: 'Sábados: 09:00 às 14:00',
  fotoFachada: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80',
  fotoShowroom: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
  webhookMarketplaces: ''
};

// Catálogo dos Carros Mais Vendidos do Brasil (Foco Real de Multimarcas)
const VEICULOS_INICIAIS = [
  {
    id: 'car-1',
    marca: 'Chevrolet',
    modelo: 'Onix Premier 1.0 Turbo Flex Automático',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 86900,
    km: 23400,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Branco Summit',
    placaFinal: '4',
    carroceria: 'Hatch',
    status: 'disponivel',
    destaque: true,
    tags: ['Líder de Vendas', 'IPVA 2026 Pago', 'Wi-Fi OnStar'],
    foto: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'O hatch mais vendido do Brasil em sua versão topo de linha Premier. Motor 1.0 Turbo de 116cv, câmbio automático de 6 marchas, laudo cautelar aprovado sem apontamentos.',
    opcionais: ['Central MyLink 8"', 'Wi-Fi 4G Nativo', 'Câmera de Ré', 'Sensor de Estacionamento Dianteiro e Traseiro', 'Chave Presencial Easy Entry', 'Carregador por Indução', '6 Airbags']
  },
  {
    id: 'car-2',
    marca: 'Hyundai',
    modelo: 'HB20 Evolution 1.0 TGDI Turbo Automático',
    anoFabricacao: 2023,
    anoModelo: 2023,
    preco: 82900,
    km: 28500,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Prata Sand',
    placaFinal: '7',
    carroceria: 'Hatch',
    status: 'disponivel',
    destaque: true,
    tags: ['Garantia de Fábrica', 'Laudo Aprovado'],
    foto: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'HB20 com motor 1.0 Turbo GDI de 120cv. Super econômico e ágil para o dia a dia. Único dono com todas as revisões feitas na concessionária Hyundai.',
    opcionais: ['Painel Digital Supervision', 'Central BlueMedia 8"', 'Alerta de Colisão Frontal', 'Frenagem Autônoma de Emergência', 'Câmera de Ré', 'Piloto Automático']
  },
  {
    id: 'car-3',
    marca: 'Volkswagen',
    modelo: 'Polo Comfortline 1.0 TSI Automático',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 88900,
    km: 19800,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Cinza Platinum',
    placaFinal: '2',
    carroceria: 'Hatch',
    status: 'disponivel',
    destaque: false,
    tags: ['Painel Digital', 'Baixo Km'],
    foto: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Um dos carros mais vendidos do Brasil. Moderno, seguro (5 estrelas Latin NCAP) e com excelente valor de revenda.',
    opcionais: ['Painel Digital 8"', 'VW Play 10.1"', 'Volante Multifuncional com Paddle Shift', 'Faróis em LED', 'Controle Eletrônico de Estabilidade', 'Chave Presencial Kessy']
  },
  {
    id: 'car-4',
    marca: 'Fiat',
    modelo: 'Strada Volcano 1.3 Flex Cabine Dupla',
    anoFabricacao: 2023,
    anoModelo: 2023,
    preco: 99800,
    km: 32000,
    cambio: 'Manual',
    combustivel: 'Flex',
    cor: 'Vermelho Montecarlo',
    placaFinal: '9',
    carroceria: 'Picape',
    status: 'disponivel',
    destaque: true,
    tags: ['Picape Mais Vendida', 'Cabine Dupla 5 Lugares'],
    foto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'A picape mais vendida da história recente do Brasil. Versão topo de linha Volcano com 4 portas, espaço para 5 ocupantes e caçamba versátil.',
    opcionais: ['Faróis Full LED', 'Bancos em Couro e Tecido', 'Central Multimídia 7" Sem Fio', 'Capota Marítima', 'Controle de Tração TC+', 'Câmera de Ré']
  },
  {
    id: 'car-5',
    marca: 'Volkswagen',
    modelo: 'T-Cross 200 TSI Comfortline Automático',
    anoFabricacao: 2022,
    anoModelo: 2023,
    preco: 114900,
    km: 36500,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Branco Puro',
    placaFinal: '5',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: true,
    tags: ['SUV Campeão', 'ACC Adaptativo'],
    foto: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'O SUV mais vendido da categoria no mercado brasileiro. Espaço interno generoso, dirigibilidade alemã e motor TSI turbinado potente e econômico.',
    opcionais: ['Piloto Automático Adaptativo (ACC)', 'Frenagem Autônoma de Emergência', 'Painel Active Info Display', 'Central VW Play', 'Ar-Condicionado Climatronic Touch', 'Rodas 17" Diamantadas']
  },
  {
    id: 'car-6',
    marca: 'Hyundai',
    modelo: 'Creta Limited 1.0 Turbo TGDI Automático',
    anoFabricacao: 2023,
    anoModelo: 2023,
    preco: 119500,
    km: 26000,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Preto Onix',
    placaFinal: '1',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: false,
    tags: ['Chave Presencial', 'Garantia até 2028'],
    foto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'SUV moderno com visual imponente e conforto absoluto. Motor 1.0 Turbo GDI de 120cv com câmbio de 6 marchas suave.',
    opcionais: ['Carregador de Celular por Indução', 'Bancos em Couro', 'Central BlueMedia 8"', 'Câmera de Ré com Linhas Dinâmicas', 'Sensor de Fadiga', 'Start-Stop']
  },
  {
    id: 'car-7',
    marca: 'Fiat',
    modelo: 'Mobi Like 1.0 Fire Flex',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 56900,
    km: 21000,
    cambio: 'Manual',
    combustivel: 'Flex',
    cor: 'Prata Bari',
    placaFinal: '8',
    carroceria: 'Hatch',
    status: 'disponivel',
    destaque: false,
    tags: ['Super Econômico', 'IPVA Barato', 'Parcelas Baixas'],
    foto: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'O campeão da economia de combustível e manutenção barata. Ideal para transporte diário, trabalho e primeiro veículo.',
    opcionais: ['Ar-Condicionado', 'Direção Hidráulica', 'Vidros Elétricos Dianteiros', 'Travas Elétricas', 'Freios ABS com EBD', 'Computador de Bordo']
  },
  {
    id: 'car-8',
    marca: 'Chevrolet',
    modelo: 'Onix Plus LTZ 1.0 Turbo Sedan Flex Automático',
    anoFabricacao: 2022,
    anoModelo: 2023,
    preco: 84900,
    km: 39000,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Azul Eclipse',
    placaFinal: '3',
    carroceria: 'Sedan',
    status: 'disponivel',
    destaque: false,
    tags: ['Porta-Malas 469L', 'Sedan Mais Vendido'],
    foto: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'O sedan mais vendido do país. Muito espaço para toda a família, conforto nas viagens e consumo exemplar de combustível.',
    opcionais: ['Porta-Malas Gigante de 469 Litros', 'Central MyLink com Bluetooth', 'Sensor Crepuscular', 'Controle de Tração e Estabilidade', '6 Airbags de Série', 'Assistente de Partida em Rampa']
  },
  {
    id: 'car-9',
    marca: 'Jeep',
    modelo: 'Renegade Sport 1.3 Turbo T270 Flex Automático',
    anoFabricacao: 2022,
    anoModelo: 2022,
    preco: 94900,
    km: 43000,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Cinza Antique',
    placaFinal: '6',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: true,
    tags: ['Motor Turbo 185cv', 'Estrutura Robusta'],
    foto: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'SUV autêntico com motor potente de 185 cavalos. Posição alta de dirigir, muita estabilidade e visual de jipe tradicional.',
    opcionais: ['Motor T270 Turbo 185cv', 'Faróis Full LED', 'Freio de Estacionamento Eletrônico', 'Central Multimídia 7" com CarPlay/Android Auto', 'Controle de Estabilidade', 'Câmera de Ré']
  },
  {
    id: 'car-10',
    marca: 'Fiat',
    modelo: 'Argo Drive 1.0 Flex',
    anoFabricacao: 2023,
    anoModelo: 2023,
    preco: 69900,
    km: 30500,
    cambio: 'Manual',
    combustivel: 'Flex',
    cor: 'Branco Banchisa',
    placaFinal: '0',
    carroceria: 'Hatch',
    status: 'disponivel',
    destaque: false,
    tags: ['Econômico', 'Manutenção Simples'],
    foto: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Design esportivo italiano, acabamento acima da média da categoria e motor Firefly de 3 cilindros super econômico.',
    opcionais: ['Central Multimídia Uconnect 7"', 'Volante com Comandos de Áudio', 'Ar-Condicionado', 'Direção Elétrica Progressiva', 'Vidros e Travas Elétricas', 'Monitor de Pressão dos Pneus']
  },
  {
    id: 'car-11',
    marca: 'Renault',
    modelo: 'Kwid Intense 1.0 12V Flex',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 54800,
    km: 17500,
    cambio: 'Manual',
    combustivel: 'Flex',
    cor: 'Laranja Ocre',
    placaFinal: '7',
    carroceria: 'Hatch',
    status: 'disponivel',
    destaque: false,
    tags: ['Baixíssimo Km', 'O Mais Econômico do Brasil'],
    foto: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Eleito repetidas vezes o carro mais econômico do Brasil pelo Inmetro. Pequeno por fora, ótimo espaço interno e altura livre do solo para buracos e lombadas.',
    opcionais: ['Central Multimídia Media Evolution 8"', 'Câmera de Ré', '4 Airbags (Frontais e Laterais)', 'Luzes Diurnas DRL em LED', 'Computador de Bordo', 'Start-Stop']
  },
  {
    id: 'car-12',
    marca: 'Fiat',
    modelo: 'Pulse Drive 1.3 Flex Automático',
    anoFabricacao: 2023,
    anoModelo: 2023,
    preco: 89900,
    km: 25800,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Azul Amalfi',
    placaFinal: '4',
    carroceria: 'SUV',
    status: 'vendido',
    destaque: true,
    tags: ['SUV Compacto', 'Vendido Recentemente'],
    foto: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'O SUV compacto que caiu no gosto do brasileiro. Câmbio automático CVT de 7 marchas virtuais suave e econômico.',
    opcionais: ['Faróis e Lanternas em LED', 'Central Multimídia 8.4" Sem Fio', 'Piloto Automático', 'Ar-Condicionado Digital Automático', 'Direção Elétrica', 'Controle de Tração TC+']
  }
];

class EstoqueDB {
  static obterVeiculos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.salvarTodos(VEICULOS_INICIAIS);
        return VEICULOS_INICIAIS;
      }
      const lista = JSON.parse(data);
      // Garante retrocompatibilidade para fotos array
      return lista.map(v => {
        if (!v.fotos || !Array.isArray(v.fotos) || v.fotos.length === 0) {
          v.fotos = [v.foto || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'];
        }
        if (!v.foto) v.foto = v.fotos[0];
        return v;
      });
    } catch (e) {
      console.error('Erro ao ler estoque do localStorage:', e);
      return VEICULOS_INICIAIS;
    }
  }

  static salvarTodos(veiculos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(veiculos));
      window.dispatchEvent(new CustomEvent('estoque-atualizado', { detail: veiculos }));
    } catch (e) {
      console.error('Erro ao salvar estoque:', e);
    }
  }

  static obterPorId(id) {
    const todos = this.obterVeiculos();
    return todos.find(v => v.id === id) || null;
  }

  static adicionarVeiculo(novoCarro) {
    const todos = this.obterVeiculos();
    const id = 'car-' + Date.now();
    
    // Normaliza array de fotos
    let fotosArray = novoCarro.fotos && Array.isArray(novoCarro.fotos) && novoCarro.fotos.length > 0 
      ? novoCarro.fotos 
      : (novoCarro.foto ? [novoCarro.foto] : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80']);

    const carroFormatado = {
      id,
      marca: novoCarro.marca || 'Marca',
      modelo: novoCarro.modelo || 'Modelo',
      anoFabricacao: parseInt(novoCarro.anoFabricacao) || new Date().getFullYear(),
      anoModelo: parseInt(novoCarro.anoModelo) || new Date().getFullYear(),
      preco: parseFloat(novoCarro.preco) || 0,
      km: parseInt(novoCarro.km) || 0,
      cambio: novoCarro.cambio || 'Automático',
      combustivel: novoCarro.combustivel || 'Flex',
      cor: novoCarro.cor || 'Branco',
      placaFinal: novoCarro.placaFinal || '0',
      carroceria: novoCarro.carroceria || 'SUV',
      status: novoCarro.status || 'disponivel',
      destaque: Boolean(novoCarro.destaque),
      tags: novoCarro.tags && novoCarro.tags.length ? novoCarro.tags : ['Revisado com Garantia'],
      foto: fotosArray[0],
      fotos: fotosArray,
      descricao: novoCarro.descricao || 'Veículo em excelente estado de conservação, revisado e com laudo cautelar 100% aprovado.',
      opcionais: novoCarro.opcionais || ['Ar-Condicionado', 'Direção Elétrica', 'Vidros Elétricos', 'Airbags']
    };

    todos.unshift(carroFormatado);
    this.salvarTodos(todos);
    return carroFormatado;
  }

  static atualizarVeiculo(id, dadosAtualizados) {
    const todos = this.obterVeiculos();
    const index = todos.findIndex(v => v.id === id);
    if (index !== -1) {
      if (dadosAtualizados.fotos && Array.isArray(dadosAtualizados.fotos) && dadosAtualizados.fotos.length > 0) {
        dadosAtualizados.foto = dadosAtualizados.fotos[0];
      }
      todos[index] = { ...todos[index], ...dadosAtualizados };
      this.salvarTodos(todos);
      return todos[index];
    }
    return null;
  }

  static alterarStatus(id, novoStatus) {
    return this.atualizarVeiculo(id, { status: novoStatus });
  }

  static alternarDestaque(id) {
    const veiculo = this.obterPorId(id);
    if (veiculo) {
      return this.atualizarVeiculo(id, { destaque: !veiculo.destaque });
    }
    return null;
  }

  static excluirVeiculo(id) {
    let todos = this.obterVeiculos();
    todos = todos.filter(v => v.id !== id);
    this.salvarTodos(todos);
    return true;
  }

  static restaurarDemonstracao() {
    this.salvarTodos(VEICULOS_INICIAIS);
    return VEICULOS_INICIAIS;
  }

  static obterEstatisticas() {
    const todos = this.obterVeiculos();
    const disponiveis = todos.filter(v => v.status === 'disponivel');
    const vendidos = todos.filter(v => v.status === 'vendido');
    const reservados = todos.filter(v => v.status === 'reservado');
    const valorEstoqueDisponivel = disponiveis.reduce((acc, v) => acc + (v.preco || 0), 0);

    return {
      total: todos.length,
      disponiveis: disponiveis.length,
      vendidos: vendidos.length,
      reservados: reservados.length,
      valorEstoque: valorEstoqueDisponivel
    };
  }

  static formatarPreco(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(valor);
  }

  static formatarKm(km) {
    return new Intl.NumberFormat('pt-BR').format(km) + ' km';
  }

  /**
   * Gera Feed XML de Estoque compatível com o padrão de integradores automotivos (OLX, Webmotors, etc.)
   */
  static gerarXmlFeed() {
    const veiculos = this.obterVeiculos().filter(v => v.status === 'disponivel');
    const config = ConfigLojaDB.obterConfig();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<estoque_automotivo versao="2.0">\n`;
    xml += `  <revenda>\n`;
    xml += `    <nome>${config.nome || 'AutoPrime Multimarcas'}</nome>\n`;
    xml += `    <telefone>${config.telefone || ''}</telefone>\n`;
    xml += `    <whatsapp>${config.whatsapp || ''}</whatsapp>\n`;
    xml += `    <endereco>${config.endereco || ''}</endereco>\n`;
    xml += `    <cidade>${config.cidade || ''}</cidade>\n`;
    xml += `    <total_veiculos>${veiculos.length}</total_veiculos>\n`;
    xml += `    <gerado_em>${new Date().toISOString()}</gerado_em>\n`;
    xml += `  </revenda>\n`;
    xml += `  <veiculos>\n`;

    veiculos.forEach(v => {
      xml += `    <veiculo>\n`;
      xml += `      <id>${v.id}</id>\n`;
      xml += `      <marca>${v.marca}</marca>\n`;
      xml += `      <modelo>${v.modelo}</modelo>\n`;
      xml += `      <ano_fabricacao>${v.anoFabricacao}</ano_fabricacao>\n`;
      xml += `      <ano_modelo>${v.anoModelo}</ano_modelo>\n`;
      xml += `      <preco>${v.preco}</preco>\n`;
      xml += `      <km>${v.km}</km>\n`;
      xml += `      <cor>${v.cor}</cor>\n`;
      xml += `      <cambio>${v.cambio}</cambio>\n`;
      xml += `      <combustivel>${v.combustivel}</combustivel>\n`;
      xml += `      <carroceria>${v.carroceria}</carroceria>\n`;
      xml += `      <placa_final>${v.placaFinal}</placa_final>\n`;
      xml += `      <status>${v.status}</status>\n`;
      xml += `      <destaque>${v.destaque ? '1' : '0'}</destaque>\n`;
      xml += `      <descricao><![CDATA[${v.descricao || ''}]]></descricao>\n`;
      xml += `      <fotos>\n`;
      (v.fotos && v.fotos.length > 0 ? v.fotos : [v.foto]).forEach((f, idx) => {
        if (f) xml += `        <foto ordem="${idx + 1}">${f}</foto>\n`;
      });
      xml += `      </fotos>\n`;
      xml += `      <opcionais>\n`;
      (v.opcionais || []).forEach(opc => {
        xml += `        <item>${opc}</item>\n`;
      });
      xml += `      </opcionais>\n`;
      xml += `    </veiculo>\n`;
    });

    xml += `  </veiculos>\n`;
    xml += `</estoque_automotivo>`;
    return xml;
  }

  /**
   * Gera Planilha CSV padronizada para importação em lote nos marketplaces
   */
  static gerarCsvFeed() {
    const veiculos = this.obterVeiculos();
    const headers = ['ID', 'Marca', 'Modelo', 'Ano Fabricacao', 'Ano Modelo', 'Preco Venda', 'KM', 'Cambio', 'Combustivel', 'Cor', 'Carroceria', 'Placa Final', 'Status', 'Foto Capa', 'Descricao'];
    const rows = veiculos.map(v => [
      v.id,
      `"${v.marca}"`,
      `"${v.modelo}"`,
      v.anoFabricacao,
      v.anoModelo,
      v.preco,
      v.km,
      `"${v.cambio}"`,
      `"${v.combustivel}"`,
      `"${v.cor}"`,
      `"${v.carroceria}"`,
      v.placaFinal,
      v.status,
      `"${(v.fotos && v.fotos[0]) || v.foto || ''}"`,
      `"${(v.descricao || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

/**
 * Gestão de Autenticação e Senha do Lojista
 */
class AuthDB {
  static obterSenha() {
    return localStorage.getItem(STORAGE_SENHA_KEY) || 'admin123';
  }

  static alterarSenha(senhaAtual, novaSenha) {
    const atual = this.obterSenha();
    if (senhaAtual !== atual) {
      return { sucesso: false, mensagem: 'A senha atual digitada está incorreta.' };
    }
    if (!novaSenha || novaSenha.trim().length < 4) {
      return { sucesso: false, mensagem: 'A nova senha deve ter no mínimo 4 caracteres.' };
    }
    localStorage.setItem(STORAGE_SENHA_KEY, novaSenha.trim());
    return { sucesso: true, mensagem: 'Senha alterada com sucesso!' };
  }

  static redefinirSenhaPadrao() {
    localStorage.removeItem(STORAGE_SENHA_KEY);
    return 'admin123';
  }
}

/**
 * Gestão de Configurações da Loja (White-Label: Nome, Logo, WhatsApp, Endereço)
 */
class ConfigLojaDB {
  static obterConfig() {
    try {
      const data = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (!data) return CONFIG_LOJA_PADRAO;
      return { ...CONFIG_LOJA_PADRAO, ...JSON.parse(data) };
    } catch (e) {
      return CONFIG_LOJA_PADRAO;
    }
  }

  static salvarConfig(novosDados) {
    try {
      const atual = this.obterConfig();
      const atualizado = { ...atual, ...novosDados };
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(atualizado));
      window.dispatchEvent(new CustomEvent('config-loja-atualizada', { detail: atualizado }));
      return atualizado;
    } catch (e) {
      console.error('Erro ao salvar config da loja:', e);
      return null;
    }
  }
}

window.EstoqueDB = EstoqueDB;
window.AuthDB = AuthDB;
window.ConfigLojaDB = ConfigLojaDB;
