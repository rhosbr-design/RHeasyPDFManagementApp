import { useState } from 'react';
import logoSrc from './imports/ChatGPT_Image_13_de_ago._de_2026__10_38_37.png';
import Dashboard from './views/Dashboard';
import UploadPDF from './views/UploadPDF';
import Employees from './views/Employees';
import History from './views/History';
import Confirmations from './views/Confirmations';
import Requests from './views/Requests';
import Admission from './views/Admission';
import SignedDocs from './views/SignedDocs';
import Admin from './views/Admin';
import Termination from './views/Termination';
import Companies from './views/Companies';
import SST from './views/SST';
import Vacations from './views/Vacations';
import { solicitacoes } from './data/mockData';

export type View = 'dashboard' | 'upload' | 'employees' | 'history' | 'confirmations' | 'requests' | 'admission' | 'signed' | 'admin' | 'termination' | 'companies' | 'sst' | 'vacations';

interface NavItem { id: View; label: string; icon: string; badge?: number; group?: string }

const pendingRequests = solicitacoes.filter(s => s.status === 'aberta' || s.status === 'em_analise').length;

const navItems: NavItem[] = [
  { id: 'dashboard',     label: 'Painel Principal',      icon: '📊',  group: 'principal' },
  { id: 'requests',      label: 'Solicitações',          icon: '📬',  badge: pendingRequests, group: 'principal' },
  { id: 'upload',        label: 'Importar PDF',          icon: '📤',  group: 'documentos' },
  { id: 'signed',        label: 'Doc. Assinados',        icon: '✍️',  group: 'documentos' },
  { id: 'confirmations', label: 'Comprovantes',          icon: '🔐',  group: 'documentos' },
  { id: 'employees',     label: 'Colaboradores',         icon: '👥',  group: 'rh' },
  { id: 'admission',     label: 'Admissão',              icon: '📋',  group: 'rh' },
  { id: 'sst',           label: 'Saúde e Segurança',     icon: '🏥',  group: 'rh' },
  { id: 'vacations',     label: 'Férias',                icon: '🏖️',  group: 'rh' },
  { id: 'termination',   label: 'Rescisão',              icon: '👋',  group: 'rh' },
  { id: 'history',       label: 'Histórico de Envios',   icon: '📑',  group: 'rh' },
  { id: 'companies',     label: 'Empresas / CNPJs',      icon: '🏢',  group: 'sistema' },
  { id: 'admin',         label: 'Administração',         icon: '⚙️',  group: 'sistema' },
];

const groupLabels: Record<string, string> = {
  principal: 'Principal',
  documentos: 'Documentos',
  rh: 'RH & Pessoas',
  sistema: 'Sistema',
};

const now = new Date();
const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, icon: '📬', text: 'Nova solicitação de férias — Mariana Oliveira', time: '2 min', unread: true },
    { id: 2, icon: '⚠️', text: 'Correção de ponto urgente — Carlos Lima', time: '8 min', unread: true },
    { id: 3, icon: '✅', text: 'Holerites enviados com sucesso — 7 colaboradores', time: '1h', unread: false },
    { id: 4, icon: '📋', text: 'Admissão concluída — Lucas Henrique Tavares', time: '2h', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const groups = [...new Set(navItems.map(n => n.group!))];
  const currentItem = navItems.find(n => n.id === view);

  return (
    <div className="flex h-screen bg-surface overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── Sidebar ── */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: 'linear-gradient(175deg, #060f2a 0%, #0d1f4a 55%, #152a66 100%)' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
          <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
            <img src={logoSrc} alt="RHeasy" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-extrabold text-base leading-none">RHeasy</div>
              <div className="text-white/40 text-xs mt-0.5">Gestão Documental</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-3">
          {groups.map(group => (
            <div key={group}>
              {!collapsed && (
                <div className="px-2 pb-1.5 pt-0.5">
                  <span className="text-white/25 text-xs font-semibold uppercase tracking-widest">{groupLabels[group]}</span>
                </div>
              )}
              <div className="space-y-0.5">
                {navItems.filter(n => n.group === group).map(item => {
                  const active = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative group ${
                        active ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/8 hover:text-white/90'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: 'linear-gradient(180deg,#e8b84b,#c8921a)' }} />}
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-xs">{item.label}</span>
                          {item.badge ? (
                            <span className="text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[1.25rem] text-center"
                              style={{ background: 'linear-gradient(135deg,#e8b84b,#c8921a)' }}>
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                      {collapsed && item.badge ? (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full text-white text-xs" style={{ background: '#c8921a' }} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <button onClick={() => setCollapsed(p => !p)}
            className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/60 py-1.5 rounded-lg text-xs transition-colors">
            <span className="text-base">{collapsed ? '→' : '←'}</span>
            {!collapsed && <span>Recolher</span>}
          </button>
          {!collapsed && (
            <div className="flex items-center gap-2.5 bg-white/8 rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#e8b84b,#c8921a)' }}>AR</div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white/90 truncate">Admin RH</div>
                <div className="text-xs text-white/35 truncate">admin@empresa.com.br</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 bg-white/85 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-base">{currentItem?.icon}</span>
            <span className="text-sm font-semibold text-navy-900">{currentItem?.label}</span>
            {currentItem?.badge ? (
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                {currentItem.badge} pendente{currentItem.badge > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {timeStr} · {dateStr}
            </div>
            <div className="hidden sm:block text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              🏢 Empresa Demo S.A.
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(p => !p)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#c8921a' }} />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-navy-900 text-sm">Notificações</span>
                    <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{unreadCount} novas</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {notifications.map(n => (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-amber-50/40' : ''}`}>
                        <span className="text-lg flex-shrink-0">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-700 leading-relaxed">{n.text}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{n.time} atrás</div>
                        </div>
                        {n.unread && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: '#c8921a' }} />}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100">
                    <button className="text-xs text-navy-700 hover:text-navy-900 font-medium w-full text-center">Ver todas →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" onClick={() => showNotifications && setShowNotifications(false)}>
          {view === 'dashboard'     && <Dashboard onNavigate={v => setView(v as View)} />}
          {view === 'upload'        && <UploadPDF />}
          {view === 'employees'     && <Employees />}
          {view === 'history'       && <History />}
          {view === 'confirmations' && <Confirmations />}
          {view === 'requests'      && <Requests />}
          {view === 'admission'     && <Admission />}
          {view === 'sst'           && <SST />}
          {view === 'vacations'     && <Vacations />}
          {view === 'signed'        && <SignedDocs />}
          {view === 'termination'   && <Termination />}
          {view === 'companies'     && <Companies />}
          {view === 'admin'         && <Admin />}
        </main>
      </div>
    </div>
  );
}
