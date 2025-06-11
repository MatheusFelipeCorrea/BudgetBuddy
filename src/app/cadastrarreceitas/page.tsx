'use client';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Wallet2, Pencil, Trash2, FolderOpen, Loader2 } from 'lucide-react';
// IMPORTANTE: Importe 'supabase' APENAS DE UM LUGAR
import { supabase } from '../../lib/supabaseClient'; // <--- ESTA É A ÚNICA LINHA NECESSÁRIA PARA OBTER O CLIENTE SUPABASE
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

// REMOVIDO: Toda a seção de configuração do Supabase local (supabaseUrl, supabaseAnonKey, createClient)
// Ela está agora no '../../lib/supabaseClient.ts'

// --- COMPONENTE PRINCIPAL ---
export default function RecipeManager() {
  // --- ESTADOS ---
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', date: '', value: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Estado para armazenar o usuário logado

  const router = useRouter();
  const isEditing = editingId !== null;

  // Função para buscar e atualizar o saldo do usuário
  const updateBalance = async (userId: string, amount: number, operation: 'add' | 'subtract') => {
    // console.log para depuração (descomente se precisar ver o fluxo no console)
    // console.log('updateBalance: userId:', userId, 'amount:', amount, 'operation:', operation);
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
      // console.log('updateBalance: Saldo atual antes:', newTotal);

      if (operation === 'add') {
        newTotal += amount;
      } else {
        newTotal -= amount;
      }

      // console.log('updateBalance: Saldo novo calculado:', newTotal);

      const { error: upsertError } = await supabase
        .from('saldo')
        .upsert(
          { id_usuario: userId, valor_total: newTotal },
          { onConflict: 'id_usuario' }
        );

      if (upsertError) {
        throw upsertError;
      }
      // console.log('updateBalance: Saldo atualizado com SUCESSO para:', newTotal);
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
        router.push('/login'); // Redireciona para a página de login
        return;
      }

      setUser(user);
      await fetchRecipes(user.id);
    };

    // Chamada direta da função que verifica o usuário e busca dados
    checkUserAndFetchData();
  }, [router]); // Adicione router como dependência

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

    // console.log('handleSubmit: user object:', user); // Log para depuração

    if (!user) { // Garante que há um usuário logado
      console.error('handleSubmit: Erro: Usuário não autenticado no handleSubmit.');
      router.push('/login'); // Redireciona
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
      id_usuario: user.id, // Adiciona o id_usuario aqui!
    };

    let error;
    let oldRecipeValue = 0; // Para caso de edição

    // console.log('handleSubmit: isEditing:', isEditing);
    if (isEditing) {
      oldRecipeValue = recipes.find(r => r.id === editingId)?.value || 0;
      const { error: updateError } = await supabase
        .from('receita')
        .update(recipeData)
        .eq('id_receita', editingId)
        .eq('id_usuario', user.id); // Garante que só o próprio usuário pode editar
      error = updateError;
    } else {
      // console.log('handleSubmit: Tentando inserir nova receita...');
      const { error: insertError } = await supabase
        .from('receita')
        .insert([recipeData]);
      error = insertError;
    }

    if (error) {
      console.error('handleSubmit: Erro ao salvar receita no DB:', error);
      alert(`Erro ao salvar receita: ${error.message}`); // Exibe mensagem de erro mais detalhada
    } else {
      // console.log('handleSubmit: Receita salva com sucesso. Chamando updateBalance...');
      // ATUALIZAÇÃO DO SALDO AQUI
      if (isEditing) {
        const diff = numericValue - oldRecipeValue;
        if (diff !== 0) {
            await updateBalance(user.id, Math.abs(diff), diff > 0 ? 'add' : 'subtract');
        }
      } else {
        await updateBalance(user.id, numericValue, 'add');
      }

      resetForm();
      await fetchRecipes(user.id); // Recarrega as receitas do usuário atual
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
    if (!user) { // Garante que há um usuário logado
      console.error('Erro: Usuário não autenticado.');
      router.push('/login'); // Redireciona
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
      .eq('id_usuario', user.id); // Garante que só o próprio usuário pode deletar

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
    <div className="bg-[#0f172a] text-white flex flex-col items-center justify-center min-h-screen p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block bg-yellow-400 p-3 rounded-full mb-4">
            <Image src="/img/BudgetBuddy Icon 2sgv.svg" alt="Wallet" width={60} height={60} />
          </div>
          <h1 className="text-2xl font-bold text-gray-200">BUDGET BUDDY</h1>
          <p className="text-gray-400">Cadastrar nova Receita</p>
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
      </div>
    </div>
  );
}