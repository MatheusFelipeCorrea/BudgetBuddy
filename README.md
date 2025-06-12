# Documentação BudgetBuddy


## 1. Introdução
O projeto BudgetBuddy é uma aplicação web inovadora voltada para a gestão pessoal de finanças. A plataforma utiliza LocalStorage para salvamento de dados, permitindo que os usuários acompanhem seu saldo, vencimentos futuros, gastos por categoria, e visualizem gráficos detalhados sobre sua renda mensal. Além disso, a ferramenta oferece dicas financeiras, criação e gerenciamento de metas, e um extrato financeiro para melhor controle das finanças.

Atualmente, o endividamento da população tem sido uma preocupação crescente, muitas vezes causado pela falta de organização financeira. O BudgetBuddy surge como uma solução prática e acessível para esse problema, proporcionando um organizador financeiro simples e intuitivo, sem a complexidade das tradicionais planilhas.

###  1.1 Objetivo
O principal objetivo do BudgetBuddy é proporcionar aos usuários uma maneira prática e eficiente de gerenciar suas finanças pessoais, ajudando-os a visualizar suas receitas e despesas de forma clara. A plataforma visa melhorar a educação financeira, incentivando hábitos mais saudáveis no controle de gastos e auxiliando na criação de metas financeiras realistas e alcançáveis.

### 1.2 Escopo
O projeto abrange as seguintes funcionalidades:

- ✅ Registro e acompanhamento do saldo disponível.

- ✅ Visualização de vencimentos futuros.

- ✅ Categorização de despesas e receitas.

- ✅ Representação gráfica da renda mensal.

- ✅ Sugestões e dicas financeiras personalizadas.

- ✅ Criação e gerenciamento de metas financeiras.

- ✅ Exibição do extrato financeiro.


O que não está incluído no escopo:

- 🚫 Integração com bancos ou contas externas.

- 🚫 Funcionalidades de inteligência artificial para análise preditiva.

- 🚫 Suporte para múltiplos usuários com sincronização em nuvem.

### 1.3 Público-Alvo
O BudgetBuddy é destinado a qualquer pessoa que deseja uma ferramenta prática e acessível para organizar suas finanças. Entre os principais usuários, destacam-se:

- 👤 Jovens adultos que estão começando a gerenciar seu próprio dinheiro.

- 👨‍👩‍👧‍👦 Famílias que desejam um melhor controle financeiro.

- 💼 Profissionais autônomos que precisam acompanhar entradas e saídas de dinheiro.

- 📈 Pessoas interessadas em melhorar sua educação financeira e estabelecer metas de economia.

### 1.4 Visão Geral
O BudgetBuddy propõe uma solução inovadora para a organização financeira, diferenciando-se das planilhas tradicionais e de aplicativos complexos. Seu diferencial está na simplicidade e na usabilidade, permitindo que qualquer pessoa, mesmo sem conhecimento avançado de finanças, consiga administrar seu orçamento de forma eficiente.

Com um design intuitivo e funcionalidades práticas, a plataforma auxilia no planejamento financeiro de forma acessível e sem burocracia, tornando-se uma ferramenta indispensável para quem deseja mais controle sobre sua vida financeira.


## 2. Contexto
Atualmente, vivemos em uma sociedade cada vez mais consumista e financeiramente instável. Muitos indivíduos enfrentam dificuldades para gerenciar seus recursos devido à falta de conhecimento financeiro e ausência de ferramentas adequadas.

Dentre os principais desafios enfrentados pela população em relação ao gerenciamento financeiro, destacam-se:

Falta de um orçamento claro, dificultando a visualização da real situação financeira.
Gastos impulsivos, que levam ao descontrole das finanças.
Dívidas acumuladas, resultado da falta de planejamento e do uso excessivo de crédito.
Ausência de metas financeiras, o que dificulta a construção de um patrimônio sólido.
Falta de ferramentas adequadas, obrigando muitas pessoas a utilizar métodos ineficientes, como anotações manuais ou acompanhamento apenas pelo extrato bancário.
A pesquisa realizada com 30 pessoas revelou que:
- 📌 27,8% não realizam nenhum tipo de planejamento financeiro.
- 📌 44,4% acompanham seus gastos apenas pelo extrato bancário.
- 📌 16,7% utilizam planilhas para gerenciamento financeiro.
- 📌 Apenas 11,1% possuem um orçamento financeiro estruturado e controlam suas metas.

Esses dados mostram a necessidade de uma solução prática, acessível e eficiente, que facilite o gerenciamento financeiro e incentive hábitos mais saudáveis no controle de gastos e investimentos.

### 2.1 Justificativa
Diante do cenário identificado, percebe-se a importância de uma ferramenta que ajude as pessoas a organizarem suas finanças de forma simples e eficaz. O BudgetBuddy surge como uma solução inovadora que permitirá aos usuários monitorar seu saldo, planejar seus gastos e estabelecer metas de forma intuitiva e acessível.

Os benefícios esperados com a implementação do projeto incluem:
- ✅ Maior controle financeiro pessoal, reduzindo o endividamento.

- ✅ Facilidade na visualização de receitas e despesas, por meio de gráficos e categorias.

- ✅ Incentivo ao planejamento financeiro, ajudando os usuários a estabelecerem metas.

- ✅ Alternativa simples e eficiente, sem a complexidade de planilhas ou aplicativos bancários tradicionais.

Com essa ferramenta, espera-se impactar positivamente a vida financeira dos usuários, ajudando-os a desenvolver hábitos mais saudáveis e a tomar decisões financeiras mais inteligentes.

### 2.2 Análise de Mercado
O mercado de aplicativos e soluções para gestão financeira pessoal tem crescido significativamente, impulsionado pela necessidade de melhor controle sobre gastos e investimentos. Algumas das principais tendências observadas são:

- 📊 Digitalização das finanças: Muitas pessoas estão migrando do controle manual (anotações e planilhas) para ferramentas digitais mais práticas.

- 📉 Preocupação com endividamento: O aumento das dívidas levou a uma maior busca por soluções de gestão financeira acessíveis.

- 📱 Uso de tecnologias acessíveis: Aplicações que não exigem sincronização bancária, como o LocalStorage, são atrativas para usuários preocupados com segurança e privacidade.

Em comparação com soluções existentes, como apps de bancos, planilhas e softwares financeiros complexos, o BudgetBuddy se destaca por oferecer uma interface amigável e intuitiva, sem necessidade de conexão bancária, garantindo praticidade e segurança.

### 2.3 Requisitos Legais ou Normativos
Para garantir conformidade e segurança, o projeto deve seguir algumas diretrizes legais e boas práticas, tais como:

- 📌 LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018): Como a aplicação armazena dados no LocalStorage, é essencial garantir que nenhuma informação sensível seja compartilhada sem o consentimento do usuário.

- 📌 Educação Financeira: Seguir boas práticas recomendadas por órgãos como o Banco Central do Brasil e a Febraban, promovendo informações claras e acessíveis.

- 📌 Acessibilidade Digital: Adotar padrões como WCAG para garantir que a aplicação seja utilizável por pessoas com diferentes necessidades.

Dessa forma, o BudgetBuddy se estabelece como uma solução inovadora, confiável e segura, voltada para um público que busca autonomia e eficiência no controle de suas finanças pessoais.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
