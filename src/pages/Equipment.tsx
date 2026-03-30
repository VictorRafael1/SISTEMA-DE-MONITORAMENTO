import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { School, Equipment as EquipmentType, EquipmentStatus, EquipmentType as EqType } from '../types';
import StatusBadge from '../components/StatusBadge';

const EQUIPMENT_TYPES: EqType[] = ['Computador', 'Tablet', 'Projetor', 'Impressora', 'Roteador', 'Monitor', 'Outro'];
const STATUSES: EquipmentStatus[] = ['Ativo', 'Manutenção', 'Inativo'];

const emptyForm: Omit<EquipmentType, 'id'> = {
  nome: '',
  tipo: 'Computador',
  numeroSerie: '',
  status: 'Ativo',
  escolaId: '',
  dataAquisicao: '',
  observacoes: '',
};

const Equipment: React.FC = () => {
  const [schools] = useLocalStorage<School[]>('schools', []);
  const [equipment, setEquipment] = useLocalStorage<EquipmentType[]>('equipment', []);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<EquipmentType, 'id'>>(emptyForm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | ''>('');

  const openAdd = () => {
    setForm({ ...emptyForm, escolaId: schools[0]?.id || '' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (eq: EquipmentType) => {
    const { id, ...rest } = eq;
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.escolaId) return;

    if (editingId) {
      setEquipment(prev =>
        prev.map(e => e.id === editingId ? { ...form, id: editingId } : e)
      );
    } else {
      const newEq: EquipmentType = {
        ...form,
        id: crypto.randomUUID(),
      };
      setEquipment(prev => [...prev, newEq]);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (deletingId) {
      setEquipment(prev => prev.filter(e => e.id !== deletingId));
    }
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const getSchoolName = (id: string) => {
    return schools.find(s => s.id === id)?.nome || <span className="text-muted">Escola não encontrada</span>;
  };

  const filtered = equipment.filter(eq => {
    const matchSearch =
      eq.nome.toLowerCase().includes(search.toLowerCase()) ||
      eq.numeroSerie.toLowerCase().includes(search.toLowerCase()) ||
      eq.tipo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === '' || eq.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const deletingEq = equipment.find(e => e.id === deletingId);

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Equipamentos</h1>
          <p className="page-subtitle">Gerencie os equipamentos cadastrados no sistema</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openAdd}
          disabled={schools.length === 0}
          title={schools.length === 0 ? 'Cadastre uma escola primeiro' : ''}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Equipamento
        </button>
      </div>

      {schools.length === 0 && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', color: '#92400e', fontSize: '14px', marginBottom: '16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Para cadastrar equipamentos, primeiro cadastre ao menos uma escola.
        </div>
      )}

      <div className="filter-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nome, tipo ou número de série..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as EquipmentStatus | '')}
        >
          <option value="">Todos os status</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>N° Série / Patrimônio</th>
                <th>Status</th>
                <th>Escola</th>
                <th>Aquisição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 16px' }}>
                    {equipment.length === 0 ? 'Nenhum equipamento cadastrado' : 'Nenhum resultado encontrado'}
                  </td>
                </tr>
              ) : (
                filtered.map(eq => (
                  <tr key={eq.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{eq.nome}</strong>
                      {eq.observacoes && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {eq.observacoes.substring(0, 60)}{eq.observacoes.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ padding: '3px 8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>
                        {eq.tipo}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>
                      {eq.numeroSerie || <span className="text-muted">—</span>}
                    </td>
                    <td><StatusBadge status={eq.status} /></td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>{getSchoolName(eq.escolaId)}</td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {eq.dataAquisicao
                        ? new Date(eq.dataAquisicao + 'T00:00:00').toLocaleDateString('pt-BR')
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" title="Editar" onClick={() => openEdit(eq)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="btn-icon danger" title="Excluir" onClick={() => openDelete(eq.id)}>
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
              <h2 className="modal-title">{editingId ? 'Editar Equipamento' : 'Novo Equipamento'}</h2>
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
                  <label className="form-label">Nome do Equipamento *</label>
                  <input
                    className="form-input"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Ex: Notebook Dell Latitude"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" name="tipo" value={form.tipo} onChange={handleChange}>
                    {EQUIPMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">N° de Série / Patrimônio</label>
                  <input
                    className="form-input"
                    name="numeroSerie"
                    value={form.numeroSerie}
                    onChange={handleChange}
                    placeholder="Ex: SN-12345-ABC"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Aquisição</label>
                  <input
                    className="form-input"
                    type="date"
                    name="dataAquisicao"
                    value={form.dataAquisicao}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Escola *</label>
                  <select
                    className="form-select"
                    name="escolaId"
                    value={form.escolaId}
                    onChange={handleChange}
                  >
                    <option value="">Selecione uma escola</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-textarea"
                    name="observacoes"
                    value={form.observacoes}
                    onChange={handleChange}
                    placeholder="Observações adicionais sobre o equipamento..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!form.nome.trim() || !form.escolaId}
              >
                {editingId ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
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
                Deseja realmente excluir o equipamento <strong>{deletingEq?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Excluir Equipamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
