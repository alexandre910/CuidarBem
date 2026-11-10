# CuidarBem

Aplicativo que conecta cuidadores, enfermeiras, contratantes e cursos de qualificação.

**Disciplina:** [ADS - FATEC ZONA SUL]
**Integrantes:** [nomes do grupo]
**Professor(a):** [nome]

## Funcionalidades
- Cadastro e login (e-mail e senha) para os 4 tipos de usuário: cuidadores, enfermeiras, contratantes e cursos
- Busca e contratação de profissionais
- Cursos de qualificação profissional
- Layout responsivo: versão mobile e versão computador (a partir de 1100 px de largura)

## Tecnologias
- React Native (Expo) com TypeScript
- Desenvolvido e hospedado no Replit

## Como rodar
1. Clone o repositório: `git clone https://github.com/SEU_USUARIO/cuidarbem.git`
2. Instale as dependências: `npm install`
3. Inicie o projeto: `npx expo start`
4. Escaneie o QR code com o app Expo Go, ou aperte `w` para abrir no navegador

## Variáveis de ambiente
- `SESSION_SECRET`: segredo de sessão (configure o seu valor; não está no repositório)

## Limitações conhecidas
Por ser um protótipo acadêmico, os usuários e senhas são guardados no armazenamento local do aparelho, sem criptografia e sem servidor. Em uma versão real, a autenticação seria feita em um backend, com senhas protegidas por hash.

## Status
Em desenvolvimento.
