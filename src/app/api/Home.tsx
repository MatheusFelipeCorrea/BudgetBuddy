'use client';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useState, useEffect } from 'react';

export default function Home() {
  // ========== Lógica dos Depoimentos ==========
  const testimonials = [
    "Ótima plataforma! Agora acompanho meus gastos com muito mais facilidade. - João.",
    "O sistema de metas me ajudou a economizar e atingir meus objetivos! - Maria.",
    "A melhor ferramenta para organizar minhas finanças pessoais e empresariais! - Pedro.",
    "Acompanhar meus vencimentos nunca foi tão simples. Recomendo! - Ana.",
    "Visualização clara e prática das despesas mensais. Excelente! - Lucas.",
    "Gostei bastante das dicas financeiras, são realmente úteis! - Camila.",
    "Agora sei exatamente onde estou gastando e como posso melhorar. - Rafael.",
    "Muito intuitivo, facilitou meu planejamento financeiro. - Bianca.",
    "Funcionalidades incríveis para manter minhas contas em dia! - Eduardo.",
    "A organização por categorias me ajuda muito a entender meus gastos. - Vanessa.",
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(testimonials[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ========== Lógica do Carrossel de Imagens ==========
  useEffect(() => {
    // Configuração do intervalo para depoimentos
    const testimonialInterval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      setCurrentIndex(nextIndex);
      setCurrentTestimonial(testimonials[nextIndex]);
    }, 15000);

    // Configuração do carrossel de imagens
    const images = document.querySelectorAll(".image");
    
    const handleClick = (image: HTMLElement) => {
      if (!image.classList.contains("active")) {
        document.querySelector(".image.active")?.classList.remove("active");
        image.classList.add("active");
      }
    };

    images.forEach((image) => {
      if (image instanceof HTMLElement) {
        image.addEventListener("click", () => handleClick(image));
      }
    });

    // Limpeza dos event listeners e intervalos
    return () => {
      clearInterval(testimonialInterval);
      images.forEach((image) => {
        if (image instanceof HTMLElement) {
          image.removeEventListener("click", () => handleClick(image));
        }
      });
    };
  }, [currentIndex]);

  return (
    <>
      <Head>
        <title>BudgetBuddy</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header>
        <Link href="/" className="navbar-brand">
          <img 
            src="/img/BudgetBuddy Icon 2sgv.svg" 
            alt="Logo BudgetBuddy" 
            width={100}
            height={100} />
        </Link>
      </header>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="nav-icons d-flex align-items-center">
            <a href="#" className="icon-button me-3">
              <img src="/img/Home/whatsapp.svg" alt="WhatsApp" className="icon" width={25} height={25} />
            </a>
            <a href="#" className="icon-button me-3">
              <img src="/img/Home/mail.svg" alt="Email" className="icon" width={25} height={25} />
            </a>
            <a 
              href="https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2024-2-ti2-3687100-atenasbuffet/tree/main" 
              target="_blank"
              rel="noopener noreferrer"
              className="icon-button me-3"
            >
              <img src="/img/Home/github (2).svg" alt="Github" className="icon" width={25} height={25} />
            </a>
            <a href="#" className="icon-button me-3">
              <img src="/img/Home/Linkedin.svg" alt="Linkedin" className="icon" width={25} height={25} />
            </a>
          </div>

          <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#sobre">Sobre o BudgetBuddy</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#servicos">Nossos Serviços</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#depoimentos">Depoimentos</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contatos">Contatos</a>
              </li>
            </ul>
          </div>
        </div>
        <button id="clientAreaButton" className="btn btn-custom d-flex align-items-center">
          <img 
            src="/img/Home/User.svg" 
            alt="User" 
            width={32}
            height={32}
            className="me-2"
          />
        </button>
      </nav>

      {/* Main Content */}
      <main>
        {/* Seção Sobre */}
        <section id="sobre" className="sobre">
          <div className="container-fluid p-0">
            <div className="row g-0">
              <div className="col-md-6">
                <img 
                  src="/img/Home/Firefly gere imagens relacionadas a finanças na paleta de cores 46A094 e 042940 27136 1.png" 
                  alt="Controle Financeiro" 
                  className="img-fluid banner-img" 
                  width={834}
                  height={532}
                />
              </div>
              <div className="col-md-6 d-flex align-items-center justify-content-center bg-dark-blue text-gold">
                <div className="p-5 text-center">
                  <h1>Sobre o BudgetBuddy</h1>
                  <p>
                    O BudgetBuddy é uma solução voltada para ajudar jovens e adultos a controlar suas finanças pessoais. 
                    Ele permite monitorar gastos, criar orçamentos e estabelecer metas financeiras. 
                    A ferramenta busca promover hábitos saudáveis de economia, visando maior estabilidade econômica e bem-estar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Serviços */}
        <section id="servicos" className="servicos">
          <h2>Nossos Serviços</h2>
          <div className="servicos-container">
            <div className="image-container">
              <div className="image active">
                <img 
                  src="https://neon.com.br/aprenda/wp-content/uploads/2023/12/metas-para-proximo-ano-1024x542.png" 
                  alt="Metas Financeiras" 
                  width={300}
                  height={200}
                />
                <span>Metas</span>
              </div>
              <div className="image">
                <img 
                  src="https://files.sunoresearch.com.br/p/uploads/2021/08/renda-em-dobro-800x450.jpg" 
                  alt="Renda Mensal" 
                  width={300}
                  height={200}
                />
                <span>Renda Mensal</span>
              </div>
              <div className="image">
                <img 
                  src="https://lh5.googleusercontent.com/IdKoNQHaetLoMQs5wtUOjJ9VUdLG5Xp-36kDEOzh_Zfn6RcmszFmQaYq3RisUC59vj-c2VV-A2cSTUYGvopkNNb_dBXUQr4aAyquD6zCZCf76KT83B6mSaZ6FHRizoil-WrmTBPiE3BdZauyTnVCGw" 
                  alt="Gastos por Categoria" 
                  width={300}
                  height={200}
                />
                <span>Gastos por Categoria</span>
              </div>
              <div className="image">
                <img 
                  src="https://www.cashme.com.br/blog/wp-content/uploads/2021/11/extrato-bancario.jpg" 
                  alt="Extrato de Gastos" 
                  width={300}
                  height={200}
                />
                <span>Extrato de Gastos</span>
              </div>
              <div className="image">
                <img 
                  src="https://pefmbddiag.blob.core.windows.net/cdn-blog-pi/output/img/materia/m%C3%A9todos%20para%20poupar%20dinheiro.jpg" 
                  alt="Dicas para Poupar" 
                  width={300}
                  height={200}
                />
                <span>Dicas para Poupar</span>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Depoimentos */}
        <section id="depoimentos" className="depoimentos">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h2>Depoimentos dos nossos clientes</h2>
                <blockquote className="depoimento">
                  {currentTestimonial}
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Seção CTA */}
        <section className="curioso">
          <h2>Ficou Curioso?</h2>
          <Link href="/login" passHref>
            <button className="btn-inscrever">Inscrever-me</button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-left">
            <img 
              src="/img/BudgetBuddysgv.svg" 
              alt="Logo BudgetBuddy" 
              className="footer-logo"
              width={160}
            />
            <div className="nav-icons d-flex align-items-center">
              <a href="#" className="icon-button me-3">
                <img src="/img/Home/whatsapp.svg" alt="WhatsApp" className="icon" width={25} height={25} />
              </a>
              <a href="#" className="icon-button me-3">
                <img src="/img/Home/mail.svg" alt="Email" className="icon" width={25} height={25} />
              </a>
              <a 
                href="https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2024-2-ti2-3687100-atenasbuffet/tree/main" 
                target="_blank"
                rel="noopener noreferrer"
                className="icon-button me-3"
              >
                <img src="/img/Home/github (2).svg" alt="Github" className="icon" width={25} height={25} />
              </a>
              <a href="#" className="icon-button me-3">
                <img src="/img/Home/Linkedin.svg" alt="Linkedin" className="icon" width={25} height={25} />
              </a>
            </div>
          </div>
          <div className="footer-center">
            <h2>Pronto para conquistar o controle das suas finanças?</h2>
            <p className="frase">
              Inscreva-se agora e comece a transformar sua relação com o dinheiro, 
              tornando seus sonhos mais próximos a cada passo!
            </p>
          </div>
          <div className="footer-right">
            <ul>
              <li><Link href="#sobre">Sobre o BudgetBuddy</Link></li>
              <li><Link href="#servicos">Nossos Serviços</Link></li>
              <li><Link href="#depoimentos">Depoimentos</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
    </>
  );
}