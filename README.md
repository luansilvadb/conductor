# Conductor

O framework definitivo para trabalhar com IA em código (Cursor, Claude Code, Antigravity, Trae).
Pare de debugar alucinações. Force a IA a planejar, executar e testar com disciplina.

## Comece em 1 Comando

Na raiz do seu projeto, rode (requer Node 20.11+):

```bash
npx github:luansilvadb/conductor
```

> **Dica:** adicione no seu `~/.zshrc` ou `~/.bashrc`:
> `alias conductor="npx github:luansilvadb/conductor"`

Ele detecta sua ferramenta de IA e instala as **Skills** (comandos que sua IA entende) automaticamente.

---

## Como Usar (O Fluxo Diário)

Abra o chat da sua ferramenta de IA e invoque as skills na ordem abaixo. Todo o histórico, regras e decisões ficarão salvos na pasta `conductor/` do seu projeto.

### 1. Iniciar o projeto (Apenas a 1ª vez)
> **Você:** "Execute o `conductor-setup` para criar um app de todo list em React."

A IA vai analisar a ideia e registrar a visão, as regras (UX, testes) e a stack tecnológica no diretório do Conductor.

### 2. Planejar uma tarefa
> **Você:** "Execute o `conductor-new-track` para a funcionalidade de login."

Zero código gerado aqui. A IA vai apenas criar uma especificação (`spec.md`) e um plano de ação passo a passo (`plan.md`).

### 3. Escrever o código
> **Você:** "Execute o `conductor-implement`."

Agora sim. A IA vai ler o plano que acabou de fazer, programar seguindo testes (TDD), marcar o que terminou (`[x]`) no documento e comitar no Git mantendo a rastreabilidade.

### 4. Revisar e Finalizar
> **Você:** "Execute o `conductor-review`."

A IA assume o papel de um tech lead: revisa o próprio código contra as regras iniciais do projeto, garante a qualidade e encerra a track.

---

## Outras Skills Úteis (Peça à IA)

- **`conductor-status`**: Mostra o que já foi feito, % de conclusão, o que falta e bloqueios.
- **`conductor-revert`**: A IA fez bagunça? Invoque essa skill e ela desfaz com precisão (usando git notes) todos os commits e mudanças apenas da track atual.
- **`conductor-archive`**: Limpa a área de trabalho arquivando tarefas já finalizadas.

---

## CLI (Uso Manual no Terminal)

Se quiser mexer nas configurações via terminal ao invés de usar o assistente `npx`:

```bash
conductor                # Inicia o modo assistente interativo
conductor generate       # Atualiza as skills se você mudar de IDE
conductor --tool trae    # Força a instalação para o Trae (ou cursor, claude-code)
conductor list           # Lista as skills instaladas
conductor uninstall      # Remove o framework do projeto
```

---

## Contribuindo (Dev)

Para mexer no código-fonte do próprio Conductor:

```bash
git clone https://github.com/luansilvadb/conductor.git
cd conductor
npm install
npm run build      # Gera dist/index.cjs (single-file bundle)
npm link           # Disponibiliza `conductor` globalmente para testes
```

Licença MIT.
