import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { School } from '../types';
import { geocodeAddress } from '../utils/geocoding';

const emptyForm: Omit<School, 'id'> = {
  nome: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  telefone: '',
  email: '',
  geocodingStatus: 'not_attempted',
};

const Schools: React.FC = () => {
  const [schools, setSchools] = useLocalStorage<School[]>('schools', []);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<School, 'id'>>(emptyForm);
  const [geocoding, setGeocoding] = useState(false);
  const [search, setSearch] = useState('');

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (school: School) => {
    const { id, ...rest } = school;
    setForm(rest);
    setEditingId(id);
    setShowModal(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setGeocoding(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return;

    setGeocoding(true);
    let lat: number | undefined;
    let lng: number | undefined;
    let geocodingStatus: School['geocodingStatus'] = 'not_attempted';

    const hasAddress = form.rua.trim() || form.cidade.trim();
    if (hasAddress) {
      geocodingStatus = 'pending';
      const result = await geocodeAddress(form.rua, form.numero, form.bairro, form.cidade, form.estado);
      if (result) {
        lat = result.lat;
        lng = result.lng;
        geocodingStatus = 'success';
      } else {
        geocodingStatus = 'error';
      }
    }

    setGeocoding(false);

    if (editingId) {
      setSchools(prev =>
        prev.map(s =>
          s.id === editingId ? { ...form, id: editingId, lat, lng, geocodingStatus } : s
        )
      );
    } else {
      const newSchool: School = {
        ...form,
        id: crypto.randomUUID(),
        lat,
        lng,
        geocodingStatus,
      };
      setSchools(prev => [...prev, newSchool]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deletingId) {
      setSchools(prev => prev.filter(s => s.id !== deletingId));
    }
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const filtered = schools.filter(s =>
    s.nome.toLowerCase().includes(search.toLowerCase()) ||
    s.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const getGeoStatusLabel = (status?: School['geocodingStatus']) => {
    switch (status) {
      case 'success': return 'Geolocalizado';
      case 'error': return 'Falha na geocodificação';
      case 'pending': return 'Geocodificando...';
      default: return 'Sem endereço';
    }
  };

  const deletingSchool = schools.find(s => s.id === deletingId);

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Escolas</h1>
          <p className="page-subtitle">Gerencie as escolas cadastradas no sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Escola
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nome ou cidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Endereço</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Mapa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 16px' }}>
                    {schools.length === 0 ? 'Nenhuma escola cadastrada' : 'Nenhum resultado encontrado'}
                  </td>
                </tr>
              ) : (
                filtered.map(school => (
                  <tr key={school.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{school.nome}</strong>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      {[school.rua, school.numero, school.bairro, school.cidade, school.estado]
                        .filter(Boolean)
                        .join(', ') || <span className="text-muted">—</span>}
                    </td>
                    <td style={{ fontSize: '13px' }}>{school.telefone || <span className="text-muted">—</span>}</td>
                    <td style={{ fontSize: '13px' }}>{school.email || <span className="text-muted">—</span>}</td>
                    <td>
                      <span className={`geocoding-status ${school.geocodingStatus || 'not_attempted'}`}>
                        {school.geocodingStatus === 'success' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {getGeoStatusLabel(school.geocodingStatus)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn-icon"
                          title="Editar"
                          onClick={() => openEdit(school)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Excluir"
                          onClick={() => openDelete(school.id)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Editar Escola' : 'Nova Escola'}</h2>
              <button className="btn-icon" onClick={closeModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid form-grid-2">
                <div className="form-group full-width">
                  <label className="form-label">Nome da Escola *</label>
                  <input
                    className="form-input"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Nome completo da escola"
                  />
                </div>

                <div className="form-section-title">Endereço</div>

                <div className="form-group full-width">
                  <label className="form-label">Rua / Logradouro</label>
                  <input
                    className="form-input"
                    name="rua"
                    value={form.rua}
                    onChange={handleChange}
                    placeholder="Ex: Rua das Flores"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Número</label>
                  <input
                    className="form-input"
                    name="numero"
                    value={form.numero}
                    onChange={handleChange}
                    placeholder="Ex: 123"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bairro</label>
                  <input
                    className="form-input"
                    name="bairro"
                    value={form.bairro}
                    onChange={handleChange}
                    placeholder="Ex: Centro"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input
                    className="form-input"
                    name="cidade"
                    value={form.cidade}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <input
                    className="form-input"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    placeholder="Ex: SP"
                  />
                </div>

                <div className="form-section-title">Contato</div>

                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input
                    className="form-input"
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="Ex: (11) 1234-5678"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input
                    className="form-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="escola@exemplo.com"
                  />
                </div>
              </div>

              {(form.rua || form.cidade) && (
                <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '13px', color: '#0369a1' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  O endereço será geocodificado automaticamente via Nominatim ao salvar.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={geocoding}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={geocoding || !form.nome.trim()}>
                {geocoding ? (
                  <>
                    <span className="spinner" />
                    Geocodificando...
                  </>
                ) : (
                  editingId ? 'Salvar Alterações' : 'Cadastrar Escola'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Exclusão</h2>
              <button className="btn-icon" onClick={() => setShowDeleteModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Deseja realmente excluir a escola <strong>{deletingSchool?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Excluir Escola
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schools;
