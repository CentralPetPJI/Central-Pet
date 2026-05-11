# Política de Segurança

## Versões Suportadas

O Central-Pet ainda está em desenvolvimento inicial e não possui uma série estável de versões públicas. Os pacotes do monorepo indicam versões `0.0.x`, e as tags locais existentes usam datas em vez de uma política formal de releases semânticas.

Por esse motivo, correções de segurança são mantidas apenas na linha ativa de desenvolvimento. Não há suporte retroativo para forks, ambientes locais antigos ou tags históricas, salvo decisão explícita da equipe em uma versão futura.

| Linha / versão                        | Suportada |
| ------------------------------------- | --------- |
| Branch `main`                         | ✅        |
| Branches de feature ou correção       | ❌        |
| Tags históricas sem release semântica | ❌        |
| Builds locais ou forks não revisados  | ❌        |

## Relatando uma Vulnerabilidade

Não reporte vulnerabilidades em issues públicas. Para evitar exposição indevida de dados, credenciais, endpoints ou detalhes de exploração, envie o relato por um canal privado.

Canal recomendado:

- E-mail: `central.pet.adote@gmail.com`

O e-mail acima é fictício e deve ser substituído pelo contato oficial da equipe antes da publicação do projeto. Se o repositório estiver com GitHub Security Advisories habilitado, esse canal também pode ser usado para reportes privados.

Ao reportar, inclua quando possível:

- descrição clara do problema;
- passos para reproduzir;
- impacto esperado;
- arquivos, rotas, workflows ou endpoints afetados;
- evidências mínimas, como logs, capturas de tela ou payloads de prova de conceito;
- indicação se houve acesso a dados pessoais, credenciais ou informações sensíveis.

Após o recebimento, a equipe deve:

- confirmar o recebimento em até 3 dias úteis;
- avaliar impacto, severidade e reprodutibilidade;
- informar atualizações relevantes pelo menos a cada 7 dias corridos enquanto o caso estiver aberto;
- corrigir a vulnerabilidade na linha suportada quando o reporte for aceito;
- informar o motivo quando o reporte for recusado, por exemplo por não ser reproduzível, estar fora de escopo ou não representar risco de segurança.

São considerados dentro do escopo:

- falhas de autenticação, autorização ou controle de sessão;
- exposição indevida de dados pessoais ou dados de adoção;
- injeção, execução indevida de comandos ou manipulação de workflows do GitHub Actions;
- vulnerabilidades em dependências usadas pelo frontend, backend ou testes E2E;
- falhas que permitam alteração não autorizada de issues, código, dados ou infraestrutura.

São considerados fora do escopo, salvo demonstração de impacto real:

- problemas que dependam exclusivamente de ambiente local inseguro;
- ataques de negação de serviço sem prova de impacto relevante;
- achados automatizados sem caminho de exploração;
- ausência de cabeçalhos ou configurações sem impacto demonstrado;
- vulnerabilidades em forks ou implantações modificadas fora do controle do projeto.

Pedimos que qualquer teste seja limitado ao necessário para comprovar o problema, sem acessar, alterar, excluir ou divulgar dados de terceiros.
