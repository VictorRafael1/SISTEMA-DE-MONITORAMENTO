export interface School {
  id: string;
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  lat?: number;
  lng?: number;
  geocodingStatus?: 'pending' | 'success' | 'error' | 'not_attempted';
}

export interface Equipment {
  id: string;
  nome: string;
  tipo: 'Computador' | 'Tablet' | 'Projetor' | 'Impressora' | 'Roteador' | 'Monitor' | 'Outro';
  numeroSerie: string;
  status: 'Ativo' | 'Manutenção' | 'Inativo';
  escolaId: string;
  dataAquisicao: string;
  observacoes: string;
}

export type EquipmentStatus = 'Ativo' | 'Manutenção' | 'Inativo';
export type EquipmentType = 'Computador' | 'Tablet' | 'Projetor' | 'Impressora' | 'Roteador' | 'Monitor' | 'Outro';
