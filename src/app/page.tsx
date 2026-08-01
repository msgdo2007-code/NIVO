import { ArrowRight, BarChart3, Blocks, Check, Orbit, Palette, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const benefits = [
  { icon: Blocks, title: "Tudo em uma órbita", text: "Links, conteúdos, produtos e redes sociais organizados em blocos flexíveis." },
  { icon: Palette, title: "Identidade sem limites", text: "Temas, efeitos e layouts pensados para transformar sua página em uma assinatura." },
  { icon: BarChart3, title: "Decisões com contexto", text: "Entenda visitas e cliques com analytics que respeitam a privacidade." },
];

export default function Home() {
  return (
    <main className="landing">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="NIVO — página inicial"><span className="brand-mark"><Orbit /></span><strong>NIVO</strong></Link>
        <nav aria-label="Navegação principal"><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#seguranca">Segurança</a></nav>
        <div className="header-actions"><Link className="button ghost" href="/login">Entrar</Link><Link className="button primary" href="/cadastro">Criar universo</Link></div>
      </header>
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy"><span className="pill"><Sparkles /> Sua presença, elevada</span><h1>Seu universo.<br />Seus links. <em>Sua identidade.</em></h1><p>Crie uma página única para reunir seus links, conteúdos, produtos e redes sociais em um universo totalmente personalizado.</p><div className="hero-actions"><Link className="button primary large" href="/cadastro">Criar meu universo <ArrowRight /></Link><a className="button ghost large" href="#preview">Explorar perfis</a></div><div className="trust-row"><span><Check /> Grátis para começar</span><span><Check /> Sem cartão</span><span><ShieldCheck /> Dados protegidos</span></div></div>
        <div className="profile-stage" id="preview" aria-label="Prévia de um perfil NIVO"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="profile-card"><div className="profile-cover"><span className="planet" /></div><div className="profile-avatar">N</div><h2>Nina Cósmica <span>✦</span></h2><p>@ninacosmica</p><p className="profile-bio">Design, música e pequenos universos digitais.</p><div className="profile-links"><span>Meu portfólio <ArrowRight /></span><span>Último vídeo <ArrowRight /></span><span>Playlist da órbita <ArrowRight /></span></div><div className="profile-foot"><Orbit /> Feito com NIVO</div></div></div>
      </section>
      <section className="section" id="recursos"><div className="section-heading"><span className="eyebrow">Poder sem complicação</span><h2>Uma base sólida para o seu próximo nível.</h2><p>Ferramentas que crescem junto com sua presença digital.</p></div><div className="feature-grid">{benefits.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><span className="feature-icon"><Icon /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="section workflow" id="como-funciona"><div><span className="eyebrow">Três passos</span><h2>Da ideia ao ar em minutos.</h2></div><ol><li><b>01</b><div><h3>Crie sua conta</h3><p>Entre com e-mail, Google ou Discord.</p></div></li><li><b>02</b><div><h3>Monte sua órbita</h3><p>Escolha o visual e adicione seus blocos.</p></div></li><li><b>03</b><div><h3>Compartilhe e evolua</h3><p>Publique seu link e acompanhe resultados reais.</p></div></li></ol></section>
      <section className="section security" id="seguranca"><div className="security-icon"><ShieldCheck /></div><div><span className="eyebrow">Segurança desde a fundação</span><h2>Seu universo pertence a você.</h2><p>Sessões seguras, permissões no banco, isolamento por usuário e segredos apenas no servidor.</p></div></section>
      <section className="cta"><Rocket /><span className="eyebrow">Pronto para decolar?</span><h2>Crie um lugar na internet que só poderia ser seu.</h2><Link className="button primary large" href="/cadastro">Começar agora <ArrowRight /></Link></section>
      <footer><Link className="brand" href="/"><span className="brand-mark"><Orbit /></span><strong>NIVO</strong></Link><p>Seu universo digital, em uma única órbita.</p><span>© 2026 NIVO</span></footer>
    </main>
  );
}
