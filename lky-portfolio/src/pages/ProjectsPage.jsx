import { useEffect, useMemo, useState } from 'react'
import FeatureModal from '../components/FeatureModal.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import Pagination from '../components/Pagination.jsx'
import { PROJECT_PAGE_SIZE, detailProjects } from '../data/detailProjects.js'

export default function ProjectsPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('detail')
  const totalPages = Math.ceil(detailProjects.length / PROJECT_PAGE_SIZE)
  const visibleProjects = useMemo(() => {
    const start = (page - 1) * PROJECT_PAGE_SIZE
    return detailProjects.slice(start, start + PROJECT_PAGE_SIZE)
  }, [page])

  useEffect(() => {
    document.title = '프로젝트 - 궁금하면500원'
  }, [])

  const openModal = (project, nextMode) => {
    setSelected(project)
    setMode(nextMode)
  }

  return (
    <>
      <Header page="projects" />
      <main className="page-projects">
        <section className="project-detail">
          <div className="container">
            <div className="project-header">
              <h1>주요 프로젝트</h1>
              <p>다양한 기술 스택을 활용하여 개발한 프로젝트들을 소개합니다.</p>
            </div>
            <div className="project-grid">
              {visibleProjects.map((project) => (
                <div className="project-card-large" key={project.id}>
                  <div className="project-image-large">
                    <img src={project.image} alt={project.alt} />
                  </div>
                  <div className="project-content-large">
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    <div className="project-features">
                      <h4>주요 기능</h4>
                      <ul className="feature-list">
                        {project.cardFeatures.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="project-links-large">
                      <button
                        type="button"
                        className="project-link-large project-link-primary"
                        onClick={() => openModal(project, 'detail')}
                      >
                        <i className="fas fa-info-circle" />
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </section>

        <FeatureModal project={selected} mode={mode} onClose={() => setSelected(null)} />
      </main>
      <Footer />
    </>
  )
}
