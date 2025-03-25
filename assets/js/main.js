const { createApp } = Vue;
const { createVuetify } = Vuetify;

const vuetify = createVuetify();

const app = createApp({
  data: () => ({
    message: 'Olá Vuetify!'
  })
});

app.use(vuetify).mount('#app');

