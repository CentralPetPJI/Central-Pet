# Contribuindo com o Central-Pet 🐾

Bem-vindo(a) ao Central-Pet! Ficamos felizes com seu interesse em ajudar a construir uma plataforma melhor para conectar pets abandonados a pessoas incríveis. Toda contribuição é muito bem-vinda, seja código, documentação, sugestões ou divulgação!

## ✨ Como contribuir

1. **Faça um clone** deste repositório para sua máquina.
   ```bash
   git clone https://github.com/CentralPetPJI/Central-Pet
   ```
2. Antes de rodar comandos do projeto, habilite o [Corepack](https://nodejs.org/api/corepack.html) para garantir que o gerenciador de pacotes correto (pnpm) será usado, conforme especificado no `packageManager` do `package.json`:
   ```bash
   corepack enable
   corepack install
   ```
   > Isso evita instalar o pnpm globalmente e garante compatibilidade. Após esse passo, use os comandos normalmente com `pnpm`.
   > Se preferir, você pode usar `npm`, mas o padrão do projeto é pnpm.
3. Crie uma branch descritiva para sua contribuição:
   ```bash
   git checkout -b feat/nome-da-feature
   ```
4. Faça suas alterações seguindo as boas práticas do projeto.
5. Teste localmente para garantir que tudo funciona.
6. Faça commits claros e objetivos (veja o padrão abaixo).
7. Envie um Pull Request (PR) explicando sua contribuição.

## ✅ Checklist para contribuir

- [ ] Rode `pnpm install` para instalar dependências
- [ ] Teste sua alteração localmente (`pnpm dev`)
- [ ] Atualize a documentação se necessário
- [ ] Preencha o título e descrição do PR de forma clara

## 📝 Padrão de commits (conventional commits)

Utilize o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) para facilitar o entendimento do histórico:

Exemplos:

- `feat: adicionar página de adoção`
- `fix: corrigir bug no formulário de denúncia`
- `docs: atualizar README com novas instruções`
- `refactor: melhorar lógica do Carousel`

## 🌐 Idioma do projeto

- Documentações, Mensagens de commit e comentários no código: português
- Código, nomes de variáveis, funções, componentes e identificadores: inglês

## 🚩 Como abrir uma issue

1. Verifique se já existe uma issue semelhante.
2. Descreva claramente o problema, sugestão ou dúvida.
3. Inclua prints, logs ou exemplos se possível.

## 🚀 Como enviar um Pull Request

1. Certifique-se de que sua branch está atualizada com a `main`.
2. Preencha o template do PR explicando o que foi feito e por quê.
3. Aguarde a revisão e responda aos comentários dos mantenedores.

## 🖥️ Rodar localmente ou em contêiner?

Neste projeto, as duas opções funcionam bem para desenvolvimento. O `docker-compose.dev.yml` monta o código com bind mount e executa o frontend com hot reload, então você pode editar localmente e ver as mudanças refletidas no contêiner sem perder produtividade.

Rodar localmente ainda pode ser útil quando você quer integração direta com as ferramentas da sua máquina, menor camada de abstração e um ciclo de depuração mais direto.

Rodar em contêiner é útil quando você quer manter o ambiente padronizado, evitar diferenças entre máquinas e garantir que a versão do Node e as dependências usadas sejam as mesmas para todo mundo.

Em resumo:

- Use localmente se quiser depender do seu ambiente e das ferramentas já configuradas na sua máquina.
- Use o contêiner de desenvolvimento se quiser trabalhar com hot reload, mas com mais isolamento e previsibilidade no ambiente.

## 💡 Dicas para um código de qualidade

- Use TypeScript estrito (`strict: true`)
- Prefira funções puras e componentes pequenos
- Evite `any`; use `unknown` + type guards se necessário
- Sempre adicione JSDoc em funções utilitárias e hooks customizados
- Não confie apenas na validação do frontend em formulários
- Siga o padrão de pastas e nomes do projeto

## 🤝 Contato e agradecimentos

Dúvidas? Sugestões? Fale com a gente abrindo uma issue ou pelo e-mail do mantenedor principal.

Obrigado por ajudar a construir o Central-Pet! Sua contribuição faz a diferença na vida de muitos pets e pessoas. 🐶🐱

---

Ajude-nos a crescer! Contribua com uma feature, reporte bugs ou compartilhe o projeto. Adote com responsabilidade 🐾
