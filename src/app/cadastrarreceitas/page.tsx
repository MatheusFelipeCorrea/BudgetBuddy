'use client';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Wallet2, Pencil, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- INTERFACES E CONFIGURAÇÃO DO SUPABASE ---

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- COMPONENTE PRINCIPAL ---
export default function RecipeManager() {
  // --- ESTADOS ---
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', date: '', value: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = editingId !== null;

  // --- FUNÇÃO PARA BUSCAR DADOS ---
  const fetchRecipes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('receita')
      .select('*');

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

  // --- EFEITO PARA CARREGAMENTO INICIAL ---
  useEffect(() => {
    fetchRecipes();
  }, []);

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

    if (!name.trim() || !date || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      console.error('Validação falhou: Por favor, preencha todos os campos corretamente.');
      setIsSubmitting(false);
      return;
    }
    
    const recipeData = {
      nome_receita: name.trim(),
      data: date,
      valor: parseFloat(value),
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase
        .from('receita')
        .update(recipeData)
        .eq('id_receita', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('receita')
        .insert([recipeData]);
      error = insertError;
    }

    if (error) {
      console.error('Erro ao salvar receita:', error);
    } else {
      resetForm();
      await fetchRecipes();
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
    const { error } = await supabase
      .from('receita')
      .delete()
      .eq('id_receita', id);

    if (error) {
      console.error('Erro ao excluir receita:', error);
      } else {
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
          <img src="/img/BudgetBuddy Icon 2sgv.svg" alt="Wallet" className="w-15 h-15" />
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
