<template>
  <v-container fluid class="pa-6" :style="{ backgroundColor: isDark ? '#121212' : '#f5f6f8', minHeight: '100vh' }">

    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold" :style="{ color: isDark ? '#FFFFFF' : '#224688' }">
        Accesos Directos
      </h2>
      <v-divider class="mt-2"></v-divider>
    </div>

    <v-row v-for="(menu, index) in doneMenu" :key="index" class="mb-6">
      
      <v-col cols="12" class="pb-0">
        <div class="d-flex align-center mb-2">
          <v-icon color="#FF6A13" class="mr-2">label</v-icon>
          <span class="subtitle-1 font-weight-bold grey--text text--darken-2 text-uppercase">
            {{ menu.Tag }}
          </span>
        </div>
      </v-col>

      <v-col
        v-for="(item, i) in menu.SubMenu"
        :key="i"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="pa-3"
      >
        <v-hover v-slot="{ hover }">
          <v-card
            class="ravisa-card fill-height"
            :elevation="hover ? 8 : 2"
            :color="isDark ? '#1E1E1E' : 'white'"
            :to="{
              path: item.Path,
              props: { title: item.Tag },
            }"
          >
            <div class="ravisa-accent"></div>

            <v-card-text class="d-flex flex-column align-center justify-center py-6">

              <v-avatar :color="isDark ? 'indigo darken-3' : 'indigo lighten-5'" size="70" class="mb-4">
                <v-icon size="32" :color="isDark ? '#FFFFFF' : '#224688'">
                  {{ getIcon(item.Tag) }}
                </v-icon>
              </v-avatar>

              <div
                class="text-center font-weight-medium title"
                :style="{ color: isDark ? '#FFFFFF' : '#224688', lineHeight: 1.2 }"
              >
                {{ item.Tag }}
              </div>

              <div class="caption grey--text mt-2">
                Ir a sección
              </div>

            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  // Agregamos data() vacío para evitar errores de compatibilidad
  data() {
    return {};
  },
  computed: {
    ...mapGetters("config", ["doneMenu"]),
    isDark() {
      return this.$vuetify.theme.isDark;
    },
  },
  methods: {
    getIcon(tagName) {
      const iconMap = {
        'Dispersion': 'account_balance_wallet',
        'Dispersión': 'account_balance_wallet',
        'Pagos generados': 'receipt',
        'Pagos Generados': 'receipt',
        'Control Summary': 'insert_chart',
        'Referencias': 'folder_open',
        'Cierre Mensual Referencias': 'event_note',
        'Cierre Mensual': 'date_range'
      };
      // Retorna el icono mapeado o una flecha por defecto
      return iconMap[tagName] || 'arrow_forward';
    }
  }
};
</script>

<style scoped>
.ravisa-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 12px !important;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.theme--dark .ravisa-card {
  border: 1px solid rgba(255,255,255,0.08);
}

.ravisa-card:hover {
  transform: translateY(-5px);
}

.ravisa-accent {
  height: 6px;
  background: #FF6A13;
  width: 100%;
}
</style>