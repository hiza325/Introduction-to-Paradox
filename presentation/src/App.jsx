import React, { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowRight, ArrowDown, ArrowLeft, AudioLines, BrainCircuit, Check, ChevronRight, Code2, Cpu, Database, Expand, Eye, Fingerprint, Layers3, Lightbulb, LockKeyhole, Menu, Pause, Play, RotateCcw, ShieldCheck, Sparkles, Workflow, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);
const AICore = lazy(() => import('./components/AICore.jsx'));
const sections = [
  ['home', 'Tổng quan', 'Khi AI luôn đưa ra đáp án, người học còn cơ hội tự suy luận không? PARADOX AI đề xuất một vai trò khác cho AI trong giáo dục.'],
  ['problem', 'Vấn đề', 'Đáp án đến quá nhanh có thể khiến quá trình tư duy bị bỏ qua. Phân biệt hoàn thành bài tập và hiểu bản chất.'],
  ['solution', 'Giải pháp', 'Hội đồng phản biện ảo là hướng thiết kế: phân tích, đặt câu hỏi và gợi mở để người học tự sửa.'],
  ['workflow', 'Quy trình', 'Đi qua bảy bước. Nhấn mạnh bước Thử lại: người học vẫn là người giải bài. Chọn từng bước hoặc bật tự chạy.'],
  ['demo', 'Live Demo', 'Đây là mô phỏng có kịch bản, không gọi AI thật. Dùng các gợi ý để minh họa cách người học quay lại suy luận.'],
  ['avalanche', 'Avalanche', 'Skill Passport là thiết kế đề xuất. Chỉ đưa bằng chứng cần thiết lên chain; dữ liệu học tập giữ off-chain. Không có giao dịch thật trong bản này.'],
  ['architecture', 'Công nghệ', 'Frontend thuyết trình đã có trong repository. AI, backend, database và smart contract là kiến trúc dự kiến. Kết thúc với tư duy phản biện, tự học và chứng minh tiến bộ.'],
];
const steps = [
  ['Gửi bài', 'Upload', 'Bắt đầu từ suy nghĩ của bạn.', 'Đưa vào câu hỏi hoặc bài làm đầu tiên. Một lần thử chưa hoàn hảo cũng là điểm bắt đầu có giá trị.', Code2],
  ['Phân tích', 'Analyze', 'Nhìn vào cách lập luận.', 'Hướng thiết kế: đọc từng bước suy luận để hiểu cách người học tiếp cận vấn đề.', BrainCircuit],
  ['Phát hiện', 'Detect', 'Tìm điểm cần xem lại.', 'Xác định bước chưa hợp lý hoặc giả định còn thiếu, thay vì chỉ đánh dấu đúng hay sai.', Eye],
  ['Gợi mở', 'Hint', 'Một gợi ý, một hướng nghĩ mới.', 'Đặt câu hỏi vừa đủ để người học tự tìm ra bước tiếp theo, không đưa ngay lời giải.', Lightbulb],
  ['Thử lại', 'Retry', 'Bạn vẫn là người giải bài.', 'Quay lại bài làm, kiểm tra giả định và tự điều chỉnh cách giải bằng hiểu biết của mình.', RotateCcw],
  ['Rà soát', 'Review', 'Đối chiếu sự thay đổi.', 'Xem lại cách giải mới và các điểm đã được điều chỉnh trong quá trình học.', ShieldCheck],
  ['Giải thích', 'Explain', 'Biến lời giải thành hiểu biết.', 'Diễn đạt vì sao cách giải có cơ sở và suy nghĩ về cách áp dụng cho một bài toán khác.', AudioLines],
];
const architecture = [
  ['Giao diện học tập', 'React · Vite · Three.js', 'Prototype hiện tại', Layers3],
  ['Điều phối & AI', 'Phân tích · phản biện · gợi ý', 'Thiết kế dự kiến', Cpu],
  ['Dữ liệu học tập', 'Phiên học · tiến trình cá nhân', 'Thiết kế dự kiến', Database],
  ['Chứng chỉ & xác minh', 'Avalanche · tham chiếu bằng chứng', 'Thiết kế dự kiến', Fingerprint],
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

function CoreFallback() {
  return <div className="core-fallback"><div className="fallback-halo"/><div className="fallback-crystal"/><span>REASONING CORE</span></div>;
}
class CoreBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <CoreFallback/> : this.props.children; }
}
function SectionHeading({ number, label, children, description }) {
  return <div className="section-heading reveal"><div className="eyebrow"><span/>{number} / {label}</div><h2>{children}</h2>{description && <p className="section-description">{description}</p>}</div>;
}

function LearningWorkflow({ reduced, lowPower }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !visible || reduced || lowPower) return;
    const id = window.setInterval(() => { if (!document.hidden) setStep(value => (value + 1) % steps.length); }, 3200);
    return () => window.clearInterval(id);
  }, [playing, visible, reduced, lowPower]);
  const Icon = steps[step][4];
  const select = index => { setStep(index); setPlaying(false); };
  return <div className="workflow-console reveal" ref={ref}>
    <div className="console-bar"><span><span className="status-dot"/> LEARNING PROTOCOL</span><span>7 BƯỚC · 1 VÒNG LẶP</span></div>
    <div className="step-rail" role="group" aria-label="Bảy bước học tập">{steps.map((item, index) => <button key={item[1]} className={`step-tab ${index === step ? 'active' : ''} ${index < step ? 'complete' : ''}`} aria-pressed={index === step} onClick={() => select(index)}><span>{index < step ? <Check size={15}/> : `0${index + 1}`}</span><b>{item[0]}</b><small>{item[1]}</small></button>)}</div>
    <div className="step-detail" key={step} aria-live="polite"><div className="step-visual"><div className="step-icon"><Icon size={44} strokeWidth={1.2}/></div><span className="step-watermark">0{step + 1}</span><span className="mono">{steps[step][1].toUpperCase()}_PROTOCOL</span></div><div className="step-copy"><span className="eyebrow">BƯỚC 0{step + 1} / 07</span><h3>{steps[step][2]}</h3><p>{steps[step][3]}</p><div className="step-bottom"><button className="text-button" onClick={() => select((step + 1) % 7)}>Bước tiếp theo <ArrowRight size={16}/></button><button className="icon-button" disabled={reduced || lowPower} aria-pressed={playing && !reduced && !lowPower} aria-label={playing ? 'Tạm dừng quy trình' : 'Tự chạy quy trình'} title={reduced || lowPower ? 'Tự chạy tắt khi giảm chuyển động hoặc tiết kiệm hiệu ứng' : 'Tự chạy quy trình'} onClick={() => setPlaying(!playing)}>{playing && !reduced && !lowPower ? <Pause size={16}/> : <Play size={16}/>}</button></div></div></div>
    <div className="workflow-track"><span style={{ width: `${(step + 1) / 7 * 100}%` }}/></div>
  </div>;
}

function LiveDemo() {
  const [demo, setDemo] = useState(0);
  const responses = ['Khoan kết luận nhé. Hãy nhìn lại bước đầu tiên trong cách giải của bạn.', 'Nếu trừ 3 ở cả hai vế, phương trình còn lại là gì?', 'Bây giờ chia cả hai vế cho 2. Bạn tìm được x bằng bao nhiêu?', 'Bạn đã điều chỉnh thành x = 4. Vì sao cách làm này đúng?', 'Trừ 3 ở cả hai vế được 2x = 8. Chia cả hai vế cho 2 được x = 4. Thay lại: 2 × 4 + 3 = 11.'];
  return <div className="demo-window reveal"><div className="console-bar"><span className="window-title"><i/><i/><i/><span>paradox / learning-session</span></span><span className="demo-badge">MÔ PHỎNG CÓ KỊCH BẢN</span></div><div className="demo-body"><div className="exercise"><div className="eyebrow">THỬ THÁCH NHỎ</div><h3>Tìm giá trị của x</h3><div className="equation">2x + 3 = 11</div><div className="learner-answer"><span>BÀI LÀM MINH HỌA</span><b className={demo >= 3 ? 'correct' : ''}>x = {demo < 3 ? '5' : '4'}{demo >= 3 && <Check size={18}/>}</b></div><p>Một lời giải chưa đúng.<br/>Một cơ hội để hiểu sâu hơn.</p><div className="exercise-footer"><LockKeyhole size={13}/> Không kết nối dịch vụ AI</div></div><div className="conversation"><div className="council-label"><span className="ai-avatar"><BrainCircuit size={21}/></span><div><b>Hội đồng phản biện</b><small>Phản hồi mẫu · không do AI tạo trực tiếp</small></div><Sparkles size={17}/></div><div className="response" key={demo} aria-live="polite"><span className="mono">{['QUAN SÁT', 'GỢI Ý 01', 'GỢI Ý 02', 'THỬ LẠI', 'GIẢI THÍCH'][demo]}</span><p>{responses[demo]}</p><div className="response-signature"><span/> Giữ quyền suy luận ở người học</div></div><div className="demo-actions">{demo < 4 ? <><button className="button primary compact" onClick={() => setDemo(Math.min(4, demo + 1))}>{demo < 2 ? `Gợi ý ${demo + 1}` : demo === 2 ? 'Thử lại theo kịch bản' : 'Vì sao đúng?'}<ArrowRight size={15}/></button><button className="text-button subtle" onClick={() => setDemo(4)}>Xem giải thích</button></> : <button className="button secondary compact" onClick={() => setDemo(0)}><RotateCcw size={15}/> Bắt đầu lại</button>}</div><div className="demo-dots" aria-label={`Tiến trình mô phỏng ${demo + 1} trên 5`}>{responses.map((_, index) => <span key={index} className={index <= demo ? 'active' : ''}/>)}</div></div></div></div>;
}

export default function App() {
  const root = useRef(null);
  const progress = useRef(null);
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [presenter, setPresenter] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const reduced = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
      let current = 0;
      sections.forEach(([id], index) => { if (document.getElementById(id).getBoundingClientRect().top <= window.innerHeight * .42) current = index; });
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      if (reduced || lowPower) return;
      gsap.utils.toArray('.reveal').forEach(element => gsap.from(element, {
        y: 32, opacity: 0, duration: .85, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 92%', once: true },
      }));
      gsap.to('.hero-visual', { y: 65, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } });
    }, root);
    return () => context.revert();
  }, [reduced, lowPower]);

  const navigate = index => { document.getElementById(sections[index][0]).scrollIntoView({ behavior: reduced || lowPower ? 'instant' : 'smooth', block: 'start' }); setMenuOpen(false); };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setFullscreenError('');
    } catch { setFullscreenError('Trình duyệt chưa cho phép chế độ toàn màn hình.'); }
  };
  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') { setMenuOpen(false); setPresenter(false); }
      if (event.target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); navigate(Math.min(6, active + 1)); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(Math.max(0, active - 1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, reduced, lowPower]);

  return <div ref={root} className={`app ${lowPower ? 'low-power' : ''}`}>
    <a className="skip-link" href="#problem">Đến nội dung chính</a>
    <header className="topbar"><a className="brand" href="#home" aria-label="PARADOX AI — về đầu trang"><span className="brand-symbol">P<span/></span><span>PARADOX<span className="brand-ai">.AI</span></span></a><nav className="desktop-nav" aria-label="Điều hướng chính">{[[1, 'Vấn đề'], [2, 'Giải pháp'], [3, 'Quy trình'], [5, 'Avalanche']].map(([index, label]) => <a href={`#${sections[index][0]}`} key={index} aria-current={active === index ? 'location' : undefined}>{label}</a>)}</nav><div className="header-actions"><span className="event-badge"><span className="status-dot"/> UNIHACK <b>2026</b></span><a className="nav-demo" href="#demo">Trải nghiệm <ArrowUpRight size={14}/></a><button className="icon-button menu-toggle" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button></div>{menuOpen && <nav id="mobile-menu" className="mobile-menu" aria-label="Điều hướng di động">{sections.map(([id, label], index) => <a href={`#${id}`} key={id} onClick={() => setMenuOpen(false)} aria-current={active === index ? 'location' : undefined}><span>0{index + 1}</span>{label}<ArrowUpRight size={15}/></a>)}</nav>}</header>
    <aside className="section-index" aria-label="Các phần thuyết trình">{sections.map(([id, label], index) => <a href={`#${id}`} key={id} className={active === index ? 'active' : ''} aria-current={active === index ? 'location' : undefined} aria-label={`0${index + 1} ${label}`}><span>{label}</span><i/></a>)}</aside>
    <main>
      <section id="home" className="hero section-shell"><div className="hero-grid"/><div className="hero-layout"><div className="hero-copy"><div className="eyebrow hero-eyebrow"><span/> THE FUTURE OF ACTIVE LEARNING</div><div className="product-label">EduDefend<span>.</span>OS <span className="version">/ CONCEPT PRESENTATION</span></div><h1>PARADOX <span>AI</span><span className="title-period">.</span></h1><p className="hero-slogan">Đừng chỉ nhận đáp án.<br/><strong>Hãy học cách tư duy.</strong></p><p className="hero-description">Một hướng tiếp cận AI phản biện: đặt câu hỏi đúng, khơi mở lập luận và giúp người học chủ động làm chủ kiến thức.</p><div className="hero-actions"><a className="button primary" href="#problem">Khám phá hệ thống <ArrowUpRight size={17}/></a><a className="button secondary" href="#workflow"><Play size={14} fill="currentColor"/> Xem cách hoạt động</a></div><div className="hero-principles"><span><BrainCircuit size={14}/> Tư duy phản biện</span><span><Fingerprint size={14}/> Dấu ấn năng lực</span></div></div><div className="hero-visual" role="img" aria-label="AI Core 3D phát sáng với các nút liên kết, biểu tượng cho tư duy kết nối"><div className="core-coordinate top">NEURAL ENGINE <span>/ 01</span></div><CoreBoundary><Suspense fallback={<CoreFallback/>}><AICore reduced={reduced} lowPower={lowPower}/></Suspense></CoreBoundary><div className="core-label label-reason"><span className="label-icon"><BrainCircuit size={17}/></span><div><small>01 / ANALYZE</small><b>Hiểu cách bạn nghĩ</b></div><i/></div><div className="core-label label-question"><span className="label-icon violet"><Workflow size={17}/></span><div><small>02 / CHALLENGE</small><b>Mở rộng góc nhìn</b></div></div><div className="core-caption"><span className="status-dot"/> REASONING CORE<span className="core-caption-line"/><span>THINK. RETHINK. GROW.</span></div></div></div><div className="hero-bottom"><a href="#problem"><span className="scroll-capsule"><ArrowDown size={14}/></span><span>CUỘN ĐỂ KHÁM PHÁ</span></a><span className="hero-bottom-center">HUMAN THINKING. AI GUIDANCE.</span><span>01 <i>/</i> 07</span></div></section>
      <div className="principle-strip"><span>ĐƯỢC THIẾT KẾ ĐỂ</span><span>Khơi mở tư duy <Sparkles size={14}/></span><span>Nuôi dưỡng tự học <Sparkles size={14}/></span><span>Ghi nhận năng lực <Sparkles size={14}/></span><span className="strip-end">LEARNING, REIMAGINED.</span></div>
      <section id="problem" className="section-shell content-section problem-section"><SectionHeading number="02" label="THE PROBLEM" description="Khi câu trả lời chỉ cách một cú nhấp, điều gì xảy ra với hành trình tự tìm hiểu?">Đáp án đến nhanh.<br/><span>Tư duy có theo kịp?</span></SectionHeading><div className="problem-grid"><div className="problem-copy reveal"><span className="large-quote">“</span><p>Hoàn thành một bài tập<br/>chưa có nghĩa là<br/><strong>hiểu được bản chất.</strong></p><div className="editorial-note">PARADOX đặt lại vai trò của AI trong giáo dục: tạo không gian để người học thử, sai và tự lý giải.</div></div><div className="comparison reveal"><div className="comparison-row shortcut"><div className="comparison-label"><span className="tiny-dot"/> LỐI TẮT QUEN THUỘC</div><div className="mini-flow"><span>Đặt câu hỏi</span><ArrowRight size={16}/><span>Nhận đáp án</span><ArrowRight size={16}/><span className="flow-end">Sao chép</span></div><p>Bài làm có thể xong. Lập luận vẫn còn bỏ ngỏ.</p></div><div className="comparison-row rethink"><div className="comparison-label"><span className="tiny-dot"/> MỘT CÁCH HỌC KHÁC</div><div className="mini-flow"><span>Tự thử</span><ArrowRight size={16}/><span>Phản biện</span><ArrowRight size={16}/><span className="flow-end">Tự hiểu <Sparkles size={14}/></span></div><p>Mỗi lần điều chỉnh là một cơ hội hiểu sâu hơn.</p></div></div></div></section>
      <section id="solution" className="section-shell content-section solution-section"><div className="split-heading"><SectionHeading number="03" label="THE SOLUTION">Một hội đồng AI.<br/><span>Nhiều góc nhìn tư duy.</span></SectionHeading><p className="section-aside reveal">Hội đồng phản biện ảo là hướng thiết kế giúp người học nhìn lại lập luận, nhận gợi ý và tự sửa cách giải.</p></div><div className="council-grid">{[[BrainCircuit, '01', 'Phân tích', 'Đi sâu vào quá trình', 'Xem xét từng bước và các giả định trong bài làm. Hiểu cách tiếp cận trước khi nhận xét.'], [Eye, '02', 'Phản biện', 'Đặt câu hỏi có giá trị', 'Chỉ ra điểm cần kiểm tra, mở thêm một góc nhìn và khuyến khích người học bảo vệ lập luận.'], [Lightbulb, '03', 'Dẫn dắt', 'Gợi mở vừa đủ', 'Đưa gợi ý theo tiến trình để người học tự tìm hướng giải và giải thích bằng lời của mình.']].map(([Icon, number, title, subtitle, body]) => <article className="council-card reveal" key={title}><div className="card-top"><span className="council-icon"><Icon size={27} strokeWidth={1.3}/></span><span className="mono">{number} / COUNCIL</span></div><span className="card-overline">{subtitle}</span><h3>{title}</h3><p>{body}</p><div className="card-bottom"><span>VAI TRÒ ĐỀ XUẤT</span><ArrowUpRight size={17}/></div></article>)}</div><div className="solution-takeaway reveal"><span className="status-dot"/><p>AI mở đường. <strong>Người học làm chủ hành trình.</strong></p><span className="mono">HUMAN IN THE LOOP</span></div></section>
      <section id="workflow" className="section-shell content-section workflow-section"><div className="split-heading"><SectionHeading number="04" label="THE LEARNING LOOP">Từ một lần thử.<br/><span>Đến một lần hiểu.</span></SectionHeading><p className="section-aside reveal">7 bước học tập, một nguyên tắc xuyên suốt: người học luôn là người thực hiện bước tiếp theo.</p></div><LearningWorkflow reduced={reduced} lowPower={lowPower}/></section>
      <section id="demo" className="section-shell content-section demo-section"><SectionHeading number="05" label="INTERACTIVE DEMO" description="Một bài toán đơn giản để trải nghiệm cách phản hồi gợi mở có thể tạo ra cơ hội suy nghĩ.">Thử dừng lại.<br/><span>Để nghĩ thêm một bước.</span></SectionHeading><LiveDemo/><p className="simulation-note"><span className="tiny-dot"/> Nội dung có sẵn để minh họa tương tác. Không phải phiên AI trực tiếp hay kết quả đánh giá năng lực.</p></section>
      <section id="avalanche" className="section-shell content-section avalanche-section"><div className="passport-layout"><div className="passport-copy"><SectionHeading number="06" label="BUILT TOWARD AVALANCHE">Năng lực của bạn.<br/><span>Dấu ấn của riêng bạn.</span></SectionHeading><p className="section-description reveal">Skill Passport là định hướng ghi nhận quá trình học và hỗ trợ xác minh chứng chỉ bằng bằng chứng on-chain.</p><div className="passport-features reveal"><div><ShieldCheck size={19}/><div><h3>Hai lớp ghi nhận</h3><p>AI Evaluation Certificate ghi nhận đánh giá.<br/>Competency Certificate ghi nhận năng lực.</p></div></div><div><LockKeyhole size={19}/><div><h3>Quyền riêng tư từ thiết kế</h3><p>Giữ dữ liệu học tập off-chain. Chỉ tham chiếu bằng chứng cần thiết để xác minh.</p></div></div></div><div className="chain-tag reveal"><span className="avalanche-mark">▲</span> AVALANCHE FUJI <span>ĐỊNH HƯỚNG TÍCH HỢP</span></div></div><div className="passport-visual reveal"><div className="passport-glow"/><div className="passport-card"><div className="passport-card-head"><span><Fingerprint size={16}/> EduDefend.OS</span><span className="mono">CONCEPT / 01</span></div><div className="passport-emblem"><ShieldCheck size={44} strokeWidth={1}/></div><span className="passport-kicker">YOUR LEARNING IDENTITY</span><h3>Skill Passport<span>.</span></h3><div className="passport-rule"/><div className="passport-fields"><div><small>TRẠNG THÁI</small><b>Thiết kế minh họa</b></div><div><small>XÁC MINH</small><b>Chưa kết nối on-chain</b></div></div><div className="passport-card-foot"><span className="tiny-dot"/> CONCEPT · CHƯA PHÁT HÀNH <Fingerprint size={22}/></div></div><div className="proof-pipeline"><span>Bằng chứng học tập</span><ChevronRight size={15}/><span>Chứng chỉ</span><ChevronRight size={15}/><span>Xác minh</span></div><p className="passport-disclaimer">Không phát hành chứng chỉ, không tạo giao dịch blockchain.</p></div></div></section>
      <section id="architecture" className="section-shell content-section architecture-section"><div className="split-heading"><SectionHeading number="07" label="ARCHITECTURE & IMPACT">Công nghệ kết nối.<br/><span>Giá trị ở con người.</span></SectionHeading><p className="section-aside reveal">Kiến trúc mục tiêu tách trải nghiệm học tập, đánh giá và xác minh để mỗi lớp có trách nhiệm rõ ràng.</p></div><div className="architecture-map reveal">{architecture.map(([title, description, status, Icon], index) => <article className="architecture-node" key={title}><div><Icon size={23} strokeWidth={1.3}/><span className="mono">0{index + 1}</span></div><h3>{title}</h3><p>{description}</p><span className={`architecture-status ${index === 0 ? 'implemented' : ''}`}><span className="tiny-dot"/>{status}</span></article>)}</div><p className="architecture-note reveal">Repository hiện chứa website thuyết trình. Các dịch vụ AI, backend, database và smart contract chưa được kết nối trong bản này.</p><div className="impact-row reveal">{[['01', 'Tư duy phản biện', 'Biết hỏi “vì sao”, không chỉ “đáp án là gì”.'], ['02', 'Học tập chủ động', 'Tự thử, tự sửa, tự diễn đạt hiểu biết.'], ['03', 'Năng lực có dấu ấn', 'Hướng tới ghi nhận tiến bộ có thể xác minh.']].map(([number, title, body]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></div>)}</div><div className="closing reveal"><div className="eyebrow"><span/> THE NEXT CHAPTER STARTS WITH YOU</div><h2>Đáp án là điểm đến.<br/><span>Tư duy là hành trình.</span></h2><div className="closing-actions"><a className="button primary" href="#demo">Trải nghiệm vòng lặp <ArrowUpRight size={17}/></a><a className="text-button" href="https://unihack2026-beryl.vercel.app/" target="_blank" rel="noreferrer">Mở website dự án <ArrowUpRight size={16}/></a></div></div><footer className="footer"><a className="brand" href="#home">PARADOX<span className="brand-ai">.AI</span></a><span>EduDefend.OS · UniHack 2026</span><a href="#home">Về đầu trang <ArrowUpRight size={14}/></a></footer></section>
    </main>
    <div className="presentation-dock"><span className="dock-counter">0{active + 1}<i>/ 07</i><span>{sections[active][1]}</span></span><div className="dock-navigation"><button className="icon-button" disabled={active === 0} aria-label="Phần trước" onClick={() => navigate(active - 1)}><ArrowLeft size={15}/></button><span className="dock-key-hint">← →</span><button className="icon-button" disabled={active === 6} aria-label="Phần tiếp theo" onClick={() => navigate(active + 1)}><ArrowRight size={15}/></button></div><div className="dock-tools"><button className={`icon-button ${lowPower ? 'selected' : ''}`} aria-label="Tiết kiệm hiệu ứng" aria-pressed={lowPower} title="Tiết kiệm hiệu ứng" onClick={() => setLowPower(!lowPower)}><Sparkles size={15}/></button><button className={`icon-button ${presenter ? 'selected' : ''}`} aria-label="Ghi chú thuyết trình" aria-expanded={presenter} aria-controls="presenter-notes" title="Ghi chú thuyết trình" onClick={() => setPresenter(!presenter)}><Eye size={15}/></button><button className="icon-button fullscreen-button" aria-label="Bật hoặc tắt toàn màn hình" title="Toàn màn hình" onClick={toggleFullscreen}><Expand size={15}/></button></div></div><div className="scroll-progress" aria-hidden="true"><span ref={progress}/></div>
    {presenter && <aside id="presenter-notes" className="presenter-panel" aria-label="Ghi chú thuyết trình"><div><span className="eyebrow">SPEAKER NOTES / 0{active + 1}</span><button className="icon-button" aria-label="Đóng ghi chú" onClick={() => setPresenter(false)}><X size={17}/></button></div><h3>{sections[active][1]}</h3><p>{sections[active][2]}</p><span className="mono">NHỊP GỢI Ý: 25–40 GIÂY / PHẦN</span></aside>}
    {fullscreenError && <div className="system-notice" role="status">{fullscreenError}<button className="icon-button" aria-label="Đóng thông báo" onClick={() => setFullscreenError('')}><X size={14}/></button></div>}
  </div>;
}
