import { Logging } from '@google-cloud/logging';

// Inicializa o cliente do GCP usando as variáveis cadastradas na Vercel
const logging = new Logging({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const log = logging.log('app-auditoria');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userId, acao, detalhe } = req.body;

  try {
    const entry = log.entry(
      { resource: { type: 'global' } },
      {
        event_type: 'user_action',
        userId: userId || 'anonimo',
        action: acao,
        metadata: detalhe,
        timestamp: new Date().toISOString(),
      }
    );

    await log.write(entry);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao gravar log no GCP:', error);
    return res.status(500).json({ error: error.message });
  }
}
