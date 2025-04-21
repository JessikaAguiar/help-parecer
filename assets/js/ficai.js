const { createApp } = Vue;
const { createVuetify } = Vuetify;
const JSON_PATH = `../assets/db/db.json`;

const vuetify = createVuetify();

const app = createApp({
  data: () => ({
    dialog: false,
    types: [],
    titleDrawer: '',
    drawer: false,
    typesEspecific: [],
    selectType: null,
    allPareceres: [],
    parecerFilter: [],
    parecer: "",
    currentPage: '',
    parecerFicai: {situacao: '', orientacao: ''},
    maxCaractere: 0,
    qtdPaginas: 0,
    qtdLinhas: 0,
    paginasFormatadas: [],
    capsLockAtivo: false,
    alertText: false,
    showFicaiOrientacao: false,
    showFicaiSituacao: false,
    snackbar: {
      status: false,
      text: ''
    },
    alertas: {
      situacao: false,
      orientacaoFicai: false,
    },
    capsLockCampos: {
      situacao: false,
      orientacaoFicai: false,
    },
  }),
  watch: {
    parecer(value) {
      if (value.length > 0) {
        const { linhas } = this.formatarTexto(this.parecer);
        const totalPermitido = this.qtdPaginas * this.qtdLinhas;
        this.alertText = linhas.length > totalPermitido;
      } else {
        this.paginasFormatadas = [];
      }
    }
  },
  mounted() {
    this.loadTypes();
    const path = window.location.pathname;
    this.currentPage = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    this.qtdPaginas = 1;
    this.qtdLinhas = 10;
    this.maxCaractere = this.qtdPaginas * this.qtdLinhas * 76;
  },
  computed: {
    botaoDesabilitado() {
      // 1. Se algum alerta de limite estiver ativo
      const alertaAtivo = Object.values(this.alertas).some(alerta => alerta === true);
  
      // 2. Verificar campos obrigatórios
      const camposPreenchidos =
          this.parecerFicai.situacao.trim().length > 0 ||
          this.parecerFicai.orientacao.trim().length > 0;
  
      return alertaAtivo || !camposPreenchidos;
    }
  },

  methods: {
    async loadTypes() {
      try {
        const response = await fetch(JSON_PATH);
        if (!response.ok) throw new Error('Erro ao carregar o JSON');
        const data = await response.json();

        this.types = data.types;
        this.selectType = data.types.find(el => el.link === 'aluno-infre').id
        this.typesEspecific = data.types_especific;
        this.allPareceres = data.parecer;
      } catch (error) {
        console.error('Erro ao buscar os pareceres:', error);
      }
    },
    getTypeEspecific(type) {
      return this.typesEspecific.find(p => p.type === type)
    },
    getAllParecerByEspecific(typeKey) {
      const type = this.getTypeEspecific(typeKey);
      return this.allPareceres.filter(p => p.type === this.selectType && p.type_especific === type?.id);
    },
    getParecer(item) {
      this.parecer = item.text;
    },
    clear() {
      this.parecer = "";
      this.parecerFicai = {situacao: '', orientacao: ''},
      this.selectTypeTecnicos = null,
      this.showFicaiSituacao = false
      this.showFicaiOrientacao = false
      this.paginasFormatadas = [];
      this.capsLockAtivo = false;
      this.alertText = false;
    },
    copiarTexto(texto) {
      navigator.clipboard.writeText(texto).then(() => {
        this.snackbar.status = true;
        this.snackbar.text = 'Texto copiado com sucesso.'
      }).catch(() => {
        this.snackbar.status = true;
        this.snackbar.text = 'Erro ao copiar o texto.'
      });
    },
    formatarTexto(texto) {
      const maxCaracteres = 76;
      const palavras = texto.split(/\s+/);
      const linhas = [];
      let linhaAtual = '';
    
      for (const palavra of palavras) {
        if (palavra.length > maxCaracteres) {
          if (linhaAtual) {
            linhas.push(linhaAtual.trim());
            linhaAtual = '';
          }
          linhas.push(palavra); // adiciona a palavra gigante sozinha
        } else if ((linhaAtual + ' ' + palavra).trim().length <= maxCaracteres) {
          linhaAtual += ' ' + palavra;
        } else {
          linhas.push(linhaAtual.trim());
          linhaAtual = palavra;
        }
      }

      if (linhaAtual) {
        linhas.push(linhaAtual.trim());
      }

      return { linhas };
    },
    processarCampo(texto) {
      const { linhas } = this.formatarTexto(texto);
      const maxLinhasPorPagina = this.qtdLinhas;
      const paginas = [];
  
      const totalPaginas = Math.ceil(linhas.length / maxLinhasPorPagina);
      for (let i = 0; i < totalPaginas; i++) {
        const inicio = i * maxLinhasPorPagina;
        const fim = inicio + maxLinhasPorPagina;
        const linhasPagina = linhas.slice(inicio, fim);
        if (linhasPagina.length > 0) {
          paginas.push(linhasPagina.join('\n'));
        }
      }
      return paginas;
    }, 
    confirmarParecer() {
      this.paginasFormatadas = [];
      this.paginasFormatadas.push(
          { titulo: 'Situação Observada', paginas: this.processarCampo(this.parecerFicai.situacao) },
          { titulo: 'Orientações Dadas à Família', paginas: this.processarCampo(this.parecerFicai.orientacao) }
        );
      this.dialog = true;
    },
    openDrawer(type) {
      this.drawer = true
      this.showFicaiSituacao = type ===  'FICAI_SITUACAO'
      this.showFicaiOrientacao = type ===  'FICAI_ORIENTACAO'
      this.parecerFilter = this.getAllParecerByEspecific(type)
      if(this.showFicaiSituacao) {
        this.titleDrawer = "Modelos de Situação Observada"
      } else {
        this.titleDrawer = "Modelos de Orientações Dadas à Família"
      }
    },
    handleNavigation(link) {
      if (this.currentPage !== link) {
        window.location.href = `${link}.html`;
      }
    },
    scrollParaSituacao(texto) {
      this.parecerFicai.situacao = texto;

      this.$nextTick(() => {
        const anchor = document.getElementById('situacao-anchor');
        if (anchor) {
          const y = anchor.getBoundingClientRect().top + window.scrollY - 80;
          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    scrollParaOritencao(texto) {
      this.parecerFicai.orientacao = texto;

      this.$nextTick(() => {
        const anchor = document.getElementById('orientacao-anchor');
        if (anchor) {
          const y = anchor.getBoundingClientRect().top + window.scrollY - 80;
          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    verificarCapsLock(event, campo) {
      this.capsLockCampos[campo] = event.getModifierState && event.getModifierState('CapsLock');
    },    
    verificarLimite(texto, campo) {
      const { linhas } = this.formatarTexto(texto);
      const totalPermitido = this.qtdPaginas * this.qtdLinhas;
      this.alertas[campo] = linhas.length > totalPermitido;
    }
  }
});


app.use(vuetify).mount('#app');

