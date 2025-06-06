'use client';
import { useState, useEffect, useRef } from 'react';
import './login.css';

export default function Login() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const leftTextGroupRef = useRef<HTMLDivElement>(null);
  const rightTextGroupRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      image: '/img/Login/Mask group1.png',
      title: 'Controle suas finanças',
      description: 'Acompanhe seus gastos e receitas de forma simples e eficiente'
    },
    {
      image: '/img/Login/Mask group2.png',
      title: 'Organize seu orçamento',
      description: 'Defina metas e acompanhe seu progresso'
    },
    {
      image: '/img/Login/Mask group3.png',
      title: 'Faça suas metas!',
      description: 'Alcance seus objetivos financeiros com planejamento'
    }
  ];

  useEffect(() => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const signUpMobile = document.getElementById('signUp_mobile');
    const signInMobile = document.getElementById('signIn_mobile');
    const container = document.getElementById('container');

    const handleSignUp = () => {
      if (container) {
        container.classList.add('right-panel-active');
      }
    };

    const handleSignIn = () => {
      if (container) {
        container.classList.remove('right-panel-active');
      }
    };

    signUpButton?.addEventListener('click', handleSignUp);
    signInButton?.addEventListener('click', handleSignIn);
    signUpMobile?.addEventListener('click', handleSignUp);
    signInMobile?.addEventListener('click', handleSignIn);

    return () => {
      signUpButton?.removeEventListener('click', handleSignUp);
      signInButton?.removeEventListener('click', handleSignIn);
      signUpMobile?.removeEventListener('click', handleSignUp);
      signInMobile?.removeEventListener('click', handleSignIn);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (leftTextGroupRef.current) {
      leftTextGroupRef.current.style.transform = `translateY(-${currentSlide * 50}px)`;
    }
    if (rightTextGroupRef.current) {
      rightTextGroupRef.current.style.transform = `translateY(-${currentSlide * 50}px)`;
    }
  }, [currentSlide]);

  const handleBulletClick = (index: number) => {
    setCurrentSlide(index);
  };

  const renderCarousel = (textGroupRef: React.RefObject<HTMLDivElement | null>) => (
    <div className="carousel">
      <div className="images-wrapper">
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide.image}
            className={`image ${index === currentSlide ? 'show' : ''}`}
            alt={slide.title}
          />
        ))}
      </div>
      <div className="text-slider">
        <div className="text-wrap">
          <div className="text-group" ref={textGroupRef}>
            {slides.map((slide, index) => (
              <h2 key={index}>{slide.title}</h2>
            ))}
          </div>
        </div>
        <div className="bullets">
          {slides.map((_, index) => (
            <span
              key={index}
              className={index === currentSlide ? 'active' : ''}
              onClick={() => handleBulletClick(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container" id="container">
      <div className="row">
        {/* Sign Up */}
        <div className="form-container sign-up-container">
          <form action="#">
            <img src="/img/BudgetBuddysgv.svg" alt="Logo" width="100" height="100" />
            <h1>Bem Vindo</h1>
            <h2>Criar Cadastro</h2>
            <span>Ou use seu Email para o registro</span>
            <input type="text" placeholder="Nome" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Senha" />
            <button>Cadastrar</button>
            <p id="mobile_para">To keep connected with us, please login</p>
            <button className="ghost_mobile" id="signIn_mobile">Fazer Login</button>
          </form>
        </div>

        {/* Sign In */}
        <div className="form-container sign-in-container">
          <form action="#">
            <img src="/img/BudgetBuddysgv.svg" alt="Logo" width="100" height="100" />
            <h1>Bem-Vindo Novamente!</h1>
            <h2>Fazer Login</h2>
            <span>Ou use sua conta</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Senha" />
            <a href="#">Esqueceu sua senha?</a>
            <button>Fazer Login</button>
            <p id="mobile_para">Não possui conta? Crie uma aqui !!</p>
            <button className="ghost_mobile" id="signUp_mobile">Criar Cadastro</button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Overlay left */}
            <div className="overlay-panel overlay-left">
              {renderCarousel(leftTextGroupRef)}
              <button className="ghost" id="signIn">Fazer Login</button>
            </div>

            {/* Overlay right */}
            <div className="overlay-panel overlay-right">
              {renderCarousel(rightTextGroupRef)}
              <button className="ghost" id="signUp">Cadastre-se</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 