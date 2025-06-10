import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todas as receitas de um usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const receitas = await prisma.receita.findMany({
      where: {
        id_usuario: parseInt(userId)
      },
      orderBy: {
        data: 'desc'
      }
    });

    return NextResponse.json(receitas);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar receitas' },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova receita
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome_receita, valor, data, id_usuario } = body;

    // Validações
    if (!nome_receita || !valor || !data || !id_usuario) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      );
    }

    const dataReceita = new Date(data);
    if (isNaN(dataReceita.getTime())) {
      return NextResponse.json(
        { error: 'Data inválida' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: parseInt(id_usuario) }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const receita = await prisma.receita.create({
      data: {
        nome_receita,
        valor: valorNumerico,
        data: dataReceita,
        id_usuario: parseInt(id_usuario)
      }
    });

    return NextResponse.json(receita, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    return NextResponse.json(
      { error: 'Erro ao criar receita' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar uma receita existente
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id_receita, nome_receita, valor, data } = body;

    if (!id_receita || !nome_receita || !valor || !data) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      );
    }

    const dataReceita = new Date(data);
    if (isNaN(dataReceita.getTime())) {
      return NextResponse.json(
        { error: 'Data inválida' },
        { status: 400 }
      );
    }

    // Verificar se a receita existe
    const receitaExistente = await prisma.receita.findUnique({
      where: { id_receita: parseInt(id_receita) }
    });

    if (!receitaExistente) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      );
    }

    const receita = await prisma.receita.update({
      where: {
        id_receita: parseInt(id_receita)
      },
      data: {
        nome_receita,
        valor: valorNumerico,
        data: dataReceita
      }
    });

    return NextResponse.json(receita);
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar receita' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir uma receita
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da receita é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a receita existe
    const receitaExistente = await prisma.receita.findUnique({
      where: { id_receita: parseInt(id) }
    });

    if (!receitaExistente) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      );
    }

    await prisma.receita.delete({
      where: {
        id_receita: parseInt(id)
      }
    });

    return NextResponse.json({ message: 'Receita excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir receita' },
      { status: 500 }
    );
  }
} 