import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import es from 'vuetify/es5/locale/es';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    // Carga la preferencia guardada por el usuario (default: modo claro)
    dark: localStorage.getItem('dark') === 'true',
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: '#224688',
        secondary: '#FF6A13',
        accent: '#26c6da',
      },
      dark: {
        primary: '#5C8AE6',
        secondary: '#FF6A13',
        accent: '#26c6da',
      },
    },
  },
  lang: {
    locales: { es },
    current: 'es',
  },
  icons: {
    iconfont: 'md',
  },
});
