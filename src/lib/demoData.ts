/**
 * TalentRank AI - High-Fidelity Demo Dataset
 * 9 Realistic candidates and a calibrated Senior Machine Learning Engineer Job Description.
 */

import { Candidate, JobDescription } from '../types';
import { calculateHybridScore, generateScoreExplanation } from './ml/hybridScorer';
import { evaluateSkillMatch } from './nlp/skillsTaxonomy';

export const DEMO_JOB_DESCRIPTION: JobDescription = {
  id: 'jd-ml-engineer-2026',
  title: 'Senior Machine Learning Engineer',
  department: 'Applied AI & Core Infrastructure',
  location: 'San Francisco, CA (Hybrid / Remote Option)',
  minExperienceYears: 4,
  maxExperienceYears: 9,
  educationLevel: 'Masters',
  requiredSkills: [
    'Python',
    'PyTorch',
    'Machine Learning',
    'Deep Learning',
    'Docker',
    'SQL',
    'MLOps'
  ],
  preferredSkills: [
    'Kubernetes',
    'Transformers',
    'Large Language Models',
    'FastAPI',
    'AWS',
    'Natural Language Processing'
  ],
  rawText: `Role: Senior Machine Learning Engineer
Department: Applied AI Systems
Location: San Francisco, CA

About the Role:
We are seeking an experienced Senior Machine Learning Engineer to design, train, and deploy high-throughput deep learning and foundation model pipelines into production. You will bridge experimental modeling with robust MLOps infrastructure, working closely with data scientists, platform engineers, and product stakeholders.

Key Responsibilities:
- Architect end-to-end ML pipelines from data ingestion and distributed feature engineering to low-latency model inference.
- Fine-tune, evaluate, and optimize modern Transformers and Large Language Models (LLMs) using PyTorch.
- Containerize training and inference jobs with Docker and deploy resilient workloads to Kubernetes on AWS.
- Establish robust MLOps practices: model registry, continuous evaluation, drift detection, and automated retraining workflows.
- Write clean, maintainable Python code and execute complex analytical SQL queries.

Requirements:
- Minimum 4+ years of professional engineering experience applying Machine Learning / Deep Learning to production systems.
- Master's degree or Ph.D. in Computer Science, Data Science, Electrical Engineering, or related technical discipline (or equivalent practical depth).
- Deep expertise in Python and modern deep learning frameworks (PyTorch preferred).
- Hands-on experience with Docker, containerization, and automated CI/CD for ML.
- Proficient in relational databases and SQL for dataset curation.
- Track record of shipping production ML systems with measurable latency and accuracy SLOs.

Preferred Qualifications:
- Experience orchestrating distributed training on Kubernetes (EKS / GKE) with Kubeflow or Ray.
- Familiarity with Hugging Face Transformers, parameter-efficient fine-tuning (LoRA), and retrieval-augmented generation (RAG).
- Production API deployment using FastAPI or gRPC.
- Cloud platforms (AWS, GCP) and vector databases.`,
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z'
};

export const DEMO_CANDIDATES_RAW = [
  {
    id: 'cand-elena-rostova',
    fileName: 'Elena_Rostova_StaffMLE.pdf',
    fileSize: 184500,
    parsedAt: '2026-03-10T09:15:00Z',
    status: 'Shortlisted' as const,
    notes: 'Exceptional deep learning and MLOps background. Top contender for tech lead.',
    blindName: 'Candidate #1 (MLE)',
    parsedData: {
      name: 'Elena Rostova',
      email: 'elena.rostova@engineer-ai.org',
      phone: '+1 (415) 890-4421',
      location: 'San Francisco, CA',
      summary: 'Senior ML Engineer with 6 years building distributed PyTorch deep learning systems and LLM inference engines. Kaggle Competitions Grandmaster and open-source contributor.',
      skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Docker', 'SQL', 'MLOps', 'Transformers', 'Large Language Models', 'AWS', 'Kubernetes', 'FastAPI', 'Pandas', 'Git'],
      totalExperienceYears: 6,
      education: [
        { degree: 'Master of Science in Computer Science', institute: 'Stanford University', year: '2020', cgpa: '3.92' },
        { degree: 'Bachelor of Science in Applied Mathematics', institute: 'UC Berkeley', year: '2018', cgpa: '3.88' }
      ],
      experience: [
        { role: 'Senior Machine Learning Engineer', company: 'NovaScale AI', duration: '2022 - Present', years: 4, description: 'Led fine-tuning and distillation of 7B-70B parameter models. Built Triton inference clusters reducing p99 latency by 45%.' },
        { role: 'Machine Learning Engineer', company: 'DataCrest Systems', duration: '2020 - 2022', years: 2, description: 'Engineered automated MLOps pipelines on AWS EKS with Docker, MLflow, and automated model drift monitors.' }
      ],
      projects: [
        { name: 'FastDistill-LLM', description: 'Open-source PyTorch library for low-rank adaptation and quantization with 1.4k GitHub stars.', techStack: ['PyTorch', 'Transformers', 'CUDA', 'Python'], link: 'https://github.com/erostova/fastdistill' },
        { name: 'Kaggle Competition Champion', description: 'Placed 1st out of 2,100 teams in Multimodal Document Intelligence.', techStack: ['PyTorch', 'Transformers', 'Ensembles'] }
      ],
      certifications: ['AWS Certified Machine Learning - Specialty', 'CKA: Certified Kubernetes Administrator'],
      achievements: ['Kaggle Grandmaster (Rank #42 Global)', 'Co-authored NeurIPS 2024 workshop paper on speculative decoding'],
      languages: ['English', 'Russian'],
      links: [
        { url: 'https://linkedin.com/in/elena-rostova-ai', category: 'LinkedIn' as const, text: 'linkedin.com/in/elena-rostova-ai' },
        { url: 'https://github.com/erostova', category: 'GitHub' as const, text: 'github.com/erostova' },
        { url: 'https://kaggle.com/erostova_gm', category: 'Kaggle' as const, text: 'kaggle.com/erostova_gm' },
        { url: 'https://elena-rostova.dev', category: 'Portfolio/Website' as const, text: 'elena-rostova.dev' }
      ],
      rawText: 'Elena Rostova, M.S. CS Stanford 2020. Senior Machine Learning Engineer with 6+ years experience in PyTorch, Transformers, LLM fine-tuning, Docker, Kubernetes, AWS, SQL, MLOps, Triton Inference Server. Kaggle Grandmaster. GitHub: github.com/erostova. LinkedIn: linkedin.com/in/elena-rostova-ai.'
    },
    scores: {
      tfidfCosineScore: 91,
      bm25Score: 94,
      lexicalCombinedScore: 92.5,
      skillMatchScore: 98,
      experienceFitScore: 95,
      educationFitScore: 100,
      llmSemanticScore: 96
    },
    llmAnalysis: {
      semantic_match_score: 96,
      strengths: [
        'Direct alignment with all 7 required skills and 5 of 6 preferred skills',
        'Proven track record scaling PyTorch and large foundation models in production',
        'Demonstrated leadership in MLOps automation and GPU latency optimization',
        'Stanford M.S. degree directly satisfies educational qualification'
      ],
      weaknesses: [
        'Highly sought-after profile; may require competitive offer structure'
      ],
      red_flags: [],
      skill_evidence: [
        { skill: 'PyTorch', evidence: 'Primary framework for FastDistill-LLM open-source library and production model fine-tuning' },
        { skill: 'MLOps', evidence: 'Built automated retraining and drift monitoring pipelines on AWS EKS' },
        { skill: 'Transformers', evidence: 'Architected distillation and quantization pipelines for 7B-70B parameter models' }
      ],
      suggested_interview_questions: [
        'Walk us through how you optimized p99 latency on Triton Inference Server for large Transformer checkpoints.',
        'How did you structure automated drift detection and canary deployments for retraining cycles in Kubernetes?',
        'Describe your approach to distributed multi-node LoRA fine-tuning in PyTorch.'
      ],
      one_line_verdict: 'Standout Tier-1 candidate with impeccable credentials, domain mastery, and verified open-source output.',
      fit_category: 'Excellent' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-aris-thorne',
    fileName: 'Dr_Aris_Thorne_ResearchMLE.pdf',
    fileSize: 210200,
    parsedAt: '2026-03-10T09:20:00Z',
    status: 'Shortlisted' as const,
    notes: 'Ph.D. background with deep mathematical formulation and published NLP models.',
    blindName: 'Candidate #2 (MLE)',
    parsedData: {
      name: 'Dr. Aris Thorne',
      email: 'athorne@vectorlab.edu',
      phone: '+1 (617) 555-0199',
      location: 'Boston, MA (Relocating to SF)',
      summary: 'Ph.D. in Computer Science with 7 years researching and deploying deep NLP architectures, Transformer self-attention mechanisms, and PyTorch foundation models.',
      skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Transformers', 'Large Language Models', 'Docker', 'SQL', 'MLOps', 'FastAPI'],
      totalExperienceYears: 7,
      education: [
        { degree: 'Ph.D. in Computer Science (NLP & Deep Learning)', institute: 'MIT', year: '2022', cgpa: '4.00' },
        { degree: 'Bachelor of Science in Electrical Engineering & CS', institute: 'MIT', year: '2017', cgpa: '3.95' }
      ],
      experience: [
        { role: 'Lead AI Research Engineer', company: 'Synthetica AI', duration: '2022 - Present', years: 4, description: 'Spearheaded domain-specific LLM pretraining and alignment (RLHF/DPO) on high-memory GPU nodes with PyTorch.' },
        { role: 'Graduate Research Fellow', company: 'MIT CSAIL', duration: '2018 - 2022', years: 4, description: 'Published 6 ACL/EMNLP papers on efficient attention mechanisms and zero-shot reasoning.' }
      ],
      projects: [
        { name: 'SparseAttention-PyTorch', description: 'Kernel implementation of linear-complexity attention mechanism for long contexts.', techStack: ['PyTorch', 'CUDA', 'Python'], link: 'https://github.com/aristhorne/sparse-attention' }
      ],
      certifications: ['DeepLearning.AI NLP Specialization'],
      achievements: ['Best Paper Award at EMNLP 2021', 'National Science Foundation Graduate Research Fellow'],
      languages: ['English', 'Greek'],
      links: [
        { url: 'https://linkedin.com/in/aris-thorne-phd', category: 'LinkedIn' as const, text: 'linkedin.com/in/aris-thorne-phd' },
        { url: 'https://github.com/aristhorne', category: 'GitHub' as const, text: 'github.com/aristhorne' },
        { url: 'https://scholar.google.com/citations?user=aris_thorne', category: 'Portfolio/Website' as const, text: 'scholar.google.com/citations' }
      ],
      rawText: 'Dr. Aris Thorne. Ph.D. MIT 2022. 7 years experience in deep learning, NLP, Transformers, PyTorch, Python, Docker, MLOps, SQL. Published ACL/EMNLP author. GitHub: github.com/aristhorne.'
    },
    scores: {
      tfidfCosineScore: 88,
      bm25Score: 90,
      lexicalCombinedScore: 89,
      skillMatchScore: 92,
      experienceFitScore: 96,
      educationFitScore: 100,
      llmSemanticScore: 94
    },
    llmAnalysis: {
      semantic_match_score: 94,
      strengths: [
        'Ph.D. from MIT with deep theoretical and practical grasp of Transformer internals',
        '7 years of deep learning research and production deployment',
        'Outstanding publications record in top-tier conferences (ACL, EMNLP)'
      ],
      weaknesses: [
        'More heavily indexed on cutting-edge research; slightly less focus on pure Kubernetes cluster operations'
      ],
      red_flags: [],
      skill_evidence: [
        { skill: 'Deep Learning', evidence: 'Doctoral dissertation on efficient attention and foundation model reasoning' },
        { skill: 'PyTorch', evidence: 'Custom CUDA kernels and distributed RLHF pipeline implementations' }
      ],
      suggested_interview_questions: [
        'How do you handle memory bottlenecks during long-sequence Transformer training in PyTorch?',
        'Describe the trade-offs between DPO and PPO reinforcement learning from human feedback.'
      ],
      one_line_verdict: 'Deep research rigor paired with hands-on PyTorch engineering; stellar fit for core AI systems.',
      fit_category: 'Excellent' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-maya-lin',
    fileName: 'Maya_Lin_ML_Platform.pdf',
    fileSize: 195000,
    parsedAt: '2026-03-10T09:25:00Z',
    status: 'Shortlisted' as const,
    notes: 'Well-rounded ML engineer with strong FastAPI, RAG, and production LLM orchestration.',
    blindName: 'Candidate #3 (MLE)',
    parsedData: {
      name: 'Maya Lin',
      email: 'mayalin.code@gmail.com',
      phone: '+1 (206) 555-8321',
      location: 'Seattle, WA (Open to SF)',
      summary: 'Machine Learning Engineer with 5 years experience specializing in RAG systems, Transformer fine-tuning, Docker containerization, and AWS production inference.',
      skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Docker', 'SQL', 'MLOps', 'Transformers', 'Large Language Models', 'FastAPI', 'AWS', 'Kubernetes'],
      totalExperienceYears: 5,
      education: [
        { degree: 'Master of Science in Technology Innovation', institute: 'University of Washington', year: '2021', cgpa: '3.85' },
        { degree: 'Bachelor of Science in Informatics', institute: 'University of Washington', year: '2019', cgpa: '3.78' }
      ],
      experience: [
        { role: 'ML Engineer II', company: 'Hyperion AI', duration: '2022 - Present', years: 4, description: 'Designed high-availability RAG pipelines using vector indexing, FastAPI, and Docker on AWS ECS.' },
        { role: 'Software Engineer (Data & ML)', company: 'Nordic Cloud Systems', duration: '2020 - 2022', years: 2, description: 'Maintained feature stores, automated ETL with SQL, and orchestrated model evaluation.' }
      ],
      projects: [
        { name: 'Enterprise-RAG-Engine', description: 'Production-ready semantic search and question answering service with hybrid BM25 + dense retrieval.', techStack: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'PostgreSQL'], link: 'https://github.com/mayalin/enterprise-rag' }
      ],
      certifications: ['AWS Certified Developer Associate'],
      achievements: ['Reduced LLM hallucination rates by 32% across 50,000 monthly customer queries'],
      languages: ['English', 'Mandarin'],
      links: [
        { url: 'https://linkedin.com/in/maya-lin-ml', category: 'LinkedIn' as const, text: 'linkedin.com/in/maya-lin-ml' },
        { url: 'https://github.com/mayalin', category: 'GitHub' as const, text: 'github.com/mayalin' },
        { url: 'https://mayalin.me', category: 'Portfolio/Website' as const, text: 'mayalin.me' }
      ],
      rawText: 'Maya Lin. M.S. Univ of Washington 2021. 5 years experience in Python, PyTorch, Docker, Kubernetes, SQL, MLOps, Transformers, LLMs, FastAPI, AWS. Built enterprise RAG systems. GitHub: github.com/mayalin.'
    },
    scores: {
      tfidfCosineScore: 86,
      bm25Score: 89,
      lexicalCombinedScore: 87.5,
      skillMatchScore: 95,
      experienceFitScore: 94,
      educationFitScore: 100,
      llmSemanticScore: 90
    },
    llmAnalysis: {
      semantic_match_score: 90,
      strengths: [
        'Covers all 7 required skills and 5 preferred skills',
        'Hands-on experience architecting production RAG and microservices with FastAPI',
        'Strong balance of modeling and deployment engineering'
      ],
      weaknesses: [
        'Fewer published open-source libraries compared to top 2 applicants'
      ],
      red_flags: [],
      skill_evidence: [
        { skill: 'FastAPI', evidence: 'Built high-throughput inference endpoints serving 50k monthly queries' },
        { skill: 'Docker & AWS', evidence: 'Containerized model workloads deployed to AWS ECS and Kubernetes' }
      ],
      suggested_interview_questions: [
        'How do you design re-ranking and thresholding strategies for enterprise hybrid RAG systems?',
        'What metrics do you track to evaluate prompt regression and retrieval quality over time?'
      ],
      one_line_verdict: 'Excellent pragmatic ML engineer with balanced systems deployment and LLM tooling skills.',
      fit_category: 'Excellent' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-marcus-vance',
    fileName: 'Marcus_Vance_SystemsMLE.pdf',
    fileSize: 172000,
    parsedAt: '2026-03-10T09:30:00Z',
    status: 'New' as const,
    notes: 'Solid platform and containerization experience. Slightly lower educational degree level than Masters req.',
    blindName: 'Candidate #4 (MLE)',
    parsedData: {
      name: 'Marcus Vance',
      email: 'm.vance@techfrontier.io',
      phone: '+1 (510) 555-4432',
      location: 'Oakland, CA',
      summary: 'Production ML Platform Engineer with 5 years experience building Kubernetes ML pipelines, Docker containers, and scalable feature stores using Python and SQL.',
      skills: ['Python', 'PyTorch', 'Machine Learning', 'Docker', 'Kubernetes', 'SQL', 'MLOps', 'AWS', 'FastAPI', 'Linux', 'CI/CD'],
      totalExperienceYears: 5,
      education: [
        { degree: 'Bachelor of Science in Computer Science', institute: 'UC Berkeley', year: '2021', cgpa: '3.70' }
      ],
      experience: [
        { role: 'ML Systems Engineer', company: 'Apex Telemetry', duration: '2021 - Present', years: 5, description: 'Configured Kubeflow workflows on AWS EKS. Built automated packaging and regression tests for ML artifacts.' }
      ],
      projects: [
        { name: 'K8s-Model-Deployer', description: 'CLI tool for rolling updates of PyTorch inference services across multi-tenant clusters.', techStack: ['Python', 'Kubernetes', 'Docker'] }
      ],
      certifications: ['Certified Kubernetes Application Developer (CKAD)'],
      achievements: ['Automated deployment cycle from 3 days to under 25 minutes'],
      languages: ['English'],
      links: [
        { url: 'https://linkedin.com/in/marcus-vance-dev', category: 'LinkedIn' as const, text: 'linkedin.com/in/marcus-vance-dev' },
        { url: 'https://github.com/marcusvance', category: 'GitHub' as const, text: 'github.com/marcusvance' },
        { url: 'https://leetcode.com/marcus_v', category: 'LeetCode' as const, text: 'leetcode.com/marcus_v' }
      ],
      rawText: 'Marcus Vance. B.S. CS UC Berkeley 2021. 5 years experience in Python, PyTorch, Docker, Kubernetes, SQL, MLOps, AWS, CI/CD, FastAPI. Kubernetes ML engineer. GitHub: github.com/marcusvance.'
    },
    scores: {
      tfidfCosineScore: 82,
      bm25Score: 84,
      lexicalCombinedScore: 83,
      skillMatchScore: 89,
      experienceFitScore: 94,
      educationFitScore: 75,
      llmSemanticScore: 83
    },
    llmAnalysis: {
      semantic_match_score: 83,
      strengths: [
        'Top-tier Kubernetes and infrastructure automation skills',
        'Strong hands-on Python and Docker production experience',
        '5 years solid industry tenure'
      ],
      weaknesses: [
        'Holds a Bachelors rather than the required Masters degree',
        'Less deep mathematical emphasis on cutting-edge Transformer architecture design'
      ],
      red_flags: [],
      skill_evidence: [
        { skill: 'Kubernetes', evidence: 'Architected Kubeflow on AWS EKS and built custom K8s deployment CLI' },
        { skill: 'Docker', evidence: 'Standardized container build pipelines across multi-tenant infrastructure' }
      ],
      suggested_interview_questions: [
        'How do you manage GPU scheduling and resource quotas for training jobs in Kubernetes?',
        'Explain how you ensure deterministic container builds for deep learning environments.'
      ],
      one_line_verdict: 'Strong systems and MLOps infrastructure profile with reliable production engineering habits.',
      fit_category: 'Good' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-tatsuya-endo',
    fileName: 'Tatsuya_Endo_CV_ML.pdf',
    fileSize: 165000,
    parsedAt: '2026-03-10T09:35:00Z',
    status: 'New' as const,
    notes: 'High potential deep learning engineer, slightly under the 4-year minimum experience guideline.',
    blindName: 'Candidate #5 (MLE)',
    parsedData: {
      name: 'Tatsuya Endo',
      email: 'tatsuya.endo.ai@tokyo.ac.jp',
      phone: '+1 (415) 555-6671',
      location: 'San Francisco, CA',
      summary: 'Deep Learning Engineer with 3 years experience specializing in computer vision, PyTorch optimization, Docker containerization, and high-performance inference.',
      skills: ['Python', 'PyTorch', 'Deep Learning', 'Machine Learning', 'Docker', 'Computer Vision', 'C++', 'SQL', 'FastAPI'],
      totalExperienceYears: 3,
      education: [
        { degree: 'Master of Science in Information Science', institute: 'Tokyo Institute of Technology', year: '2023', cgpa: '3.90' },
        { degree: 'Bachelor of Engineering in CS', institute: 'Tokyo Institute of Technology', year: '2021', cgpa: '3.82' }
      ],
      experience: [
        { role: 'Machine Learning Engineer', company: 'VisionMatrix Global', duration: '2023 - Present', years: 3, description: 'Optimized real-time object detection models with TensorRT and PyTorch, achieving 60 FPS on edge devices.' }
      ],
      projects: [
        { name: 'EdgeTorch-Inference', description: 'Lightweight C++ & Python bridge for low-latency deep learning inference.', techStack: ['C++', 'PyTorch', 'Python', 'Docker'], link: 'https://github.com/tatsuya-endo/edgetorch' }
      ],
      certifications: ['NVIDIA Deep Learning Institute Certificate'],
      achievements: ['Won 2nd prize at Asian Vision Robotics Hackathon 2023'],
      languages: ['English', 'Japanese'],
      links: [
        { url: 'https://linkedin.com/in/tatsuya-endo', category: 'LinkedIn' as const, text: 'linkedin.com/in/tatsuya-endo' },
        { url: 'https://github.com/tatsuya-endo', category: 'GitHub' as const, text: 'github.com/tatsuya-endo' },
        { url: 'https://tatsuyaendo.dev', category: 'Portfolio/Website' as const, text: 'tatsuyaendo.dev' }
      ],
      rawText: 'Tatsuya Endo. M.S. Tokyo Tech 2023. 3 years experience in Python, PyTorch, Deep Learning, Computer Vision, Docker, C++, SQL, TensorRT. GitHub: github.com/tatsuya-endo.'
    },
    scores: {
      tfidfCosineScore: 76,
      bm25Score: 78,
      lexicalCombinedScore: 77,
      skillMatchScore: 84,
      experienceFitScore: 70,
      educationFitScore: 100,
      llmSemanticScore: 79
    },
    llmAnalysis: {
      semantic_match_score: 79,
      strengths: [
        'Master’s degree in technical field satisfies education requirement',
        'Strong low-level C++ and PyTorch profiling capabilities',
        'Great computer vision domain depth'
      ],
      weaknesses: [
        '3 years experience is slightly below the 4-year minimum requirement',
        'Limited Kubernetes and large-scale distributed cloud training experience'
      ],
      red_flags: [],
      skill_evidence: [
        { skill: 'PyTorch', evidence: 'Optimized production inference with TensorRT and PyTorch C++ extensions' }
      ],
      suggested_interview_questions: [
        'How do you bridge PyTorch computational graphs into optimized C++ runtimes?',
        'Given a strict latency budget, how do you profile memory bandwidth bottlenecks?'
      ],
      one_line_verdict: 'Talented deep learning practitioner with great low-level chops, though slightly junior for senior title.',
      fit_category: 'Average' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-sophia-chen',
    fileName: 'Sophia_Chen_DataScientist.pdf',
    fileSize: 158000,
    parsedAt: '2026-03-10T09:40:00Z',
    status: 'New' as const,
    notes: 'Strong tabular data and classical ML experience; lighter on deep learning and MLOps infrastructure.',
    blindName: 'Candidate #6 (MLE)',
    parsedData: {
      name: 'Sophia Chen',
      email: 'sophia.chen.ds@gmail.com',
      phone: '+1 (412) 555-9012',
      location: 'Pittsburgh, PA',
      summary: 'Data Scientist with 4 years experience building predictive machine learning models, SQL feature pipelines, and statistical analysis for customer growth.',
      skills: ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'NumPy', 'SQL', 'Data Pipelines', 'Docker', 'Git'],
      totalExperienceYears: 4,
      education: [
        { degree: 'Bachelor of Science in Statistics and Data Science', institute: 'Carnegie Mellon University', year: '2022', cgpa: '3.81' }
      ],
      experience: [
        { role: 'Data Scientist', company: 'MetricPulse Corp', duration: '2022 - Present', years: 4, description: 'Engineered gradient boosting models (XGBoost/LightGBM) improving customer churn prediction by 18%.' }
      ],
      projects: [
        { name: 'CustomerLTV-Predictor', description: 'Production batch inference pipeline calculating lifetime value across 2M users.', techStack: ['Python', 'SQL', 'Scikit-Learn', 'Docker'] }
      ],
      certifications: ['Databricks Certified Associate Developer for Apache Spark'],
      achievements: ['Delivered predictive churn model driving $1.2M in annual retention'],
      languages: ['English', 'Mandarin'],
      links: [
        { url: 'https://linkedin.com/in/sophiachen-ds', category: 'LinkedIn' as const, text: 'linkedin.com/in/sophiachen-ds' },
        { url: 'https://github.com/sophiachen-ds', category: 'GitHub' as const, text: 'github.com/sophiachen-ds' }
      ],
      rawText: 'Sophia Chen. B.S. CMU 2022. 4 years experience in Python, Machine Learning, Scikit-Learn, Pandas, SQL, Docker, XGBoost. Data scientist with strong analytics. GitHub: github.com/sophiachen-ds.'
    },
    scores: {
      tfidfCosineScore: 71,
      bm25Score: 73,
      lexicalCombinedScore: 72,
      skillMatchScore: 72,
      experienceFitScore: 90,
      educationFitScore: 75,
      llmSemanticScore: 71
    },
    llmAnalysis: {
      semantic_match_score: 71,
      strengths: [
        'Robust statistical foundation from CMU',
        'Strong SQL and tabular machine learning track record',
        'Meets 4-year experience threshold'
      ],
      weaknesses: [
        'Missing PyTorch and deep learning experience requested in JD',
        'No hands-on experience with LLMs, Transformers, or Kubernetes',
        'Bachelors degree vs Masters required'
      ],
      red_flags: [],
      skill_evidence: [
        { skill: 'Machine Learning & Python', evidence: 'Implemented XGBoost churn models on 2M user dataset' },
        { skill: 'SQL', evidence: 'Extracted complex analytical cohorts and automated pipeline features' }
      ],
      suggested_interview_questions: [
        'How would you transition your tabular feature engineering experience into deep learning embeddings?',
        'Describe how you validate ML models to prevent target leakage in temporal datasets.'
      ],
      one_line_verdict: 'Competent data scientist, but role requires deep learning, PyTorch, and foundation models.',
      fit_category: 'Average' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-priya-patel',
    fileName: 'Priya_Patel_DataEng_ML.pdf',
    fileSize: 189000,
    parsedAt: '2026-03-10T09:45:00Z',
    status: 'New' as const,
    notes: 'Senior data engineer transitioning into ML. High total tenure but less PyTorch modeling depth.',
    blindName: 'Candidate #7 (MLE)',
    parsedData: {
      name: 'Priya Patel',
      email: 'priya.patel.eng@gmail.com',
      phone: '+1 (408) 555-7711',
      location: 'San Jose, CA',
      summary: 'Senior Data Engineer with 8 years building distributed Spark streaming pipelines, SQL data warehouses, and Dockerized ETL workflows on AWS.',
      skills: ['Python', 'SQL', 'Apache Spark', 'Data Pipelines', 'Docker', 'AWS', 'Java', 'Machine Learning', 'Scikit-Learn', 'PostgreSQL'],
      totalExperienceYears: 8,
      education: [
        { degree: 'Bachelor of Technology in Computer Engineering', institute: 'IIT Bombay', year: '2018', cgpa: '3.75' }
      ],
      experience: [
        { role: 'Senior Data Engineer', company: 'CloudNexus Data', duration: '2021 - Present', years: 5, description: 'Orchestrated petabyte-scale data pipelines with Spark and Airflow. Managed Postgres and Snowflake clusters.' },
        { role: 'Data Engineer', company: 'Infoserve Solutions', duration: '2018 - 2021', years: 3, description: 'Wrote Java and Python ETL scripts, modeled relational schemas.' }
      ],
      projects: [
        { name: 'RealTime-Stream-Ingest', description: 'Kafka + Spark streaming engine processing 100k events/sec.', techStack: ['Python', 'Spark', 'Kafka', 'Docker', 'AWS'] }
      ],
      certifications: ['AWS Certified Big Data - Specialty', 'Databricks Certified Data Engineer Professional'],
      achievements: ['Decreased end-to-end data processing latency from 4 hours to 8 minutes'],
      languages: ['English', 'Hindi', 'Gujarati'],
      links: [
        { url: 'https://linkedin.com/in/priya-patel-data', category: 'LinkedIn' as const, text: 'linkedin.com/in/priya-patel-data' },
        { url: 'https://github.com/priyapatel-eng', category: 'GitHub' as const, text: 'github.com/priyapatel-eng' }
      ],
      rawText: 'Priya Patel. B.Tech IIT Bombay 2018. 8 years experience in Python, SQL, Spark, Data Pipelines, Docker, AWS, Scikit-Learn. Senior data engineer. GitHub: github.com/priyapatel-eng.'
    },
    scores: {
      tfidfCosineScore: 68,
      bm25Score: 69,
      lexicalCombinedScore: 68.5,
      skillMatchScore: 67,
      experienceFitScore: 98,
      educationFitScore: 75,
      llmSemanticScore: 68
    },
    llmAnalysis: {
      semantic_match_score: 68,
      strengths: [
        '8 years of deep production engineering and massive data scale experience',
        'World-class SQL, Docker, AWS, and distributed data pipeline capabilities',
        'IIT Bombay pedigree with outstanding track record'
      ],
      weaknesses: [
        'Primarily a Data Engineer rather than a Machine Learning / Deep Learning specialist',
        'No PyTorch, MLOps model registry, or LLM fine-tuning experience'
      ],
      red_flags: [],
      skill_evidence: [
        { skill: 'SQL & Data Pipelines', evidence: 'Engineered petabyte-scale streaming pipelines handling 100k events/sec' },
        { skill: 'Docker & AWS', evidence: 'Containerized microservices and automated infrastructure on AWS' }
      ],
      suggested_interview_questions: [
        'How would you architect a feature store to bridge offline Spark processing with real-time PyTorch inference?',
        'What are the key differences between training data pipelines and operational inference data streaming?'
      ],
      one_line_verdict: 'Phenomenal data engineer, but lacking the core PyTorch and deep learning requirements.',
      fit_category: 'Average' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-julian-moreau',
    fileName: 'Julian_Moreau_DevOps.pdf',
    fileSize: 161000,
    parsedAt: '2026-03-10T09:50:00Z',
    status: 'Rejected' as const,
    notes: 'DevOps/SRE engineer. Lacks machine learning modeling capabilities required for this ML role.',
    blindName: 'Candidate #8 (MLE)',
    parsedData: {
      name: 'Julian Moreau',
      email: 'julian.moreau@cloudstack.ca',
      phone: '+1 (514) 555-2384',
      location: 'Montreal, Canada',
      summary: 'Senior DevOps & Infrastructure Engineer with 6 years experience in Kubernetes, Terraform, Docker, CI/CD pipelines, and AWS cloud management.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Bash', 'Python', 'Prometheus'],
      totalExperienceYears: 6,
      education: [
        { degree: 'Bachelor of Engineering in Software Engineering', institute: 'McGill University', year: '2020', cgpa: '3.62' }
      ],
      experience: [
        { role: 'Senior DevOps Engineer', company: 'KubeCloud Corp', duration: '2022 - Present', years: 4, description: 'Provisioned enterprise Kubernetes clusters across AWS and GCP using Terraform and Helm.' },
        { role: 'Cloud Engineer', company: 'Mont-Royal Tech', duration: '2020 - 2022', years: 2, description: 'Configured automated GitLab CI/CD pipelines and container security scanning.' }
      ],
      projects: [
        { name: 'Terraform-EKS-Blueprint', description: 'Production-ready IaC module for autoscaling Kubernetes workloads on AWS.', techStack: ['Terraform', 'Kubernetes', 'AWS'] }
      ],
      certifications: ['AWS Certified Solutions Architect - Professional', 'CKA: Certified Kubernetes Administrator'],
      achievements: ['Achieved 99.99% infrastructure uptime across 40 production microservices'],
      languages: ['English', 'French'],
      links: [
        { url: 'https://linkedin.com/in/julian-moreau-devops', category: 'LinkedIn' as const, text: 'linkedin.com/in/julian-moreau-devops' },
        { url: 'https://github.com/jmoreau-infra', category: 'GitHub' as const, text: 'github.com/jmoreau-infra' }
      ],
      rawText: 'Julian Moreau. B.Eng. McGill 2020. 6 years experience in Docker, Kubernetes, AWS, Terraform, CI/CD, Linux, Python. Senior DevOps engineer. GitHub: github.com/jmoreau-infra.'
    },
    scores: {
      tfidfCosineScore: 56,
      bm25Score: 58,
      lexicalCombinedScore: 57,
      skillMatchScore: 48,
      experienceFitScore: 94,
      educationFitScore: 75,
      llmSemanticScore: 52
    },
    llmAnalysis: {
      semantic_match_score: 52,
      strengths: [
        'Superb Kubernetes, Docker, and AWS cloud automation skills',
        'Extensive experience with CI/CD and infrastructure reliability'
      ],
      weaknesses: [
        'Does not possess Machine Learning, PyTorch, Deep Learning, or MLOps modeling experience',
        'Profile is aligned with DevOps/SRE rather than Machine Learning Engineering'
      ],
      red_flags: ['Complete absence of ML algorithms or statistical modeling in work history'],
      skill_evidence: [
        { skill: 'Docker & Kubernetes', evidence: 'Maintains enterprise EKS clusters with 99.99% uptime' }
      ],
      suggested_interview_questions: [
        'Have you ever configured GPU-accelerated node pools for ML training jobs in Kubernetes?'
      ],
      one_line_verdict: 'Qualified DevOps professional but mismatched with the Machine Learning modeling prerequisites.',
      fit_category: 'Poor' as const,
      isDemo: true
    }
  },
  {
    id: 'cand-david-miller',
    fileName: 'David_Miller_Junior_Dev.pdf',
    fileSize: 142000,
    parsedAt: '2026-03-10T09:55:00Z',
    status: 'Rejected' as const,
    notes: 'Junior profile (2 years exp). High enthusiasm but does not meet senior qualification bar.',
    blindName: 'Candidate #9 (MLE)',
    parsedData: {
      name: 'David Miller',
      email: 'davidmiller.codes@yahoo.com',
      phone: '+1 (512) 555-8930',
      location: 'Austin, TX',
      summary: 'Junior developer with 2 years experience building small ML proof-of-concepts, Flask web apps, and Python scripts.',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Flask', 'SQL', 'HTML5', 'CSS3', 'Git'],
      totalExperienceYears: 2,
      education: [
        { degree: 'Associate Degree in Information Technology', institute: 'Austin Community College', year: '2024', cgpa: '3.40' },
        { degree: 'Full Stack & Data Science Bootcamp Certificate', institute: 'General Assembly', year: '2023' }
      ],
      experience: [
        { role: 'Junior Python Developer', company: 'LoneStar Web Apps', duration: '2024 - Present', years: 2, description: 'Assisted in building basic REST APIs with Flask and running small scikit-learn classification scripts.' }
      ],
      projects: [
        { name: 'Movie-Recommender-App', description: 'Collaborative filtering prototype deployed on Heroku.', techStack: ['Python', 'TensorFlow', 'Flask'] }
      ],
      certifications: ['Coursera Machine Learning Specialization'],
      achievements: ['Completed 300+ coding challenges'],
      languages: ['English'],
      links: [
        { url: 'https://linkedin.com/in/david-miller-jr', category: 'LinkedIn' as const, text: 'linkedin.com/in/david-miller-jr' },
        { url: 'https://github.com/dmiller-codes', category: 'GitHub' as const, text: 'github.com/dmiller-codes' }
      ],
      rawText: 'David Miller. Associate Degree 2024. 2 years experience in Python, Machine Learning, TensorFlow, Flask, SQL. Junior developer. GitHub: github.com/dmiller-codes.'
    },
    scores: {
      tfidfCosineScore: 49,
      bm25Score: 51,
      lexicalCombinedScore: 50,
      skillMatchScore: 45,
      experienceFitScore: 40,
      educationFitScore: 55,
      llmSemanticScore: 46
    },
    llmAnalysis: {
      semantic_match_score: 46,
      strengths: [
        'Eager learner with foundational Python scripting skills'
      ],
      weaknesses: [
        'Has only 2 years experience vs 4+ required for Senior MLE',
        'Missing PyTorch, Docker, Kubernetes, MLOps, and production distributed systems experience',
        'Associate degree vs Masters prerequisite'
      ],
      red_flags: ['Significant seniority gap for a Senior-level role'],
      skill_evidence: [
        { skill: 'Python', evidence: 'Built basic Flask applications and tutorial ML scripts' }
      ],
      suggested_interview_questions: [
        'How would you scale a Flask and ML script to handle hundreds of concurrent requests?'
      ],
      one_line_verdict: 'Early-career developer with great drive, but not yet ready for a Senior ML Engineer role.',
      fit_category: 'Poor' as const,
      isDemo: true
    }
  }
];

/**
 * Generate full hydrated demo candidates with scores and explanations calculated
 */
export function generateDemoCandidates(): Candidate[] {
  const defaultWeights = {
    lexical: 25,
    skills: 30,
    experience: 20,
    education: 10,
    llm: 15
  };

  const jd = DEMO_JOB_DESCRIPTION;

  const candidates: Candidate[] = DEMO_CANDIDATES_RAW.map((cand, index) => {
    const skillDetails = evaluateSkillMatch(
      cand.parsedData.skills,
      jd.requiredSkills,
      jd.preferredSkills,
      cand.parsedData.rawText
    );

    const finalScore = calculateHybridScore(cand.scores, defaultWeights);

    const explanation = generateScoreExplanation(
      cand.parsedData.name,
      cand.scores,
      finalScore,
      jd,
      skillDetails.matchedRequired.length,
      jd.requiredSkills.length,
      cand.parsedData.totalExperienceYears,
      cand.parsedData.education[0]?.degree || 'Degree'
    );

    return {
      ...cand,
      skillDetails,
      finalScore,
      explanation
    };
  });

  // Sort descending by finalScore to assign rank
  candidates.sort((a, b) => b.finalScore - a.finalScore);
  candidates.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  return candidates;
}
