import { useState, useMemo } from 'react';
import { employees } from '../data/mockData';

type Status = 'pending_director' | 'pending_hr' | 'completed';
type ReqType = 'agendamento' | 'simulacao';

interface Vacation {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  days: number;
  abono: boolean;
  type: ReqType;
  status: Status;
  requestedBy: string;
  requestedAt: string;
}

const initialVacations: Vacation[] = [
  { id: '1', employeeId: employees[0].id, employeeName: employees[0].nomeCompleto, startDate: '2026-11-05', days: 20, abono: true, type: 'agendamento', status: 'completed', requestedBy: 'João Silva (Gerente)', requestedAt: '2026-09-01T10:00:00Z' },
  { id: '2', employeeId: employees[1].id, employeeName: employees[1].nomeCompleto, startDate: '2026-11-20', days: 15, abono: false, type: 'agendamento', status: 'pending_hr', requestedBy: 'Maria Souza (Gerente)', requestedAt: '2026-08-25T14:30:00Z' },
  { id: '3', employeeId: employees[2].id, employeeName: employees[2].nomeCompleto, startDate: '2026-12-10', days: 30, abono: false, type: 'agendamento', status: 'pending_director', requestedBy: 'Carlos Lima (Gerente)', requestedAt: '2026-09-05T10:00:00Z' },
];

export default function Vacations() {
  const [vacations, setVacations] = useState<Vacation[]>(initialVacations);
  const [modal, setModal] = useState<boolean>(false);
  
  // Form
  const [selectedEmp, setSelectedEmp] = useState('');
  const [startDate, setStartDate] = useState('');
  const [daysCount, setDaysCount] = useState<number>(30);
  const [abono, setAbono] = useState<boolean>(false);
  const [reqType, setReqType] = useState<ReqType>('agendamento');

  const approvedVacations = useMemo(() => {
    const list = vacations.filter(v => v.status !== 'pending_director' && v.type === 'agendamento');
    const grouped = list.reduce((acc, v) => {
      const d = new Date(v.startDate);
      // workaround timezone issues for grouping
      const key = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      const capKey = key.charAt(0).toUpperCase() + key.slice(1);
      if (!acc[capKey]) acc[capKey] = [];
      acc[capKey].push(v);
      return acc;
    }, {} as Record<string, Vacation[]>);

    // sort by month roughly
    return Object.entries(grouped).sort((a, b) => {
      return new Date(a[1][0].startDate).getTime() - new Date(b[1][0].startDate).getTime();
    });
  }, [vacations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !startDate || daysCount <= 0) return;
    const emp = employees.find(e => e.id === selectedEmp);
    if (!emp) return;

    const newVacation: Vacation = {
      id: Math.random().toString(36).substring(7),
      employeeId: emp.id,
      employeeName: emp.nomeCompleto,
      startDate,
      days: daysCount,
      abono,
      type: reqType,
      status: 'pending_director',
      requestedBy: 'Você (Gerente)',
      requestedAt: new Date().toISOString(),
    };
    setVacations([newVacation, ...vacations]);
    setModal(false);
    
    // Reset
    setSelectedEmp('');
    setStartDate('');
    setDaysCount(30);
    setAbono(false);
    setReqType('agendamento');
  };

  const handleAbonoChange = (checked: boolean) => {
    setAbono(checked);
    if (checked && daysCount > 20) {
      setDaysCount(20);
    }
  };

  const handleApproveDirector = (id: string) => {
    setVacations(prev => prev.map(t => t.id === id ? { ...t, status: 'pending_hr' } : t));
  };

  const handleApproveHR = (id: string) => {
    setVacations(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'pending_director': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">Aprovação: Diretor</span>;
      case 'pending_hr': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">Aprovação: RH</span>;
      case 'completed': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">Concluído</span>;
    }
  };

  const getTypeBadge = (type: ReqType) => {
    if (type === 'simulacao') return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-md">Simulação</span>;
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase rounded-md">Agendamento</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Solicitações de Férias</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie pedidos de férias, programação aprovada e simulações.</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-navy-900/20 flex items-center gap-2"
        >
          <span>➕</span>
          Nova Solicitação
        </button>
      </div>

      {approvedVacations.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2">
            <span>📅</span> Programação Aprovada (Mensal)
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {approvedVacations.map(([month, vacs]) => (
              <div key={month} className="min-w-[280px] bg-gray-50 border border-gray-100 rounded-2xl p-4 snap-start shrink-0">
                <div className="text-sm font-bold text-navy-900 capitalize mb-3 border-b border-gray-200 pb-2">{month}</div>
                <div className="space-y-3">
                  {vacs.map(v => {
                    const d = new Date(v.startDate);
                    d.setTime(d.getTime() + d.getTimezoneOffset() * 60000); // fix tz 
                    return (
                      <div key={v.id} className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{v.employeeName}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            Início: {d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ({v.days} dias)
                          </div>
                        </div>
                        {v.status === 'pending_hr' ? (
                          <span className="w-2 h-2 rounded-full bg-blue-400 mt-1 shadow-sm" title="Aprovado pelo Diretor, pendente RH" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shadow-sm" title="Concluído" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Colaborador / Tipo</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de Início</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dias / Abono</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vacations.map(v => {
               const dt = new Date(v.startDate);
               dt.setTime(dt.getTime() + dt.getTimezoneOffset() * 60000);
               return (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-navy-900">{v.employeeName}</span>
                      {getTypeBadge(v.type)}
                    </div>
                    <div className="text-xs text-gray-500">Solicitado por {v.requestedBy}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {dt.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-navy-900">{v.days} dias</span>
                    {v.abono && <span className="ml-2 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md">+ Abono</span>}
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(v.status)}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {v.status === 'pending_director' && (
                      <button onClick={() => handleApproveDirector(v.id)} className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        Aprovar (Diretor)
                      </button>
                    )}
                    {v.status === 'pending_hr' && (
                      <button onClick={() => handleApproveHR(v.id)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        {v.type === 'simulacao' ? 'Enviar Simulação (RH)' : 'Aprovar (RH)'}
                      </button>
                    )}
                    {v.status === 'completed' && (
                      <span className="text-xs font-semibold text-gray-400">Processado</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {vacations.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                  Nenhuma solicitação encontrada.
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
              <h3 className="text-lg font-bold text-navy-900">Solicitar Férias</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Colaborador</label>
                <select
                  required
                  value={selectedEmp}
                  onChange={e => setSelectedEmp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                >
                  <option value="">Selecione um colaborador...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.nomeCompleto} - {e.matricula}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-2">Tipo de Pedido</label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-xl text-sm cursor-pointer transition-all ${reqType === 'agendamento' ? 'bg-navy-50 border-navy-900 text-navy-900 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="reqType" value="agendamento" checked={reqType === 'agendamento'} onChange={() => setReqType('agendamento')} className="hidden" />
                    📅 Agendamento
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-xl text-sm cursor-pointer transition-all ${reqType === 'simulacao' ? 'bg-purple-50 border-purple-600 text-purple-700 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="reqType" value="simulacao" checked={reqType === 'simulacao'} onChange={() => setReqType('simulacao')} className="hidden" />
                    🧮 Simulação
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Data de Início</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Qtd. de Dias</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max={abono ? 20 : 30}
                    value={daysCount}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setDaysCount(abono && val > 20 ? 20 : val);
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="abono"
                  checked={abono}
                  onChange={e => handleAbonoChange(e.target.checked)}
                  className="w-4 h-4 text-navy-900 border-gray-300 rounded focus:ring-navy-900 cursor-pointer"
                />
                <label htmlFor="abono" className="text-sm text-gray-700 font-semibold cursor-pointer">
                  Férias com Abono (Vender 10 dias)
                </label>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-navy-900 text-white font-semibold text-sm rounded-xl hover:bg-navy-800 transition-colors shadow-md shadow-navy-900/20">
                  {reqType === 'simulacao' ? 'Pedir Simulação' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
