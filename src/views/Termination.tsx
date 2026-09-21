import { useState } from 'react';
import { employees } from '../data/mockData';

type Status = 'pending_director' | 'pending_hr' | 'completed';

interface Termination {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  reason: string;
  status: Status;
  requestedBy: string;
  requestedAt: string;
  approvedByDirectorAt?: string;
}

const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const initialTerminations: Termination[] = [
  { id: '1', employeeId: employees[0].id, employeeName: employees[0].nomeCompleto, date: '2026-09-15', reason: 'Redução de quadro', status: 'pending_director', requestedBy: 'João Silva (Gerente)', requestedAt: '2026-09-01T10:00:00Z' },
  // This one was approved 8 days ago (2 days left to pay)
  { id: '2', employeeId: employees[1].id, employeeName: employees[1].nomeCompleto, date: '2026-08-30', reason: 'Baixo desempenho', status: 'pending_hr', requestedBy: 'Maria Souza (Gerente)', requestedAt: '2026-08-25T14:30:00Z', approvedByDirectorAt: getPastDate(8) },
];

export default function Termination() {
  const [terminations, setTerminations] = useState<Termination[]>(initialTerminations);
  const [modal, setModal] = useState<boolean>(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [termDate, setTermDate] = useState('');
  const [termReason, setTermReason] = useState('');

  const activeEmployees = employees.filter(e => !terminations.find(t => t.employeeId === e.id && t.status !== 'completed'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !termDate || !termReason) return;
    const emp = employees.find(e => e.id === selectedEmp);
    if (!emp) return;

    const newTerm: Termination = {
      id: Math.random().toString(36).substring(7),
      employeeId: emp.id,
      employeeName: emp.nomeCompleto,
      date: termDate,
      reason: termReason,
      status: 'pending_director',
      requestedBy: 'Você (Gerente)',
      requestedAt: new Date().toISOString(),
    };
    setTerminations([newTerm, ...terminations]);
    setModal(false);
    setSelectedEmp('');
    setTermDate('');
    setTermReason('');
  };

  const handleApproveDirector = (id: string) => {
    setTerminations(prev => prev.map(t => t.id === id ? { ...t, status: 'pending_hr', approvedByDirectorAt: new Date().toISOString() } : t));
  };

  const handleApproveHR = (id: string) => {
    setTerminations(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'pending_director': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">Aprovação: Diretor</span>;
      case 'pending_hr': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">Aprovação: RH</span>;
      case 'completed': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">Concluído</span>;
    }
  };

  // Check for approaching deadlines (10 days after director's approval)
  const now = new Date();
  let alerts = 0;
  const processedTerminations = terminations.map(t => {
    let daysLeft = null;
    let isApproaching = false;
    
    if (t.status === 'pending_hr' && t.approvedByDirectorAt) {
      const approvedAt = new Date(t.approvedByDirectorAt);
      const deadline = new Date(approvedAt);
      deadline.setDate(deadline.getDate() + 10);
      
      const diffMs = deadline.getTime() - now.getTime();
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 3 && daysLeft >= 0) {
        isApproaching = true;
        alerts++;
      }
    }
    return { ...t, daysLeft, isApproaching };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Desligamentos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie solicitações de rescisão e aprovações.</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-navy-900/20 flex items-center gap-2"
        >
          <span>➕</span>
          Nova Solicitação
        </button>
      </div>

      {alerts > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-red-900 font-bold text-sm">Alerta de Pagamento de Rescisão!</h3>
            <p className="text-red-700 text-sm mt-0.5">
              Você possui <strong>{alerts} rescisão(ões)</strong> com o prazo de pagamento (10 dias após a aprovação da diretoria) vencendo em 3 dias ou menos. Conclua os pagamentos e aprove no sistema.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Colaborador</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Rescisão</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status / Prazo</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processedTerminations.map(t => (
              <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${t.isApproaching ? 'bg-red-50/30' : ''}`}>
                <td className="py-4 px-6">
                  <div className="text-sm font-semibold text-navy-900">{t.employeeName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Solicitado por {t.requestedBy}</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{t.reason}</td>
                <td className="py-4 px-6">
                  <div>{getStatusBadge(t.status)}</div>
                  {t.isApproaching && (
                    <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md inline-block">
                      Vence em {t.daysLeft} dia(s)
                    </div>
                  )}
                  {t.daysLeft !== null && !t.isApproaching && t.status === 'pending_hr' && t.daysLeft >= 0 && (
                    <div className="mt-1 text-[10px] text-gray-500">
                      Prazo para pgto: {t.daysLeft} dias restantes
                    </div>
                  )}
                  {t.daysLeft !== null && t.daysLeft < 0 && t.status === 'pending_hr' && (
                    <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md inline-block">
                      PRAZO VENCIDO
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  {t.status === 'pending_director' && (
                    <button onClick={() => handleApproveDirector(t.id)} className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                      Aprovar (Diretor)
                    </button>
                  )}
                  {t.status === 'pending_hr' && (
                    <button onClick={() => handleApproveHR(t.id)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                      Aprovar Pgto. (RH)
                    </button>
                  )}
                  {t.status === 'completed' && (
                    <span className="text-xs font-semibold text-gray-400">Sem ações</span>
                  )}
                </td>
              </tr>
            ))}
            {terminations.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                  Nenhuma solicitação de rescisão encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-navy-900">Aviso de Rescisão</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Colaborador</label>
                <select
                  required
                  value={selectedEmp}
                  onChange={e => setSelectedEmp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                >
                  <option value="">Selecione um colaborador...</option>
                  {activeEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.nomeCompleto} - {e.matricula}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Data Prevista</label>
                <input
                  required
                  type="date"
                  value={termDate}
                  onChange={e => setTermDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Motivo / Observações</label>
                <textarea
                  required
                  value={termReason}
                  onChange={e => setTermReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all resize-none"
                  placeholder="Ex: Baixo desempenho, redução de custos, etc."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-navy-900 text-white font-semibold text-sm rounded-xl hover:bg-navy-800 transition-colors shadow-md shadow-navy-900/20">
                  Emitir Aviso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
