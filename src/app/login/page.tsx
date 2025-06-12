'use client';
import { useState, useEffect } from 'react'; // useRef não é mais necessário aqui
import './login.css';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [currentSlide, setCurrentSlide] = useState(0);
  // --- MUDANÇA 1: Refs removidos ---
  // const leftTextGroupRef = useRef<HTMLDivElement>(null);
  // const rightTextGroupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isSignUpActive, setIsSignUpActive] = useState(false);

  // Estados para login/cadastro
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [registerNome, setRegisterNome] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerSenha, setRegisterSenha] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');

  const slides = [
    { image: '/img/Login/Mask group1.png', title: 'Controle suas finanças', description: 'Acompanhe seus gastos e receitas de forma simples e eficiente' },
    { image: '/img/Login/Mask group2.png', title: 'Organize seu orçamento', description: 'Defina metas e acompanhe seu progresso' },
    { image: '/img/Login/Mask group3.png', title: 'Faça suas metas!', description: 'Alcance seus objetivos financeiros com planejamento' }
  ];
  
  // useEffect para o slider automático (continua igual)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // --- MUDANÇA 2: useEffect de animação REMOVIDO ---
  // Este bloco não é mais necessário, pois o estilo será aplicado diretamente no JSX.
  /*
  useEffect(() => {
    // ...código removido...
  }, [currentSlide]);
  */

  const handleBulletClick = (index: number) => {
    setCurrentSlide(index);
  };

  // --- MUDANÇA 3: A função renderCarousel é simplificada ---
  // Ela não precisa mais receber uma 'ref'
  const renderCarousel = () => (
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
          {/* --- MUDANÇA 4: A MÁGICA ACONTECE AQUI! --- */}
          {/* O transform é aplicado dinamicamente com base no estado 'currentSlide' */}
          <div 
            className="text-group" 
            style={{ transform: `translateY(-${currentSlide * 50}px)` }}
          >
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterMsg('');
    if (!registerNome || !registerEmail || !registerSenha) {
      setRegisterMsg('Preencha todos os campos!');
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerSenha,
      options: { data: { nome: registerNome } }
    });
    if (error) {
      setRegisterMsg(error.message);
    } else {
      setRegisterMsg('Cadastro realizado! Verifique seu email.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg('');
    if (!loginEmail || !loginSenha) {
      setLoginMsg('Preencha todos os campos!');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginSenha
    });
    if (error) {
      setLoginMsg('Email ou senha inválidos!');
    } else {
      setLoginMsg('Login realizado com sucesso!');
      router.push('/dashboard');
    }
  };

  return (
    // A classe do container é controlada pelo estado 'isSignUpActive'
    <div className={`container ${isSignUpActive ? 'right-panel-active' : ''}`}>
      <div className="row">
        {/* Sign Up */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <img src="/img/BudgetBuddysgv.svg" alt="Logo" width="100" height="100" />
            <h1>Bem Vindo</h1>
            <h2>Criar Cadastro</h2>
            <span></span>
            <input type="text" placeholder="Nome" value={registerNome} onChange={e => setRegisterNome(e.target.value)} />
            <input type="email" placeholder="Email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} />
            <input type="password" placeholder="Senha" value={registerSenha} onChange={e => setRegisterSenha(e.target.value)} />
            <button type="submit">Cadastrar</button>
            {registerMsg && <p style={{ color: registerMsg.startsWith('Cadastro') ? 'green' : 'red', marginTop: 8 }}>{registerMsg}</p>}
            <p id="mobile_para"></p>
            {/* O onClick agora altera o estado */}
            <button className="ghost_mobile" type="button" onClick={() => setIsSignUpActive(false)}>Fazer Login</button>
          </form>
        </div>

        {/* Sign In */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <img src="/img/BudgetBuddysgv.svg" alt="Logo" width="100" height="100" />
            <h1>Bem-Vindo Novamente!</h1>
            <h2>Fazer Login</h2>
            <span></span>
            <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Senha" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} />
            <a href="#">Esqueceu sua senha?</a>
            <button type="submit">Fazer Login</button>
            {loginMsg && <p style={{ color: loginMsg.startsWith('Login') ? 'green' : 'red', marginTop: 8 }}>{loginMsg}</p>}
            <p id="mobile_para">Não possui conta? Crie uma aqui !!</p>
            {/* O onClick agora altera o estado */}
            <button className="ghost_mobile" type="button" onClick={() => setIsSignUpActive(true)}>Criar Cadastro</button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Overlay left */}
            <div className="overlay-panel overlay-left">
              {renderCarousel()}
              <button className="ghost" type="button" onClick={() => setIsSignUpActive(false)}>Fazer Login</button>
            </div>

            {/* Overlay right */}
            <div className="overlay-panel overlay-right">
              {renderCarousel()}
              <button className="ghost" type="button" onClick={() => setIsSignUpActive(true)}>Cadastre-se</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}