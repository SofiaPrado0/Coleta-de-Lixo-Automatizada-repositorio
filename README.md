# Coleta de Lixo Automatizada — Dashboard

Este é o repositório/dashboard front-end do projeto de Coleta de Lixo Automatizada (carrinho seguidor de linha inteligente baseado em ESP32). A interface foi projetada com foco em dispositivos móveis (mobile-first), apresentando um design escuro premium com tons de rosa, focando na simplicidade e objetividade.

A dashboard exibe de forma estática o estado operacional do carrinho, os dados da maquete física dividida entre casinhas (pontos de coleta) e o centro de lixo, a contagem de resíduos categorizados apenas entre Reciclável e Não Reciclável, e a timeline de atividades recentes.

---

## Tecnologias Utilizadas

- HTML5 (Estrutura semântica)
- CSS3 (Estilização customizada, variáveis CSS, layout responsivo)
- JavaScript (Manipulação de dados estáticos e renderização de componentes com SVG inline)

---

## Como Executar o Projeto

Como este projeto é composto exclusivamente por arquivos estáticos de front-end (HTML, CSS e JS), não é necessário compilar nada. Existem duas maneiras simples de executá-lo:

### Opção 1: Abrir Diretamente no Navegador (Mais Rápido)
1. Navegue até a pasta do projeto: coletaautomatizada-repositorio.
2. Dê um duplo clique no arquivo index.html (ou clique com o botão direito e selecione para abrir com o navegador de sua preferência, como Google Chrome, Microsoft Edge, Firefox, Safari, etc.).

---

### Opção 2: Executar um Servidor Local (Recomendado para simular o ambiente web)
Se você tem o Node.js instalado na sua máquina, você pode usar um servidor HTTP estático local:

1. Abra o terminal (PowerShell, CMD ou Bash) na pasta do projeto:
   ```bash
   cd c:\Users\sofia\Desktop\faculdade\coletaautomatizada-repositorio
   ```

2. Execute o servidor utilizando o npx (que vem junto com o Node.js):
   ```bash
   npx serve -l 3000
   ```

3. Abra o navegador e acesse o endereço:
   ```text
   http://localhost:3000
   ```

(Caso utilize o VS Code, você também pode clicar com o botão direito sobre o arquivo index.html e selecionar "Open with Live Server" se tiver essa extensão instalada).

---

## Visualização no Celular
A dashboard foi planejada principalmente para uso em celular. Para visualizar de forma ideal no computador:
1. Abra o painel nas ferramentas de desenvolvedor do navegador (F12 ou Ctrl+Shift+I).
2. Clique no ícone de dispositivo móvel (modo responsivo) para simular uma tela de smartphone.
3. Se rodar pela Opção 2 na mesma rede Wi-Fi, você pode acessar pelo celular usando o seu IP local (exemplo: http://192.168.x.x:3000).

---

## Estrutura da Dashboard

- Status do Carrinho: Informações sobre o nível de bateria, velocidade de movimentação, o modo de operação (Seguindo Linha) e a leitura atual do sensor de cor.
- Visão Geral da Maquete:
  - Centro de Lixo: Mostra 2 lixeiras grandes (uma para materiais Reciclados e outra para Não Reciclados).
  - Casinhas: Mostra os 4 pontos de coleta da cidadezinha (Casa 1, Casa 2, Casa 3 e Casa 4), com lixeiras pequenas.
- Coleta por Tipo: Totalizador consolidado das coletas divididas entre Reciclados e Não Reciclados.
- Atividade Recente: Linha do tempo mostrando as últimas ações do carrinho (detecções, coletas efetuadas e locomoção entre trechos).
