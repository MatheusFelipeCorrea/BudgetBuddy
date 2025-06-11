'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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


// --- COMPONENTE PRINCIPAL ---
export default function DueDateManager() {
  // --- ESTADOS ---
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [formData, setFormData] = useState<FormData>({ name: '', date: '', value: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });
  const [showOnlyPaid, setShowOnlyPaid] = useState(false);

  const isEditing = editingId !== null;

  // --- FUNÇÃO PARA BUSCAR DADOS DO SUPABASE ---
  const fetchDueDates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('conta')
      .select('*');

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
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      fetchDueDates();
    } else {
      setIsLoading(false);
    }
  }, []);


  // --- FUNÇÕES AUXILIARES E DADOS DERIVADOS ---
  const formatCurrency = (value: number): string => (isNaN(value) || value === null) ? '' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDateToTable = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const { monthName, year, daysInMonth, firstDayOfMonth } = useMemo(() => {
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
    return { monthName, year, daysInMonth, firstDayOfMonth };
  }, [currentDate]);

  const dueDatesByDay = useMemo(() => {
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
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setSelectedDay(null);
  };
  
  const handleDayClick = (day: number) => {
    if (dueDatesByDay.has(day)) {
        setShowOnlyPaid(false);
        setSelectedDay(prev => prev === day ? null : day);
    }
  };

  const toggleShowPaid = () => {
    setSelectedDay(null);
    setShowOnlyPaid(prev => !prev);
  }
  
  const resetForm = () => {
    setFormData({ name: '', date: '', value: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { name, date, value } = formData;
    if (!name.trim() || !date || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      alert('Por favor, preencha todos os campos corretamente.');
      setIsSubmitting(false);
      return;
    }
    
    // Mapeia para os nomes das colunas do banco
    const dueData = {
        nome: name.trim(),
        data_vencimento: date,
        valor: parseFloat(value),
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from('conta').update(dueData).eq('id_conta', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('conta').insert([{ ...dueData, pago: false }]);
      error = insertError;
    }

    if (error) {
        console.error("Erro ao salvar vencimento:", error);
        alert("Ocorreu um erro ao salvar o vencimento.");
    } else {
        await fetchDueDates();
        resetForm();
    }

    setIsSubmitting(false);
  };
  
  const handleStartEdit = (dueDate: DueDate) => {
    setEditingId(dueDate.id);
    setFormData({
      name: dueDate.name,
      date: dueDate.date,
      value: dueDate.value.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('conta').delete().eq('id_conta', id);
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

  const handleTogglePaid = async (id: number) => {
    const dueDate = dueDates.find(d => d.id === id);
    if (!dueDate) return;

    const newPaidStatus = !dueDate.isPaid;
    const { error } = await supabase.from('conta').update({ pago: newPaidStatus }).eq('id_conta', id);

    if (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Não foi possível atualizar o status de pagamento.");
    } else {
        setDueDates(dueDates.map(d => d.id === id ? { ...d, isPaid: newPaidStatus } : d));
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, day: number) => {
    if (dueDatesByDay.has(day)) {
      const content = dueDatesByDay.get(day)!.map(d => `${d.name}: ${formatCurrency(d.value)}`).join('\n');
      setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
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
      <div className="bg-[#0f172a] text-white flex flex-col items-center justify-center min-h-screen p-4 font-sans">
        <header className="text-center mb-8">
          <div className="inline-block bg-yellow-400 p-3 rounded-full mb-4">
          <img src="/img/BudgetBuddy Icon 2sgv.svg" alt="Wallet" className="w-15 h-15" />
          </div>
          <h1 className="text-2xl font-bold text-gray-200">BUDGET BUDDY</h1>
        </header>

        <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <div className="bg-[#1e293b] p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-teal-500/20 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
              <h2 className="text-xl font-bold capitalize text-center w-48">{monthName} {year}</h2>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-teal-500/20 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
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

          <div>
            <div className="bg-[#1e293b] p-6 rounded-2xl mb-8">
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
                  <label htmlFor="value" className="block text-sm font-medium text-gray-400 mb-1">Valor Monetário</label>
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
              <div className="space-y-2">
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
        </main>
      </div>
    </>
  );
}
