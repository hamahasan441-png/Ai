import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Data Science & Machine Learning Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Supervised Learning ───────────────────────────────────────────────────

  describe('Supervised Learning', () => {
    it('explains classification vs regression in supervised learning', async () => {
      const r = await brain.chat('What is supervised learning classification and regression?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/classif|regress|label|predict|supervis/)
    })

    it('describes random forest and decision trees', async () => {
      const r = await brain.chat('How does a random forest machine learning model work with decision trees for supervised learning?')
      expect(r.text.toLowerCase()).toMatch(/random\s*forest|decision\s*tree|ensemble|bagging|split|classif|regress|supervis/)
    })

    it('explains SVM classifier and margin', async () => {
      const r = await brain.chat('How does an SVM classifier model in sklearn find the maximum margin for supervised learning?')
      expect(r.text.toLowerCase()).toMatch(/svm|support\s*vector|margin|hyperplane|kernel|classif|supervis|sklearn/)
    })

    it('covers sklearn model training workflow', async () => {
      const r = await brain.chat('What is the sklearn model fitting and training workflow?')
      expect(r.text.toLowerCase()).toMatch(/sklearn|fit|predict|train|test|split/)
    })
  })

  // ── Unsupervised Learning ─────────────────────────────────────────────────

  describe('Unsupervised Learning', () => {
    it('explains K-Means clustering algorithm', async () => {
      const r = await brain.chat('How does K-Means and DBSCAN clustering work for unsupervised learning with PCA dimensionality reduction?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/k-?means|cluster|centroid|unsupervis|dbscan|density|pca|dimension/)
    })

    it('describes DBSCAN density-based clustering', async () => {
      const r = await brain.chat('How does DBSCAN density-based clustering handle noise and outliers?')
      expect(r.text.toLowerCase()).toMatch(/dbscan|density|cluster|noise|outlier/)
    })

    it('covers PCA dimensionality reduction', async () => {
      const r = await brain.chat('How does PCA dimensionality reduction preserve variance?')
      expect(r.text.toLowerCase()).toMatch(/pca|dimension|principal|component|variance/)
    })
  })

  // ── Deep Learning ─────────────────────────────────────────────────────────

  describe('Deep Learning', () => {
    it('explains neural network fundamentals', async () => {
      const r = await brain.chat('What are the deep learning neural network fundamentals with PyTorch and TensorFlow?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/neural|deep\s*learn|layer|activation|pytorch|tensorflow/)
    })

    it('describes backpropagation and gradient descent', async () => {
      const r = await brain.chat('How does backpropagation and gradient descent work in neural networks?')
      expect(r.text.toLowerCase()).toMatch(/backprop|gradient|loss|optim|descent|adam/)
    })

    it('covers dropout and regularization', async () => {
      const r = await brain.chat('How does deep learning regularization with dropout work?')
      expect(r.text.toLowerCase()).toMatch(/dropout|regulariz|overfit|batch\s*norm|weight\s*decay/)
    })
  })

  // ── CNN & Computer Vision ─────────────────────────────────────────────────

  describe('CNN & Computer Vision', () => {
    it('explains convolutional neural network architecture', async () => {
      const r = await brain.chat('How does a CNN image classification convolutional neural network work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/cnn|convolut|filter|pool|image|classif/)
    })

    it('describes transfer learning with pretrained models', async () => {
      const r = await brain.chat('How does CNN transfer learning with ResNet or EfficientNet work?')
      expect(r.text.toLowerCase()).toMatch(/transfer|pretrain|resnet|efficientnet|fine-?tun|imagenet/)
    })

    it('covers object detection architectures', async () => {
      const r = await brain.chat('What are the main CNN object detection architectures like YOLO?')
      expect(r.text.toLowerCase()).toMatch(/detect|yolo|r-?cnn|segment|classif/)
    })
  })

  // ── NLP & Transformers ────────────────────────────────────────────────────

  describe('NLP & Transformers', () => {
    it('explains BERT model and fine-tuning', async () => {
      const r = await brain.chat('How does the BERT model fine-tuning work for NLP tasks?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/bert|transformer|fine-?tun|nlp|pre-?train|attention/)
    })

    it('describes transformer architecture and attention', async () => {
      const r = await brain.chat('How does the transformer model attention mechanism work in NLP?')
      expect(r.text.toLowerCase()).toMatch(/transformer|attention|self-?attention|multi-?head|positional/)
    })

    it('covers word embeddings and representations', async () => {
      const r = await brain.chat('How do word embeddings work in NLP language models?')
      expect(r.text.toLowerCase()).toMatch(/embed|word2vec|glove|token|vector|represent/)
    })

    it('lists NLP tasks and libraries', async () => {
      const r = await brain.chat('What NLP tasks can transformers handle and what libraries exist?')
      expect(r.text.toLowerCase()).toMatch(/nlp|classif|ner|question|summar|hugging\s*face|spacy/)
    })
  })

  // ── Data Preprocessing ────────────────────────────────────────────────────

  describe('Data Preprocessing & EDA', () => {
    it('explains pandas dataframe operations', async () => {
      const r = await brain.chat('How to use pandas dataframe for data manipulation and analysis?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/pandas|dataframe|describe|info|read_csv|column/)
    })

    it('covers feature engineering techniques', async () => {
      const r = await brain.chat('What are the key feature engineering and data preprocessing steps?')
      expect(r.text.toLowerCase()).toMatch(/feature|encod|scal|missing|transform|preprocess/)
    })

    it('describes exploratory data analysis', async () => {
      const r = await brain.chat('How to perform exploratory data analysis EDA with visualization?')
      expect(r.text.toLowerCase()).toMatch(/eda|explor|distribut|correlat|plot|visual/)
    })
  })

  // ── Gradient Boosting ─────────────────────────────────────────────────────

  describe('Gradient Boosting & Ensembles', () => {
    it('explains XGBoost for Kaggle competitions', async () => {
      const r = await brain.chat('How does XGBoost work for Kaggle competition winning models?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/xgboost|gradient\s*boost|regulariz|ensemble|kaggle/)
    })

    it('compares LightGBM and CatBoost', async () => {
      const r = await brain.chat('What are the differences between LightGBM and CatBoost gradient boosting?')
      expect(r.text.toLowerCase()).toMatch(/lightgbm|catboost|gradient|boost|leaf|categorical/)
    })

    it('describes hyperparameter tuning', async () => {
      const r = await brain.chat('How to tune hyperparameters for gradient boosting models?')
      expect(r.text.toLowerCase()).toMatch(/hyperparameter|tun|grid|random|optuna|learning_rate|depth/)
    })
  })

  // ── Reinforcement Learning ────────────────────────────────────────────────

  describe('Reinforcement Learning', () => {
    it('explains Q-Learning and DQN', async () => {
      const r = await brain.chat('How does reinforcement learning Q-Learning and DQN work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/reinforcement|q-?learn|dqn|reward|state|action|policy/)
    })

    it('covers policy gradient methods', async () => {
      const r = await brain.chat('How do reinforcement learning policy gradient methods like PPO work?')
      expect(r.text.toLowerCase()).toMatch(/policy|gradient|ppo|actor|critic|proximal/)
    })
  })

  // ── Time Series ───────────────────────────────────────────────────────────

  describe('Time Series Forecasting', () => {
    it('explains ARIMA time series model', async () => {
      const r = await brain.chat('How does the ARIMA model work for time series forecasting with Prophet seasonal decomposition?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/arima|time\s*series|forecast|autoregress|station|prophet|season/)
    })

    it('covers LSTM and Prophet for forecasting', async () => {
      const r = await brain.chat('How do LSTM networks and Prophet handle time series forecasting?')
      expect(r.text.toLowerCase()).toMatch(/lstm|prophet|time\s*series|forecast|season/)
    })
  })

  // ── Generative Models ─────────────────────────────────────────────────────

  describe('Generative Models', () => {
    it('explains GANs for image generation', async () => {
      const r = await brain.chat('How do GAN generative adversarial networks create images?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/gan|generat|discriminat|adversar|image/)
    })

    it('covers diffusion models and Stable Diffusion', async () => {
      const r = await brain.chat('How do diffusion models like Stable Diffusion generate images?')
      expect(r.text.toLowerCase()).toMatch(/diffusion|denois|stable|text-?to-?image|latent/)
    })

    it('describes variational autoencoders', async () => {
      const r = await brain.chat('How does a variational autoencoder VAE learn latent representations?')
      expect(r.text.toLowerCase()).toMatch(/vae|variational|autoencoder|latent|kl|divergen|encoder|decoder/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Data Science & ML concepts', () => {
    it('has Data Science & Machine Learning concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Data Science & Machine Learning')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('artificial-intelligence')
    })

    it('has Supervised Learning concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Supervised Learning')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('machine-learning')
    })

    it('has Deep Learning concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Deep Learning')
      expect(concept).toBeDefined()
    })

    it('has CNN & Computer Vision concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('CNN & Computer Vision')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('deep-learning')
    })

    it('has NLP & Transformers concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('NLP & Transformers')
      expect(concept).toBeDefined()
    })

    it('has Gradient Boosting Ensembles concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Gradient Boosting Ensembles')
      expect(concept).toBeDefined()
    })

    it('has Reinforcement Learning concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Reinforcement Learning')
      expect(concept).toBeDefined()
    })

    it('has Time Series Forecasting concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Time Series Forecasting')
      expect(concept).toBeDefined()
    })

    it('has Generative Models concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Generative Models')
      expect(concept).toBeDefined()
    })

    it('Data Science & ML has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Data Science & Machine Learning')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(6)
    })

    it('Deep Learning is part of Data Science & ML', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Deep Learning')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Data Science & Machine Learning')
    })

    it('CNN is related to Supervised Learning', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('CNN & Computer Vision')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Supervised Learning')
    })
  })
})
