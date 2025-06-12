'use client';

import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// --- INTERFACES DE DADOS ---
interface Recipe {
  id: number;
  name: string;
  value: number;
  date: string;
}

interface FormData {
  name: string;
  date: string;
  value: string;
}

// --- ÍCONES (SVG Components para o Sidebar) ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconTrendingDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

// --- COMPONENTE DO MENU LATERAL (SIDEBAR) ---
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
export default function RecipeManager() {
  // --- ESTADOS ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', date: '', value: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const isEditing = editingId !== null;

  // Função para buscar e atualizar o saldo do usuário
  const updateBalance = async (userId: string, amount: number, operation: 'add' | 'subtract') => {
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
      newTotal = operation === 'add' ? newTotal + amount : newTotal - amount;

      const { error: upsertError } = await supabase
        .from('saldo')
        .upsert(
          { id_usuario: userId, valor_total: newTotal },
          { onConflict: 'id_usuario' }
        );

      if (upsertError) throw upsertError;
    } catch (error: any) {
      console.error('Erro ao atualizar saldo:', error.message);
      alert(`Erro ao atualizar saldo: ${error.message}`);
    }
  };

  // --- FUNÇÃO PARA BUSCAR DADOS ---
  const fetchRecipes = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('receita')
      .select('*')
      .eq('id_usuario', userId);

    if (error) {
      console.error('Erro ao buscar receitas:', error);
    } else {
      const formattedData = data.map((recipe: any) => ({
        id: recipe.id_receita,
        name: recipe.nome_receita,
        value: recipe.valor,
        date: recipe.data
      }));
      setRecipes(formattedData);
    }
    setIsLoading(false);
  };

  // --- EFEITO PARA CARREGAMENTO INICIAL E AUTENTICAÇÃO ---
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
      await fetchRecipes(user.id);
    };

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }

    checkUserAndFetchData();
  }, [router]);

  // --- FUNÇÕES AUXILIARES ---
  const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [recipes]);

  // --- MANIPULADORES DE EVENTOS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', value: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { name, date, value } = formData;

    if (!user) {
      console.error('handleSubmit: Erro: Usuário não autenticado no handleSubmit.');
      router.push('/login');
      setIsSubmitting(false);
      return;
    }

    if (!name.trim() || !date || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      console.error('Validação falhou: Por favor, preencha todos os campos corretamente.');
      setIsSubmitting(false);
      return;
    }

    const numericValue = parseFloat(value);
    const recipeData = {
      nome_receita: name.trim(),
      data: date,
      valor: numericValue,
      id_usuario: user.id,
    };

    let error;
    let oldRecipeValue = 0;

    if (isEditing) {
      oldRecipeValue = recipes.find(r => r.id === editingId)?.value || 0;
      const { error: updateError } = await supabase
        .from('receita')
        .update(recipeData)
        .eq('id_receita', editingId)
        .eq('id_usuario', user.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('receita')
        .insert([recipeData]);
      error = insertError;
    }

    if (error) {
      console.error('handleSubmit: Erro ao salvar receita no DB:', error);
      alert(`Erro ao salvar receita: ${error.message}`);
    } else {
      if (isEditing) {
        const diff = numericValue - oldRecipeValue;
        if (diff !== 0) {
            await updateBalance(user.id, Math.abs(diff), diff > 0 ? 'add' : 'subtract');
        }
      } else {
        await updateBalance(user.id, numericValue, 'add');
      }

      resetForm();
      await fetchRecipes(user.id);
    }
    setIsSubmitting(false);
  };

  const handleStartEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      date: recipe.date,
      value: recipe.value.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!user) {
      console.error('Erro: Usuário não autenticado.');
      router.push('/login');
      return;
    }

    const recipeToDelete = recipes.find(r => r.id === id);
    if (!recipeToDelete) {
        console.error('Receita não encontrada para exclusão.');
        return;
    }

    const { error } = await supabase
      .from('receita')
      .delete()
      .eq('id_receita', id)
      .eq('id_usuario', user.id);

    if (error) {
      console.error('Erro ao excluir receita:', error);
      alert(`Erro ao excluir receita: ${error.message}`);
    } else {
      await updateBalance(user.id, recipeToDelete.value, 'subtract');
      
      setRecipes(recipes.filter((recipe) => recipe.id !== id));
      if (id === editingId) {
        resetForm();
      }
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return 'Salvando...';
    return isEditing ? 'Salvar Alterações' : 'Cadastrar Receita';
  };

  const getButtonStyle = () => {
    return isEditing
      ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
      : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20';
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={4} className="text-center p-8 text-gray-400">
            <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
            Carregando receitas...
          </td>
        </tr>
      );
    }

    if (recipes.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="text-center p-8 text-gray-400">
            <FolderOpen className="mx-auto h-12 w-12 mb-2" />
            Nenhuma receita cadastrada ainda.
          </td>
        </tr>
      );
    }

    return sortedRecipes.map((recipe) => (
      <tr key={recipe.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="p-4 font-medium text-gray-800">{recipe.name}</td>
        <td className="p-4 text-green-600 font-semibold">{formatCurrency(recipe.value)}</td>
        <td className="p-4 text-gray-600">{formatDate(recipe.date)}</td>
        <td className="p-4">
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => handleStartEdit(recipe)} title="Editar Receita" className="p-2 rounded-full hover:bg-blue-100 transition-colors"><Pencil className="h-5 w-5 text-blue-500" /></button>
            <button onClick={() => handleDelete(recipe.id)} title="Excluir Receita" className="p-2 rounded-full hover:bg-red-100 transition-colors"><Trash2 className="h-5 w-5 text-red-500" /></button>
          </div>
        </td>
      </tr>
    ));
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="bg-[#0f172a] min-h-screen flex text-white font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <header className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/10 lg:hidden">
                  <IconMenu />
              </button>
              <div className="flex items-center gap-3">
                  <div className="bg-yellow-400 p-3 rounded-full text-slate-900">
                      <IconTrendingUp />
                  </div>
                  <div>
                      <h1 className="text-2xl font-bold text-gray-200">Gerenciar Receitas</h1>
                      <p className="text-gray-400">Adicione e controle suas fontes de renda.</p>
                  </div>
              </div>
          </header>
        
          <div className="bg-[#1e293b] border border-teal-500/30 p-6 rounded-2xl mb-10">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Nome da Receita</label>
                <input type="text" id="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Salário" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Data</label>
                <input type="date" id="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" style={{ colorScheme: 'dark' }}/>
              </div>
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-400 mb-1">Valor Monetário</label>
                <input type="number" id="value" value={formData.value} onChange={handleInputChange} placeholder="R$ 150,00" step="0.01" className="w-full bg-[#0f172a] border border-teal-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none"/>
              </div>
              <div className="md:col-span-4 mt-2">
                <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center ${getButtonStyle()} disabled:bg-gray-500 disabled:cursor-not-allowed`}>
                  {isSubmitting && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                  {getButtonText()}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Receitas Cadastradas</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-sm font-semibold text-gray-500">NOME DA RECEITA</th>
                    <th className="p-3 text-sm font-semibold text-gray-500">VALOR</th>
                    <th className="p-3 text-sm font-semibold text-gray-500">DATA</th>
                    <th className="p-3 text-sm font-semibold text-gray-500 text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableContent()}
                </tbody>
              </table>
            </div>
          </div>
      </main>
    </div>
  );
}