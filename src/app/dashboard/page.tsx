'use client';

import { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation'; // Adicione esta importação

// --- INTERFACES E CONFIGURAÇÃO DO SUPABASE ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ALERTA: Variáveis de ambiente do Supabase não configuradas. A aplicação não funcionará corretamente.');
}
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);


// --- ÍCONES (SVG Components) ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconTrendingDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconArrowUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const IconArrowDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;


// --- COMPONENTE PRINCIPAL DO DASHBOARD ---
export default function DashboardPage() {
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Estados para armazenar os dados do Supabase
    const [userName, setUserName] = useState('Usuário'); // Estado para o nome do usuário
    const [transactions, setTransactions] = useState<any[]>([]);
    const [dueDates, setDueDates] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);

    const router = useRouter(); // Inicialize o useRouter

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);

            // 1. Obter a sessão do usuário
            const { data: { user }, error: userSessionError } = await supabase.auth.getUser();

            if (userSessionError || !user) {
                console.error('Nenhum usuário logado ou erro ao buscar sessão:', userSessionError?.message);
                router.push('/login'); // Redireciona para a página de login
                return; // Impede a execução do restante do useEffect
            }

            // 2. Se houver um usuário, buscar o nome dele na tabela 'usuario'
            // Assumimos que o 'id_usuario' na sua tabela 'usuario' é o UUID do usuário logado.
            const { data: userData, error: userDataError } = await supabase
                .from('usuario')
                .select('nome')
                .eq('id_usuario', user.id) // Usando 'id_usuario' conforme seu DER
                .single();

            if (userDataError) {
                console.error('Erro ao buscar nome do usuário na tabela usuario:', userDataError.message);
                setUserName('Usuário'); // Fallback para "Usuário" em caso de erro
            } else if (userData) {
                setUserName(userData.nome || 'Usuário');
            }

            // 3. Buscar os demais dados do Supabase para o usuário logado
            // Filtre por id_usuario para garantir que você só pegue os dados do usuário atual
            const [recipesResponse, expensesResponse, dueDatesResponse, goalsResponse] = await Promise.all([
                supabase.from('receita').select('*').eq('id_usuario', user.id),
                supabase.from('despesas').select('*, categoria(nome_categoria)').eq('id_usuario', user.id),
                supabase.from('conta').select('*').eq('id_usuario', user.id),
                supabase.from('meta').select('*').eq('id_usuario', user.id)
            ]);

            // Processa transações (receitas e despesas)
            const combinedTransactions = [
                ...(recipesResponse.data || []).map(r => ({ ...r, type: 'receita', name: r.nome_receita, category: 'Receita', value: r.valor, date: r.data || new Date().toISOString() })),
                ...(expensesResponse.data || []).map(d => ({ ...d, type: 'despesa', name: d.nome_despesa, category: d.categoria?.nome_categoria || 'Sem Categoria', value: d.valor, date: d.data || new Date().toISOString() }))
            ];
            setTransactions(combinedTransactions);

            // Processa vencimentos
            if (dueDatesResponse.data) {
                setDueDates(dueDatesResponse.data.map(d => ({ ...d, date: d.data_vencimento, isPaid: d.pago })));
            }

            // Processa metas
            if (goalsResponse.data) {
                setGoals(goalsResponse.data.map(g => ({ ...g, name: g.nome_meta, targetValue: g.valor_alvo, currentValue: g.valor_atual, isCompleted: g.is_completed })));
            }

            setIsLoading(false);
        };

        if (supabaseUrl && supabaseAnonKey) {
            fetchAllData();
        } else {
            setIsLoading(false);
        }
    }, [router]); // Adicione router como dependência para que o useEffect reaja a mudanças de rota

    const { balance } = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
        const totalExpenses = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
        return { balance: totalIncome - totalExpenses };
    }, [transactions]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleShowTooltip = (e: React.MouseEvent, content: string) => setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
    const handleHideTooltip = () => setTooltip({ visible: false, content: '', x: 0, y: 0 });

    if (isLoading) {
        return (
            <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">
                <svg className="animate-spin h-10 w-10 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a] min-h-screen flex text-white font-sans">
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #475569; }
            `}</style>
            {tooltip.visible && (
                <div className="fixed z-50 p-2 text-sm bg-gray-900 text-white rounded-md shadow-lg whitespace-pre-wrap" style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}>
                    {tooltip.content}
                </div>
            )}
            <aside className="w-64 bg-[#1e293b] p-6 hidden lg:flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-yellow-400 p-2 rounded-full">
                    <img src="/img/BudgetBuddy Icon 2sgv.svg" alt="Wallet" className="w-15 h-15" />
                    </div>
                    <h1 className="text-xl font-bold">BudgetBuddy</h1>
                </div>
                <nav>
                    <ul className="space-y-2">
                        <li><a href="/dashboard" className="flex items-center gap-3 p-3 bg-teal-500/20 rounded-lg text-teal-300 font-semibold"><IconHome /> Dashboard</a></li>
                        <li><a href="/cadastrarreceitas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"><IconTrendingUp /> Cadastro de Receitas</a></li>
                        <li><a href="/cadastrardespesa" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"><IconTrendingDown /> Cadastro de Despesas</a></li>
                        <li><a href="/cadastrarmeta" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"><IconTarget /> Cadastro de Metas</a></li>
                        <li><a href="/cadastrarvencimentos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"><IconCalendar /> Cadastro de Vencimentos</a></li>
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                    <div className="flex items-center gap-4">
                           <img src="/img/maneki-neko 1.svg" alt="Mascote" className=" w-15 h-15 hidden sm:block" />
                           <div>
                               <h2 className="text-3xl font-bold">Olá, {userName}! 👋</h2> {/* Aqui o nome do usuário será exibido */}
                               <p className="text-gray-400">Vamos economizar de um jeito inteligente hoje?</p>
                           </div>
                    </div>
                    <div className="bg-[#1e293b] p-4 rounded-xl flex items-center gap-4 self-start sm:self-center w-full sm:w-auto">
                        <div>
                            <p className="text-sm text-gray-400">SALDO DE HOJE</p>
                            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {balanceVisible ? formatCurrency(balance) : 'R$ ••••••'}
                            </p>
                        </div>
                        <button onClick={() => setBalanceVisible(!balanceVisible)} className="p-2 h-fit rounded-full hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <GastosPorCategoria transactions={transactions} />
                        <RendaMensal transactions={transactions} />
                    </div>

                    <div className="space-y-6">
                        <ProximosVencimentosComCalendario dueDates={dueDates} onShowTooltip={handleShowTooltip} onHideTooltip={handleHideTooltip} />
                        <MetasEmAndamento goals={goals} onShowTooltip={handleShowTooltip} onHideTooltip={handleHideTooltip} />
                    </div>

                    <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <DicasParaPoupar />
                        <Extrato transactions={transactions} />
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTES DO DASHBOARD ---

function ProximosVencimentosComCalendario({ dueDates, onShowTooltip, onHideTooltip }: { dueDates: any[], onShowTooltip: Function, onHideTooltip: Function }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { monthName, year, daysInMonth, firstDayOfMonth } = useMemo(() => {
        const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
        const year = currentDate.getFullYear();
        const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
        return { monthName, year, daysInMonth, firstDayOfMonth };
    }, [currentDate]);

    const dueDatesByDay = useMemo(() => {
        const map = new Map<number, any[]>();
        dueDates.forEach(dueDate => {
            const d = parseISO(dueDate.date);
            if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                const day = d.getDate();
                if (!map.has(day)) map.set(day, []);
                map.get(day)!.push(dueDate);
            }
        });
        return map;
    }, [dueDates, currentDate]);

    const upcomingDueDatesList = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        return dueDates.filter(d => parseISO(d.date) >= today)
                         .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    }, [dueDates]);

    const changeMonth = (offset: number) => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Próximos Vencimentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-teal-500/20"><IconChevronLeft /></button>
                        <h4 className="text-sm font-bold capitalize text-center">{monthName} {year}</h4>
                        <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-teal-500/20"><IconChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i} className="font-bold text-gray-400">{day}</div>)}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const dayNumber = day + 1;
                            const isToday = new Date().getDate() === dayNumber && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === year;
                            const hasDueDate = dueDatesByDay.has(dayNumber);
                            const tooltipContent = hasDueDate ? dueDatesByDay.get(dayNumber)!.map(d => `${d.nome}: ${formatCurrency(d.valor)}`).join('\n') : '';

                            return (
                                <div key={dayNumber} className={`relative p-1 rounded-full flex items-center justify-center ${isToday ? 'bg-teal-500 text-white font-bold' : ''}`}
                                    onMouseEnter={(e) => hasDueDate && onShowTooltip(e, tooltipContent)}
                                    onMouseLeave={() => hasDueDate && onHideTooltip()}>
                                    {dayNumber}
                                    {hasDueDate && <div className="absolute bottom-0 w-1 h-1 bg-yellow-400 rounded-full"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="space-y-2">
                     {upcomingDueDatesList.slice(0, 4).map(item => (
                        <div key={item.id_conta} className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg">
                            <span>{item.nome}</span>
                            <div className="text-right">
                                <span className="font-bold">{formatCurrency(item.valor)}</span>
                                <span className="block text-xs text-gray-400">{format(parseISO(item.date), 'dd/MM/yyyy')}</span>
                            </div>
                        </div>
                    ))}
                    {upcomingDueDatesList.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum vencimento próximo.</p>}
                </div>
            </div>
        </div>
    );
}

function GastosPorCategoria({ transactions }: { transactions: any[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const changeMonth = (offset: number) => setCurrentMonth(prev => subMonths(prev, offset));

    const data = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const filtered = transactions.filter(t => t.type === 'despesa' && parseISO(t.date) >= monthStart && parseISO(t.date) <= monthEnd);
        const grouped = filtered.reduce((acc, curr) => {
            if (!acc[curr.category]) acc[curr.category] = 0;
            acc[curr.category] += curr.value;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(grouped).map(([name, value]) => ({ name, Gasto: value }));
    }, [transactions, currentMonth]);

    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl h-96 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Gastos por Categoria</h3>
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => changeMonth(1)}><IconChevronLeft/></button>
                    <span className="w-24 text-center capitalize">{format(currentMonth, 'MMMM', { locale: ptBR })}</span>
                    <button onClick={() => changeMonth(-1)}><IconChevronRight/></button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="name" tick={{ fill: '#9ca3af' }} fontSize={12} /><YAxis tick={{ fill: '#9ca3af' }} fontSize={12} /><Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}/><Bar dataKey="Gasto" fill="#2dd4bf" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
    );
}

function RendaMensal({ transactions }: { transactions: any[] }) {
    const data = useMemo(() => {
        const aYearAgo = subMonths(new Date(), 11);
        const months = eachMonthOfInterval({ start: aYearAgo, end: new Date() });
        return months.map(monthStart => {
            const monthEnd = endOfMonth(monthStart);
            const name = format(monthStart, 'MMM', { locale: ptBR });
            const receitas = transactions.filter(t => t.type === 'receita' && parseISO(t.date) >= monthStart && parseISO(t.date) <= monthEnd).reduce((sum, t) => sum + t.value, 0);
            const despesas = transactions.filter(t => t.type === 'despesa' && parseISO(t.date) >= monthStart && parseISO(t.date) <= monthEnd).reduce((sum, t) => sum + t.value, 0);
            return { name, Receitas: receitas, Despesas: despesas };
        });
    }, [transactions]);

    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl h-80 flex flex-col">
            <h3 className="font-bold mb-4">Renda Mensal</h3>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="name" tick={{ fill: '#9ca3af' }} fontSize={12} /><YAxis tick={{ fill: '#9ca3af' }} fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} /><Legend /><Line type="monotone" dataKey="Receitas" stroke="#2dd4bf" strokeWidth={2} /><Line type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2} /></LineChart></ResponsiveContainer>
        </div>
    );
}

function MetasEmAndamento({ goals, onShowTooltip, onHideTooltip }: { goals: any[], onShowTooltip: Function, onHideTooltip: Function }) {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const inProgressGoals = goals.filter(goal => !goal.isCompleted);

    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Metas em Andamento</h3>
            <div className="space-y-4">
                {inProgressGoals.length > 0 ? (
                    inProgressGoals.slice(0, 6).map(goal => {
                        const progress = (goal.currentValue / goal.targetValue) * 100;
                        return (
                            <div key={goal.id_meta} className="text-sm"> {/* Usando id_meta conforme seu DER */}
                                <div className="flex justify-between mb-1"><span className="font-semibold">{goal.name}</span><span className="text-gray-400">{formatCurrency(goal.targetValue)}</span></div>
                                <div className="w-full bg-gray-700 rounded-full h-2 cursor-pointer" onMouseEnter={(e) => onShowTooltip(e, `Arrecadado: ${formatCurrency(goal.currentValue)}`)} onMouseLeave={() => onHideTooltip()}>
                                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                </div>
                            </div>
                        );
                    })
                ) : ( <p className="text-sm text-gray-400 text-center py-4">Nenhuma meta em andamento no momento.</p> )}
            </div>
        </div>
    );
}

function DicasParaPoupar() {
    return (
        <div className="lg:col-span-1 bg-[#1e293b] p-6 rounded-2xl flex flex-col items-center text-center">
            <img src="https://placehold.co/100x100/1e293b/facc15?text=💡" alt="Ícone de lâmpada" className="rounded-full mb-4" />
            <h3 className="font-bold mb-2">Dicas Para Poupar Dinheiro!</h3>
            <p className="text-sm text-gray-400">A criação de riqueza é um jogo de soma positiva evolutivamente recente. É tudo sobre quem aproveita a oportunidade primeiro.</p>
        </div>
    );
}

function Extrato({ transactions }: { transactions: any[] }) {
    return (
        <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Extrato</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <div key={t.id_receita || t.id_despesa} className="flex items-center justify-between p-2 bg-white/5 rounded-lg"> {/* Usando id_receita ou id_despesa para a key */}
                        <div className="flex items-center gap-3">
                            {t.type === 'receita' ? <IconArrowUp /> : <IconArrowDown />}
                            <div><p className="font-semibold">{t.name}</p><p className="text-xs text-gray-400">{format(parseISO(t.date), "dd MMM, HH:mm", {locale: ptBR})}</p></div>
                        </div>
                        <p className={`font-bold ${t.type === 'receita' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'receita' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.value)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}