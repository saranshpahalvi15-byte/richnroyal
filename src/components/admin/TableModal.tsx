import React, { useState, useEffect } from 'react';
import { Table } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tableData: Partial<Table>) => Promise<void>;
  tableToEdit?: Table | null;
  existingCount: number;
}

export const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tableToEdit,
  existingCount,
}) => {
  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState<number>(4);
  const [section, setSection] = useState('Main Hall');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (tableToEdit) {
      setTableNumber(tableToEdit.tableNumber || '');
      setTableName(tableToEdit.tableName || '');
      setCapacity(tableToEdit.capacity || 4);
      setSection(tableToEdit.section || 'Main Hall');
      setActive(tableToEdit.active !== false);
    } else {
      const nextNum = String(existingCount + 1).padStart(2, '0');
      setTableNumber(nextNum);
      setTableName(`Table ${nextNum}`);
      setCapacity(4);
      setSection('Main Hall');
      setActive(true);
    }
    setFormError(null);
  }, [tableToEdit, isOpen, existingCount]);

  const handleNumberChange = (num: string) => {
    setTableNumber(num);
    if (!tableToEdit) {
      setTableName(`Table ${num}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      setFormError('Table number is required.');
      return;
    }
    if (!tableName.trim()) {
      setFormError('Table name is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await onSave({
        tableNumber: tableNumber.trim(),
        tableName: tableName.trim(),
        capacity: Number(capacity) || 4,
        section: section.trim() || 'Main Hall',
        active,
      });
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save table');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tableToEdit ? 'Edit Dining Table' : 'Add New Dining Table'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
              Table Number *
            </label>
            <input
              type="text"
              required
              value={tableNumber}
              onChange={(e) => handleNumberChange(e.target.value)}
              placeholder="e.g. 04"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
              Seating Capacity
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Display Name *
          </label>
          <input
            type="text"
            required
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="e.g. Table 04, Royal VIP Lounge"
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Dining Area / Section
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
          >
            <option value="Main Hall">Main Hall</option>
            <option value="Royal Lounge">Royal Lounge</option>
            <option value="Terrace Garden">Terrace Garden</option>
            <option value="Outdoor Patio">Outdoor Patio</option>
            <option value="Balcony Area">Balcony Area</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-white border border-[#EADBCA] rounded-2xl">
          <div>
            <span className="text-xs font-bold text-[#241A18] block">Active Table</span>
            <span className="text-[11px] text-[#735A53]">Customers can only order if the table is active</span>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              active ? 'bg-emerald-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                active ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0E4D3]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#735A53] hover:bg-[#F3E7D5]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : tableToEdit ? 'Save Changes' : 'Create Table'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
