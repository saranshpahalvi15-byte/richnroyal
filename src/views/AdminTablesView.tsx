import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Table } from '../types';
import { 
  Plus, 
  QrCode, 
  Edit2, 
  Trash2, 
  Users, 
  ExternalLink, 
  AlertTriangle 
} from 'lucide-react';
import { TableModal } from '../components/admin/TableModal';
import { TableQRModal } from '../components/admin/TableQRModal';
import { Modal } from '../components/common/Modal';

export const AdminTablesView: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tables'), (snapshot) => {
      const list: Table[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      // Sort by table number
      list.sort((a, b) => (a.tableNumber || '').localeCompare(b.tableNumber || '', undefined, { numeric: true }));
      setTables(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSaveTable = async (tableData: Partial<Table>) => {
    try {
      if (editingTable) {
        const tableRef = doc(db, 'tables', editingTable.id);
        await updateDoc(tableRef, {
          ...tableData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'tables'), {
          ...tableData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        editingTable ? OperationType.UPDATE : OperationType.CREATE,
        'tables'
      );
    }
  };

  const handleToggleActive = async (table: Table) => {
    try {
      const tableRef = doc(db, 'tables', table.id);
      await updateDoc(tableRef, {
        active: !table.active,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tables/${table.id}`);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      await deleteDoc(doc(db, 'tables', tableToDelete.id));
      setTableToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tables/${tableToDelete.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C99A3D] uppercase tracking-widest block font-royal">
            Dining Areas & Table QRs
          </span>
          <h1 className="text-2xl font-black text-[#5A1724] font-royal">
            Cafe Tables ({tables.length})
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingTable(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} className="text-[#C99A3D]" />
          <span>Add Dining Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-[#5A1724] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#735A53]">Loading cafe tables...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFDF9] rounded-3xl border border-[#EADBCA] p-8 shadow-2xs">
          <QrCode size={36} className="mx-auto text-[#93786F] mb-2" />
          <h3 className="text-sm font-bold text-[#5A1724] font-royal">No tables added yet</h3>
          <p className="text-xs text-[#735A53] mt-1 max-w-sm mx-auto">
            Add your cafe tables to generate instant printable QR codes for customer ordering.
          </p>
          <button
            onClick={() => {
              setEditingTable(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#5A1724] text-[#FFF8ED] text-xs font-bold"
          >
            Add First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => {
            const tableCode = table.tableNumber ? `T${table.tableNumber.padStart(2, '0')}` : table.id;
            return (
              <div
                key={table.id}
                className={`bg-[#FFFDF9] border rounded-3xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${
                  table.active ? 'border-[#EADBCA]' : 'border-stone-300 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0E4D3]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#5A1724] text-[#C99A3D] flex items-center justify-center font-royal font-bold text-sm shadow-xs">
                        {table.tableNumber || '#'}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#5A1724] font-royal leading-tight">
                          {table.tableName}
                        </h3>
                        <span className="text-[11px] text-[#93786F] font-mono">
                          ID: {tableCode}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(table)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        table.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {table.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="py-3 space-y-1.5 text-xs text-[#735A53]">
                    <div className="flex items-center justify-between">
                      <span>Area Section:</span>
                      <strong className="text-[#241A18]">{table.section || 'Main Hall'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Seating Capacity:</span>
                      <strong className="text-[#241A18] flex items-center gap-1">
                        <Users size={13} />
                        {table.capacity || 4} Guests
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#F0E4D3] space-y-2">
                  <button
                    onClick={() => setQrModalTable(table)}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF8ED] hover:bg-[#5A1724] hover:text-[#FFF8ED] text-[#5A1724] border border-[#C99A3D]/50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <QrCode size={15} className="text-[#C99A3D]" />
                    <span>View & Print QR Code</span>
                  </button>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <a
                      href={`/menu?table=${tableCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#735A53] hover:text-[#5A1724] flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink size={12} />
                      <span>Open Customer View</span>
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTable(table);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#5A1724] hover:bg-[#F3E7D5] border border-[#EADBCA]"
                        title="Edit Table"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setTableToDelete(table)}
                        className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200"
                        title="Delete Table"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTable(null);
        }}
        onSave={handleSaveTable}
        tableToEdit={editingTable}
        existingCount={tables.length}
      />

      {/* Table QR Modal */}
      {qrModalTable && (
        <TableQRModal
          isOpen={Boolean(qrModalTable)}
          onClose={() => setQrModalTable(null)}
          table={qrModalTable}
        />
      )}

      {/* Delete Table Modal */}
      {tableToDelete && (
        <Modal
          isOpen={Boolean(tableToDelete)}
          onClose={() => setTableToDelete(null)}
          title="Delete Dining Table"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <p className="text-xs text-[#735A53]">
              Are you sure you want to remove <strong className="text-[#241A18]">{tableToDelete.tableName}</strong>? Customers scanning this QR will no longer be able to place orders.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteTable}
                className="flex-1 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setTableToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
