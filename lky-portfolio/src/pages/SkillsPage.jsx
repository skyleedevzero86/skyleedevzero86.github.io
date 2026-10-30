import { useEffect } from 'react'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import Timeline from '../components/Timeline.jsx'
import { certifications, experiences } from '../data/experience.js'
import { skillStages } from '../data/skills.js'

export default function SkillsPage() {
  useEffect(() => {
    document.title = '기술 스택 - 궁금하면500원'
  }, [])

  return (
    <>
      <Header page="skills" />
      <main className="page-skills">
        <section className="skills-detail">
          <div className="container">
            <div className="skills-header">
              <h1>기술 스택</h1>
              <p>다양한 기술들을 활용하여 효율적이고 안정적인 시스템을 구축합니다.</p>
            </div>
            {skillStages.map((category) => (
              <div className="skill-category" key={category.title}>
                <h2>{category.title}</h2>
                <div className="skill-grid">
                  {category.items.map((skill) => (
                    <div className="skill-card" key={skill.name}>
                      <div className="skill-icon">
                        <i className={skill.icon} />
                      </div>
                      <div className="skill-name">{skill.name}</div>
                      <div className="skill-description">{skill.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="experience-timeline" className="experience-timeline">
          <div className="container">
            <h2 className="section-title">기술 경험 타임라인</h2>
            <Timeline items={experiences} className="timeline-container" animate />
          </div>
        </section>

        <section className="certifications">
          <div className="container">
            <h2 className="section-title">자격증 및 인증</h2>
            {certifications.map((cert) => (
              <div className="cert-card" key={cert.name}>
                <div className="cert-icon">
                  <i className="fas fa-certificate" />
                </div>
                <div className="cert-name">{cert.name}</div>
                <div className="cert-issuer">{cert.issuer}</div>
                <div className="cert-date">{cert.date}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
