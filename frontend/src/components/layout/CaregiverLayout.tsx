import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Pill, History, LogOut, ChevronDown, Plus, HeartHandshake } from 'lucide-react';
import { Caregiver, Patient } from '@/types';
import { apiRequest } from '@/lib/api';

interface CaregiverLayoutProps {
  user: Caregiver;
  patients: Patient[];
  activePatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onAddPatientClick: () => void;
  children: React.ReactNode;
}

export function CaregiverLayout({
  user,
  patients,
  activePatient,
  onSelectPatient,
  onAddPatientClick,
  children,
}: CaregiverLayoutProps) {
  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'Patients', path: '/app/patients', icon: Users },
    { label: 'Medications', path: '/app/medications', icon: Pill },
    { label: 'Dose History', path: '/app/history', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row text-[#202824]">
      {/* Desktop Sidebar (Inspired by Medico & Pharmax) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-[#167C53] flex items-center justify-center text-white font-black text-xl shadow-sm">
              द
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#202824]">DawaReminder</h1>
              <p className="text-[10px] text-[#5C6863] font-medium tracking-wide">CAREGIVER PORTAL</p>
            </div>
          </div>

          {/* Active Patient Switcher */}
          <div className="bg-[#F8FAF9] border border-gray-100 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
              <span>MANAGING</span>
              <button
                onClick={onAddPatientClick}
                className="text-[#167C53] hover:text-[#0D4E34] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {patients.length > 0 ? (
              <div className="relative">
                <select
                  value={activePatient?.id || ''}
                  onChange={(e) => {
                    const sel = patients.find((p) => p.id === Number(e.target.value));
                    if (sel) onSelectPatient(sel);
                  }}
                  className="w-full bg-white border border-gray-200 text-sm font-semibold text-gray-800 rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#167C53]/30 cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.age ? `(${p.age} yrs)` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            ) : (
              <button
                onClick={onAddPatientClick}
                className="w-full text-center py-2 px-3 bg-white border border-dashed border-[#167C53] text-[#167C53] rounded-xl text-xs font-semibold hover:bg-emerald-50 transition"
              >
                + Add First Patient
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#E9F5EF] text-[#167C53]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#167C53]/10 text-[#167C53] font-bold flex items-center justify-center text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-16 md:pb-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#167C53] flex items-center justify-center text-white font-bold">
              द
            </div>
            <span className="font-bold text-gray-900">DawaReminder</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500">
            <span>Family Care</span>
            <span>&bull;</span>
            <span className="text-[#167C53] font-semibold">
              {activePatient ? `Active: ${activePatient.name}` : 'No patient selected'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activePatient && (
              <a
                href={`/p/${activePatient.access_token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF4D6] text-[#B45309] hover:bg-[#ffe9b3] rounded-xl text-xs font-semibold border border-amber-200 transition"
              >
                <HeartHandshake className="w-4 h-4" />
                Open Patient View
              </a>
            )}
            <button
              onClick={handleLogout}
              className="md:hidden text-xs text-gray-500 hover:text-red-600 border px-2 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around z-30 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 text-[11px] font-medium ${
                  isActive ? 'text-[#167C53] font-bold' : 'text-gray-500'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
