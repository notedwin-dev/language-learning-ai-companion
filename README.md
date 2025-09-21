# 🌍 Language Learning AI Companion

An immersive, AI-powered language learning platform that teaches Mandarin Chinese, Cantonese, and Bahasa Melayu through interactive real-world scenarios. Experience authentic conversations in restaurants, markets, and travel situations with advanced speech recognition, pronunciation coaching, and AI-driven explanations.

![Language Learning Demo](https://img.shields.io/badge/Languages-Mandarin%20%7C%20Cantonese%20%7C%20Malay-blue)
![AI Powered](https://img.shields.io/badge/AI-AWS%20Bedrock%20%7C%20Polly%20%7C%20Transcribe-orange)
![Framework](https://img.shields.io/badge/Framework-Next.js%20%7C%20Express.js-green)

## ✨ Features

### 🎯 **Interactive Scenario Learning**
- **Restaurant Conversations**: Order food, communicate with staff, handle payment
- **Market Haggling**: Negotiate prices, ask about products, practice numbers
- **Travel & Directions**: Navigate cities, use public transport, ask for help
- **Real-world Context**: Learn through authentic cultural scenarios

### 🤖 **AI-Powered Learning Experience**
- **Speech Recognition**: AWS Transcribe with multi-language detection
- **Pronunciation Coaching**: AI-driven feedback with scoring (0.0-1.0)
- **Smart Explanations**: Context-aware learning tips from AWS Bedrock
- **Auto-Progression**: Score-based advancement (≥0.6 threshold)

### 🎵 **Advanced Audio Features**
- **Text-to-Speech**: Natural voice synthesis with AWS Polly
- **Real-time Recording**: Browser-based audio capture
- **Language Detection**: Automatic identification of spoken language
- **Pronunciation Analysis**: DeepSeek R1 AI model evaluation

### 📱 **Modern User Experience**
- **Responsive Design**: Mobile-first Tailwind CSS interface
- **Smooth Animations**: Framer Motion transitions
- **Practice Modes**: Flexible sentence practice options
- **Progress Tracking**: Achievement system and completion scores

## 🏗️ Architecture

### Frontend (Next.js 15)
```
frontend/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ScenarioEngine.tsx    # Main conversation interface
│   │   ├── NavBar.tsx           # Navigation component
│   │   └── Icons.tsx            # SVG icon library
│   ├── learn/              # Learning interface pages
│   ├── languages/          # Language selection
│   ├── destinations/       # Cultural destinations
│   └── how-to-play/        # Tutorial and guides
├── public/                 # Static assets
└── utils/                  # Utility functions
```

### Backend (Express.js)
```
backend/
├── routes/
│   ├── speech-to-text.js        # AWS Transcribe integration
│   ├── text-to-speech.js        # AWS Polly integration
│   └── check-pronunciation.js   # AI pronunciation analysis
├── server.js               # Main Express server
└── uploads/                # Temporary audio file storage
```

### AWS Services Integration
- **AWS Transcribe**: Speech-to-text conversion with language detection
- **AWS Polly**: High-quality text-to-speech synthesis
- **AWS Bedrock**: AI explanations using DeepSeek R1 model
- **AWS S3**: Audio file storage for transcription processing

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **AWS Account** with Bedrock, Polly, and Transcribe access
- **Modern Browser** with microphone permissions

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/language-learning-ai-companion.git
cd language-learning-ai-companion
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies (if separate package.json exists)
cd ../backend && npm install
```

3. **Configure environment variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your AWS credentials
```

4. **Set up AWS credentials**
```bash
# Required environment variables
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Optional configurations
BEDROCK_MODEL_ID=deepseek.r1-v1:0
AWS_S3_BUCKET=your_transcription_bucket
PORT=5000
```

5. **Start the development servers**
```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start separately:
# Frontend: cd frontend && npm run dev
# Backend: cd backend && nodemon server.js
```

6. **Access the application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🎮 How to Use

### 1. **Choose Your Language**
- Select from Mandarin Chinese, Cantonese, or Bahasa Melayu
- Each language features authentic cultural contexts

### 2. **Pick a Scenario**
- **Restaurant**: Order food in Chengdu, Guangzhou, or Kuala Lumpur
- **Market**: Practice haggling and shopping
- **Directions**: Navigate public transport and find locations

### 3. **Interactive Learning**
- Listen to native speaker audio
- Choose your response from multiple options
- Practice pronunciation with AI feedback
- Get contextual explanations for grammar and culture

### 4. **Learning Mode Features**
- **Check Pronunciation**: Record yourself speaking
- **AI Explanations**: Understand grammar, culture, and usage
- **Auto-Progression**: Advance when pronunciation score ≥ 0.6
- **Skip Options**: Manual progression for different learning styles

## 🔧 API Endpoints

### Speech Processing
```javascript
POST /api/speech-to-text     // Convert audio to text
POST /api/text-to-speech     // Generate speech from text
POST /api/check-pronunciation // AI pronunciation analysis
```

### AI Services
```javascript
POST /api/generate-explanation // Context-aware learning explanations
POST /api/message             // General AI chat (legacy)
```

### Request/Response Examples

**Pronunciation Check:**
```javascript
// Request
{
  "expected": {
    "chinese": "欢迎光临",
    "cantonese": "fun1 jing4 gwong1 lam4",
    "english": "Welcome"
  },
  "actual": "欢迎光临",
  "language": "cantonese",
  "detectedLanguage": "zh-HK"
}

// Response
{
  "score": 0.85,
  "feedback": "Excellent pronunciation! Your tone pattern for '欢迎光临' was clear and accurate. Focus on the rising tone in '迎' for even better results."
}
```

## 🛠️ Development

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js (ES Modules)
- **AI Services**: AWS Bedrock (DeepSeek R1), AWS Polly, AWS Transcribe
- **Animations**: Framer Motion
- **Audio**: MediaRecorder API, Web Audio API

### Project Structure
```
language-learning-ai-companion/
├── 📁 frontend/           # Next.js application
├── 📁 backend/            # Express.js API server
├── 📁 docs/               # Documentation
├── 📁 scripts/            # Build and deployment scripts
├── 🔧 docker-compose.yml  # Container orchestration
├── 🔧 package.json        # Root dependencies and scripts
└── 📚 README.md           # This file
```

### Development Scripts
```bash
npm run dev      # Start both frontend and backend
npm run build    # Build production frontend
npm run start    # Start production frontend
npm run lint     # Run ESLint
npm run lint:fix # Fix ESLint issues
```

### Environment Configuration
The application supports multiple environment configurations:

- **Development**: Uses local servers with hot reload
- **Production**: Optimized builds with AWS services
- **Docker**: Containerized deployment (see docker-compose.yml)

## 🌟 Advanced Features

### Pronunciation Scoring System
The AI analyzes speech across multiple dimensions:
- **Accuracy**: Word recognition and transcription quality
- **Tone**: Proper tonal pronunciation (crucial for Chinese languages)
- **Fluency**: Speech rhythm and natural flow
- **Language Match**: Detecting correct target language usage

### Cultural Learning Integration
- **Authentic Scenarios**: Real-world conversation contexts
- **Cultural Notes**: Understanding social norms and etiquette
- **Regional Variations**: Different dialects and local expressions
- **Progressive Difficulty**: Scenarios build upon previous learning

### AI-Powered Explanations
- **Grammar Patterns**: Explanation of sentence structure
- **Cultural Context**: When and how to use phrases appropriately
- **Alternative Expressions**: Different ways to convey the same meaning
- **Pronunciation Tips**: Specific guidance for challenging sounds

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start containers
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Infrastructure
The application requires the following AWS services:
- **Bedrock**: AI model access (DeepSeek R1)
- **Polly**: Text-to-speech synthesis
- **Transcribe**: Speech recognition
- **S3**: Audio file storage (optional)

### Environment Variables for Production
```bash
# AWS Configuration
AWS_ACCESS_KEY=your_production_access_key
AWS_SECRET_KEY=your_production_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=production_bucket_name

# Model Configuration
BEDROCK_MODEL_ID=deepseek.r1-v1:0

# Server Configuration
PORT=5000
NODE_ENV=production
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AWS**: For providing powerful AI and cloud services
- **DeepSeek**: For the advanced R1 reasoning model
- **Next.js Team**: For the excellent React framework
- **Framer Motion**: For smooth animations
- **Tailwind CSS**: For utility-first styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/language-learning-ai-companion/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/your-server) for real-time help

## 🗺️ Roadmap

### Upcoming Features
- [ ] **More Languages**: Japanese, Korean, Vietnamese
- [ ] **Advanced Scenarios**: Business meetings, medical visits, shopping
- [ ] **Multiplayer Mode**: Practice with other learners
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Offline Mode**: Download scenarios for offline practice
- [ ] **Progress Analytics**: Detailed learning insights and recommendations

### Current Status
- [x] Core conversation engine
- [x] AI pronunciation analysis
- [x] Multi-language support (Mandarin, Cantonese, Malay)
- [x] Real-world scenarios (Restaurant, Market)
- [x] Learning mode with explanations
- [ ] Travel/Directions scenario (Coming Soon)

---

**Built with ❤️ for language learners worldwide**

*Start your language learning journey today! Choose a destination, pick a scenario, and immerse yourself in authentic conversations powered by cutting-edge AI technology.*