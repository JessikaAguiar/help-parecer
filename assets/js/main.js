const { createApp } = Vue;
const { createVuetify } = Vuetify;

const vuetify = createVuetify();

const app = createApp({
  data: () => ({
    types: [],
  }),
  mounted() {
    this.loadTypes();
  },
  methods: {
    async loadTypes() {
      try {
        const response = await fetch('./assets/db/db.json');
        if (!response.ok) throw new Error('Erro ao carregar o JSON');
        const data = await response.json();
        this.types = data.types;
      } catch (error) {
        console.error('Erro ao buscar os pareceres:', error);
      }
    }
  }
});


app.use(vuetify).mount('#app');

