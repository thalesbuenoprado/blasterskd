-- ========================================
-- JURISCONTENT - SISTEMA DE PAGAMENTOS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. TABELA DE PLANOS
-- Define os planos disponíveis no sistema
CREATE TABLE IF NOT EXISTS planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  limite_geracoes INTEGER NOT NULL DEFAULT 0, -- 0 = ilimitado
  recursos JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir os planos
INSERT INTO planos (nome, slug, descricao, preco, limite_geracoes, recursos, ordem) VALUES
  ('Grátis', 'gratis', 'Ideal para conhecer a plataforma', 0, 3, '["3 posts/mês", "Templates básicos", "Marca d''água"]'::jsonb, 1),
  ('Essencial', 'essencial', 'Para advogados iniciando no digital', 47, 20, '["20 posts/mês", "Todos os templates", "Sem marca d''água", "Suporte por email"]'::jsonb, 2),
  ('Profissional', 'profissional', 'Para advogados ativos nas redes', 97, 50, '["50 posts/mês", "Todos os templates", "Sem marca d''água", "Agendamento de posts", "Suporte prioritário"]'::jsonb, 3),
  ('Escritório', 'escritorio', 'Para escritórios e equipes', 197, 0, '["Posts ilimitados", "Todos os templates", "Sem marca d''água", "Agendamento de posts", "Múltiplos usuários", "Suporte VIP"]'::jsonb, 4)
ON CONFLICT (slug) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  preco = EXCLUDED.preco,
  limite_geracoes = EXCLUDED.limite_geracoes,
  recursos = EXCLUDED.recursos,
  ordem = EXCLUDED.ordem,
  updated_at = NOW();

-- 2. TABELA DE ASSINATURAS
-- Registra a assinatura ativa de cada usuário
CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES planos(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- pendente, ativa, cancelada, expirada

  -- Datas importantes
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  data_proxima_cobranca TIMESTAMP WITH TIME ZONE,

  -- Mercado Pago
  mp_subscription_id VARCHAR(100), -- ID da assinatura no Mercado Pago
  mp_preapproval_id VARCHAR(100), -- ID do preapproval
  mp_payer_id VARCHAR(100), -- ID do pagador

  -- Controle
  cancelada_em TIMESTAMP WITH TIME ZONE,
  motivo_cancelamento TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id) -- Cada usuário só pode ter uma assinatura ativa
);

-- 3. TABELA DE PAGAMENTOS
-- Histórico de todas as transações
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assinatura_id UUID REFERENCES assinaturas(id),

  -- Valores
  valor DECIMAL(10,2) NOT NULL,
  moeda VARCHAR(3) DEFAULT 'BRL',

  -- Mercado Pago
  mp_payment_id VARCHAR(100), -- ID do pagamento no MP
  mp_status VARCHAR(50), -- approved, pending, rejected, etc
  mp_status_detail VARCHAR(100),
  mp_payment_type VARCHAR(50), -- credit_card, pix, boleto
  mp_payment_method VARCHAR(50),

  -- Dados do pagador
  payer_email VARCHAR(255),
  payer_name VARCHAR(255),

  -- Controle
  status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- pendente, aprovado, rejeitado, estornado
  processado_em TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ADICIONAR CONTROLE DE GERAÇÕES NA TABELA PERFIS
-- Adiciona colunas para controlar uso mensal
ALTER TABLE perfis
ADD COLUMN IF NOT EXISTS geracoes_mes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mes_referencia VARCHAR(7) DEFAULT TO_CHAR(NOW(), 'YYYY-MM'),
ADD COLUMN IF NOT EXISTS plano_atual VARCHAR(50) DEFAULT 'gratis';

-- 5. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_assinaturas_user_id ON assinaturas(user_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_mp_subscription ON assinaturas(mp_subscription_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_user_id ON pagamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mp_payment ON pagamentos(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);

-- 6. FUNÇÃO PARA RESETAR GERAÇÕES MENSAIS
-- Reseta o contador de gerações quando muda o mês
CREATE OR REPLACE FUNCTION reset_geracoes_mes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mes_referencia != TO_CHAR(NOW(), 'YYYY-MM') THEN
    NEW.geracoes_mes := 0;
    NEW.mes_referencia := TO_CHAR(NOW(), 'YYYY-MM');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para resetar automaticamente
DROP TRIGGER IF EXISTS trigger_reset_geracoes ON perfis;
CREATE TRIGGER trigger_reset_geracoes
  BEFORE UPDATE ON perfis
  FOR EACH ROW
  EXECUTE FUNCTION reset_geracoes_mes();

-- 7. FUNÇÃO PARA VERIFICAR LIMITE DE GERAÇÕES
CREATE OR REPLACE FUNCTION verificar_limite_geracoes(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_perfil RECORD;
  v_plano RECORD;
  v_limite INTEGER;
  v_usado INTEGER;
  v_pode_gerar BOOLEAN;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO v_perfil FROM perfis WHERE id = p_user_id;

  -- Se não encontrou perfil, permite (vai usar plano grátis)
  IF NOT FOUND THEN
    RETURN json_build_object(
      'pode_gerar', true,
      'limite', 3,
      'usado', 0,
      'restante', 3,
      'plano', 'gratis'
    );
  END IF;

  -- Resetar se mudou o mês
  IF v_perfil.mes_referencia != TO_CHAR(NOW(), 'YYYY-MM') THEN
    UPDATE perfis SET
      geracoes_mes = 0,
      mes_referencia = TO_CHAR(NOW(), 'YYYY-MM')
    WHERE id = p_user_id;
    v_perfil.geracoes_mes := 0;
  END IF;

  -- Buscar limite do plano
  SELECT * INTO v_plano FROM planos WHERE slug = COALESCE(v_perfil.plano_atual, 'gratis');

  IF NOT FOUND THEN
    v_limite := 3; -- Default: plano grátis
  ELSE
    v_limite := v_plano.limite_geracoes;
  END IF;

  v_usado := COALESCE(v_perfil.geracoes_mes, 0);

  -- 0 = ilimitado
  IF v_limite = 0 THEN
    v_pode_gerar := true;
  ELSE
    v_pode_gerar := v_usado < v_limite;
  END IF;

  RETURN json_build_object(
    'pode_gerar', v_pode_gerar,
    'limite', v_limite,
    'usado', v_usado,
    'restante', CASE WHEN v_limite = 0 THEN -1 ELSE v_limite - v_usado END,
    'plano', COALESCE(v_perfil.plano_atual, 'gratis')
  );
END;
$$ LANGUAGE plpgsql;

-- 8. FUNÇÃO PARA INCREMENTAR GERAÇÕES
CREATE OR REPLACE FUNCTION incrementar_geracao(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_resultado JSON;
BEGIN
  -- Verificar limite primeiro
  v_resultado := verificar_limite_geracoes(p_user_id);

  IF NOT (v_resultado->>'pode_gerar')::boolean THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Limite de gerações atingido',
      'limite', v_resultado
    );
  END IF;

  -- Incrementar contador
  UPDATE perfis SET
    geracoes_mes = COALESCE(geracoes_mes, 0) + 1,
    mes_referencia = TO_CHAR(NOW(), 'YYYY-MM')
  WHERE id = p_user_id;

  -- Se não existe perfil, criar
  IF NOT FOUND THEN
    INSERT INTO perfis (id, geracoes_mes, mes_referencia, plano_atual)
    VALUES (p_user_id, 1, TO_CHAR(NOW(), 'YYYY-MM'), 'gratis')
    ON CONFLICT (id) DO UPDATE SET
      geracoes_mes = COALESCE(perfis.geracoes_mes, 0) + 1;
  END IF;

  RETURN json_build_object(
    'success', true,
    'limite', verificar_limite_geracoes(p_user_id)
  );
END;
$$ LANGUAGE plpgsql;

-- 9. RLS (Row Level Security) - Políticas de segurança
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Política: usuário só vê suas próprias assinaturas
CREATE POLICY "Usuários veem suas assinaturas" ON assinaturas
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuário só vê seus próprios pagamentos
CREATE POLICY "Usuários veem seus pagamentos" ON pagamentos
  FOR SELECT USING (auth.uid() = user_id);

-- Política: planos são públicos (leitura)
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planos são públicos" ON planos
  FOR SELECT USING (true);

-- 10. VIEW PARA DASHBOARD DO USUÁRIO
CREATE OR REPLACE VIEW v_usuario_assinatura AS
SELECT
  u.id as user_id,
  u.email,
  p.nome as plano_nome,
  p.slug as plano_slug,
  p.preco as plano_preco,
  p.limite_geracoes,
  COALESCE(pf.geracoes_mes, 0) as geracoes_usadas,
  CASE
    WHEN p.limite_geracoes = 0 THEN -1
    ELSE p.limite_geracoes - COALESCE(pf.geracoes_mes, 0)
  END as geracoes_restantes,
  a.status as assinatura_status,
  a.data_inicio,
  a.data_fim,
  a.data_proxima_cobranca
FROM auth.users u
LEFT JOIN perfis pf ON pf.id = u.id
LEFT JOIN planos p ON p.slug = COALESCE(pf.plano_atual, 'gratis')
LEFT JOIN assinaturas a ON a.user_id = u.id AND a.status = 'ativa';

-- ========================================
-- PRONTO! Execute este SQL no Supabase
-- ========================================
