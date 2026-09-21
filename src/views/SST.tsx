import { useState } from 'react';
import { employees } from '../data/mockData';

interface ASO {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'admissional' | 'periodico' | 'demissional' | 'mudanca_funcao' | 'retorno_trabalho';
  date: string;
  expiration: string;
  status: 'valido' | 'vencendo' | 'vencido';
}

interface EPI {
  id: string;
  employeeId: string;
  employeeName: string;
  item: string;
  ca: string;
  expiration: string;
  supplier: string;
  boughtFrom: string;
  deliveryDate: string;
}

const mockASOs: ASO[] = [
  { id: '1', employeeId: employees[0].id, employeeName: employees[0].nomeCompleto, type: 'admissional', date: '2025-08-01', expiration: '2026-08-01', status: 'valido' },
  { id: '2', employeeId: employees[1].id, employeeName: employees[1].nomeCompleto, type: 'periodico', date: '2025-09-10', expiration: '2026-09-10', status: 'vencendo' },
];

const mockEPIs: EPI[] = [
  { id: '1', employeeId: employees[0].id, employeeName: employees[0].nomeCompleto, item: 'Bota de Segurança', ca: '12345', expiration: '2026-12-01', supplier: 'Safety SA', boughtFrom: 'Loja EpiNet', deliveryDate: '2026-01-10' },
];

export default function SST() {
  const [activeTab, setActiveTab] = useState<'aso' | 'epi'>('aso');
  const [asos, setAsos] = useState<ASO[]>(mockASOs);
  const [epis, setEpis] = useState<EPI[]>(mockEPIs);

  // Modal states
  const [asoModal, setAsoModal] = useState(false);
  const [epiModal, setEpiModal] = useState(false);
  const [printModal, setPrintModal] = useState<string | null>(null);

  // Form states
  const [empId, setEmpId] = useState('');
  
  // ASO Form
  const [asoType, setAsoType] = useState<ASO['type']>('periodico');
  const [asoDate, setAsoDate] = useState('');
  const [asoExp, setAsoExp] = useState('');

  // EPI Form
  const [epiItem, setEpiItem] = useState('');
  const [epiCA, setEpiCa] = useState('');
  const [epiExp, setEpiExp] = useState('');
  const [epiSupp, setEpiSupp] = useState('');
  const [epiBought, setEpiBought] = useState('');

  const handleAddAso = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(x => x.id === empId);
    if (!emp) return;
    setAsos([{
      id: Math.random().toString(),
      employeeId: empId,
      employeeName: emp.nomeCompleto,
      type: asoType,
      date: asoDate,
      expiration: asoExp,
      status: 'valido'
    }, ...asos]);
    setAsoModal(false);
  };

  const handleAddEpi = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(x => x.id === empId);
    if (!emp) return;
    setEpis([{
      id: Math.random().toString(),
      employeeId: empId,
      employeeName: emp.nomeCompleto,
      item: epiItem,
      ca: epiCA,
      expiration: epiExp,
      supplier: epiSupp,
      boughtFrom: epiBought,
      deliveryDate: new Date().toISOString().split('T')[0]
    }, ...epis]);
    setEpiModal(false);
  };

  const employeeEpis = printModal ? epis.filter(e => e.employeeId === printModal) : [];
  const printEmpName = printModal ? employees.find(e => e.id === printModal)?.nomeCompleto : '';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Saúde e Segurança (SST)</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de Atestados de Saúde Ocupacional e Fichas de EPI.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('aso')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'aso' ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'}`}>
            ASOs
          </button>
          <button onClick={() => setActiveTab('epi')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'epi' ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'}`}>
            EPIs
          </button>
        </div>
      </div>

      {activeTab === 'aso' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-navy-900">Atestados (ASO)</h2>
            <button onClick={() => setAsoModal(true)} className="bg-navy-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-md">
              + Registrar ASO
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Colaborador</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Data Exame</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Vencimento</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {asos.map(aso => (
                  <tr key={aso.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 text-sm font-semibold text-navy-900">{aso.employeeName}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 capitalize">{aso.type.replace('_', ' ')}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{new Date(aso.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">{new Date(aso.expiration).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${aso.status === 'valido' ? 'bg-emerald-100 text-emerald-700' : aso.status === 'vencendo' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {aso.status === 'valido' ? 'Válido' : aso.status === 'vencendo' ? 'Vence em breve' : 'Vencido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'epi' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-navy-900">Controle de EPIs</h2>
            <div className="flex gap-2">
              <button onClick={() => setEpiModal(true)} className="bg-navy-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-md">
                + Adicionar EPI
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => {
              const empEpis = epis.filter(e => e.employeeId === emp.id);
              if (empEpis.length === 0) return null;
              return (
                <div key={emp.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-navy-900 text-sm">{emp.nomeCompleto}</h3>
                      <p className="text-xs text-gray-500">{emp.matricula} · {emp.cargo}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-5">
                    {empEpis.map(e => (
                      <div key={e.id} className="bg-gray-50 p-2.5 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-navy-900">{e.item}</div>
                          <div className="text-gray-500">CA: {e.ca} · Val: {new Date(e.expiration).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPrintModal(emp.id)} className="w-full border border-gray-200 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50">
                    🖨️ Imprimir Ficha de EPI
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASO Modal */}
      {asoModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-navy-900">Registrar ASO</h3>
              <button onClick={() => setAsoModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddAso} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1.5">Colaborador</label>
                <select required value={empId} onChange={e => setEmpId(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600">
                  <option value="">Selecione...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.nomeCompleto}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1.5">Tipo de Exame</label>
                <select required value={asoType} onChange={e => setAsoType(e.target.value as ASO['type'])} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600">
                  <option value="admissional">Admissional</option>
                  <option value="periodico">Periódico</option>
                  <option value="demissional">Demissional</option>
                  <option value="mudanca_funcao">Mudança de Função</option>
                  <option value="retorno_trabalho">Retorno ao Trabalho</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Data</label>
                  <input required type="date" value={asoDate} onChange={e => setAsoDate(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Vencimento</label>
                  <input required type="date" value={asoExp} onChange={e => setAsoExp(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-navy-900 text-white py-2.5 rounded-xl text-sm font-semibold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EPI Modal */}
      {epiModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-navy-900">Lançar EPI</h3>
              <button onClick={() => setEpiModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddEpi} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1.5">Colaborador</label>
                <select required value={empId} onChange={e => setEmpId(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600">
                  <option value="">Selecione...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.nomeCompleto}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Item (Ex: Luva, Bota)</label>
                  <input required type="text" value={epiItem} onChange={e => setEpiItem(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Nº do CA</label>
                  <input required type="text" value={epiCA} onChange={e => setEpiCa(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Validade</label>
                  <input required type="date" value={epiExp} onChange={e => setEpiExp(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Fabricante/Fornecedor</label>
                  <input required type="text" value={epiSupp} onChange={e => setEpiSupp(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Onde foi comprado?</label>
                  <input required type="text" value={epiBought} onChange={e => setEpiBought(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:border-navy-600" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-navy-900 text-white py-2.5 rounded-xl text-sm font-semibold">Registrar EPI</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printModal && (
        <div className="fixed inset-0 bg-white z-[60] overflow-y-auto print:bg-white print:static">
          <div className="max-w-4xl mx-auto p-8 print:p-0">
            <div className="flex justify-between items-center mb-8 print:hidden">
              <h2 className="text-xl font-bold">Visualização de Impressão</h2>
              <button onClick={() => setPrintModal(null)} className="px-4 py-2 border rounded-xl font-semibold">Fechar</button>
            </div>

            <div className="border border-black p-8">
              <div className="text-center border-b border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">Ficha de Controle de EPI</h1>
                <p className="text-sm">Empresa Demo S.A.</p>
              </div>
              <div className="mb-6">
                <p><strong>Colaborador:</strong> {printEmpName}</p>
                <p>Declaro ter recebido da empresa os Equipamentos de Proteção Individual (EPI) listados abaixo e comprometo-me a usá-los, conservá-los e devolvê-los quando solicitado.</p>
              </div>
              <table className="w-full border-collapse border border-black text-sm text-left mb-16">
                <thead>
                  <tr>
                    <th className="border border-black p-2">Data</th>
                    <th className="border border-black p-2">EPI</th>
                    <th className="border border-black p-2">CA</th>
                    <th className="border border-black p-2">Validade</th>
                    <th className="border border-black p-2">Assinatura</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeEpis.map(e => (
                    <tr key={e.id}>
                      <td className="border border-black p-2">{new Date(e.deliveryDate).toLocaleDateString('pt-BR')}</td>
                      <td className="border border-black p-2">{e.item}</td>
                      <td className="border border-black p-2">{e.ca}</td>
                      <td className="border border-black p-2">{new Date(e.expiration).toLocaleDateString('pt-BR')}</td>
                      <td className="border border-black p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center pt-8">
                <div className="border-t border-black w-64 text-center text-sm pt-2">
                  Assinatura do Colaborador
                </div>
              </div>
            </div>

            <div className="mt-8 text-center print:hidden">
              <button onClick={() => window.print()} className="bg-navy-900 text-white px-6 py-2.5 rounded-xl font-semibold">Imprimir Ficha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
