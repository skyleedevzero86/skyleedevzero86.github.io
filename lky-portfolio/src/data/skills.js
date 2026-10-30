const skills = [
  {
    group: 'Backend',
    icon: 'fab fa-java',
    name: 'Java',
    stage: '실무',
    description:
      '2016년 11월부터 2022년 4월까지 병원, 공공, 금융 업무 시스템에서 Java로 개발했습니다. 경력은 5년 6개월입니다.',
  },
  {
    group: 'Backend',
    icon: 'fas fa-leaf',
    name: 'Spring Boot',
    stage: '개인 프로젝트',
    description: '개인 프로젝트에서 API 서버를 Spring Boot로 만듭니다. 회사 업무는 전자정부 프레임워크 기반이었습니다.',
  },
  {
    group: 'Backend',
    icon: 'fas fa-database',
    name: 'JPA/Hibernate',
    stage: '개인 프로젝트',
    description: '개인 프로젝트에서 엔티티 매핑과 조회에 JPA를 씁니다.',
  },
  {
    group: 'Backend',
    icon: 'fas fa-code',
    name: 'MyBatis',
    stage: '실무',
    description: '업무 시스템에서 SQL 매핑과 동적 쿼리를 작성했습니다.',
  },
  {
    group: 'Backend',
    icon: 'fas fa-code',
    name: 'Kotlin',
    stage: '개인 프로젝트',
    description: '개인 프로젝트에서 Spring Boot 애플리케이션을 Kotlin으로 작성합니다.',
  },
  {
    group: 'Database',
    icon: 'fas fa-database',
    name: 'MySQL',
    stage: '실무',
    description: '업무 시스템에서 테이블 설계와 쿼리 수정에 MySQL을 사용했습니다.',
  },
  {
    group: 'Database',
    icon: 'fas fa-database',
    name: 'PostgreSQL',
    stage: '개인 프로젝트',
    description: '개인 프로젝트 저장소로 PostgreSQL을 사용합니다.',
  },
  {
    group: 'Database',
    icon: 'fas fa-memory',
    name: 'Redis',
    stage: '개인 프로젝트',
    description: '개인 프로젝트에서 캐시로 Redis를 씁니다.',
  },
  {
    group: 'Database',
    icon: 'fas fa-database',
    name: 'Oracle',
    stage: '실무',
    description: '병원과 콜센터 업무 시스템에서 Oracle을 사용했습니다.',
  },
  {
    group: 'Cloud & DevOps',
    icon: 'fab fa-aws',
    name: 'AWS',
    stage: '학습 중',
    description: 'EC2, RDS, S3는 개인 학습입니다. 업무 시스템에 올려 운영한 경험으로 적지 않습니다.',
  },
  {
    group: 'Cloud & DevOps',
    icon: 'fab fa-docker',
    name: 'Docker',
    stage: '개인 프로젝트',
    description: '개인 프로젝트 실행 환경을 Docker로 맞춥니다.',
  },
  {
    group: 'Cloud & DevOps',
    icon: 'fas fa-mountain',
    name: 'Terraform',
    stage: '학습 중',
    description: '인프라를 코드로 적는 방법을 학습 중입니다.',
  },
  {
    group: 'Cloud & DevOps',
    icon: 'fab fa-github',
    name: 'GitHub Actions',
    stage: '학습 중',
    description: '저장소에 빌드와 배포 흐름을 붙이는 방법을 학습 중입니다.',
  },
  {
    group: 'Cloud & DevOps',
    icon: 'fab fa-jenkins',
    name: 'Jenkins',
    stage: '실무',
    description: 'Jenkins 서버 구성과 빌드·배포 자동화를 직접 했습니다.',
  },
  {
    group: 'Cloud & DevOps',
    icon: 'fas fa-stream',
    name: 'Apache Flink',
    stage: '학습 중',
    description: '스트림 처리 개념을 학습 중입니다.',
  },
  {
    group: 'Tools',
    icon: 'fas fa-chart-line',
    name: 'Datadog',
    stage: '학습 중',
    description: '애플리케이션 모니터링 도구를 학습 중입니다.',
  },
  {
    group: 'Tools',
    icon: 'fas fa-terminal',
    name: 'Shell Script',
    stage: '실무',
    description: '서버 작업과 반복 작업을 셸 스크립트로 처리했습니다.',
  },
  {
    group: 'Tools',
    icon: 'fas fa-cogs',
    name: 'Spring Batch',
    stage: '개인 프로젝트',
    description: '개인 프로젝트에서 주기 작업을 Spring Batch로 나눕니다.',
  },
  {
    group: 'Tools',
    icon: 'fas fa-database',
    name: 'DBeaver',
    stage: '실무',
    description: '쿼리를 확인하고 데이터를 볼 때 DBeaver를 씁니다.',
  },
]

const groups = ['Backend', 'Database', 'Cloud & DevOps', 'Tools']
const stages = ['실무', '개인 프로젝트', '학습 중']

export const skillGroups = groups.map((title) => ({
  title,
  items: skills.filter((skill) => skill.group === title),
}))

export const skillStages = stages.map((title) => ({
  title,
  items: skills.filter((skill) => skill.stage === title),
}))
