const express = require('express');
const cors = require('cors');
const { createCanvas, loadImage, registerFont } = require('canvas');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Arquivo para armazenar trending topics
const TRENDING_FILE = path.join(__dirname, 'trending-topics.json');

// CORS configurado para produção
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Cloudinary configurado via variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgf3hzmb8',
  api_key: process.env.CLOUDINARY_API_KEY || '239768197523983',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'PVPOJkaWTJcMIJn5Nsn-_h9BWJk'
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'JurisContent Backend v1.4 - Com Logo nos Stories',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ================================================
// FUNÇÕES AUXILIARES PARA CANVAS
// ================================================

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

function drawTextWithShadow(ctx, text, x, y, shadowColor = 'rgba(0,0,0,0.8)', shadowBlur = 10) {
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawDarkBox(ctx, x, y, width, height, radius = 20, opacity = 0.75) {
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
}

function drawMultilineText(ctx, lines, x, y, lineHeight, align = 'center') {
  ctx.textAlign = align;
  for (let i = 0; i < lines.length; i++) {
    drawTextWithShadow(ctx, lines[i], x, y + (i * lineHeight));
  }
}

// ================================================
// FUNÇÃO AUXILIAR: Processar conteúdo por template
// ================================================
function processarConteudoPorTemplate(template, conteudo, textoFallback, tema) {
  if (!conteudo || typeof conteudo !== 'object') {
    console.log('⚠️ Usando fallback para template:', template);
    return criarFallback(template, textoFallback, tema);
  }

  console.log('✅ Processando conteúdo estruturado para:', template);

  switch (template) {
    case 'voce-sabia':
      return {
        pergunta: conteudo.pergunta || tema || 'Você sabia?',
        resposta: conteudo.resposta || textoFallback?.substring(0, 150) || '',
        destaque: conteudo.destaque || 'SAIBA SEUS DIREITOS!',
        cta: 'Arraste para saber mais'
      };

    case 'bullets':
      return {
        headline: conteudo.titulo || `Seus direitos: ${tema}`,
        bullets: Array.isArray(conteudo.bullets) 
          ? conteudo.bullets.slice(0, 4) 
          : [],
        cta: conteudo.cta || 'Salve para não esquecer!'
      };

    case 'estatistica':
      return {
        estatistica: {
          numero: conteudo.numero || '70%',
          contexto: conteudo.contexto || tema,
          explicacao: conteudo.explicacao || '',
          fonte: conteudo.fonte || ''
        },
        headline: `${conteudo.numero || ''} ${conteudo.contexto || tema}`,
        cta: 'Proteja seus direitos!'
      };

    case 'urgente':
      return {
        alerta: conteudo.alerta || `ATENÇÃO: ${tema}`,
        prazo: conteudo.prazo || '',
        risco: conteudo.risco || '',
        acao: conteudo.acao || 'Consulte um advogado',
        headline: conteudo.alerta || tema,
        destaque: '⚠️ URGENTE',
        cta: 'Não perca o prazo!'
      };

    case 'premium':
      return {
        headline: conteudo.headline || tema,
        insight: conteudo.insight || textoFallback?.substring(0, 150) || '',
        conclusao: conteudo.conclusao || '',
        resposta: conteudo.insight || '',
        destaque: conteudo.conclusao || 'Consultoria Especializada',
        cta: 'Agende uma consulta'
      };

    default:
      return criarFallback(template, textoFallback, tema);
  }
}

function criarFallback(template, texto, tema) {
  const textoLimpo = texto?.substring(0, 150) || '';
  
  return {
    pergunta: tema ? `Você sabia sobre ${tema}?` : 'Você sabia?',
    resposta: textoLimpo,
    destaque: 'CONHEÇA SEUS DIREITOS!',
    headline: tema || 'Informação Jurídica',
    bullets: [],
    estatistica: {},
    cta: 'Arraste para saber mais'
  };
}

// ================================================
// ROTA: GERAR STORY (para Puppeteer) - COM LOGO!
// ================================================
app.post('/api/gerar-story', async (req, res) => {
  try {
    const { 
      conteudo,
      texto,
      tema, 
      area, 
      template, 
      perfil_visual, 
      nome_advogado, 
      oab, 
      telefone, 
      instagram,
      logo          // ← NOVO: receber logo
    } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'Template obrigatório' });
    }

    console.log('📱 Gerando Story:', { template, area, tema, temLogo: !!logo });

    const dadosProcessados = processarConteudoPorTemplate(template, conteudo, texto, tema);

    const PUPPETEER_URL = process.env.PUPPETEER_URL || 'http://localhost:3002/render-story';

    const storyData = {
      template,
      data: {
        corPrimaria: perfil_visual?.cor_primaria || '#1e3a5f',
        corSecundaria: perfil_visual?.cor_secundaria || '#d4af37',
        corFundo: perfil_visual?.cor_fundo || '#0d1b2a',
        nomeAdvogado: nome_advogado || '',
        oab: oab || '',
        telefone: telefone || '',
        instagram: instagram || '',
        iniciais: nome_advogado 
          ? nome_advogado.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
          : '',
        area: area || '',
        tema: tema || '',
        logo: logo || '',    // ← NOVO: passar logo para Puppeteer
        ...dadosProcessados
      }
    };

    const response = await fetch(PUPPETEER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Puppeteer erro: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.success || !data.image) {
      throw new Error('Falha ao gerar imagem do Story');
    }

    console.log('📤 Upload Story para Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(data.image, {
      folder: 'juridico-stories',
      format: 'png'
    });

    console.log('✅ Story gerado:', uploadResult.secure_url);

    res.json({
      success: true,
      imageUrl: uploadResult.secure_url,
      template: template,
      renderTimeMs: data.renderTimeMs
    });

  } catch (error) {
    console.error('❌ Erro gerar story:', error);
    res.status(500).json({
      error: 'Erro ao gerar story',
      details: error.message
    });
  }
});

// ================================================
// ROTA: GERAR IMAGEM FEED (COM CAIXA ESCURA)
// ================================================
app.post('/api/gerar-imagem', async (req, res) => {
  try {
    const { 
      imageUrl, 
      tema, 
      area, 
      nomeAdvogado, 
      oab, 
      formato, 
      estilo, 
      logo,
      bullets,
      conteudo
    } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'URL da imagem obrigatória' });

    console.log('🖼️ Gerando imagem Feed:', { formato, estilo, area });

    const paletas = {
      classico: { text: '#FFFFFF', accent: '#D4AF37', dark: 'rgba(0,0,0,0.8)' },
      moderno: { text: '#FFFFFF', accent: '#FACC15', dark: 'rgba(15,23,42,0.85)' },
      executivo: { text: '#FFFFFF', accent: '#C9A050', dark: 'rgba(0,0,0,0.85)' },
      acolhedor: { text: '#FFFFFF', accent: '#FFB366', dark: 'rgba(30,20,10,0.8)' }
    };
    const cores = paletas[estilo] || paletas.classico;

    const dimensoes = {
      quadrado: { w: 1080, h: 1080 },
      stories: { w: 1080, h: 1920 },
      landscape: { w: 1200, h: 628 }
    };
    const dim = dimensoes[formato] || dimensoes.quadrado;

    const canvas = createCanvas(dim.w, dim.h);
    const ctx = canvas.getContext('2d');

    const baseImage = await loadImage(imageUrl);
    ctx.drawImage(baseImage, 0, 0, dim.w, dim.h);

    // CAIXA ESCURA NO TOPO
    const paddingH = 60;
    const topoBoxY = 30;
    const topoBoxHeight = 180;
    
    ctx.font = 'bold 42px Arial';
    const temaLines = wrapText(ctx, tema || '', dim.w - (paddingH * 2) - 40);
    const temaBoxHeight = Math.max(topoBoxHeight, 80 + (temaLines.length * 50));
    
    drawDarkBox(ctx, paddingH, topoBoxY, dim.w - (paddingH * 2), temaBoxHeight, 20, 0.8);

    if (area) {
      ctx.fillStyle = cores.accent;
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      drawTextWithShadow(ctx, area.toUpperCase(), dim.w / 2, topoBoxY + 45);
    }

    if (tema) {
      ctx.fillStyle = cores.text;
      ctx.font = 'bold 42px Georgia';
      const startY = topoBoxY + 90;
      drawMultilineText(ctx, temaLines, dim.w / 2, startY, 50, 'center');
    }

    // CAIXA ESCURA NO RODAPÉ
    const rodapeBoxHeight = 140;
    const rodapeBoxY = dim.h - rodapeBoxHeight - 30;
    
    drawDarkBox(ctx, paddingH, rodapeBoxY, dim.w - (paddingH * 2), rodapeBoxHeight, 20, 0.8);

    if (nomeAdvogado) {
      ctx.fillStyle = cores.accent;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      drawTextWithShadow(ctx, nomeAdvogado, dim.w / 2, rodapeBoxY + 55);
    }

    if (oab) {
      ctx.fillStyle = cores.text;
      ctx.font = '26px Arial';
      ctx.textAlign = 'center';
      drawTextWithShadow(ctx, oab, dim.w / 2, rodapeBoxY + 100);
    }

    // BULLETS
    const bulletsArray = bullets || conteudo?.bullets || [];
    
    if (bulletsArray.length > 0) {
      const bulletBoxY = temaBoxHeight + topoBoxY + 40;
      const bulletBoxHeight = Math.min(bulletsArray.length * 70 + 60, dim.h - bulletBoxY - rodapeBoxHeight - 100);
      
      drawDarkBox(ctx, paddingH, bulletBoxY, dim.w - (paddingH * 2), bulletBoxHeight, 20, 0.75);
      
      ctx.fillStyle = cores.text;
      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      
      const bulletStartY = bulletBoxY + 50;
      const bulletX = paddingH + 40;
      
      bulletsArray.slice(0, 5).forEach((bullet, index) => {
        const bulletText = typeof bullet === 'string' ? bullet : bullet.texto || bullet.titulo || '';
        const icon = '✓';
        const y = bulletStartY + (index * 65);
        
        ctx.fillStyle = cores.accent;
        drawTextWithShadow(ctx, icon, bulletX, y);
        
        ctx.fillStyle = cores.text;
        const bulletLines = wrapText(ctx, bulletText, dim.w - (paddingH * 2) - 100);
        drawTextWithShadow(ctx, bulletLines[0] || '', bulletX + 40, y);
      });
    }

    // LOGO
    if (logo) {
      try {
        const logoBase64 = logo.startsWith('data:') ? logo : `data:image/png;base64,${logo}`;
        const logoImage = await loadImage(logoBase64);
        
        const logoX = dim.w - 110;
        const logoY = 40;
        const logoSize = 70;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fill();
        ctx.restore();
        
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      } catch (e) {
        console.log('⚠️ Erro ao carregar logo:', e.message);
      }
    }

    const imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: 'juridico-final',
      format: 'jpg'
    });

    console.log('✅ Imagem Feed gerada:', uploadResult.secure_url);

    res.json({ success: true, imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error);
    res.status(500).json({ error: 'Erro ao gerar imagem', details: error.message });
  }
});

// ================================================
// ROTA: GERAR STORY COM IA (via N8N)
// ================================================
app.post('/api/gerar-story-ia', async (req, res) => {
  try {
    const { texto, tema, area, template, perfil_visual, nome_advogado, oab, telefone, instagram } = req.body;

    console.log('🤖 Gerando Story com IA:', { template, area });

    const N8N_URL = 'http://localhost:5678/webhook/juridico-stories';

    const response = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto, tema, area, template, perfil_visual,
        nome_advogado, oab, telefone, instagram
      })
    });

    if (!response.ok) {
      throw new Error(`N8N erro: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.image) {
      throw new Error('Falha ao gerar story via IA');
    }

    const uploadResult = await cloudinary.uploader.upload(data.image, {
      folder: 'juridico-stories',
      format: 'png'
    });

    console.log('✅ Story IA gerado:', uploadResult.secure_url);

    res.json({
      success: true,
      imageUrl: uploadResult.secure_url,
      template: template
    });

  } catch (error) {
    console.error('❌ Erro story IA:', error);
    res.status(500).json({
      error: 'Erro ao gerar story com IA',
      details: error.message
    });
  }
});

// ================================================
// ROTA: SALVAR TRENDING TOPICS (do N8N)
// ================================================
app.post('/api/trending-topics', (req, res) => {
  try {
    const { trending, dataAtualizacao } = req.body;

    if (!trending || !Array.isArray(trending)) {
      return res.status(400).json({ error: 'Dados de trending inválidos' });
    }

    const dados = {
      trending: trending.slice(0, 3),
      dataAtualizacao: dataAtualizacao || new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString()
    };

    fs.writeFileSync(TRENDING_FILE, JSON.stringify(dados, null, 2));
    console.log('✅ Trending topics salvos:', dados.trending.length, 'temas');

    res.json({
      success: true,
      message: 'Trending topics atualizados',
      count: dados.trending.length
    });
  } catch (error) {
    console.error('❌ Erro ao salvar trending:', error);
    res.status(500).json({
      error: 'Erro ao salvar trending topics',
      details: error.message
    });
  }
});

app.get('/api/trending-topics', (req, res) => {
  try {
    if (fs.existsSync(TRENDING_FILE)) {
      const dados = JSON.parse(fs.readFileSync(TRENDING_FILE, 'utf-8'));
      const dataHoje = new Date().toISOString().split('T')[0];
      const dataArquivo = dados.ultimaAtualizacao?.split('T')[0];

      if (dataArquivo === dataHoje) {
        return res.json(dados);
      }
    }

    res.json({
      trending: [
        { tema: "Direitos do Consumidor em 2025", descricao: "Novas regras para compras online", area: "Direito do Consumidor", icone: "🛒" },
        { tema: "Reforma Trabalhista", descricao: "Impactos nas relações de trabalho", area: "Direito Trabalhista", icone: "💼" },
        { tema: "LGPD e Proteção de Dados", descricao: "Multas e adequação das empresas", area: "Direito Digital", icone: "🔐" }
      ],
      dataAtualizacao: new Date().toISOString(),
      isFallback: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar trending topics' });
  }
});

app.post('/api/analisar-logo', async (req, res) => {
  try {
    const { logo } = req.body;
    if (!logo) return res.status(400).json({ error: 'Logo obrigatória' });

    const response = await fetch('http://localhost:5678/webhook/analisar-logo-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo })
    });

    if (!response.ok) throw new Error(`N8N erro: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao analisar logo', details: error.message });
  }
});

app.post('/api/gerar-conteudo', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

    const response = await fetch('http://localhost:5678/webhook/juridico-working', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error(`N8N erro: ${response.status}`);
    const data = await response.json();
    res.json({ content: data.content || data.texto || '' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar conteúdo', details: error.message });
  }
});

app.post('/api/gerar-prompt-imagem', async (req, res) => {
  try {
    const { tema, area, estilo, formato, texto, perfil_visual } = req.body;

    const response = await fetch('http://localhost:5678/webhook/juridico-hibrido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema, area, estilo, formato, texto, perfil_visual })
    });

    if (!response.ok) throw new Error(`N8N erro: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar prompt', details: error.message });
  }
});

app.post('/api/remover-fundo', async (req, res) => {
  try {
    let { logo } = req.body;
    if (!logo) return res.status(400).json({ success: false, error: 'Logo não fornecida' });

    if (logo.includes(',')) logo = logo.split(',')[1];

    const https = require('https');
    const querystring = require('querystring');

    const postData = querystring.stringify({
      image_file_b64: logo,
      size: 'auto',
      format: 'png'
    });

    const options = {
      hostname: 'api.remove.bg',
      path: '/v1.0/removebg',
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY || 'cz67CSF3ZrSWHxhXuvWzVgTz',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const apiRequest = https.request(options, (apiResponse) => {
      const chunks = [];
      apiResponse.on('data', (chunk) => chunks.push(chunk));
      apiResponse.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (apiResponse.statusCode === 200) {
          res.json({ success: true, logoSemFundo: buffer.toString('base64'), mimeType: 'image/png' });
        } else {
          res.status(apiResponse.statusCode).json({ success: false, error: 'Erro na API' });
        }
      });
    });

    apiRequest.on('error', (error) => res.status(500).json({ success: false, error: error.message }));
    apiRequest.write(postData);
    apiRequest.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const http = require("http");

app.all("/api/n8n/*", (req, res) => {
  const n8nPath = req.path.replace("/api/n8n", "");
  const options = {
    hostname: "localhost",
    port: 5678,
    path: n8nPath,
    method: req.method,
    headers: { "Content-Type": "application/json" }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", () => res.status(500).json({ error: "Erro n8n" }));
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
});

app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 Backend v1.4 - Logo nos Stories');
  console.log('=================================');
  console.log('✅ Porta:', PORT);
  console.log('📱 Stories: COM LOGO');
  console.log('🖼️ Feed: COM CAIXA ESCURA');
  console.log('=================================');
});