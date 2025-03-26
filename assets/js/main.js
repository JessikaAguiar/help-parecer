const { createApp } = Vue;
const { createVuetify } = Vuetify;
const JSON_PATH = `assets/db/db.json`;

const vuetify = createVuetify();

const app = createApp({
  data: () => ({
    types: [],
    selectType: null,
    allPareceres: [],
    parecer: "",
    caractereSocio: 2156,
    caractereFicai: 770,
    maxCaractere: 0,
    qtdPaginas: 0,
    qtdLinhas: 0,
    paginasFormatadas: [],
  }),

  mounted() {
    this.loadTypes();
    this.maxCaractere = this.caracteFicai;
  },
  watch: {
    selectType(value) {
      if (value === '75989fa6-aefb-4ed4-839b-916ce722f791') {
        this.maxCaractere = this.caractereFicai;
        this.qtdPaginas = 1;
        this.qtdLinhas = 10;
      } else {
        this.maxCaractere = this.caractereSocio;
        this.qtdPaginas = 2;
        this.qtdLinhas = 14;
      }
      this.clear();
    },
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
      const maxLinhasPorPagina = 14;
      const maxPaginas = 2;
      const maxTotalLinhas = this.qtdLinhas;

      this.paginasFormatadas = [];

  for (let i = 0; i < maxPaginas; i++) {
    const inicio = i * maxLinhasPorPagina;
    const fim = inicio + maxLinhasPorPagina;

    const linhasPagina = linhas.slice(inicio, fim);

    // Se não houver mais conteúdo, pare
    if (!linhasPagina.length) break;

    this.paginasFormatadas.push(linhasPagina.join('\n'));
  }
    }
  }
});


app.use(vuetify).mount('#app');

