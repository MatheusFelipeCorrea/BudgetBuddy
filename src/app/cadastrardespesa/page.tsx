'use client';

import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // <--- AGORA SOMENTE ESTA LINHA É USADA PARA OBTER O CLIENTE SUPABASE
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Loader2, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

// --- INTERFACES E CONFIGURAÇÃO ---
interface Category {
  id_categoria: number;
  nome_categoria: string;
}

const PRESET_CATEGORIES: Category[] = [
  { id_categoria: 1, nome_categoria: 'Alimentação' },
  { id_categoria: 2, nome_categoria: 'Transporte' },
  { id_categoria: 3, nome_categoria: 'Educação' },
  { id_categoria: 4, nome_categoria: 'Lazer' },
  { id_categoria: 5, nome_categoria: 'Moradia' },
  { id_categoria: 6, nome_categoria: 'Saúde' },
  { id_categoria: 7, nome_categoria: 'Serviços' },
  { id_categoria: 8, nome_categoria: 'Imprevistos' },
  { id_categoria: 9, nome_categoria: 'Investimentos' },
  { id_categoria: 10, nome_categoria: 'Compras' },
];

interface Expense {
  id: number;
  name: string;
  value: number;
  date: string;
  category: {
    id_categoria: number;
    nome_categoria: string;
  } | null;
}

interface FormData {
  name: string;
  date: string;
  value: string;
  categoryId: string;
}

// REMOVIDO: const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// REMOVIDO: const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// REMOVIDO: if (!supabaseUrl || !supabaseAnonKey) { ... }
// REMOVIDO: const supabase = createClient(supabaseUrl!, supabaseAnonKey!);


// --- COMPONENTE PRINCIPAL ---
export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories] = useState<Category[]>(PRESET_CATEGORIES);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', date: '', value: '', categoryId: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const isEditing = editingId !== null;

  const updateBalance = async (userId: string, amount: number, operation: 'add' | 'subtract') => {
    console.log('updateBalance: userId:', userId, 'amount:', amount, 'operation:', operation);
    if (!userId) {
        console.error('updateBalance: userId é nulo ou indefinido. Abortando.');
        return;
    }

    try {
      const { data: currentBalanceData, error: fetchError } = await supabase
        .from('saldo')
        .select('valor_total')
        .eq('id_usuario', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        console.warn('updateBalance: Saldo não encontrado para o usuário. Iniciando com 0.');
      } else if (fetchError) {
        throw fetchError;
      }

      let newTotal = currentBalanceData ? currentBalanceData.valor_total : 0;
      console.log('updateBalance: Saldo atual antes:', newTotal);

      if (operation === 'add') {
        newTotal += amount;
      } else {
        newTotal -= amount;
      }

      console.log('updateBalance: Saldo novo calculado:', newTotal);

      const { error: upsertError } = await supabase
        .from('saldo')
        .upsert(
          { id_usuario: userId, valor_total: newTotal },
          { onConflict: 'id_usuario' }
        );

      if (upsertError) {
        throw upsertError;
      }
      console.log('updateBalance: Saldo atualizado com SUCESSO para:', newTotal);
    } catch (error: any) {
      console.error('updateBalance: Erro fatal na transação de saldo:', error.message);
      alert(`Erro ao atualizar saldo: ${error.message}`);
    }
  };


  const fetchExpenses = async (userId: string) => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from('despesas')
      .select('*, categoria(id_categoria, nome_categoria)')
      .eq('id_usuario', userId);

    if (error) {
      console.error('Erro ao buscar despesas:', error);
    } else {
      const formattedData = data.map((expense: any) => ({
        id: expense.id_despesa,
        name: expense.nome_despesa,
        value: expense.valor,
        date: expense.data,
        category: expense.categoria
      }));
      setExpenses(formattedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Nenhum usuário logado ou erro:', userError?.message);
        router.push('/login');
        return;
      }

      setUser(user);
      await fetchExpenses(user.id);
    };

    // A VERIFICAÇÃO de chaves de ambiente é feita apenas em '../../lib/supabaseClient'.
    checkUserAndFetchData();
  }, [router]);

  const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', value: '', categoryId: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { name, date, value, categoryId } = formData;

    console.log('handleSubmit: user object:', user); // Log para depuração

    if (!user) {
      console.error('handleSubmit: Erro: Usuário não autenticado no handleSubmit.');
      router.push('/login');
      setIsSubmitting(false);
      return;
    }

    if (!name.trim() || !date || isNaN(parseFloat(value)) || parseFloat(value) <= 0 || !categoryId) {
      console.error('Validação falhou: Por favor, preencha todos os campos corretamente.');
      alert('Por favor, preencha todos os campos, incluindo a categoria.');
      setIsSubmitting(false);
      return;
    }

    const numericValue = parseFloat(value);
    const expenseData = {
      nome_despesa: name.trim(),
      data: date,
      valor: numericValue,
      id_categoria: parseInt(categoryId, 10),
      id_usuario: user.id,
    };

    let error;
    let oldExpenseValue = 0;

    console.log('handleSubmit: isEditing:', isEditing);
    if (isEditing) {
      oldExpenseValue = expenses.find(exp => exp.id === editingId)?.value || 0;
      const { error: updateError } = await supabase
        .from('despesas')
        .update(expenseData)
        .eq('id_despesa', editingId)
        .eq('id_usuario', user.id);
      error = updateError;
    } else {
      console.log('handleSubmit: Tentando inserir nova despesa...');
      const { error: insertError } = await supabase
        .from('despesas')
        .insert([expenseData]);
      error = insertError;
    }

    if (error) {
      console.error('handleSubmit: Erro ao salvar despesa no DB:', error);
      alert(`Ocorreu um erro ao salvar a despesa: ${error.message}`);
    } else {
      console.log('handleSubmit: Despesa salva com sucesso. Chamando updateBalance...');
      if (isEditing) {
        const diff = oldExpenseValue - numericValue;
        if (diff !== 0) {
            await updateBalance(user.id, Math.abs(diff), diff > 0 ? 'add' : 'subtract');
        }
      } else {
        await updateBalance(user.id, numericValue, 'subtract');
      }

      resetForm();
      await fetchExpenses(user.id);
    }
    setIsSubmitting(false);
  };

  const handleStartEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      name: expense.name,
      date: expense.date,
      value: expense.value.toString(),
      categoryId: expense.category?.id_categoria.toString() || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!user) {
      console.error('Erro: Usuário não autenticado.');
      router.push('/login');
      return;
    }

    const expenseToDelete = expenses.find(exp => exp.id === id);
    if (!expenseToDelete) {
        console.error('Despesa não encontrada para exclusão.');
        return;
    }

    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id_despesa', id)
      .eq('id_usuario', user.id);

    if (error) {
      console.error('Erro ao excluir despesa:', error);
      alert(`Não foi possível excluir a despesa: ${error.message}`);
    } else {
      await updateBalance(user.id, expenseToDelete.value, 'add');

      setExpenses(expenses.filter((expense) => expense.id !== id));
      if (id === editingId) {
        resetForm();
      }
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return 'Salvando...';
    return isEditing ? 'Salvar Alterações' : 'Cadastrar Despesa';
  };

  const getButtonStyle = () => {
    return isEditing
      ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
      : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20';
  };

  return (
    <div className="bg-[#0f172a] text-white flex flex-col items-center justify-center min-h-screen p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block bg-yellow-400 p-3 rounded-full mb-4">
            <Image src="/img/BudgetBuddy Icon 2sgv.svg" alt="Wallet" width={60} height={60} />
          </div>
          <h1 className="text-2xl font-bold text-gray-200">BUDGET BUDDY</h1>
          <p className="text-gray-400">Cadastrar nova Despesa</p>
        </header>

        <div className="bg-[#1e293b] border border-teal-500/30 p-6 rounded-2xl mb-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Nome da Despesa</label>
              <input type="text" id="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Aluguel, Supermercado" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
              <select id="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                <option value="" disabled>Selecione</option>
                {categories.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome_categoria}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Data</label>
              <input type="date" id="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-400 mb-1">Valor Monetário</label>
              <input type="number" id="value" value={formData.value} onChange={handleInputChange} placeholder="R$ 150,00" step="0.01" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none" />
            </div>
            <div className="md:col-span-2 lg:col-span-5 mt-2">
              {/* REMOVIDO: !supabaseUrl || !supabaseAnonKey do disabled */}
              <button type="submit" disabled={isSubmitting} className={`w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/20 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed`}>
                {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Despesa')}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Despesas Cadastradas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-3 text-sm font-semibold text-gray-500">NOME DA DESPESA</th>
                  <th className="p-3 text-sm font-semibold text-gray-500">VALOR</th>
                  <th className="p-3 text-sm font-semibold text-gray-500">DATA</th>
                  <th className="p-3 text-sm font-semibold text-gray-500">CATEGORIA</th>
                  <th className="p-3 text-sm font-semibold text-gray-500 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-400">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                      Carregando despesas...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-400">
                      <FolderOpen className="mx-auto h-12 w-12 mb-2" />
                      Nenhuma despesa cadastrada ainda.
                    </td>
                  </tr>
                ) : (
                  sortedExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{expense.name}</td>
                      <td className="p-4 text-red-600 font-semibold">{formatCurrency(expense.value)}</td>
                      <td className="p-4 text-gray-600">{formatDate(expense.date)}</td>
                      <td className="p-4 text-gray-600">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                          {expense.category?.nome_categoria || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleStartEdit(expense)} title="Editar Despesa" className="p-2 rounded-full hover:bg-blue-100 transition-colors">
                            <Pencil className="h-5 w-5 text-blue-500" />
                          </button>
                          <button onClick={() => handleDelete(expense.id)} title="Excluir Despesa" className="p-2 rounded-full hover:bg-red-100 transition-colors">
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}