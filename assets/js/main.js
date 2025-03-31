const { createApp } = Vue;
const { createVuetify } = Vuetify;
const JSON_PATH = `../assets/db/db.json`;

const vuetify = createVuetify();

const app = createApp({
  data: () => ({
    types: [],
    typesEspecific: [],
    TypesTecnicos: [],
    selectType: null,
    selectTypeTecnicos: null,
    allPareceres: [],
    parecer: "",
    parecerFicai: {situacao: '', orientacao: ''},
    parecerSocio: {equipe: '', tecnico: '', orientacao: ''},
    maxCaractere: 0,
    qtdPaginas: 0,
    qtdLinhas: 0,
    paginasFormatadas: [],
    capsLockAtivo: false,
    alertText: false,
    showFicaiOrientacao: false,
    showFicaiSituacao: false,
    showSocioEquipe: false,
    showSocioTecnico: false,
    showSocioOrientacao: false,
    snackbar: {
      status: false,
      text: ''
    },
    alertas: {
      situacao: false,
      orientacaoFicai: false,
      equipe: false,
      tecnico: false,
      orientacaoSocio: false,
    },
    capsLockCampos: {
      situacao: false,
      orientacaoFicai: false,
      equipe: false,
      tecnico: false,
      orientacaoSocio: false
    },
  }),

  mounted() {
    this.loadTypes();
    this.maxCaractere = this.caracteFicai;
  },
  watch: {
    selectType(value) {
      if (value === '75989fa6-aefb-4ed4-839b-916ce722f791') {
        this.qtdPaginas = 1;
        this.qtdLinhas = 10;
      } else {
        this.qtdPaginas = 2;
        this.qtdLinhas = 14;
      }
      this.maxCaractere = this.qtdPaginas * this.qtdLinhas * 77;
      this.clear();
    },
    parecer(value) {
      if(value.length > 0 ) {
        const { linhas } = this.formatarTexto(this.parecer);
        const totalPermitido = this.qtdPaginas * this.qtdLinhas;
        this.alertText = linhas.length > totalPermitido;
      } else {
        this.paginasFormatadas = [];
      }
      
    }
  },
  computed: {
    botaoDesabilitado() {
      // 1. Se algum alerta de limite estiver ativo
      const alertaAtivo = Object.values(this.alertas).some(alerta => alerta === true);
  
      // 2. Verificar campos obrigatórios
      if (this.selectType === '75989fa6-aefb-4ed4-839b-916ce722f791') {
        // FICAI
        const camposPreenchidos =
          this.parecerFicai.situacao.trim().length > 0 ||
          this.parecerFicai.orientacao.trim().length > 0;
  
        return alertaAtivo || !camposPreenchidos;
      } else {
        // SOCIO
        const camposPreenchidos =
          this.parecerSocio.equipe.trim().length > 0 ||
          this.parecerSocio.tecnico.trim().length > 0 ||
          this.parecerSocio.orientacao.trim().length > 0;
  
        return alertaAtivo || !camposPreenchidos;
      }
    }
  },

  methods: {
    async loadTypes() {
      try {
        const response = await fetch(JSON_PATH);
        if (!response.ok) throw new Error('Erro ao carregar o JSON');
        const data = await response.json();

        this.types = data.types;
        this.typesEspecific = data.types_especific;
        this.typesTecnicos = data.types_especific.filter(item => item.type.startsWith("SOCIO_TECNICO"));
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
      return this.allPareceres.filter(p => p.type_especific === type?.id);
    },
    getParecer(item) {
      this.parecer = item.text;
    },
    clear() {
      this.parecer = "";
      this.parecerFicai = {situacao: '', orientacao: ''},
      this.parecerSocio = {equipe: '', tecnico: '', orientacao: ''},
      this.selectTypeTecnicos = null,

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
      const maxCaracteres = 77;
      const palavras = texto.split(' ');
      const linhas = [];
      let linhaAtual = '';
    
      for (const palavra of palavras) {
        if ((linhaAtual + ' ' + palavra).trim().length <= maxCaracteres) {
          linhaAtual += ' ' + palavra;
        } else {
          linhas.push(linhaAtual.trim());
          linhaAtual = palavra;
        }
      }
    
      if (linhaAtual) linhas.push(linhaAtual.trim());
    
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
      if (this.selectType === '75989fa6-aefb-4ed4-839b-916ce722f791') {
        // FICAI
        this.paginasFormatadas.push(
          { titulo: 'Situação Observada', paginas: this.processarCampo(this.parecerFicai.situacao) },
          { titulo: 'Orientações Dadas à Família', paginas: this.processarCampo(this.parecerFicai.orientacao) }
        );
      } else {
        // SOCIO
        this.paginasFormatadas.push(
          { titulo: 'Parecer da Equipe Multiprofissional', paginas: this.processarCampo(this.parecerSocio.equipe) },
          { titulo: 'Parecer Técnico', paginas: this.processarCampo(this.parecerSocio.tecnico) },
          { titulo: 'Orientações Finais', paginas: this.processarCampo(this.parecerSocio.orientacao) }
        );
      }
    },
    confirmarParecerGeral() {
      const { linhas } = this.formatarTexto(this.parecer);
      this.paginasFormatadas = [];

      const maxLinhasPorPagina = 10;
      const totalPaginas = Math.ceil(linhas.length / maxLinhasPorPagina);

      for (let i = 0; i < totalPaginas; i++) {
        const inicio = i * maxLinhasPorPagina;
        const fim = inicio + maxLinhasPorPagina;

        const linhasPagina = linhas.slice(inicio, fim);
        if (linhasPagina.length > 0) {
          this.paginasFormatadas.push(linhasPagina.join('\n'));
        }
      }
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

