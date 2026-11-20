# Site do GOTT – UFSC

Site do **Grupo de Observação e Transformação do Território (GOTT/UFSC)** — <https://gott.ufsc.br>.

Site estático (HTML + JavaScript, sem etapa de build) com um **painel de edição** em `/admin`
(Sveltia CMS). Todo o conteúdo fica em arquivos JSON na pasta `content/`, versionados no GitHub:
cada alteração feita no painel vira um *commit*, com histórico e possibilidade de desfazer.

## Estrutura

```
index.html            Página inicial
noticias.html         Lista de notícias (busca + filtro por categoria)
noticia.html?n=slug   Página individual de cada notícia
admin/                Painel de edição (index.html + config.yml)
content/              ← conteúdo editável
  site.json             textos do banner, institucional, contato e aviso (pop-up)
  noticias.json         notícias
  membros.json          membros e egressos
  linhas.json           linhas de pesquisa
  projetos.json         projetos de pesquisa
  publicacoes.json      publicações
  eventos.json          agenda e eventos
  parceiros.json        logotipos de parceiros
  links.json            links úteis
assets/
  css/style.css         identidade visual (branco, laranja e grafite #4d4d4d)
  js/app.js             funções comuns, cabeçalho, rodapé, animação
  js/home.js, noticias.js, noticia.js
  img/                  imagens fixas do site
  uploads/              imagens enviadas pelo painel
serve.ps1             servidor local para testes no Windows
```

## Como editar o conteúdo

1. Acesse **`https://<endereço-do-site>/admin/`**.
2. Clique em **“Entrar com token”** e cole um *token* do GitHub (veja abaixo).
3. Edite Notícias, Membros, Acervo ou Página inicial e clique em **Salvar**.
   O painel grava direto no repositório; o site publicado se atualiza em ~1 minuto.

### Criando o token de acesso (uma vez por pessoa)

GitHub → *Settings* → *Developer settings* → *Personal access tokens* → **Fine-grained tokens** → *Generate new token*:

- **Repository access:** *Only select repositories* → este repositório
- **Permissions → Repository → Contents:** *Read and write*
- Validade: a que o grupo preferir (ex.: 1 ano)

Cada editor precisa ser **colaborador** do repositório (Settings → Collaborators).

> Alternativa sem token: login com “Entrar com GitHub” exige um pequeno serviço de autenticação
> OAuth (ex.: [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) no Cloudflare Workers, gratuito).

### Dicas

- **Notícia como rascunho:** desmarque “Publicado”.
- **Destaque na home:** marque “Destacar na página inicial” (aparece entre as 3 primeiras).
- **Egressos:** mude a categoria do membro para “Egresso(a)” — ele vai para a aba Egressos.
- **Aviso (pop-up):** em *Página inicial e contato → Aviso*; defina uma data para ele sumir sozinho.
- **Ícones** das linhas de pesquisa e links: nomes de <https://lucide.dev/icons>.

## Publicação

### Opção A — GitHub Pages (já configurado)

O workflow `.github/workflows/pages.yml` publica o site a cada *push* na branch `main`.
Ative em **Settings → Pages → Source: GitHub Actions**. Para usar o domínio `gott.ufsc.br`,
crie o arquivo `CNAME` com `gott.ufsc.br` e peça à SeTIC/UFSC o apontamento DNS (CNAME para `<usuario>.github.io`).

### Opção B — servidor da UFSC (gott.ufsc.br) por FTP/SFTP — automático

O workflow `.github/workflows/deploy-ufsc.yml` envia o site ao servidor da UFSC a cada
alteração na `main` (inclusive as feitas pelo painel). Antes de cada envio, ele baixa uma
**cópia de segurança** do que está no servidor (fica 30 dias em *Actions → execução → Artifacts*).

Configure uma vez em **Settings → Secrets and variables → Actions → New repository secret**:

| Segredo        | Exemplo                 | Obrigatório |
|----------------|-------------------------|-------------|
| `FTP_HOST`     | `ftp.servidor.ufsc.br`  | sim |
| `FTP_USER`     | `gott`                  | sim |
| `FTP_PASSWORD` | (senha)                 | sim |
| `FTP_DIR`      | `/public_html`          | sim — a pasta onde hoje está o `index.html` |
| `FTP_PROTOCOL` | `sftp`, `ftp` ou `ftps` | não (padrão `sftp`) |
| `FTP_PORT`     | `22`                    | não (padrão 22 no sftp, 21 no ftp) |

Depois, rode manualmente em **Actions → Publicar em gott.ufsc.br → Run workflow** para testar.
Enquanto `FTP_HOST` não existir, o workflow só avisa e não falha.

O envio não apaga arquivos antigos do servidor (só adiciona/atualiza).

## Testar localmente

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Abra <http://localhost:8080>. Em <http://localhost:8080/admin/> dá para usar
**“Trabalhar com repositório local”** (Chrome/Edge) e editar os arquivos da pasta sem GitHub.

## Bibliotecas (via CDN, versões fixadas)

Tailwind CSS 3.4.17 · Lucide 1.61.0 · marked 18.1.1 · DOMPurify 3.4.17 · Sveltia CMS 0.252.0 ·
Fontes: Anton, Space Mono, Inter (Google Fonts).
