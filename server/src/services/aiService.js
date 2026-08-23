const env = require('../config/env');

const generateWorkflowFromPrompt = async (promptText) => {
  const prompt = (promptText || '').trim();

  // Tier 1: OpenRouter API
  if (env.openRouterApiKey) {
    try {
      console.log('[AIService] Attempting generation via OpenRouter API...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content:
                'You are a workflow generator for Agentflow_AI. Generate a JSON object with keys "name", "description", "nodes" (array of React Flow nodes), and "edges" (array of React Flow edges).'
            },
            { role: 'user', content: prompt }
          ]
        })
      });
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.nodes && parsed.edges) return parsed;
        }
      }
    } catch (err) {
      console.warn('[AIService] OpenRouter generation failed, falling back to Gemini:', err.message);
    }
  }

  // Tier 2: Google Gemini SDK
  if (env.geminiApiKey) {
    try {
      console.log('[AIService] Attempting generation via Google Gemini SDK...');
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(env.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Generate a JSON workflow structure for prompt: "${prompt}". Output valid JSON with keys name, description, nodes, edges.`
      );
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.nodes && parsed.edges) return parsed;
      }
    } catch (err) {
      console.warn('[AIService] Gemini generation failed, falling back to Deterministic engine:', err.message);
    }
  }

  // Tier 3: Deterministic Rule-Based Builder Engine
  console.log('[AIService] Generating workflow using Deterministic Rule Engine...');
  return buildDeterministicWorkflow(prompt);
};

const buildDeterministicWorkflow = (prompt) => {
  const lower = prompt.toLowerCase();
  const name = prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt || 'Generated Workflow';

  const nodes = [];
  const edges = [];

  // Trigger Node
  nodes.push({
    id: 'node_trigger',
    type: 'input',
    position: { x: 250, y: 50 },
    data: {
      label: 'Webhook Trigger',
      type: 'trigger',
      config: { provider: 'webhook', event: 'incoming_data' }
    }
  });

  let currentY = 180;
  let prevNodeId = 'node_trigger';

  if (lower.includes('sheet') || lower.includes('google sheet') || lower.includes('lead') || lower.includes('csv')) {
    const sheetNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: sheetNodeId,
      type: 'default',
      position: { x: 250, y: currentY },
      data: {
        label: 'Google Sheets Append',
        type: 'action',
        config: {
          provider: 'google-sheets',
          action: 'append_row',
          spreadsheetId: 'leads_spreadsheet_01',
          range: 'Sheet1!A:D'
        }
      }
    });
    edges.push({
      id: `e_${prevNodeId}_${sheetNodeId}`,
      source: prevNodeId,
      target: sheetNodeId,
      animated: true
    });
    prevNodeId = sheetNodeId;
    currentY += 130;
  }

  if (lower.includes('email') || lower.includes('gmail') || lower.includes('mail') || lower.includes('invoice')) {
    const emailNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: emailNodeId,
      type: 'default',
      position: { x: 250, y: currentY },
      data: {
        label: 'Gmail Dispatcher',
        type: 'action',
        config: {
          provider: 'gmail',
          action: 'send_email',
          to: 'operator@company.com',
          subject: 'Automation Alert - New Activity Processed'
        }
      }
    });
    edges.push({
      id: `e_${prevNodeId}_${emailNodeId}`,
      source: prevNodeId,
      target: emailNodeId,
      animated: true
    });
    prevNodeId = emailNodeId;
    currentY += 130;
  }

  if (lower.includes('slack') || lower.includes('channel') || lower.includes('notify') || lower.includes('notification')) {
    const slackNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: slackNodeId,
      type: 'default',
      position: { x: 250, y: currentY },
      data: {
        label: 'Slack Notifier',
        type: 'action',
        config: {
          provider: 'slack',
          action: 'post_message',
          channel: '#ops-alerts',
          text: 'Execution summary received'
        }
      }
    });
    edges.push({
      id: `e_${prevNodeId}_${slackNodeId}`,
      source: prevNodeId,
      target: slackNodeId,
      animated: true
    });
    prevNodeId = slackNodeId;
    currentY += 130;
  }

  if (lower.includes('discord') || lower.includes('bot')) {
    const discordNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: discordNodeId,
      type: 'default',
      position: { x: 250, y: currentY },
      data: {
        label: 'Discord Bot Broadcast',
        type: 'action',
        config: {
          provider: 'discord',
          action: 'post_bot_message',
          channelId: 'general-channel',
          content: 'Agent execution update'
        }
      }
    });
    edges.push({
      id: `e_${prevNodeId}_${discordNodeId}`,
      source: prevNodeId,
      target: discordNodeId,
      animated: true
    });
    prevNodeId = discordNodeId;
    currentY += 130;
  }

  // Fallback default node if no keyword matched
  if (nodes.length === 1) {
    const actionNodeId = 'node_2';
    nodes.push({
      id: actionNodeId,
      type: 'default',
      position: { x: 250, y: currentY },
      data: {
        label: 'AI Automation Processing',
        type: 'action',
        config: {
          provider: 'openrouter',
          action: 'process_data',
          prompt: prompt
        }
      }
    });
    edges.push({
      id: `e_node_trigger_${actionNodeId}`,
      source: 'node_trigger',
      target: actionNodeId,
      animated: true
    });
    prevNodeId = actionNodeId;
    currentY += 130;

    const notifNodeId = 'node_3';
    nodes.push({
      id: notifNodeId,
      type: 'output',
      position: { x: 250, y: currentY },
      data: {
        label: 'Slack Broadcast',
        type: 'output',
        config: {
          provider: 'slack',
          action: 'post_message',
          channel: '#general'
        }
      }
    });
    edges.push({
      id: `e_${prevNodeId}_${notifNodeId}`,
      source: prevNodeId,
      target: notifNodeId,
      animated: true
    });
  }

  return {
    name: `Workflow: ${name}`,
    description: `Auto-generated workflow graph derived from prompt: "${prompt}"`,
    nodes,
    edges,
    version: 1,
    tags: ['AI Generated', 'Automated']
  };
};

module.exports = {
  generateWorkflowFromPrompt
};
