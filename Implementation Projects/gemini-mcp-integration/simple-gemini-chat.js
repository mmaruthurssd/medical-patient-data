#!/usr/bin/env node

/**
 * Simple Gemini Chat (No MCP Integration)
 *
 * Basic conversational interface with Gemini API.
 * Use this until MCP servers are configured.
 */

const readline = require('readline');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PHIGuard = require('../../google-workspace-oauth-setup/phi-guard');
require('dotenv').config();

class SimpleGeminiChat {
  constructor() {
    this.guard = new PHIGuard();
    this.conversationHistory = [];

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    this.chat = this.model.startChat({
      history: [],
    });
  }

  async start() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║           Simple Gemini Chat                       ║');
    console.log('║           HIPAA-Compliant Edition                  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log('✅ Gemini API connected');
    console.log('✅ PHI Guard enabled\n');

    console.log('Commands:');
    console.log('  /exit    - Exit chat');
    console.log('  /clear   - Clear conversation');
    console.log('  /history - Show conversation history\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '👤 You: '
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();

      if (!input) {
        rl.prompt();
        return;
      }

      // Handle commands
      if (input === '/exit') {
        console.log('\n👋 Goodbye!\n');
        process.exit(0);
      }

      if (input === '/clear') {
        this.conversationHistory = [];
        this.chat = this.model.startChat({ history: [] });
        console.log('✓ Conversation cleared\n');
        rl.prompt();
        return;
      }

      if (input === '/history') {
        this.showHistory();
        rl.prompt();
        return;
      }

      // Process message
      await this.processMessage(input);
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\n👋 Goodbye!\n');
      process.exit(0);
    });
  }

  async processMessage(input) {
    try {
      // Detect PHI
      const detection = this.guard.detectPHI(input);

      if (detection.hasPHI) {
        console.log(`\n⚠️  PHI detected: ${detection.phiTypes.join(', ')}`);

        // De-identify
        const deidentified = this.guard.deidentify(input);
        input = deidentified.deidentifiedText;

        console.log('✓ PHI removed before processing\n');
      }

      // Send to Gemini
      console.log('🤖 Gemini: ');

      const result = await this.chat.sendMessage(input);
      const response = result.response.text();

      console.log(response + '\n');

      // Track conversation
      this.conversationHistory.push({
        user: input,
        gemini: response,
        hadPHI: detection.hasPHI
      });

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }
  }

  showHistory() {
    console.log('\n📜 Conversation History:\n');

    if (this.conversationHistory.length === 0) {
      console.log('  (empty)\n');
      return;
    }

    this.conversationHistory.forEach((msg, i) => {
      const phiFlag = msg.hadPHI ? ' 🔒' : '';
      console.log(`${i + 1}. You: ${msg.user.substring(0, 60)}${msg.user.length > 60 ? '...' : ''}${phiFlag}`);
      console.log(`   Gemini: ${msg.gemini.substring(0, 60)}${msg.gemini.length > 60 ? '...' : ''}\n`);
    });

    console.log(`Total messages: ${this.conversationHistory.length}\n`);
  }
}

// Start chat
const chat = new SimpleGeminiChat();
chat.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
