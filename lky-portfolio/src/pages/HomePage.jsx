import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DemoModal from '../components/DemoModal.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import Pagination from '../components/Pagination.jsx'
import Timeline from '../components/Timeline.jsx'
import { experiences } from '../data/experience.js'
import { aboutStats, heroIntro, heroProofs, workStories } from '../data/highlights.js'
import { featuredProjects, HOME_PAGE_SIZE, otherProjects } from '../data/homeProjects.js'
import { skillGroups } from '../data/skills.js'

function ProjectAction({ action, onDemo, children }) {
  if (action.type === 'modal') {
    return (
      <button type="button" className="project-link" onClick={onDemo}>
        {children}
      </button>
    )
  }

  return (
    <a className="project-link" href={action.href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

function ProjectCard({ project, onDemo, showStatusDemo = false }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showDemo =
    project.demo?.type === 'link' || (showStatusDemo && project.demo?.type === 'modal')

  return (
    <div className="project-card">
      <div className={`project-image${imageFailed ? ' project-image-fallback' : ''}`}>
        {imageFailed ? (
          <span className="project-image-fallback-title">{project.title}</span>
        ) : (
          <img src={project.image} alt={project.alt} onError={() => setImageFailed(true)} />
        )}
      </div>
      <div className="project-content">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="project-tech">
          {project.tech.map((item) => (
            <span className="tech-tag" key={item}>
              {item}
            </span>
          ))}
        </div>
        <div className="project-links">
          {showDemo ? (
            <ProjectAction action={project.demo} onDemo={onDemo}>
              <i className="fas fa-external-link-alt" /> 데모
            </ProjectAction>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [othersOpen, setOthersOpen] = useState(false)
  const [demoProject, setDemoProject] = useState(null)
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(otherProjects.length / HOME_PAGE_SIZE)
  const visibleOthers = useMemo(() => {
    const start = (page - 1) * HOME_PAGE_SIZE
    return otherProjects.slice(start, start + HOME_PAGE_SIZE)
  }, [page])

  useEffect(() => {
    document.title = '궁금하면500원 - 개발자 포트폴리오'
  }, [])

  return (
    <>
      <Header page="home" />
      <main className="page-home">
        <section id="home" className="hero">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                외부 데이터 통합과 정합성 검증,{' '}
                <span className="highlight">RDB 성능 최적화</span>
              </h1>
              <p className="hero-description">궁금하면500원입니다.</p>
              <p className="hero-intro">{heroIntro}</p>
              <ul className="hero-proofs">
                {heroProofs.map((proof) => (
                  <li className="hero-proof" key={proof.value}>
                    <span className="hero-proof-tag">{proof.tag}</span>
                    <strong className="hero-proof-value">{proof.value}</strong>
                    <span className="hero-proof-label">{proof.label}</span>
                  </li>
                ))}
              </ul>
              <div className="hero-buttons">
                <Link to="/projects" className="btn btn-primary">
                  프로젝트 보기
                </Link>
                <a href="#contact" className="btn btn-secondary">
                  연락하기
                </a>
              </div>
            </div>
            <div className="hero-image">
              <div className="code-animation">
                <div className="code-line">
                  <span className="keyword">public class</span>{' '}
                  <span className="class-name">Developer</span> {'{'}
                </div>
                <div className="code-line indent">
                  <span className="keyword">public void</span>{' '}
                  <span className="method">levelUp</span>() {'{'}
                </div>
                <div className="code-line indent-2">
                  <span className="variable">skills</span>.
                  <span className="method">improve</span>();
                </div>
                <div className="code-line indent">{'}'}</div>
                <div className="code-line">{'}'}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about">
          <div className="container">
            <h2 className="section-title">About Me</h2>
            <div className="about-content">
              <div className="about-text">
                <h3>이렇게 일했습니다</h3>
                {workStories.map((story) => (
                  <div className="work-story" key={story.title}>
                    <h4>{story.title}</h4>
                    <p>{story.body}</p>
                  </div>
                ))}
                <div className="stats">
                  {aboutStats.map((stat) => (
                    <div className="stat-item" key={stat.label}>
                      <h4>{stat.value}</h4>
                      <p>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="about-image">
                <div className="image-placeholder">
                  <img
                    src="/images/lky_img.png"
                    alt="궁금하면500원 프로필 이미지"
                    className="profile-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="projects">
          <div className="container">
            <h2 className="section-title clickable" onClick={() => navigate('/projects')}>
              주요 프로젝트
            </h2>
            <div className="projects-grid">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.title}
                  project={project}
                  showStatusDemo
                  onDemo={() => setDemoProject(project)}
                />
              ))}
            </div>
            <div className="other-projects-toggle">
              <button
                type="button"
                className="btn btn-secondary"
                aria-expanded={othersOpen}
                aria-controls="otherProjectsPanel"
                onClick={() => setOthersOpen((open) => !open)}
              >
                기타 프로젝트 ({otherProjects.length})
              </button>
            </div>
            <div id="otherProjectsPanel" className="other-projects-panel" hidden={!othersOpen}>
              <div className="projects-grid">
                {visibleOthers.map((project) => (
                  <ProjectCard key={project.title} project={project} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </div>
        </section>

        <section id="skills" className="skills">
          <div className="container">
            <h2 className="section-title clickable" onClick={() => navigate('/skills')}>
              기술 스택
            </h2>
            <div className="skills-content">
              {skillGroups.map((group) => (
                <div className="skills-category" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="skill-items">
                    {group.items.map((item) => (
                      <div className="skill-item" key={`${group.title}-${item.name}`}>
                        <i className={item.icon} />
                        <span>{item.name}</span>
                        <span className="skill-stage">{item.stage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="experience">
          <div className="container">
            <h2
              className="section-title clickable"
              onClick={() => navigate('/skills#experience-timeline')}
            >
              경력
            </h2>
            <Timeline items={experiences} className="timeline" />
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="container">
            <h2 className="section-title">연락처</h2>
            <div className="contact-content-simple">
              <h3>Communication.</h3>
              <div className="contact-items-simple">
                <div className="contact-item-simple">
                  <i className="fas fa-envelope" />
                  <span>sleekydz86@naver.com</span>
                </div>
                <div className="contact-item-simple">
                  <i className="fas fa-blog" />
                  <a href="https://velog.io/@sleekydevzero86/posts" target="_blank" rel="noreferrer">
                    기술블로그 - Velog
                  </a>
                </div>
                <div className="contact-item-simple">
                  <i className="fas fa-book" />
                  <a href="https://blog.naver.com/lasttokens9160" target="_blank" rel="noreferrer">
                    학습블로그 - 네이버 블로그
                  </a>
                </div>
              </div>
              <p className="contact-message">
                이메일을 보내주시면 최대한 빠르게 답변드리겠습니다 :)
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <DemoModal
        open={Boolean(demoProject)}
        title={demoProject?.title}
        onClose={() => setDemoProject(null)}
      />
    </>
  )
}
