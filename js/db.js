/**
 * db.js - Camada de Dados, Autenticação, Configurações e Estoque
 * Auto Multimarcas - Padrão Ricardo & Severino
 */

const STORAGE_KEY = 'auto_multimarcas_estoque_v2';
const STORAGE_CONFIG_KEY = 'auto_multimarcas_config_loja_v1';
const STORAGE_SENHA_KEY = 'auto_multimarcas_senha_admin';

// Configurações Padrão de Identidade Visual da Loja (White-Label)
const CONFIG_LOJA_PADRAO = {
  nome: 'AutoPrime Multimarcas',
  slogan: 'Veículos Selecionados & Procedência Garantida',
  logoTexto: 'AUTOPRIME',
  logoBadge: 'PRO',
  telefone: '(11) 99999-9999',
  whatsapp: '5511999999999',
  endereco: 'Av. das Américas, 4500 - Barra da Tijuca, Rio de Janeiro - RJ',
  horarioSemana: 'Segunda a Sexta: 08:30 às 18:30',
  horarioSabado: 'Sábados: 09:00 às 14:00'
};

// Catálogo Expandido Inicial com Múltiplas Fotos por Veículo
const VEICULOS_INICIAIS = [
  {
    id: 'car-1',
    marca: 'BMW',
    modelo: '320i M Sport 2.0 Turbo ActiveFlex',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 298900,
    km: 18500,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Branco Alpino',
    placaFinal: '8',
    carroceria: 'Sedan',
    status: 'disponivel',
    destaque: true,
    tags: ['Único Dono', 'Garantia de Fábrica', 'M Sport'],
    foto: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Impecável. Revisões feitas rigorosamente na concessionária BMW. Pacote M Sport completo, painel curvo BMW Live Cockpit Professional, teto solar, rodas aro 19.',
    opcionais: ['Teto Solar', 'Bancos em Couro M Sport', 'Painel Curvo Digital', 'Câmera 360°', 'Faróis Full LED Adaptativos', 'Piloto Automático Adaptativo', 'Sensor de Ponto Cego']
  },
  {
    id: 'car-2',
    marca: 'Jeep',
    modelo: 'Compass Longitude 1.3 T270 Turbo',
    anoFabricacao: 2023,
    anoModelo: 2023,
    preco: 142900,
    km: 34200,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Cinza Granite',
    placaFinal: '4',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: true,
    tags: ['Laudo Cautelar 100%', 'IPVA 2026 Pago'],
    foto: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'SUV médio mais desejado do Brasil. Motor turbo T270 de 185cv com câmbio automático de 6 marchas. Central de 10 polegadas com Apple CarPlay e Android Auto sem fio.',
    opcionais: ['Ar Dual Zone', 'Bancos em Couro', 'Central 10.1"', 'Paddle Shift', 'Controle de Tração TC+', 'Chave Presencial']
  },
  {
    id: 'car-3',
    marca: 'Toyota',
    modelo: 'Corolla Altis Premium Hybrid 1.8',
    anoFabricacao: 2022,
    anoModelo: 2023,
    preco: 138500,
    km: 41000,
    cambio: 'Automático',
    combustivel: 'Híbrido',
    cor: 'Preto Eclipse',
    placaFinal: '2',
    carroceria: 'Sedan',
    status: 'disponivel',
    destaque: false,
    tags: ['Ultra Econômico', 'IPVA com Desconto'],
    foto: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'O campeão de economia e durabilidade. Versão topo de linha Altis Premium com pacote de segurança ativa Toyota Safety Sense completo.',
    opcionais: ['Toyota Safety Sense', 'Teto Solar Elétrico', 'Alerta de Mudança de Faixa', 'Frenagem Autônoma de Emergência', 'Carregador por Indução']
  },
  {
    id: 'car-4',
    marca: 'Porsche',
    modelo: 'Macan 2.0 Turbo PDK AWD',
    anoFabricacao: 2021,
    anoModelo: 2022,
    preco: 429000,
    km: 26000,
    cambio: 'Automático',
    combustivel: 'Gasolina',
    cor: 'Azul Miami',
    placaFinal: '9',
    carroceria: 'SUV',
    status: 'reservado',
    destaque: true,
    tags: ['Veículo de Luxo', 'Configuração Rara'],
    foto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Performance e status puro Porsche. Tração integral sob demanda, escape esportivo com botão seletor de ronco e acabamento em couro nobre.',
    opcionais: ['Tração Integral AWD', 'Teto Solar Panorâmico', 'Sistema Bose High-End', 'Rodas RS Spyder 21"', 'Suspensão Pneumática PASM']
  },
  {
    id: 'car-5',
    marca: 'Toyota',
    modelo: 'Hilux SRX 2.8 Turbo Diesel 4x4',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 285000,
    km: 29000,
    cambio: 'Automático',
    combustivel: 'Diesel',
    cor: 'Prata Nevoeiro',
    placaFinal: '5',
    carroceria: 'Picape',
    status: 'disponivel',
    destaque: true,
    tags: ['Diesel 4x4', 'Garantia até 2028'],
    foto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'A picape mais valorizada do mercado. Versão SRX topo com sistema de som premium JBL, câmera 360 graus e ventilação nos bancos dianteiros.',
    opcionais: ['Tração 4x4 com Reduzida', 'Som Premium JBL', 'Câmera 360°', 'Bancos Ventilados', 'Capota Marítima Original']
  },
  {
    id: 'car-6',
    marca: 'Volkswagen',
    modelo: 'Nivus Highline 200 TSI',
    anoFabricacao: 2023,
    anoModelo: 2023,
    preco: 124900,
    km: 22000,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Cinza Moonstone',
    placaFinal: '7',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: true,
    tags: ['Único Dono', 'Painel Active Info'],
    foto: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Design cupê moderno e tecnologia de ponta. Painel 100% digital Active Info Display e central VW Play com manual cognitivo.',
    opcionais: ['VW Play 10.1"', 'Piloto Automático ACC', 'Frenagem de Emergência', 'Rodas 17" Escurecidas', 'Chave Kessy']
  },
  {
    id: 'car-7',
    marca: 'Audi',
    modelo: 'Q3 Prestige Plus 1.4 TFSI S-Tronic',
    anoFabricacao: 2022,
    anoModelo: 2022,
    preco: 219900,
    km: 31000,
    cambio: 'Automático',
    combustivel: 'Gasolina',
    cor: 'Preto Mito',
    placaFinal: '3',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: false,
    tags: ['Revisado Audi', 'Virtual Cockpit'],
    foto: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Elegância e conforto alemão. Painel Audi Virtual Cockpit, porta-malas elétrico com abertura por gestos e faróis Full LED.',
    opcionais: ['Audi Virtual Cockpit', 'Tampa Traseira Elétrica', 'Faróis Full LED', 'Ar Dual Zone', 'Teto Solar Panorâmico']
  },
  {
    id: 'car-8',
    marca: 'Mercedes-Benz',
    modelo: 'C300 AMG Line 2.0 Turbo 258cv',
    anoFabricacao: 2021,
    anoModelo: 2022,
    preco: 315000,
    km: 24500,
    cambio: 'Automático',
    combustivel: 'Gasolina',
    cor: 'Cinza Selenite Fosco',
    placaFinal: '6',
    carroceria: 'Sedan',
    status: 'disponivel',
    destaque: true,
    tags: ['Linha AMG', 'Interior Bicolor'],
    foto: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Sedan esportivo de alto luxo. Pacote aerodinâmico AMG, motor de 258cv com câmbio 9G-Tronic e iluminação ambiente de 64 cores.',
    opcionais: ['Pacote Estético AMG', 'Som Burmester 3D', 'Teto Solar Duplo', 'Câmbio 9G-Tronic', 'Luz Ambiente 64 Cores']
  },
  {
    id: 'car-9',
    marca: 'Chevrolet',
    modelo: 'Tracker Premier 1.2 Turbo',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 128900,
    km: 19800,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Azul Eclipse',
    placaFinal: '0',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: false,
    tags: ['Teto Solar Panorâmico', 'Wi-Fi Nativo'],
    foto: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'SUV compacto mais completo da categoria na versão Premier com teto panorâmico, alerta de colisão e estacionamento automático Easy Park.',
    opcionais: ['Teto Solar Panorâmico', 'Estacionamento Automático Easy Park', 'Wi-Fi OnStar 4G', 'Bancos em Couro Bicolor', 'Alerta de Ponto Cego']
  },
  {
    id: 'car-10',
    marca: 'Ford',
    modelo: 'Ranger Limited 3.2 4x4 Diesel',
    anoFabricacao: 2022,
    anoModelo: 2022,
    preco: 218000,
    km: 44000,
    cambio: 'Automático',
    combustivel: 'Diesel',
    cor: 'Branco Ártico',
    placaFinal: '8',
    carroceria: 'Picape',
    status: 'disponivel',
    destaque: false,
    tags: ['Tração 4x4', 'Pneus Novos'],
    foto: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Força bruta e robustez comprovada. Motor Duratorq 3.2 de 5 cilindros com piloto automático adaptativo e frenagem autônoma.',
    opcionais: ['Tração 4x4 com Bloqueio', 'Piloto Adaptativo', 'Santo Antônio Original', 'Estribos Laterais', 'Multimídia Sync 3']
  },
  {
    id: 'car-11',
    marca: 'Hyundai',
    modelo: 'Creta Ultimate 2.0 SmartSense',
    anoFabricacao: 2023,
    anoModelo: 2024,
    preco: 147500,
    km: 21000,
    cambio: 'Automático',
    combustivel: 'Flex',
    cor: 'Prata Sand',
    placaFinal: '9',
    carroceria: 'SUV',
    status: 'disponivel',
    destaque: true,
    tags: ['Garantia até 2028', 'Teto Solar'],
    foto: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Versão topo de linha Ultimate com teto panorâmico, câmera de ponto cego no painel digital e pacote Hyundai SmartSense.',
    opcionais: ['Teto Solar Panorâmico', 'Câmeras Laterais no Painel', 'Bancos Dianteiros Ventilados', 'Carregador Celular Indução']
  },
  {
    id: 'car-12',
    marca: 'Honda',
    modelo: 'Civic Touring 1.5 Turbo',
    anoFabricacao: 2020,
    anoModelo: 2021,
    preco: 134900,
    km: 48000,
    cambio: 'Automático',
    combustivel: 'Gasolina',
    cor: 'Cinza Barium',
    placaFinal: '1',
    carroceria: 'Sedan',
    status: 'vendido',
    destaque: false,
    tags: ['Vendido na Loja', 'Histórico Completo'],
    foto: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=900&q=80',
    fotos: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80'
    ],
    descricao: 'Exemplar vendido recentemente com 100% de procedência garantida pela AutoPrime Multimarcas.',
    opcionais: ['Teto Solar', 'Painel TFT', 'LaneWatch', 'Faróis Full LED']
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
