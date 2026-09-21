import { useState, useRef } from 'react';
import { employees as initialEmployees, type Employee } from '../data/mockData';

type FormData = {
  nomeCompleto: string; matricula: string; cpf: string;
  telefone: string; email: string; departamento: string; cargo: string;
};

const emptyForm: FormData = {
  nomeCompleto: '', matricula: '', cpf: '', telefone: '', email: '', departamento: '', cargo: '',
};

const formFields: { label: string; key: keyof FormData; full?: boolean; placeholder?: string }[] = [
  { label: 'Nome Completo *', key: 'nomeCompleto', full: true },
  { label: 'Matrícula *', key: 'matricula' },
  { label: 'CPF *', key: 'cpf', placeholder: '000.000.000-00' },
  { label: 'Telefone *', key: 'telefone', placeholder: '(00) 00000-0000' },
  { label: 'E-mail *', key: 'email', full: true },
  { label: 'Departamento', key: 'departamento' },
  { label: 'Cargo', key: 'cargo' },
];

export default function Employees() {
  const [tab, setTab] = useState<'list' | 'import'>('list');
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; employee?: Employee } | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = employees.filter(e =>
    e.nomeCompleto.toLowerCase().includes(search.toLowerCase()) ||
    e.matricula.toLowerCase().includes(search.toLowerCase()) ||
    e.cpf.includes(search) ||
    e.departamento.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setModal({ mode: 'add' }); };
  const openEdit = (emp: Employee) => {
    setForm({
      nomeCompleto: emp.nomeCompleto, matricula: emp.matricula, cpf: emp.cpf,
      telefone: emp.telefone, email: emp.email, departamento: emp.departamento, cargo: emp.cargo,
    });
    setModal({ mode: 'edit', employee: emp });
  };

  const closeModal = () => { setModal(null); setForm(emptyForm); };

  const handleSave = () => {
    if (!form.nomeCompleto || !form.matricula || !form.cpf || !form.email) return;
    const avatar = form.nomeCompleto.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
    if (modal?.mode === 'add') {
      setEmployees(prev => [...prev, { ...form, id: `manual-${Date.now()}`, avatar }]);
    } else if (modal?.mode === 'edit' && modal.employee) {
      setEmployees(prev => prev.map(e => e.id === modal.employee!.id ? { ...e, ...form, avatar } : e));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
  };

  const handleImportFile = () => {
    setImportStatus('processing');
    setTimeout(() => {
      const mockImported: Employee[] = [
        { id: `imp-${Date.now()}-1`, nomeCompleto: 'Bruna Cavalcanti Silva', matricula: 'MAT-2401', cpf: '901.234.567-88', telefone: '(51) 98765-4321', email: 'bruna.silva@empresa.com.br', departamento: 'RH', cargo: 'Assistente de RH', avatar: 'BS' },
        { id: `imp-${Date.now()}-2`, nomeCompleto: 'Thiago Monteiro Azevedo', matricula: 'MAT-2402', cpf: '012.345.678-99', telefone: '(51) 97654-3210', email: 'thiago.azevedo@empresa.com.br', departamento: 'TI', cargo: 'Analista de TI', avatar: 'TA' },
        { id: `imp-${Date.now()}-3`, nomeCompleto: 'Larissa Pinto Andrade', matricula: 'MAT-2403', cpf: '123.456.780-00', telefone: '(62) 99876-5432', email: 'larissa.andrade@empresa.com.br', departamento: 'Financeiro', cargo: 'Assistente Financeiro', avatar: 'LA' },
      ];
      setEmployees(prev => [...prev, ...mockImported]);
      setImportedCount(mockImported.length);
      setImportStatus('success');
    }, 1800);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Colaboradores</h1>
          <p className="text-sm text-gray-500 mt-1">{employees.length} colaboradores cadastrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm"
        >
          + Novo Colaborador
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['list', 'import'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'list' ? '👥 Lista de Colaboradores' : '📊 Importar via Excel'}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nome, matrícula, CPF ou departamento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-navy-600 shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Colaborador', 'Matrícula', 'CPF', 'Telefone', 'E-mail', 'Departamento', 'Cargo', 'Ações'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-navy-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {emp.avatar}
                          </div>
                          <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{emp.nomeCompleto}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-navy-700 whitespace-nowrap">{emp.matricula}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{emp.cpf}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{emp.telefone}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 whitespace-nowrap">{emp.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{emp.departamento || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{emp.cargo || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(emp)}
                            title="Editar"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-700 transition-colors text-xs font-medium"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(emp.id)}
                            title="Excluir"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors text-xs font-medium"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">Nenhum colaborador encontrado</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-navy-900 mb-4">Importação via Planilha Excel</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">⚠️ Campos obrigatórios na planilha:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['Nome Completo', 'Matrícula', 'CPF', 'Telefone', 'E-mail'].map(f => (
                  <div key={f} className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium text-amber-900 text-center">{f}</div>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-gray-200 rounded-xl overflow-hidden text-sm">
                <thead>
                  <tr className="bg-navy-900 text-white">
                    {['A — Nome Completo *', 'B — Matrícula *', 'C — CPF *', 'D — Telefone *', 'E — E-mail *', 'F — Departamento', 'G — Cargo'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50 text-gray-500 text-xs">
                    <td className="px-4 py-2.5">João da Silva Oliveira</td>
                    <td className="px-4 py-2.5">MAT-0001</td>
                    <td className="px-4 py-2.5">000.000.000-00</td>
                    <td className="px-4 py-2.5">(11) 99999-9999</td>
                    <td className="px-4 py-2.5">joao@empresa.com</td>
                    <td className="px-4 py-2.5">RH</td>
                    <td className="px-4 py-2.5">Analista</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {importStatus === 'idle' && (
              <div className="drop-zone p-10 flex flex-col items-center justify-center cursor-pointer text-center" onClick={() => fileRef.current?.click()}>
                <div className="text-4xl mb-3">📊</div>
                <div className="font-semibold text-navy-900 mb-1">Clique para selecionar a planilha</div>
                <div className="text-sm text-gray-500">.xlsx ou .xls — máximo 1.000 colaboradores</div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
              </div>
            )}
            {importStatus === 'processing' && (
              <div className="py-8 flex flex-col items-center">
                <div className="text-4xl mb-4 animate-spin">⚙️</div>
                <div className="font-semibold text-navy-900">Processando planilha...</div>
                <div className="text-sm text-gray-500 mt-1">Validando campos obrigatórios e CPFs</div>
              </div>
            )}
            {importStatus === 'success' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <div className="font-semibold text-emerald-800 text-lg">{importedCount} colaboradores importados com sucesso!</div>
                <button onClick={() => { setImportStatus('idle'); setTab('list'); }} className="mt-4 bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
                  Ver Colaboradores →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-navy-900 text-lg">
                  {modal.mode === 'add' ? 'Novo Colaborador' : 'Editar Colaborador'}
                </h2>
                {modal.mode === 'edit' && (
                  <p className="text-xs text-gray-500 mt-0.5">{modal.employee?.matricula}</p>
                )}
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {formFields.map(f => (
                  <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-100 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.nomeCompleto || !form.matricula || !form.cpf || !form.email}
                  className="flex-1 bg-navy-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {modal.mode === 'add' ? 'Cadastrar' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Excluir colaborador?</h2>
            <p className="text-sm text-gray-500 mb-6">
              {employees.find(e => e.id === deleteConfirm)?.nomeCompleto}<br />
              <span className="text-xs">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
