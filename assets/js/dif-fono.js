const { createApp } = Vue;
const { createVuetify } = Vuetify;

const vuetify = createVuetify();

const app = createApp({
  ...ParecerCore,
  methods: {
    ...ParecerCore.methods,
    async loadTypes() {
      const response = await fetch('../assets/db/db.json');
      const data = await response.json();
      this.types = data.types;
      this.typesEspecific = data.types_especific;
      this.typesTecnicos = data.types_especific.filter(item => item.type.startsWith("SOCIO_TECNICO"));
      this.allPareceres = data.parecer;
      this.selectType = data.types.find(el => el.link === 'dif-fono').id;
    }
  },
  mounted() {
    this.loadTypes();
    const path = window.location.pathname;
    this.currentPage = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    this.qtdPaginas = 2;
    this.qtdLinhas = 14;
    this.maxCaractere = this.qtdPaginas * this.qtdLinhas * 76;
  }
});

app.use(vuetify).mount('#app');