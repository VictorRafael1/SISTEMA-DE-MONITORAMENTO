import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { School, Equipment } from '../types';

const Dashboard: React.FC = () => {
  const [schools] = useLocalStorage<School[]>('schools', []);
  const [equipment] = useLocalStorage<Equipment[]>('equipment', []);

  const totalSchools = schools.length;
  const totalEquipment = equipment.length;
  const ativos = equipment.filter(e => e.status === 'Ativo').length;
  const manutencao = equipment.filter(e => e.status === 'Manutenção').length;
  const inativos = equipment.filter(e => e.status === 'Inativo').length;
  const schoolsWithLocation = schools.filter(s => s.lat && s.lng).length;

  const equipmentByType = equipment.reduce((acc: Record<string, number>, e) => {
    acc[e.tipo] = (acc[e.tipo] || 0) + 1;
    return acc;
  }, {});

  const recentEquipment = [...equipment]
    .sort((a, b) => new Date(b.dataAquisicao).getTime() - new Date(a.dataAquisicao).getTime())
    .slice(0, 5);

  const getSchoolName = (id: string) => {
    const school = schools.find(s => s.id === id);
    return school ? school.nome : 'Escola não encontrada';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do sistema de monitoramento</p>
      </div>

      <div className="cards-grid">
        <div className="metric-card metric-card-blue">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{totalSchools}</span>
            <span className="metric-label">Escolas Cadastradas</span>
          </div>
        </div>

        <div className="metric-card metric-card-purple">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{totalEquipment}</span>
            <span className="metric-label">Total de Equipamentos</span>
          </div>
        </div>

        <div className="metric-card metric-card-green">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{ativos}</span>
            <span className="metric-label">Equipamentos Ativos</span>
          </div>
        </div>

        <div className="metric-card metric-card-yellow">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{manutencao}</span>
            <span className="metric-label">Em Manutenção</span>
          </div>
        </div>

        <div className="metric-card metric-card-red">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{inativos}</span>
            <span className="metric-label">Equipamentos Inativos</span>
          </div>
        </div>

        <div className="metric-card metric-card-teal">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{schoolsWithLocation}</span>
            <span className="metric-label">Escolas no Mapa</span>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Equipamentos por Tipo</h2>
          </div>
          <div className="card-body">
            {Object.keys(equipmentByType).length === 0 ? (
              <p className="empty-text">Nenhum equipamento cadastrado</p>
            ) : (
              <div className="type-list">
                {Object.entries(equipmentByType).map(([tipo, count]) => (
                  <div key={tipo} className="type-item">
                    <span className="type-name">{tipo}</span>
                    <div className="type-bar-container">
                      <div
                        className="type-bar"
                        style={{ width: `${totalEquipment > 0 ? (count / totalEquipment) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="type-count">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Aquisições Recentes</h2>
          </div>
          <div className="card-body">
            {recentEquipment.length === 0 ? (
              <p className="empty-text">Nenhum equipamento cadastrado</p>
            ) : (
              <div className="recent-list">
                {recentEquipment.map(eq => (
                  <div key={eq.id} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-name">{eq.nome}</span>
                      <span className="recent-school">{getSchoolName(eq.escolaId)}</span>
                    </div>
                    <div className="recent-meta">
                      <span className="recent-date">
                        {eq.dataAquisicao ? new Date(eq.dataAquisicao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                      </span>
                      <span className={`badge badge-${eq.status === 'Ativo' ? 'ativo' : eq.status === 'Manutenção' ? 'manutencao' : 'inativo'}`}>
                        {eq.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
