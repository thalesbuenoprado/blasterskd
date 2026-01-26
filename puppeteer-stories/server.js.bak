const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let browser = null;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
        });
    }
    return browser;
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'puppeteer-stories-v3' });
});

app.post('/render', async (req, res) => {
    const startTime = Date.now();
    try {
        const { html, width = 1080, height = 1920, format = 'png' } = req.body;
        if (!html) return res.status(400).json({ error: 'HTML obrigatorio' });
        const browserInstance = await getBrowser();
        const page = await browserInstance.newPage();
        await page.setViewport({ width, height, deviceScaleFactor: 1 });
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.evaluateHandle('document.fonts.ready');
        const screenshot = await page.screenshot({ type: format, encoding: 'base64', fullPage: false });
        await page.close();
        res.json({ success: true, image: 'data:image/' + format + ';base64,' + screenshot, width, height, renderTimeMs: Date.now() - startTime });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao renderizar', details: error.message });
    }
});

app.post('/render-story', async (req, res) => {
    const startTime = Date.now();
    try {
        const { template, data, format = 'png' } = req.body;
        if (!template || !data) return res.status(400).json({ error: 'template e data obrigatorios' });
        const html = generateStoryHTML(template, data);
        const browserInstance = await getBrowser();
        const page = await browserInstance.newPage();
        await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.evaluateHandle('document.fonts.ready');
        const screenshot = await page.screenshot({ type: format, encoding: 'base64', fullPage: false });
        await page.close();
        res.json({ success: true, image: 'data:image/' + format + ';base64,' + screenshot, template, renderTimeMs: Date.now() - startTime });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao renderizar story', details: error.message });
    }
});

function generateStoryHTML(template, data) {
    const corPrimaria = data.corPrimaria || '#1e3a5f';
    const corSecundaria = data.corSecundaria || '#d4af37';
    const corFundo = data.corFundo || '#0d1b2a';
    const pergunta = data.pergunta || data.tema || '';
    const resposta = data.resposta || '';
    const destaque = data.destaque || '';
    const headline = data.headline || data.tema || '';
    const bullets = data.bullets || [];
    const estatistica = data.estatistica || {};
    const area = data.area || '';
    const nomeAdvogado = data.nomeAdvogado || '';
    const oab = data.oab || '';
    const instagram = data.instagram || '';
    const logo = data.logo || '';
    
    // CTA: usa instagram se tiver, senão "Siga para mais dicas"
    const cta = data.cta || (instagram ? '@' + instagram.replace('@', '') : 'Siga para mais dicas');

    const baseStyles = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { width: 1080px; height: 1920px; font-family: 'Inter', sans-serif; }
        </style>
    `;

    // Logo HTML
    const logoHTML = logo ? `
        <div style="display:flex;justify-content:center;margin-bottom:12px;">
            <img src="${logo}" style="width:90px;height:90px;object-fit:contain;border-radius:12px;background:rgba(0,0,0,0.4);padding:10px;" />
        </div>
    ` : '';

    // ========================================
    // TEMPLATE: VOCÊ SABIA?
    // ========================================
    if (template === 'voce-sabia') {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles}
        <style>
            .story { justify-content: flex-start; padding-top: 120px;
                width: 1080px;
                height: 1920px;
                background: linear-gradient(180deg, ${corPrimaria} 0%, ${corFundo} 100%);
                padding: 60px;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .icon { font-size: 60px; margin-bottom: 20px; }
            .pergunta {
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                color: ${corSecundaria};
                text-align: center;
                line-height: 1.3;
            }
            .content {
                
                background: rgba(255,255,255,0.08);
                border-left: 8px solid ${corSecundaria};
                border-radius: 0 16px 16px 0;
                padding: 40px;
                margin: 30px 0;
                display: flex;
                align-items: flex-start;
            }
            .content p {
                color: white;
                font-size: 34px;
                line-height: 1.5;
            }
            .destaque-box {
                background: ${corSecundaria};
                color: ${corFundo};
                padding: 24px 40px;
                border-radius: 16px;
                text-align: center;
                font-weight: 700;
                font-size: 32px;
            }
            .footer {
                text-align: center;
                padding-top: 30px;
                border-top: 1px solid rgba(255,255,255,0.2);
                margin-top: 30px;
            }
            .advogado { color: white; font-size: 32px; font-weight: 600; }
            .oab { color: rgba(255,255,255,0.6); font-size: 24px; margin-top: 8px; }
            .cta { color: ${corSecundaria}; font-size: 26px; margin-top: 20px; }
        </style></head><body>
        <div class="story">
            <div class="header">
                <div class="icon">⚖️</div>
                <div class="pergunta">${pergunta}</div>
            </div>
            <div class="content">
                <p>${resposta}</p>
            </div>
            <div class="destaque-box">${destaque || 'CONHEÇA SEUS DIREITOS!'}</div>
            <div class="footer">
                ${logoHTML}
                <div class="advogado">${nomeAdvogado}</div>
                <div class="oab">${oab}</div>
                <div class="cta">↑ ${cta}</div>
            </div>
        </div>
        </body></html>`;
    }

    // ========================================
    // TEMPLATE: BULLETS / LISTA
    // ========================================
    if (template === 'bullets') {
        let bulletsHTML = '';
        const icons = ['✓', '✓', '✓', '✓'];
        for (let i = 0; i < bullets.length && i < 4; i++) {
            const b = bullets[i];
            const bulletText = typeof b === 'string' ? b : (b.titulo || b.texto || b);
            bulletsHTML += `
                <div class="bullet">
                    <div class="bullet-icon">${icons[i]}</div>
                    <div class="bullet-text">${bulletText}</div>
                </div>
            `;
        }
        return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles}
        <style>
            .story { justify-content: flex-start; padding-top: 120px;
                width: 1080px;
                height: 1920px;
                background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
                padding: 60px;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .badge {
                background: ${corSecundaria};
                color: white;
                font-size: 24px;
                font-weight: 700;
                padding: 12px 24px;
                border-radius: 50px;
                display: inline-block;
                margin-bottom: 30px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .headline {
                font-family: 'Montserrat', sans-serif;
                font-size: 52px;
                font-weight: 800;
                color: white;
                line-height: 1.2;
                margin-bottom: 40px;
            }
            .bullets { flex: 1; display: flex; flex-direction: column; gap: 20px; }
            .bullet {
                display: flex;
                align-items: center;
                gap: 24px;
                background: rgba(255,255,255,0.06);
                padding: 28px;
                border-radius: 16px;
            }
            .bullet-icon {
                width: 56px;
                height: 56px;
                background: ${corSecundaria};
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                color: white;
                flex-shrink: 0;
            }
            .bullet-text { color: white; font-size: 32px; line-height: 1.4; }
            .footer {
                text-align: center;
                padding-top: 30px;
                border-top: 1px solid rgba(255,255,255,0.1);
                margin-top: auto;
            }
            .advogado { color: white; font-size: 30px; font-weight: 600; }
            .oab { color: rgba(255,255,255,0.5); font-size: 22px; margin-top: 8px; }
            .cta { color: ${corSecundaria}; font-size: 24px; margin-top: 16px; }
        </style></head><body>
        <div class="story">
            <div class="badge">📋 ${area}</div>
            <div class="headline">${headline}</div>
            <div class="bullets">${bulletsHTML}</div>
            <div class="footer">
                ${logoHTML}
                <div class="advogado">${nomeAdvogado}</div>
                <div class="oab">${oab}</div>
                <div class="cta">↑ ${cta}</div>
            </div>
        </div>
        </body></html>`;
    }

    // ========================================
    // TEMPLATE: ESTATÍSTICA
    // ========================================
    if (template === 'estatistica') {
        const numero = estatistica.numero || estatistica.valor || '70%';
        const contexto = estatistica.contexto || estatistica.label || 'dos casos';
        const explicacao = estatistica.explicacao || resposta || '';
        
        return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles}
        <style>
            .story { justify-content: flex-start; padding-top: 120px;
                width: 1080px;
                height: 1920px;
                background: linear-gradient(180deg, #18181b 0%, #27272a 50%, #18181b 100%);
                padding: 60px;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .area-tag {
                color: ${corSecundaria};
                font-size: 28px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 4px;
                margin-bottom: 30px;
            }
            .headline {
                font-family: 'Montserrat', sans-serif;
                font-size: 44px;
                font-weight: 700;
                color: white;
                line-height: 1.3;
                margin-bottom: 50px;
            }
            .stat-card {
                background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05));
                border: 3px solid rgba(245,158,11,0.3);
                border-radius: 32px;
                padding: 50px;
                text-align: center;
                margin-bottom: 40px;
            }
            .stat-number {
                font-family: 'Montserrat', sans-serif;
                font-size: 120px;
                font-weight: 800;
                color: ${corSecundaria};
                line-height: 1;
            }
            .stat-label {
                color: rgba(255,255,255,0.6);
                font-size: 32px;
                margin-top: 16px;
                text-transform: uppercase;
                letter-spacing: 3px;
            }
            .info-text { height: auto;
                
                color: rgba(255,255,255,0.85);
                font-size: 32px;
                line-height: 1.5;
                padding: 40px;
                background: rgba(255,255,255,0.05);
                border-radius: 24px;
            }
            .footer {
                text-align: center;
                padding-top: 30px;
                border-top: 1px solid rgba(255,255,255,0.1);
                margin-top: 30px;
            }
            .advogado { color: white; font-size: 30px; font-weight: 600; }
            .oab { color: rgba(255,255,255,0.5); font-size: 22px; margin-top: 8px; }
            .cta { color: ${corSecundaria}; font-size: 24px; margin-top: 16px; }
        </style></head><body>
        <div class="story">
            <div class="area-tag">📊 ${area}</div>
            <div class="headline">${headline}</div>
            <div class="stat-card">
                <div class="stat-number">${numero}</div>
                <div class="stat-label">${contexto}</div>
            </div>
            <div class="info-text">${explicacao}</div>
            <div class="footer">
                ${logoHTML}
                <div class="advogado">${nomeAdvogado}</div>
                <div class="oab">${oab}</div>
                <div class="cta">↑ ${cta}</div>
            </div>
        </div>
        </body></html>`;
    }

    // ========================================
    // TEMPLATE: URGENTE
    // ========================================
    if (template === 'urgente') {
        const alerta = data.alerta || headline || 'ATENÇÃO!';
        const prazo = data.prazo || '';
        const risco = data.risco || resposta || '';
        const acao = data.acao || 'Consulte um advogado';
        
        return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles}
        <style>
            .story { justify-content: flex-start; padding-top: 120px;
                width: 1080px;
                height: 1920px;
                background: linear-gradient(180deg, #450a0a 0%, #1c1917 100%);
                padding: 60px;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .alert-badge {
                background: #dc2626;
                color: white;
                font-size: 28px;
                font-weight: 700;
                padding: 16px 32px;
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 40px;
            }
            .headline {
                font-family: 'Montserrat', sans-serif;
                font-size: 52px;
                font-weight: 800;
                color: white;
                line-height: 1.2;
                margin-bottom: 40px;
            }
            .prazo-box {
                background: rgba(220,38,38,0.15);
                border: 4px solid #dc2626;
                border-radius: 24px;
                padding: 40px;
                text-align: center;
                margin-bottom: 40px;
            }
            .prazo-label {
                color: #fca5a5;
                font-size: 24px;
                text-transform: uppercase;
                letter-spacing: 4px;
                margin-bottom: 12px;
            }
            .prazo-valor {
                font-family: 'Montserrat', sans-serif;
                font-size: 72px;
                font-weight: 800;
                color: #dc2626;
            }
            .risco-box {
                
                background: rgba(255,255,255,0.05);
                padding: 40px;
                border-radius: 20px;
            }
            .risco-box p { color: rgba(255,255,255,0.9); font-size: 32px; line-height: 1.5; }
            .cta-urgente {
                background: #dc2626;
                color: white;
                padding: 32px;
                border-radius: 20px;
                text-align: center;
                font-weight: 700;
                font-size: 36px;
                margin-top: 30px;
            }
            .footer {
                text-align: center;
                padding-top: 24px;
                margin-top: 24px;
            }
            .advogado { color: white; font-size: 28px; font-weight: 600; }
            .oab { color: rgba(255,255,255,0.5); font-size: 20px; margin-top: 6px; }
        </style></head><body>
        <div class="story">
            <div class="alert-badge">🚨 ATENÇÃO</div>
            <div class="headline">${alerta}</div>
            ${prazo ? `
            <div class="prazo-box">
                <div class="prazo-label">Prazo</div>
                <div class="prazo-valor">${prazo}</div>
            </div>
            ` : ''}
            <div class="risco-box">
                <p>${risco}</p>
            </div>
            <div class="cta-urgente">${acao}</div>
            <div class="footer">
                ${logoHTML}
                <div class="advogado">${nomeAdvogado}</div>
                <div class="oab">${oab}</div>
            </div>
        </div>
        </body></html>`;
    }

    // ========================================
    // TEMPLATE: PREMIUM
    // ========================================
    if (template === 'premium') {
        const insight = data.insight || resposta || '';
        const conclusao = data.conclusao || destaque || '';
        
        return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles}
        <style>
            .story { justify-content: flex-start; padding-top: 120px;
                width: 1080px;
                height: 1920px;
                background: linear-gradient(180deg, ${corFundo} 0%, #16213e 100%);
                padding: 60px;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 50px;
            }
            .brand-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, ${corSecundaria}, #b8962e);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
            }
            .brand-name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                color: white;
            }
            .divider {
                width: 120px;
                height: 4px;
                background: linear-gradient(90deg, ${corSecundaria}, transparent);
                margin-bottom: 40px;
            }
            .area-tag {
                color: ${corSecundaria};
                font-size: 24px;
                text-transform: uppercase;
                letter-spacing: 6px;
                margin-bottom: 20px;
            }
            .headline {
                font-family: 'Playfair Display', serif;
                font-size: 52px;
                color: white;
                line-height: 1.3;
                margin-bottom: 40px;
            }
            .content-box {
                flex: 1;
                background: rgba(212,175,55,0.08);
                border: 1px solid rgba(212,175,55,0.2);
                border-radius: 24px;
                padding: 40px;
            }
            .content-box p {
                color: rgba(255,255,255,0.9);
                font-size: 32px;
                line-height: 1.6;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 30px;
                border-top: 1px solid rgba(212,175,55,0.2);
                margin-top: 30px;
            }
            .contact { color: rgba(255,255,255,0.7); font-size: 28px; }
            .contact strong { color: white; display: block; font-size: 32px; }
            .cta-arrow {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, ${corSecundaria}, #b8962e);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${corFundo};
                font-size: 36px;
            }
        </style></head><body>
        <div class="story">
            <div class="brand">
                <div class="brand-icon">⚖️</div>
                <div class="brand-name">${nomeAdvogado || 'Advocacia'}</div>
            </div>
            <div class="divider"></div>
            <div class="area-tag">${area}</div>
            <div class="headline">${headline}</div>
            <div class="content-box">
                <p>${insight}</p>
            </div>
            <div class="footer">
                <div class="contact">
                    <strong>${instagram || cta}</strong>
                </div>
                <div class="cta-arrow">→</div>
            </div>
        </div>
        </body></html>`;
    }

    throw new Error('Template nao encontrado: ' + template);
}

app.listen(PORT, function() {
    console.log('=================================');
    console.log('🎨 Puppeteer Stories v3 - REFORMULADO');
    console.log('=================================');
    console.log('✅ Porta:', PORT);
    console.log('🖼️ Templates: PROFISSIONAIS');
    console.log('=================================');
});
