'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js'; // MODIFICADO: Importa 'User'
import { useRouter } from 'next/navigation'; // ADICIONADO

// --- INTERFACES E CONFIGURAÇÃO DO SUPABASE ---

interface Goal {
  id: number;
  name: string;
  targetValue: number;
  currentValue: number;
  date: string;
  isCompleted: boolean;
}

interface FormData {
  name: string;
  targetValue: string;
  date: string;
}

interface ModalState {
  isOpen: boolean;
  goalId: number | null;
  goalName: string;
  action: 'add' | 'remove';
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


// --- COMPONENTE DO MODAL ---
const ValueUpdateModal = ({ modalState, onClose, onSubmit }: { modalState: ModalState; onClose: () => void; onSubmit: (amount: number) => void; }) => {
  const [amount, setAmount] = useState('');
  if (!modalState.isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, insira um valor numérico válido.');
      return;
    }
    onSubmit(numericAmount);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-teal-500/30 p-6 rounded-2xl shadow-lg w-full max-w-sm m-4">
        <h3 className="text-lg font-bold text-white mb-2">
          {modalState.action === 'add' ? 'Adicionar Valor à Meta' : 'Remover Valor da Meta'}
        </h3>
        <p className="text-sm text-gray-400 mb-4 truncate">"{modalState.goalName}"</p>
        <form onSubmit={handleFormSubmit}>
          <label htmlFor="modalValue" className="block text-sm font-medium text-gray-400 mb-1">Valor a {modalState.action === 'add' ? 'adicionar' : 'remover'}</label>
          <input type="number" id="modalValue" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="R$ 50,00" step="0.01" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none" autoFocus />
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-600/30 transition-colors">Cancelar</button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold transition-colors shadow-lg shadow-teal-500/20">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function GoalManager() {
  // --- ESTADOS ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ADICIONADO
  const [user, setUser] = useState<User | null>(null); // ADICIONADO
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', targetValue: '', date: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, goalId: null, goalName: '', action: 'add' });
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);

  const router = useRouter(); // ADICIONADO
  const isEditing = editingId !== null;
  
  // --- FUNÇÃO PARA BUSCAR DADOS DO SUPABASE ---
  const fetchGoals = async (userId: string) => { // MODIFICADO: Recebe userId
    setIsLoading(true);
    const { data, error } = await supabase
      .from('meta')
      .select('*')
      .eq('id_usuario', userId); // MODIFICADO: Filtra pelo usuário

    if (error) {
      console.error('Erro ao buscar metas:', error);
      alert('Erro ao carregar metas.');
    } else {
      const formattedData = data.map((goal: any) => ({
        id: goal.id_meta,
        name: goal.nome_meta,
        targetValue: goal.valor_alvo,
        currentValue: goal.valor_atual,
        date: goal.data,
        isCompleted: goal.is_completed,
      }));
      setGoals(formattedData);
    }
    setIsLoading(false);
  };

  // --- EFEITO PARA CARREGAMENTO INICIAL ---
  useEffect(() => {
    // ADICIONADO: Lógica de verificação de usuário
    const checkUserAndFetchData = async () => {
        setIsLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('Nenhum usuário logado ou erro:', userError?.message);
            router.push('/login');
            return;
        }
        
        setUser(user);
        await fetchGoals(user.id);
    };

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    checkUserAndFetchData();
  }, [router]);

  // --- DADOS DERIVADOS ---
  const completedGoalsCount = useMemo(() => goals.filter(goal => goal.isCompleted).length, [goals]);
  const filteredGoals = useMemo(() => showOnlyCompleted ? goals.filter(goal => goal.isCompleted) : goals, [goals, showOnlyCompleted]);
  const sortedGoals = useMemo(() => [...filteredGoals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [filteredGoals]);

  // --- FUNÇÕES AUXILIARES ---
  const formatCurrency = (value: number): string => (isNaN(value) || value === null) ? '' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // --- MANIPULADORES DE EVENTOS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', targetValue: '', date: '' });
    setEditingId(null);
  };

  // MODIFICADO: Para incluir o id_usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) { // ADICIONADO: Checagem de segurança
        alert('Sessão inválida. Por favor, faça o login.');
        router.push('/login');
        return;
    }

    setIsSubmitting(true);
    const { name, targetValue, date } = formData;

    if (!name.trim() || !targetValue || isNaN(parseFloat(targetValue)) || parseFloat(targetValue) <= 0 || !date) {
      alert('Por favor, preencha todos os campos corretamente.');
      setIsSubmitting(false);
      return;
    }
    
    const numericTargetValue = parseFloat(targetValue);
    const currentGoalValue = isEditing ? goals.find(g => g.id === editingId)!.currentValue : 0;
    
    const goalData = {
      nome_meta: name.trim(),
      valor_alvo: numericTargetValue,
      data: date,
      valor_atual: currentGoalValue,
      is_completed: currentGoalValue >= numericTargetValue,
      id_usuario: user.id, // ADICIONADO: ID do usuário
    };
    
    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from('meta').update(goalData).eq('id_meta', editingId).eq('id_usuario', user.id); // MODIFICADO
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('meta').insert([goalData]);
      error = insertError;
    }

    if (error) {
      console.error('Erro ao salvar meta:', error);
      alert('Erro ao salvar meta.');
    } else {
      await fetchGoals(user.id); // MODIFICADO
      resetForm();
    }
    setIsSubmitting(false);
  };

  const handleStartEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setFormData({ name: goal.name, targetValue: goal.targetValue.toString(), date: goal.date });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // MODIFICADO: Para incluir o id_usuario
  const handleDelete = async (id: number) => {
    if (!user) return; // ADICIONADO
    const { error } = await supabase.from('meta').delete().eq('id_meta', id).eq('id_usuario', user.id); // MODIFICADO
    if(error){
      alert('Erro ao deletar meta.');
      console.error(error);
    } else {
      setGoals(goals.filter((goal) => goal.id !== id));
      if (id === editingId) resetForm();
    }
  };

  // MODIFICADO: Para incluir o id_usuario
  const handleUpdateCurrentValue = async (id: number, amount: number) => {
    if (!user) return; // ADICIONADO

    const goal = goals.find(g => g.id === id);
    if(!goal) return;

    const newValue = Math.max(0, goal.currentValue + amount);
    const isNowCompleted = newValue >= goal.targetValue;

    const { error } = await supabase
      .from('meta')
      .update({ valor_atual: newValue, is_completed: isNowCompleted })
      .eq('id_meta', id)
      .eq('id_usuario', user.id); // MODIFICADO
    
    if (error) {
      alert('Erro ao atualizar valor da meta.');
      console.error(error);
    } else {
      setGoals(goals.map(g => g.id === id ? { ...g, currentValue: newValue, isCompleted: isNowCompleted } : g));
    }
  };

  // MODIFICADO: Para incluir o id_usuario
  const handleToggleComplete = async (id: number) => {
    if (!user) return; // ADICIONADO
    
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newCompletedState = !goal.isCompleted;
    const { error } = await supabase
      .from('meta')
      .update({ is_completed: newCompletedState })
      .eq('id_meta', id)
      .eq('id_usuario', user.id); // MODIFICADO

    if (error) {
      alert('Erro ao atualizar status da meta.');
      console.error(error);
    } else {
      setGoals(goals.map(g => g.id === id ? { ...g, isCompleted: newCompletedState } : g));
    }
  };
  
  // --- FUNÇÕES DO MODAL ---
  const openUpdateModal = (goal: Goal, action: 'add' | 'remove') => {
    setModalState({ isOpen: true, goalId: goal.id, goalName: goal.name, action });
  };

  const closeUpdateModal = () => {
    setModalState({ isOpen: false, goalId: null, goalName: '', action: 'add' });
  };
  
  const handleModalSubmit = async (amount: number) => {
    if (modalState.goalId !== null) {
      const finalAmount = modalState.action === 'add' ? amount : -amount;
      await handleUpdateCurrentValue(modalState.goalId, finalAmount);
    }
    closeUpdateModal();
  };

  // --- RENDERIZAÇÃO ---
  return (
    <>
      <ValueUpdateModal modalState={modalState} onClose={closeUpdateModal} onSubmit={handleModalSubmit} />
      <div className="bg-[#0f172a] min-h-screen flex text-white font-sans">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/10 lg:hidden">
                    <IconMenu />
                </button>
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-400 p-3 rounded-full text-slate-900">
                        <IconTarget />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-200">Gerenciar Metas</h1>
                        <p className="text-gray-400">Crie e acompanhe seus objetivos financeiros.</p>
                    </div>
                </div>
            </header>

            <div className="bg-[#1e293b] border border-teal-500/30 p-6 rounded-2xl mb-10">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Nome da Meta</label>
                  <input type="text" id="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Viagem para a praia" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                </div>
                <div>
                  <label htmlFor="targetValue" className="block text-sm font-medium text-gray-400 mb-1">Valor Alvo</label>
                  <input type="number" id="targetValue" value={formData.targetValue} onChange={handleInputChange} placeholder="R$ 500,00" step="0.01" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none"/>
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Data</label>
                  <input type="date" id="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" style={{ colorScheme: 'dark' }}/>
                </div>
                <div className="md:col-span-4 mt-2">
                  <button type="submit" disabled={isSubmitting} className={`w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/20 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed`}>
                    {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Meta')}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-700">Metas Cadastradas</h2>
                <button onClick={() => setShowOnlyCompleted(!showOnlyCompleted)} className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${showOnlyCompleted ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-600 hover:bg-teal-200'}`}>
                  {completedGoalsCount} Concluídas
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="p-3 text-sm font-semibold text-gray-500">NOME DA META</th>
                      <th className="p-3 text-sm font-semibold text-gray-500">VALOR TOTAL</th>
                      <th className="p-3 text-sm font-semibold text-gray-500">VALOR ARRECADADO</th>
                      <th className="p-3 text-sm font-semibold text-gray-500">DATA</th>
                      <th className="p-3 text-sm font-semibold text-gray-500">PROGRESSO</th>
                      <th className="p-3 text-sm font-semibold text-gray-500 text-center">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-400">
                          <svg className="animate-spin mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Carregando metas...
                        </td>
                      </tr>
                    ) : sortedGoals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 mb-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                          {showOnlyCompleted ? "Nenhuma meta concluída." : "Nenhuma meta cadastrada ainda. Crie uma acima!"}
                        </td>
                      </tr>
                    ) : (
                      sortedGoals.map((goal) => {
                        const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
                        return (
                            <tr key={goal.id} className={`border-b border-gray-200 transition-colors ${goal.isCompleted ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                                <td className="p-4 font-medium text-gray-800">{goal.name}</td>
                                <td className="p-4 text-gray-600 font-semibold">{formatCurrency(goal.targetValue)}</td>
                                <td className="p-4 text-teal-600 font-bold">{formatCurrency(goal.currentValue)}</td>
                                <td className="p-4 text-gray-600">{formatDate(goal.date)}</td>
                                <td className="p-4 w-40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-teal-600">{Math.round(progress)}%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <button onClick={() => handleToggleComplete(goal.id)} title={goal.isCompleted ? "Marcar como não concluída" : "Concluir meta"} className={`p-2 rounded-full transition-colors ${goal.isCompleted ? 'bg-teal-200 hover:bg-teal-300' : 'hover:bg-green-100'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                      </button>
                                      <button onClick={() => openUpdateModal(goal, 'add')} title="Adicionar valor" className="p-2 rounded-full hover:bg-blue-100 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                      </button>
                                      <button onClick={() => openUpdateModal(goal, 'remove')} title="Remover valor" className="p-2 rounded-full hover:bg-orange-100 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-orange-500"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                      </button>
                                      <button onClick={() => handleDelete(goal.id)} title="Excluir Meta" className="p-2 rounded-full hover:bg-red-100 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                      </button>
                                    </div>
                                </td>
                            </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </main>
      </div>
    </>
  );
}