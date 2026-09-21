import { useState } from 'react';

interface Company {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  status: 'ativo' | 'inativo';
  users: number;
}

const initialCompanies: Company[] = [
  { id: '1', cnpj: '12.345.678/0001-99', razaoSocial: 'Empresa Demo S.A.', nomeFantasia: 'Demo Corp', status: 'ativo', users: 145 },
  { id: '2', cnpj: '98.765.432/0001-11', razaoSocial: 'Filial Nordeste Ltda', nomeFantasia: 'Demo Nordeste', status: 'ativo', users: 32 },
];

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [modal, setModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({ cnpj: '', razaoSocial: '', nomeFantasia: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cnpj || !formData.razaoSocial) return;

    const newCompany: Company = {
      id: Math.random().toString(36).substring(7),
      cnpj: formData.cnpj,
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia || formData.razaoSocial,
      status: 'ativo',
      users: 0,
    };
    setCompanies([...companies, newCompany]);
    setModal(false);
    setFormData({ cnpj: '', razaoSocial: '', nomeFantasia: '' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Múltiplas Empresas (CNPJs)</h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre e gerencie diferentes CNPJs para uso integrado na plataforma.</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-navy-900/20 flex items-center gap-2"
        >
          <span>➕</span>
          Novo CNPJ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div key={company.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute top-6 right-6">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${company.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {company.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-900 text-xl font-bold mb-4">
              🏢
            </div>
            <h3 className="text-lg font-bold text-navy-900 truncate">{company.nomeFantasia}</h3>
            <p className="text-sm text-gray-500 truncate mb-4" title={company.razaoSocial}>{company.razaoSocial}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">CNPJ:</span>
                <span className="font-semibold text-navy-900">{company.cnpj}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Colaboradores:</span>
                <span className="font-semibold text-navy-900">{company.users}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
              <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
                Editar
              </button>
              <button className="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
                Configurar
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-navy-900">Cadastrar Novo CNPJ</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">CNPJ *</label>
                <input
                  required
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Razão Social *</label>
                <input
                  required
                  type="text"
                  value={formData.razaoSocial}
                  onChange={e => setFormData({ ...formData, razaoSocial: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">Nome Fantasia</label>
                <input
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={e => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-navy-900 text-white font-semibold text-sm rounded-xl hover:bg-navy-800 transition-colors shadow-md shadow-navy-900/20">
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
