const { createApp } = Vue;
const { createVuetify } = Vuetify;
const JSON_PATH = `../assets/db/db.json`;

const vuetify = createVuetify();

const app = createApp({
  data: () => ({
    types: [],
    selectType: null,
    allPareceres: [],
    parecer: "",
    maxCaractere: 0,
    qtdPaginas: 0,
    qtdLinhas: 0,
    paginasFormatadas: [],
    capsLockAtivo: false,
    alertText: false,
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
    listParecer() {
      return this.allPareceres.filter(p => p.type === this.selectType);
    },
  },

  methods: {
    async loadTypes() {
      try {
        const response = await fetch(JSON_PATH);
        if (!response.ok) throw new Error('Erro ao carregar o JSON');
        const data = await response.json();

        this.types = data.types;
        this.allPareceres = data.parecer;
      } catch (error) {
        console.error('Erro ao buscar os pareceres:', error);
      }
    },
    getParecer(item) {
      this.parecer = item.text;
    },
    clear() {
      this.parecer = "";
      this.paginasFormatadas = [];
      this.capsLockAtivo = false;
      this.alertText = false;
    },
    copiarTexto(texto) {
      navigator.clipboard.writeText(texto).then(() => {
        alert('Texto copiado com sucesso!');
      }).catch(() => {
        alert('Erro ao copiar o texto.');
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
    confirmarParecer() {
      const { linhas } = this.formatarTexto(this.parecer);
      if (linhas.length > this.qtdPaginas * this.qtdLinhas) {
        this.paginasFormatadas = [];
        return;
      }

      this.paginasFormatadas = [];
      const maxLinhasPorPagina  = this.qtdLinhas;

      for (let i = 0; i < this.qtdPaginas; i++) {
        const inicio = i * maxLinhasPorPagina;
        const fim = inicio + maxLinhasPorPagina;

        const linhasPagina = linhas.slice(inicio, fim);

        if (linhasPagina.length > 0) {
          this.paginasFormatadas.push(linhasPagina.join('\n'));
        }
    }
    },
    verificarCapsLock(event) {
      this.capsLockAtivo = event.getModifierState && event.getModifierState('CapsLock');
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
    }
  }
});


app.use(vuetify).mount('#app');

