<template>
  <v-app id="inspire" :style="{ backgroundColor: $vuetify.theme.isDark ? '#121212' : '#f5f6f8' }">
    
    <v-navigation-drawer 
      v-model="drawer"
      :mini-variant="mini"
      fixed 
      app 
      class="elevation-2"
      width="280"
    >
    <v-sheet 
        color="#224688" 
        dark 
        :class="mini ? 'pa-0 d-flex justify-center align-center' : 'pa-4 d-flex align-center'"
        style="height: 64px; transition: all 0.2s;"
      >
        
        <v-row align="center" no-gutters v-if="!mini">
          <v-col cols="3">
            <v-img
              :src="require('@/assets/logo_ravisa.png')"
              max-height="40"
              max-width="60"
              contain
              position="left center"
            ></v-img>
          </v-col>
          <v-col cols="9" class="pl-2">
            <div class="subtitle-1 font-weight-bold text-truncate">Portal RAVISA</div>
            <div class="caption opacity-70 text-truncate">Logística & Aduanas</div>
          </v-col>
        </v-row>

        <v-img
          v-else
          :src="require('@/assets/logo_ravisa.png')"
          max-height="36"
          max-width="36"
          contain
        ></v-img>

      </v-sheet>

      <v-divider></v-divider>

      <v-list-item 
          to="/" 
          :class="mini ? 'justify-center mb-1' : 'rounded-lg mb-1'"
          :active-class="mini ? 'orange--text text--darken-2' : 'dashboard-active'"
        >
          <v-list-item-icon :class="mini ? 'ma-0' : 'mr-3'">
            <v-icon>dashboard</v-icon> 
          </v-list-item-icon>
          
          <v-list-item-content v-if="!mini">
            <v-list-item-title class="font-weight-bold subtitle-2">
              Panel Principal
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      <v-divider></v-divider>

      <v-list dense expand nav v-for="menu in doneMenu" :key="menu.Id">
        <v-list-group 
          no-action 
          exact-path 
          :value="false"
          active-class="orange--text text--darken-2"
        >
          <template #activator>
            <v-list-item-icon>
              <v-icon>{{ menu.Icon || 'mdi-folder-outline' }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium text-uppercase caption text--secondary"> 
                {{ menu.Tag }} 
              </v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item-group color="#FF6A13"> <v-list-item
              v-model="selectedItem"
              v-for="sub in menu.SubMenu"
              :key="sub.Id"
              exact-path
              :to="sub.Path"
              @click="navegar(sub)"
              class="pl-8" 
              active-class="corporate-active-subitem"
            >
              <v-list-item-icon class="mr-2">
                <v-icon small>mdi-chevron-right</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ sub.Tag }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item 
              v-if="menu.Tag == 'Informes'" 
              @click="descargarGlobalManual"
              style="cursor: pointer;"
            >
              <v-list-item-icon class="mr-2">
                <v-icon color="#FF6A13">mdi-cloud-download</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="orange--text text--darken-2 font-weight-bold">
                  Descargar Global
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list-group>
      </v-list>

      <template v-slot:append>
        <div class="pa-2 text-center caption grey--text">
          <strong>@mm v5.0 | {{ new Date().getFullYear() }}</strong>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app fixed id="appbar" color="#224688" dark elevation="1">
      <v-app-bar-nav-icon @click="mini = !mini"></v-app-bar-nav-icon>

      <v-toolbar-title class="d-flex flex-column">
        <span class="subtitle-1 font-weight-bold">Portal RAVISA</span>
        <span class="caption blue-grey--text text--lighten-4" style="margin-top: -4px;">
          Bienvenido, {{user}}
        </span>
      </v-toolbar-title>
      
      <v-spacer></v-spacer>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn @click="darkMode" icon v-bind="attrs" v-on="on" class="theme-toggle">
            <v-icon class="theme-toggle-icon">
              {{ $vuetify.theme.isDark ? "brightness_7" : "brightness_4" }}
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $vuetify.theme.isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro" }}</span>
      </v-tooltip>
      
      <!-- Menú de usuario / cerrar sesión -->
      <v-menu offset-y left min-width="240" transition="slide-y-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn text class="text-none ml-2" v-bind="attrs" v-on="on">
            <v-avatar color="#FF6A13" size="34" class="mr-2">
              <span class="white--text font-weight-bold">{{ userInitial }}</span>
            </v-avatar>
            <span class="d-none d-sm-inline">{{ user }}</span>
            <v-icon right small>expand_more</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item>
            <v-list-item-avatar color="#224688">
              <span class="white--text font-weight-bold">{{ userInitial }}</span>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">{{ user }}</v-list-item-title>
              <v-list-item-subtitle class="green--text text--darken-1">
                <v-icon x-small color="green darken-1">fiber_manual_record</v-icon>
                Sesión activa
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="confirmLogout = true">
            <v-list-item-icon class="mr-3">
              <v-icon color="red darken-1">logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="red--text text--darken-1 font-weight-medium">
                Cerrar sesión
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Diálogo de confirmación de cierre de sesión -->
    <v-dialog v-model="confirmLogout" max-width="380" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="text-h6">
          <v-icon color="red darken-1" class="mr-2">logout</v-icon>
          Cerrar sesión
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas cerrar la sesión de <strong>{{ user }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="confirmLogout = false">Cancelar</v-btn>
          <v-btn color="red darken-1" dark depressed @click="salir">
            <v-icon left small>logout</v-icon>Cerrar sesión
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-main>
      <v-container fluid class="pa-6"> <v-fade-transition appear>
          <router-view />
        </v-fade-transition>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "MainLayout",
  data: () => ({
    selectedItem: 1,
    drawer: true,
    mini: false, // Controla si el menú está pequeño o grande
    confirmLogout: false,
    user: localStorage.getItem("user")
  }),
  methods: {
    ...mapActions("config", ["getMenu"]),

    salir() {
      // Limpia toda la información de sesión
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      localStorage.removeItem("pass");
      localStorage.removeItem("routeid");
      localStorage.removeItem("b1session");
      localStorage.removeItem("nextUrl");
      this.confirmLogout = false;
      this.$router.push({ name: "login" }).catch(() => {});
    },

    darkMode() {
      this.$vuetify.theme.isDark = !this.$vuetify.theme.isDark;
      localStorage.setItem("dark", this.$vuetify.theme.isDark);
    },

    navegar(item) {
      this.$store.commit("informes/SET_TITLE", item.Tag);
      this.$router.push({ path: item.Path, params: item.id });
    },


async descargarGlobalManual() {
      // 1. Definir FECHA INICIAL fija: 1 de Enero de 2023
      const fechaInicio = '20230101'; 

      // 2. Calcular FECHA FINAL: Día de hoy (Dinámico)
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0'); // Mes con 2 dígitos
      const dd = String(hoy.getDate()).padStart(2, '0');      // Día con 2 dígitos
      
      const fechaFin = `${yyyy}${mm}${dd}`; // Ejemplo: "20260126"

      // 3. Obtener la URL base del Store
      const baseUrl = this.$store.state.referencia.urldownload;
      
      // 4. Armar la URL completa con los parámetros
      // Nota: Usamos fechaI y fechaF porque así se llaman las variables en tu Controller C#
      const urlCompleta = `${baseUrl}?fechaI=${fechaInicio}&fechaF=${fechaFin}`;

      try {
        console.log("Iniciando descarga global...");
        console.log("Ruta:", urlCompleta);
        
        // 5. Abrir en nueva pestaña para forzar la descarga
        window.open(urlCompleta, '_blank');

      } catch (error) {
        console.error("Error al intentar descargar:", error);
        alert("Hubo un problema al conectar con el servidor de reportes.");
      }
    },
    
  },
  computed: {
    ...mapGetters("config", ["doneMenu"]),
    userInitial() {
      return (this.user || "?").toString().trim().charAt(0).toUpperCase();
    },
    urldownload() {
      return this.$store.state.referencia.urldownload;
    },
  },
  mounted() {
    this.getMenu();
  },
};
</script>

<style scoped>

.corporate-active-item {
  background-color: #eef2f8 !important; 
  color: #224688 !important; 
  border-right: 4px solid #FF6A13; 
}

.corporate-active-subitem {
  color: #FF6A13 !important; 
  font-weight: 600;
  background-color: transparent !important;
}

.theme--dark .corporate-active-item {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}

.dashboard-active {
  background-color: #E3F2FD !important;
  color: #224688 !important;
  border: 1px solid #224688;
}

.dashboard-active .v-icon {
  color: #FF6A13 !important;
}

/* Overrides para modo oscuro */
.theme--dark .dashboard-active {
  background-color: rgba(92, 138, 230, 0.15) !important;
  color: #ffffff !important;
  border: 1px solid #5C8AE6;
}

.theme--dark .corporate-active-subitem {
  color: #FF8A4C !important;
}

/* Botón de modo oscuro con transición suave del icono */
.theme-toggle-icon {
  transition: transform 0.4s ease, color 0.3s ease;
}

.theme-toggle:hover .theme-toggle-icon {
  transform: rotate(40deg) scale(1.15);
}

</style>