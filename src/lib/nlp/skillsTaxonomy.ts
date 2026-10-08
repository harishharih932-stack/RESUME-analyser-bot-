/**
 * TalentRank AI - Skills Taxonomy & Exact/Synonym Matching
 * Comprehensive dictionary of tech and professional skills with synonyms.
 */

import { SkillMatchDetails } from '../../types';

export interface SkillDefinition {
  canonical: string;
  category: 'Programming' | 'Web & Mobile' | 'Data & AI' | 'Cloud & DevOps' | 'Databases' | 'Tools & Infra' | 'Engineering' | 'Soft Skills';
  synonyms: string[];
}

export const SKILLS_TAXONOMY: SkillDefinition[] = [
  // Programming Languages
  { canonical: 'Python', category: 'Programming', synonyms: ['py', 'python3', 'python2', 'cpython'] },
  { canonical: 'JavaScript', category: 'Programming', synonyms: ['js', 'ecmascript', 'es6', 'es2020'] },
  { canonical: 'TypeScript', category: 'Programming', synonyms: ['ts'] },
  { canonical: 'Java', category: 'Programming', synonyms: ['core java', 'java 8', 'java 11', 'java 17', 'java 21'] },
  { canonical: 'C++', category: 'Programming', synonyms: ['cpp', 'c/c++'] },
  { canonical: 'C#', category: 'Programming', synonyms: ['csharp', '.net c#'] },
  { canonical: 'Go', category: 'Programming', synonyms: ['golang'] },
  { canonical: 'Rust', category: 'Programming', synonyms: ['rustlang'] },
  { canonical: 'Ruby', category: 'Programming', synonyms: ['ruby on rails', 'ror'] },
  { canonical: 'PHP', category: 'Programming', synonyms: ['php7', 'php8'] },
  { canonical: 'Swift', category: 'Programming', synonyms: ['swiftui'] },
  { canonical: 'Kotlin', category: 'Programming', synonyms: ['android kotlin'] },
  { canonical: 'Scala', category: 'Programming', synonyms: [] },
  { canonical: 'R', category: 'Programming', synonyms: ['r-project', 'r programming'] },
  { canonical: 'SQL', category: 'Programming', synonyms: ['t-sql', 'pl/sql', 'structured query language'] },
  { canonical: 'Bash', category: 'Programming', synonyms: ['shell script', 'sh', 'zsh', 'bash scripting'] },

  // Web & Mobile Frameworks
  { canonical: 'React', category: 'Web & Mobile', synonyms: ['reactjs', 'react.js', 'react 18', 'react 19'] },
  { canonical: 'Next.js', category: 'Web & Mobile', synonyms: ['nextjs', 'next'] },
  { canonical: 'Vue.js', category: 'Web & Mobile', synonyms: ['vue', 'vuejs', 'vue 3'] },
  { canonical: 'Nuxt.js', category: 'Web & Mobile', synonyms: ['nuxt', 'nuxtjs'] },
  { canonical: 'Angular', category: 'Web & Mobile', synonyms: ['angularjs', 'angular 2+'] },
  { canonical: 'Svelte', category: 'Web & Mobile', synonyms: ['sveltekit'] },
  { canonical: 'Node.js', category: 'Web & Mobile', synonyms: ['nodejs', 'node'] },
  { canonical: 'Express.js', category: 'Web & Mobile', synonyms: ['express', 'expressjs'] },
  { canonical: 'NestJS', category: 'Web & Mobile', synonyms: ['nest.js', 'nest'] },
  { canonical: 'FastAPI', category: 'Web & Mobile', synonyms: ['fast api'] },
  { canonical: 'Django', category: 'Web & Mobile', synonyms: ['django rest framework', 'drf'] },
  { canonical: 'Flask', category: 'Web & Mobile', synonyms: [] },
  { canonical: 'Spring Boot', category: 'Web & Mobile', synonyms: ['springboot', 'spring framework', 'spring'] },
  { canonical: 'ASP.NET', category: 'Web & Mobile', synonyms: ['.net core', 'asp.net core', 'dotnet'] },
  { canonical: 'HTML5', category: 'Web & Mobile', synonyms: ['html'] },
  { canonical: 'CSS3', category: 'Web & Mobile', synonyms: ['css', 'scss', 'sass', 'less'] },
  { canonical: 'Tailwind CSS', category: 'Web & Mobile', synonyms: ['tailwind', 'tailwindcss'] },
  { canonical: 'GraphQL', category: 'Web & Mobile', synonyms: ['apollo graphql', 'relay'] },
  { canonical: 'REST API', category: 'Web & Mobile', synonyms: ['restful', 'restful apis', 'rest web services'] },
  { canonical: 'Flutter', category: 'Web & Mobile', synonyms: ['flutter sdk', 'dart'] },
  { canonical: 'React Native', category: 'Web & Mobile', synonyms: ['react-native', 'rn'] },

  // Data, AI & Machine Learning
  { canonical: 'Machine Learning', category: 'Data & AI', synonyms: ['ml', 'machine-learning', 'applied ml'] },
  { canonical: 'Deep Learning', category: 'Data & AI', synonyms: ['dl', 'deep-learning', 'neural networks', 'ann', 'cnn', 'rnn'] },
  { canonical: 'Natural Language Processing', category: 'Data & AI', synonyms: ['nlp', 'text mining', 'speech processing'] },
  { canonical: 'Computer Vision', category: 'Data & AI', synonyms: ['cv', 'image processing', 'opencv'] },
  { canonical: 'PyTorch', category: 'Data & AI', synonyms: ['torch'] },
  { canonical: 'TensorFlow', category: 'Data & AI', synonyms: ['tf', 'tensorflow 2.0', 'keras'] },
  { canonical: 'Scikit-Learn', category: 'Data & AI', synonyms: ['sklearn', 'scikit'] },
  { canonical: 'Pandas', category: 'Data & AI', synonyms: [] },
  { canonical: 'NumPy', category: 'Data & AI', synonyms: [] },
  { canonical: 'SciPy', category: 'Data & AI', synonyms: [] },
  { canonical: 'Large Language Models', category: 'Data & AI', synonyms: ['llm', 'llms', 'genai', 'generative ai', 'gpt', 'llama', 'rag'] },
  { canonical: 'LangChain', category: 'Data & AI', synonyms: ['langgraph', 'llamaindex'] },
  { canonical: 'Transformers', category: 'Data & AI', synonyms: ['huggingface', 'hugging face', 'bert', 'roberta'] },
  { canonical: 'MLOps', category: 'Data & AI', synonyms: ['ml ops', 'mlflow', 'kubeflow', 'dvc', 'weights & biases', 'wandb'] },
  { canonical: 'Feature Engineering', category: 'Data & AI', synonyms: [] },
  { canonical: 'Data Modeling', category: 'Data & AI', synonyms: ['data modeling', 'data warehouse', 'star schema'] },
  { canonical: 'Apache Spark', category: 'Data & AI', synonyms: ['spark', 'pyspark'] },
  { canonical: 'Apache Kafka', category: 'Data & AI', synonyms: ['kafka', 'event streaming'] },
  { canonical: 'Data Pipelines', category: 'Data & AI', synonyms: ['etl', 'elt', 'airflow', 'apache airflow'] },

  // Cloud & DevOps
  { canonical: 'Docker', category: 'Cloud & DevOps', synonyms: ['containerization', 'containers'] },
  { canonical: 'Kubernetes', category: 'Cloud & DevOps', synonyms: ['k8s', 'kubectl', 'helm'] },
  { canonical: 'AWS', category: 'Cloud & DevOps', synonyms: ['amazon web services', 'ec2', 's3', 'lambda', 'ecs', 'eks'] },
  { canonical: 'Google Cloud Platform', category: 'Cloud & DevOps', synonyms: ['gcp', 'google cloud', 'bigquery', 'cloud run'] },
  { canonical: 'Microsoft Azure', category: 'Cloud & DevOps', synonyms: ['azure', 'azure devops'] },
  { canonical: 'CI/CD', category: 'Cloud & DevOps', synonyms: ['cicd', 'continuous integration', 'continuous delivery', 'github actions', 'gitlab ci', 'jenkins'] },
  { canonical: 'Terraform', category: 'Cloud & DevOps', synonyms: ['iac', 'infrastructure as code'] },
  { canonical: 'Ansible', category: 'Cloud & DevOps', synonyms: [] },
  { canonical: 'Prometheus', category: 'Cloud & DevOps', synonyms: ['grafana', 'datadog', 'monitoring'] },
  { canonical: 'Linux', category: 'Cloud & DevOps', synonyms: ['ubuntu', 'centos', 'debian', 'rhel', 'unix'] },

  // Databases & Stores
  { canonical: 'PostgreSQL', category: 'Databases', synonyms: ['postgres', 'psql'] },
  { canonical: 'MySQL', category: 'Databases', synonyms: ['mariadb'] },
  { canonical: 'MongoDB', category: 'Databases', synonyms: ['mongo', 'nosql'] },
  { canonical: 'Redis', category: 'Databases', synonyms: ['key-value store', 'in-memory cache'] },
  { canonical: 'Elasticsearch', category: 'Databases', synonyms: ['elastic', 'elk', 'opensearch'] },
  { canonical: 'Cassandra', category: 'Databases', synonyms: [] },
  { canonical: 'DynamoDB', category: 'Databases', synonyms: ['aws dynamodb'] },
  { canonical: 'Pinecone', category: 'Databases', synonyms: ['milvus', 'chroma', 'vector database', 'vector db', 'faiss', 'weaviate', 'qdrant'] },
  { canonical: 'SQLite', category: 'Databases', synonyms: [] },
  { canonical: 'Prisma', category: 'Databases', synonyms: ['typeorm', 'drizzle', 'sequelize', 'sqlalchemy'] },

  // Software Architecture & Engineering
  { canonical: 'Microservices', category: 'Engineering', synonyms: ['microservice architecture', 'service-oriented'] },
  { canonical: 'System Design', category: 'Engineering', synonyms: ['software architecture', 'distributed systems'] },
  { canonical: 'Unit Testing', category: 'Engineering', synonyms: ['jest', 'pytest', 'junit', 'vitest', 'tdd', 'test driven development'] },
  { canonical: 'Git', category: 'Engineering', synonyms: ['github', 'gitlab', 'version control', 'bitbucket'] },
  { canonical: 'Agile/Scrum', category: 'Engineering', synonyms: ['agile', 'scrum', 'kanban', 'jira', 'sprint planning'] },
  { canonical: 'Design Patterns', category: 'Engineering', synonyms: ['solid principles', 'clean code'] },

  // Soft Skills
  { canonical: 'Leadership', category: 'Soft Skills', synonyms: ['team lead', 'mentoring', 'team management'] },
  { canonical: 'Communication', category: 'Soft Skills', synonyms: ['technical writing', 'presentation skills'] },
  { canonical: 'Problem Solving', category: 'Soft Skills', synonyms: ['analytical thinking', 'troubleshooting'] },
  { canonical: 'Cross-functional Collaboration', category: 'Soft Skills', synonyms: ['stakeholder management', 'teamwork'] },
  { canonical: 'Project Management', category: 'Soft Skills', synonyms: ['delivery', 'ownership'] }
];

// Build synonym lookup map to canonical names
const SYNONYM_MAP = new Map<string, string>();
for (const skill of SKILLS_TAXONOMY) {
  const normCanonical = skill.canonical.toLowerCase().trim();
  SYNONYM_MAP.set(normCanonical, skill.canonical);
  for (const syn of skill.synonyms) {
    SYNONYM_MAP.set(syn.toLowerCase().trim(), skill.canonical);
  }
}

/**
 * Standardize any skill string to its canonical name if known
 */
export function normalizeSkill(skill: string): string {
  if (!skill) return '';
  const clean = skill.toLowerCase().trim();
  if (SYNONYM_MAP.has(clean)) {
    return SYNONYM_MAP.get(clean)!;
  }
  // Title case fallback
  return skill.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract all known skills from arbitrary text (resume or JD)
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const lowerText = ` ${text.toLowerCase().replace(/[\r\n\t,;:\(\)\[\]\{\}]/g, ' ')} `;
  const matched = new Set<string>();

  // Check each taxonomy item and its synonyms
  for (const def of SKILLS_TAXONOMY) {
    const variants = [def.canonical, ...def.synonyms];
    for (const v of variants) {
      const vClean = v.toLowerCase().trim();
      if (!vClean) continue;

      // Handle symbols like c++, c# or word boundaries
      const escaped = vClean.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?<=[\\s\\/,;:\\(\\)])${escaped}(?=[\\s\\/,;:\\(\\)])`, 'i');

      if (regex.test(lowerText) || lowerText.includes(` ${vClean} `)) {
        matched.add(def.canonical);
        break;
      }
    }
  }

  return Array.from(matched);
}

/**
 * Compare candidate skills with JD required and preferred skills
 */
export function evaluateSkillMatch(
  candidateSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[],
  resumeText: string = ''
): SkillMatchDetails {
  // Normalize candidate skills
  const normalizedCandidate = new Set<string>();
  for (const s of candidateSkills) {
    normalizedCandidate.add(normalizeSkill(s));
  }

  // Also include skills extracted directly from resume text
  if (resumeText) {
    const textSkills = extractSkillsFromText(resumeText);
    for (const s of textSkills) {
      normalizedCandidate.add(normalizeSkill(s));
    }
  }

  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  for (const req of requiredSkills) {
    const canonReq = normalizeSkill(req);
    if (normalizedCandidate.has(canonReq)) {
      matchedRequired.push(req);
    } else {
      missingRequired.push(req);
    }
  }

  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];
  for (const pref of preferredSkills) {
    const canonPref = normalizeSkill(pref);
    if (normalizedCandidate.has(canonPref)) {
      matchedPreferred.push(pref);
    } else {
      missingPreferred.push(pref);
    }
  }

  const allReqCanon = new Set(requiredSkills.map(normalizeSkill));
  const allPrefCanon = new Set(preferredSkills.map(normalizeSkill));
  const extraSkills: string[] = [];

  for (const skill of normalizedCandidate) {
    if (!allReqCanon.has(skill) && !allPrefCanon.has(skill)) {
      extraSkills.push(skill);
    }
  }

  const reqPct = requiredSkills.length > 0
    ? (matchedRequired.length / requiredSkills.length) * 100
    : 100;

  const prefPct = preferredSkills.length > 0
    ? (matchedPreferred.length / preferredSkills.length) * 100
    : 100;

  return {
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    extraSkills: extraSkills.slice(0, 20),
    requiredCoveragePct: Math.round(reqPct),
    preferredCoveragePct: Math.round(prefPct)
  };
}
