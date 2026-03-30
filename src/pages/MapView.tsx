import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import useLocalStorage from '../hooks/useLocalStorage';
import type { School, Equipment, EquipmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

const BRAZIL_CENTER: [number, number] = [-15.7801, -47.9292];
const BRAZIL_ZOOM = 5;

const MapView: React.FC = () => {
  const [schools] = useLocalStorage<School[]>('schools', []);
  const [equipment] = useLocalStorage<Equipment[]>('equipment', []);
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | ''>('');

  const schoolsOnMap = schools.filter(s => s.lat && s.lng);

  const getEquipmentForSchool = (schoolId: string): Equipment[] => {
    let eq = equipment.filter(e => e.escolaId === schoolId);
    if (filterStatus) {
      eq = eq.filter(e => e.status === filterStatus);
    }
    return eq;
  };

  const statusFilters: { value: EquipmentStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Manutenção', label: 'Manutenção' },
    { value: 'Inativo', label: 'Inativo' },
  ];

  return (
    <div className="page" style={{ height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Mapa</h1>
        <p className="page-subtitle">Visualização geográfica das escolas e equipamentos</p>
      </div>

      <div className="map-controls">
        <span className="map-controls-label">Filtrar por status:</span>
        {statusFilters.map(sf => (
          <button
            key={sf.value}
            className={`btn btn-sm ${filterStatus === sf.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(sf.value)}
          >
            {sf.label}
          </button>
        ))}
      </div>

      <div className="map-legend">
        <span style={{ fontWeight: 600, color: '#374151', marginRight: '4px' }}>Legenda:</span>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#15803d' }} />
          <span>Ativo</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#d97706' }} />
          <span>Manutenção</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#dc2626' }} />
          <span>Inativo</span>
        </div>
        <div className="legend-item" style={{ marginLeft: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span style={{ color: '#64748b' }}>
            {schoolsOnMap.length} escola{schoolsOnMap.length !== 1 ? 's' : ''} no mapa
          </span>
        </div>
      </div>

      {schoolsOnMap.length === 0 && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', color: '#92400e', fontSize: '14px', marginBottom: '16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Nenhuma escola foi geocodificada ainda. Cadastre escolas com endereço para que apareçam no mapa.
        </div>
      )}

      <div className="map-container">
        <MapContainer
          center={BRAZIL_CENTER}
          zoom={BRAZIL_ZOOM}
          style={{ height: '560px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {schoolsOnMap.map(school => {
            const schoolEquipment = getEquipmentForSchool(school.id);
            if (filterStatus && schoolEquipment.length === 0) return null;

            return (
              <Marker key={school.id} position={[school.lat!, school.lng!]}>
                <Popup minWidth={220} maxWidth={300}>
                  <div>
                    <div className="popup-school-name">{school.nome}</div>
                    <div className="popup-equipment-count">
                      {schoolEquipment.length} equipamento{schoolEquipment.length !== 1 ? 's' : ''}
                      {filterStatus ? ` (${filterStatus})` : ''}
                    </div>
                    {schoolEquipment.length > 0 ? (
                      <ul className="popup-equipment-list">
                        {schoolEquipment.map(eq => (
                          <li key={eq.id} className="popup-equipment-item">
                            <span style={{ fontSize: '13px', color: '#374151' }}>{eq.nome}</span>
                            <StatusBadge status={eq.status} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Nenhum equipamento</p>
                    )}
                    {school.rua && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8' }}>
                        {[school.rua, school.numero, school.bairro, school.cidade, school.estado].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
