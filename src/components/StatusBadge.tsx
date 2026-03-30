import React from 'react';
import type { EquipmentStatus } from '../types';

interface StatusBadgeProps {
  status: EquipmentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getClass = () => {
    switch (status) {
      case 'Ativo':
        return 'badge badge-ativo';
      case 'Manutenção':
        return 'badge badge-manutencao';
      case 'Inativo':
        return 'badge badge-inativo';
      default:
        return 'badge';
    }
  };

  return <span className={getClass()}>{status}</span>;
};

export default StatusBadge;
