# 💈 Projeto Agendamentos - Barbearia

Sistema simples de visualização e gerenciamento de agendamentos, feito com HTML, CSS, jQuery e Bootstrap.

---

## 🚀 Como rodar localmente (modo desenvolvimento)

Este projeto pode ser executado com o **Live Server** do VS Code.

### ✅ Pré-requisitos

- VS Code instalado
- Extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) instalada

### ▶️ Passos

1. Clone o repositório ou baixe os arquivos
2. Abra a pasta do projeto no VS Code
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**
4. O navegador abrirá em algo como:  
   `http://127.0.0.1:5500/`

---

## 🌐 Navegação no navegador

Este projeto usa **estrutura de pastas com `index.html`** para permitir URLs amigáveis (sem `.html` na URL):

| Rota                                | Página carregada                     |
|-------------------------------------|--------------------------------------|
| `/`                                 | `index.html`                         |
| `/agendamentos/`                    | `agendamentos/index.html`           |
| `/profissionais/` _(exemplo)_       | `profissionais/index.html` _(exemplo)_ |

> 🔄 Importante: **Sempre acesse com `/` no final da URL** (ex: `/agendamentos/`) para garantir carregamento correto.

---

## 📁 Estrutura de pastas recomendada

/index.html
/agendamentos/index.html
/profissionais/index.html
/css/
/js/
