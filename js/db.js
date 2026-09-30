/**
 * db.js - Camada de Dados e Sincronização do Estoque de Veículos
 * Auto Multimarcas - Padrão Ricardo & Severino
 */

const STORAGE_KEY = 'auto_multimarcas_estoque_v1';

// Dados Iniciais de Demonstração (caso o estoque esteja vazio)
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
    status: 'disponivel', // 'disponivel' | 'reservado' | 'vendido'
    destaque: true,
    tags: ['Único Dono', 'Garantia de Fábrica', 'M Sport'],
    foto: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    descricao: 'Impecável. Revisões feitas rigorosamente na concessionária BMW. Pacote M Sport completo, painel curvo BMW Live Cockpit Professional, teto solar, rodas aro 19.',
    opcionais: ['Teto Solar', 'Bancos em Couro', 'Painel Digital', 'Câmera de Ré', 'Faróis Full LED', 'Piloto Automático', 'Sensor de Ponto Cego']
  },
  {
    id: 'car-2',
    marca: 'Jeep',
    modelo: 'Compass Longitude 1.3 T270 Turbo',
    anoFabricacao: 2022,
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
    tags: ['Laudo Cautelar Aprovado', 'IPVA 2026 Pago'],
    foto: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
    descricao: 'SUV médio mais desejado do Brasil. Motor turbo T270 de 185cv com câmbio automático de 6 marchas. Central de 10 polegadas com espelhamento sem fio.',
    opcionais: ['Ar-Condicionado Dual Zone', 'Bancos em Couro', 'Central Multimídia', 'Paddle Shift', 'Controle de Tração TC+']
  },
  {
    id: 'car-3',
    marca: 'Toyota',
    modelo: 'Corolla Altis Premium Hybrid 1.8',
    anoFabricacao: 2022,
    anoModelo: 2022,
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
    descricao: 'O campeão de economia e durabilidade. Versão topo de linha Altis Premium com pacote Toyota Safety Sense completo.',
    opcionais: ['Toyota Safety Sense', 'Teto Solar', 'Alerta de Colisão', 'Frenagem Autônoma', 'Carregador por Indução']
  },
  {
    id: 'car-4',
    marca: 'Porsche',
    modelo: 'Macan 2.0 Turbo PDK AWD',
    anoFabricacao: 2021,
    anoModelo: 2021,
    preco: 429000,
    km: 26000,
    cambio: 'Automático',
    combustivel: 'Gasolina',
    cor: 'Azul Miami',
    placaFinal: '9',
    carroceria: 'SUV',
    status: 'reservado',
    destaque: true,
    tags: ['Veículo de Luxo', 'Configuração Exclusiva'],
    foto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    descricao: 'Performance e status puro Porsche. Tração integral sob demanda, escape esportivo com botão de abertura de válvulas, interior bicolor.',
    opcionais: ['Tração 4x4 AWD', 'Teto Panorâmico', 'Som Bose High-End', 'Rodas RS Spyder aro 21', 'Suspensão Pneumática']
  },
  {
    id: 'car-5',
    marca: 'Toyota',
    modelo: 'Hilux SRX 2.8 Turbo Diesel 4x4',
    anoFabricacao: 2023,
    anoModelo: 2023,
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
    descricao: 'A picape mais resistente do mundo. Versão SRX com sistema de som premium JBL, câmera 360 graus e ventilação nos bancos dianteiros.',
    opcionais: ['Tração 4x4 com Reduzida', 'Som JBL', 'Câmera 360°', 'Bancos com Ventilação', 'Capota Marítima']
  },
  {
    id: 'car-6',
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
    descricao: 'Exemplar vendido recentemente com 100% de procedência garantida pela Auto Multimarcas.',
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
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler estoque do localStorage:', e);
      return VEICULOS_INICIAIS;
    }
  }

  static salvarTodos(veiculos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(veiculos));
      // Notifica outras abas ou componentes da atualização
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
      carroceria: novoCarro.carroceria || 'Sedan',
      status: novoCarro.status || 'disponivel',
      destaque: Boolean(novoCarro.destaque),
      tags: novoCarro.tags && novoCarro.tags.length ? novoCarro.tags : ['Revisado'],
      foto: novoCarro.foto || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      descricao: novoCarro.descricao || 'Veículo em excelente estado de conservação, revisado e com garantia.',
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

window.EstoqueDB = EstoqueDB;
