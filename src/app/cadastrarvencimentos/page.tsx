'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js'; // MODIFICADO: Importa 'User'
import { useRouter } from 'next/navigation'; // ADICIONADO

// --- INTERFACES E CONFIGURAÇÃO DO SUPABASE ---

interface DueDate {
  id: number;
  name: string;
  date: string; 
  value: number;
  isPaid: boolean;
}

interface FormData {
  name: string;
  date: string;
  value: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ALERTA: Variáveis de ambiente do Supabase não configuradas. A aplicação não funcionará corretamente.');
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);


// --- ÍCONES E COMPONENTES DO SIDEBAR ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconTrendingDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const NavLink = ({ href, icon, children }: { href: string, icon: React.ReactNode, children: React.ReactNode }) => (
      <li>
          <a href={href} className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/10 ${typeof window !== 'undefined' && window.location.pathname.endsWith(href) ? 'bg-teal-500/20 text-teal-300 font-semibold' : ''}`}>
              {icon}
              <span className={`${!isOpen && 'lg:hidden'}`}>{children}</span>
          </a>
      </li>
  );
  return (
      <>
          <div className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
          <aside className={`fixed top-0 left-0 h-full bg-[#1e293b] p-4 flex flex-col z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} lg:relative lg:w-auto ${!isOpen && 'lg:w-20'}`}>
              <div className={`flex items-center gap-3 mb-10 ${isOpen ? 'justify-between' : 'justify-center'}`}>
                  <div className={`flex items-center gap-3 ${!isOpen && 'lg:hidden'}`}>
                      <div className="bg-yellow-400 p-2 rounded-full">
                          <img src="/img/BudgetBuddy Icon 2sgv.svg" alt="Wallet" className="w-8 h-8" />
                      </div>
                      <h1 className="text-xl font-bold">BudgetBuddy</h1>
                  </div>
                  <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-white/10 hidden lg:block">
                      {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
                  </button>
              </div>
              <nav>
                  <ul className="space-y-2">
                      <NavLink href="/dashboard" icon={<IconHome />}>Dashboard</NavLink>
                      <NavLink href="/cadastrarreceitas" icon={<IconTrendingUp />}>Receitas</NavLink>
                      <NavLink href="/cadastrardespesa" icon={<IconTrendingDown />}>Despesas</NavLink>
                      <NavLink href="/cadastrarmeta" icon={<IconTarget />}>Metas</NavLink>
                      <NavLink href="/cadastrarvencimentos" icon={<IconCalendar />}>Vencimentos</NavLink>
                  </ul>
              </nav>
          </aside>
      </>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function DueDateManager() {
  // --- ESTADOS ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ADICIONADO
  const [user, setUser] = useState<User | null>(null); // ADICIONADO
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [formData, setFormData] = useState<FormData>({ name: '', date: '', value: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });
  const [showOnlyPaid, setShowOnlyPaid] = useState(false);

  const router = useRouter(); // ADICIONADO
  const isEditing = editingId !== null;

  // --- FUNÇÃO PARA BUSCAR DADOS DO SUPABASE ---
  // MODIFICADO: Agora aceita userId e filtra os dados
  const fetchDueDates = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('conta')
      .select('*')
      .eq('id_usuario', userId); // MODIFICADO: Filtra por usuário

    if (error) {
      console.error("Erro ao buscar vencimentos:", error);
      alert("Não foi possível carregar os vencimentos.");
    } else {
      const formattedData = data.map((item: any) => ({
        id: item.id_conta,
        name: item.nome,
        date: item.data_vencimento,
        value: item.valor,
        isPaid: item.pago,
      }));
      setDueDates(formattedData);
    }
    setIsLoading(false);
  };

  // --- EFEITO PARA CARREGAMENTO INICIAL ---
  // MODIFICADO: Agora verifica o usuário antes de buscar os dados
  useEffect(() => {
    const checkUserAndFetchData = async () => {
        setIsLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('Nenhum usuário logado ou erro:', userError?.message);
            router.push('/login');
            return;
        }
        
        setUser(user); // Salva o usuário no estado
        await fetchDueDates(user.id); // Busca os dados para o usuário logado
    };

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }

    checkUserAndFetchData();
  }, [router]);


  // --- DEMAIS FUNÇÕES (sem mudanças na lógica interna, mas agora com segurança) ---
  const formatCurrency = (value: number): string => (isNaN(value) || value === null) ? '' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDateToTable = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const { monthName, year, daysInMonth, firstDayOfMonth } = useMemo(() => {
    //... (sem mudanças)
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
    return { monthName, year, daysInMonth, firstDayOfMonth };
  }, [currentDate]);

  const dueDatesByDay = useMemo(() => {
    //... (sem mudanças)
    const map = new Map<number, DueDate[]>();
    dueDates.forEach(dueDate => {
      const d = new Date(dueDate.date + 'T00:00:00');
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(dueDate);
      }
    });
    return map;
  }, [dueDates, currentDate]);
  
  const paidDueDatesCount = useMemo(() => dueDates.filter(d => d.isPaid).length, [dueDates]);

  const displayedDueDates = useMemo(() => {
    //... (sem mudanças)
    if (selectedDay !== null) {
      const selectedDateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      return dueDates.filter(d => d.date === selectedDateStr);
    }
    if (showOnlyPaid) {
        return dueDates.filter(d => d.isPaid).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDates
      .filter(d => new Date(d.date + 'T00:00:00') >= today && !d.isPaid)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dueDates, selectedDay, currentDate, year, showOnlyPaid]);


  // --- MANIPULADORES DE EVENTOS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //... (sem mudanças)
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const changeMonth = (offset: number) => {
    //... (sem mudanças)
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setSelectedDay(null);
  };
  
  const handleDayClick = (day: number) => {
    //... (sem mudanças)
    if (dueDatesByDay.has(day)) {
        setShowOnlyPaid(false);
        setSelectedDay(prev => prev === day ? null : day);
    }
  };

  const toggleShowPaid = () => {
    //... (sem mudanças)
    setSelectedDay(null);
    setShowOnlyPaid(prev => !prev);
  }
  
  const resetForm = () => {
    //... (sem mudanças)
    setFormData({ name: '', date: '', value: '' });
    setEditingId(null);
  };

  // MODIFICADO: Adiciona verificação de usuário e envia id_usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!user) { // ADICIONADO: Checagem de segurança
        alert('Usuário não autenticado. Por favor, faça o login novamente.');
        router.push('/login');
        setIsSubmitting(false);
        return;
    }

    const { name, date, value } = formData;
    if (!name.trim() || !date || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      alert('Por favor, preencha todos os campos corretamente.');
      setIsSubmitting(false);
      return;
    }
    
    const dueData = {
        nome: name.trim(),
        data_vencimento: date,
        valor: parseFloat(value),
        id_usuario: user.id, // ADICIONADO: Envia o ID do usuário
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from('conta').update(dueData).eq('id_conta', editingId).eq('id_usuario', user.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('conta').insert([{ ...dueData, pago: false }]);
      error = insertError;
    }

    if (error) {
        console.error("Erro ao salvar vencimento:", error);
        alert("Ocorreu um erro ao salvar o vencimento.");
    } else {
        await fetchDueDates(user.id); // MODIFICADO: Passa o user.id
        resetForm();
    }

    setIsSubmitting(false);
  };
  
  const handleStartEdit = (dueDate: DueDate) => {
    //... (sem mudanças)
    setEditingId(dueDate.id);
    setFormData({
      name: dueDate.name,
      date: dueDate.date,
      value: dueDate.value.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // MODIFICADO: Adiciona filtro de usuário para segurança
  const handleDelete = async (id: number) => {
    if (!user) return; // ADICIONADO
    const { error } = await supabase.from('conta').delete().eq('id_conta', id).eq('id_usuario', user.id); // MODIFICADO
    if (error) {
        console.error("Erro ao excluir vencimento:", error);
        alert("Não foi possível excluir o vencimento.");
    } else {
        setDueDates(dueDates.filter(d => d.id !== id));
        if (id === editingId) {
            resetForm();
        }
    }
  };

  // MODIFICADO: Adiciona filtro de usuário para segurança
  const handleTogglePaid = async (id: number) => {
    if (!user) return; // ADICIONADO

    const dueDate = dueDates.find(d => d.id === id);
    if (!dueDate) return;

    const newPaidStatus = !dueDate.isPaid;
    const { error } = await supabase.from('conta').update({ pago: newPaidStatus }).eq('id_conta', id).eq('id_usuario', user.id); // MODIFICADO

    if (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Não foi possível atualizar o status de pagamento.");
    } else {
        setDueDates(dueDates.map(d => d.id === id ? { ...d, isPaid: newPaidStatus } : d));
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, day: number) => {
    //... (sem mudanças)
    if (dueDatesByDay.has(day)) {
      const content = dueDatesByDay.get(day)!.map(d => `${d.name}: ${formatCurrency(d.value)}`).join('\n');
      setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    //... (sem mudanças)
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };


  // --- RENDERIZAÇÃO ---
  return (
    <>
      {tooltip.visible && (
        <div className="fixed z-50 p-2 text-sm bg-gray-900 text-white rounded-md shadow-lg whitespace-pre-wrap" style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}>
          {tooltip.content}
        </div>
      )}
      <div className="bg-[#0f172a] min-h-screen flex text-white font-sans">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/10 lg:hidden">
                    <IconMenu />
                </button>
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-400 p-3 rounded-full text-slate-900">
                        <IconCalendar />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-200">Gerenciar Vencimentos</h1>
                        <p className="text-gray-400">Controle suas contas e datas de pagamento.</p>
                    </div>
                </div>
            </header>
          
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="bg-[#1e293b] p-6 rounded-2xl self-start">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-teal-500/20 transition-colors"><IconChevronLeft /></button>
                      <h2 className="text-xl font-bold capitalize text-center w-48">{monthName} {year}</h2>
                      <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-teal-500/20 transition-colors"><IconChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => <div key={day} className="font-bold text-sm text-gray-400">{day}</div>)}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                      {Array.from({ length: daysInMonth }).map((_, day) => {
                        const dayNumber = day + 1;
                        const isToday = new Date().getDate() === dayNumber && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === year;
                        const hasDueDate = dueDatesByDay.has(dayNumber);
                        const isSelected = selectedDay === dayNumber;
                        return (
                          <div key={dayNumber} onClick={() => handleDayClick(dayNumber)} onMouseEnter={(e) => handleMouseEnter(e, dayNumber)} onMouseLeave={handleMouseLeave}
                            className={`relative p-2 rounded-full flex items-center justify-center transition-colors ${ isSelected ? 'bg-yellow-400 text-black font-bold' : isToday ? 'bg-teal-500 text-white font-bold' : hasDueDate ? 'cursor-pointer hover:bg-teal-500/20' : 'text-gray-500' }`}>
                            {dayNumber}
                            {hasDueDate && !isSelected && <div className="absolute bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>}
                          </div>
                        );
                      })}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[#1e293b] p-6 rounded-2xl">
                      <h2 className="text-xl font-bold text-gray-200 mb-4">{isEditing ? 'Editar Vencimento' : 'Cadastro de Vencimentos'}</h2>
                      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-3">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Nome do Vencimento</label>
                          <input type="text" id="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Conta de Luz" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                        </div>
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Data</label>
                          <input type="date" id="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" style={{ colorScheme: 'dark' }}/>
                        </div>
                        <div>
                          <label htmlFor="value" className="block text-sm font-medium text-gray-400 mb-1">Valor</label>
                          <input type="number" id="value" value={formData.value} onChange={handleInputChange} placeholder="R$ 150,00" step="0.01" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none"/>
                        </div>
                        <div>
                          <button type="submit" disabled={isSubmitting} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/20">
                            {isEditing ? 'Salvar' : 'Cadastrar'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-700">{selectedDay ? `Vencimentos do dia ${selectedDay}` : showOnlyPaid ? 'Vencimentos Pagos' : 'Próximos Vencimentos'}</h2>
                            <button onClick={toggleShowPaid} className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${showOnlyPaid ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {paidDueDatesCount} Pagos
                            </button>
                            {selectedDay && <button onClick={() => setSelectedDay(null)} className="ml-auto text-xs font-semibold text-teal-600 hover:underline">Limpar filtro</button>}
                        </div>
                        <div className="overflow-x-auto">
                        {isLoading ? (
                            <p className="text-center p-4 text-gray-400">Carregando vencimentos...</p>
                        ) : displayedDueDates.length === 0 ? (
                            <p className="text-center p-4 text-gray-400">{selectedDay ? 'Nenhum vencimento para este dia.' : showOnlyPaid ? 'Nenhum vencimento pago.' : 'Nenhum vencimento próximo.'}</p>
                        ) : (
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b-2 border-gray-200">
                                  <th className="p-3 text-sm font-semibold text-gray-500">NOME</th>
                                  <th className="p-3 text-sm font-semibold text-gray-500">VALOR</th>
                                  <th className="p-3 text-sm font-semibold text-gray-500">DATA</th>
                                  <th className="p-3 text-sm font-semibold text-gray-500 text-center">AÇÕES</th>
                                </tr>
                              </thead>
                              <tbody>
                              {displayedDueDates.map(dueDate => (
                                <tr key={dueDate.id} className={`border-b border-gray-200 transition-colors ${dueDate.isPaid ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                                  <td className={`p-4 font-medium ${dueDate.isPaid ? 'line-through text-gray-400' : ''}`}>{dueDate.name}</td>
                                  <td className={`p-4 font-semibold ${dueDate.isPaid ? 'line-through text-gray-400' : 'text-red-600'}`}>{formatCurrency(dueDate.value)}</td>
                                  <td className={`p-4 ${dueDate.isPaid ? 'line-through text-gray-400' : ''}`}>{formatDateToTable(dueDate.date)}</td>
                                  <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <button onClick={() => handleStartEdit(dueDate)} title="Editar" className="p-2 rounded-full hover:bg-blue-100 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                      </button>
                                      <button onClick={() => handleTogglePaid(dueDate.id)} title={dueDate.isPaid ? 'Marcar como pendente' : 'Marcar como pago'} className="p-2 rounded-full hover:bg-green-100 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></button>
                                      <button onClick={() => handleDelete(dueDate.id)} title="Excluir" className="p-2 rounded-full hover:bg-red-100 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              </tbody>
                            </table>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </>
  );
}