import { useState } from 'react';
import { historyEntries, employees } from '../data/mockData';

export default function History() {
  const [search, setSearch] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  const filtered = historyEntries.filter(h => {
    const matchSearch = !search ||
      h.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      h.documentType.toLowerCase().includes(search.toLowerCase()) ||
      h.confirmationCode.toLowerCase().includes(search.toLowerCase());
    const matchEmployee = !filterEmployee || h.employeeId === filterEmployee;
    const matchStatus = !filterStatus || h.status === filterStatus;
    const matchMethod = !filterMethod || h.sendMethod === filterMethod;
    return matchSearch && matchEmployee && matchStatus && matchMethod;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Histórico de Envios</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} registros encontrados</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          📥 Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-navy-600"
            />
          </div>
          <select
            value={filterEmployee}
            onChange={e => setFilterEmployee(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 text-gray-700"
          >
            <option value="">Todos os colaboradores</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.nomeCompleto}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 text-gray-700"
          >
            <option value="">Todos os status</option>
            <option value="entregue">Entregue</option>
            <option value="pendente">Pendente</option>
            <option value="falhou">Falhou</option>
          </select>
          <select
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 text-gray-700"
          >
            <option value="">Todos os canais</option>
            <option value="email">E-mail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Colaborador', 'Matrícula', 'Documento', 'Canal', 'Enviado por', 'Data/Hora', 'Código', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-navy-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {entry.employeeName.split(' ').slice(0,2).map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{entry.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-navy-700 whitespace-nowrap">{entry.matricula}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{entry.documentType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                      entry.sendMethod === 'email' ? 'bg-blue-100 text-blue-700' :
                      entry.sendMethod === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {entry.sendMethod === 'email' ? '📧 E-mail' : entry.sendMethod === 'whatsapp' ? '💬 WhatsApp' : '📤 Ambos'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{entry.createdBy}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{entry.confirmationCode}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      entry.status === 'entregue' ? 'bg-emerald-100 text-emerald-700' :
                      entry.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {entry.status === 'entregue' ? '✓ Entregue' : entry.status === 'pendente' ? '⏳ Pendente' : '✕ Falhou'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhum registro encontrado com os filtros selecionados</div>
          )}
        </div>
      </div>

      {/* Per-employee breakdown */}
      <div>
        <h2 className="font-semibold text-navy-900 mb-4">Histórico por Colaborador</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {employees.map(emp => {
            const empHistory = historyEntries.filter(h => h.employeeId === emp.id);
            const sent = empHistory.filter(h => h.status === 'entregue').length;
            const total = empHistory.length;
            return (
              <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-900 to-navy-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {emp.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{emp.nomeCompleto}</div>
                    <div className="text-xs text-gray-500">{emp.matricula}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Documentos enviados</span>
                  <span className="font-semibold text-gray-700">{sent}/{total}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-navy-900 to-navy-600 rounded-full"
                    style={{ width: total ? `${(sent/total)*100}%` : '0%' }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1.5">{emp.departamento}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
