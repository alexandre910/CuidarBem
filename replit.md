# CuidarBem - Aplicativo de Cuidados

## Visão Geral
CuidarBem é um aplicativo mobile que conecta famílias a cuidadores e enfermeiros qualificados. O aplicativo funciona como um marketplace onde profissionais de saúde oferecem seus serviços e contratantes podem encontrar e contratar esses profissionais.

**Slogan:** "Cuidados com Carinho"

## Arquitetura do Projeto

### Stack Tecnológico
- **Framework:** React Native com Expo SDK 54
- **Navegação:** React Navigation 7+
- **Armazenamento:** AsyncStorage para persistência local
- **UI:** Componentes customizados seguindo design system próprio

### Estrutura de Diretórios
```
├── assets/               # Imagens, ícones e assets
├── components/           # Componentes reutilizáveis
├── constants/            # Tema, cores e constantes
├── context/              # Context providers (Auth, Data)
├── hooks/                # Custom hooks
├── navigation/           # Navegadores e rotas
├── screens/              # Telas do aplicativo
└── types/                # Definições TypeScript
```

### Tipos de Usuários
1. **Cuidador** - Profissional de cuidados
2. **Enfermeiro** - Profissional de enfermagem (com COREN)
3. **Contratante** - Pessoa que busca profissionais
4. **Empresa** - Empresa que oferece cursos

## Funcionalidades Principais

### Implementadas
- [x] Cadastro e login de usuários
- [x] 4 tipos de perfis (cuidador, enfermeiro, contratante, empresa)
- [x] Busca de profissionais com filtros
- [x] Visualização de perfis detalhados
- [x] Sistema de chat/mensagens
- [x] Gerenciamento de cuidados do paciente (para contratantes)
- [x] Sistema de assinatura mensal/anual
- [x] Perfil editável com foto

### Próximas Fases
- [ ] Integração com Stripe para pagamentos reais
- [ ] Notificações push
- [ ] Sistema de avaliações após atendimento
- [ ] Upload de documentos (COREN, etc.)
- [ ] Backend real com API

## Esquema de Cores
- **Fundo:** #FFFAC7 (creme)
- **Texto:** #000000 (preto)
- **Primário (botões/cabeçalho):** #00FCE3 (ciano)
- **Acento 1:** #000AFF (azul)
- **Acento 2:** #DC4429 (vermelho)

## Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Testar no navegador
# Acesse a URL fornecida pelo Expo

# Testar no celular
# Escaneie o QR code com Expo Go
```

## Notas de Desenvolvimento
- O aplicativo usa armazenamento local (AsyncStorage) para dados
- Profissionais mock estão disponíveis para testes
- Sistema de assinatura é simulado localmente
- Interface em português brasileiro
