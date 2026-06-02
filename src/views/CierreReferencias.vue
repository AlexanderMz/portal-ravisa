<template>
  <v-container>
    <v-toolbar dense>
      <v-toolbar-title>Cierre Referencias</v-toolbar-title>
      <v-spacer> </v-spacer>
      <export-excel
        class="v-btn v-btn--depressed theme--dark v-size--default primary"
        :data="registros"
        worksheet="Datos"
        :name="`${date}-summary.xls`"
        v-if="registros.length"
      >
        <v-icon>
          cloud_download
        </v-icon>
      </export-excel>
    </v-toolbar>
    <v-row dense>
      <v-col class="text-center" cols="12" md="12">
        <v-data-table :headers="topColumns" dense :items="registros" :items-per-page="25" item-key="unique" :search="search2">
          <template v-slot:top>
            <v-toolbar flat icon="search">
              <v-text-field v-model="search2" label="Buscar..." class="mx-4"></v-text-field>
            </v-toolbar>
          </template>          
        </v-data-table>
      </v-col>
    </v-row>
    <!-- Dialog -->
    <v-overlay style="text-align: center" :value="overlay">
      <p>Generando informe</p>
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import xlsx from "xlsx";
import { mapActions, mapGetters } from 'vuex'
import { mixin } from "../mixin";

export default {
  data: () => ({
      search: '',
      search2: '',
      referencia: '',
      date: new Date().toISOString().substr(0, 10),      
      page: 1,
      perPage: 30,
      details: [],
      registros: [],
      expanded: [],
      overlay: false,
      loading: false,
      showDetail: false,
      modal: false,
      modal1: false,
      selectedFile: null,
      topColumns: [
        {text: 'Id', value: 'id' }, 
        {text: 'Referncia', value: 'referencia' }, 
        {text: 'Estado', value: 'estatus'},
        {text: 'Fecha Actualizacion', value: 'fechaActualizacion' }, 
        {text: 'Usuario', value: 'usuarioActualizacion' }, 
        {text: 'Pedimento', value: 'pedimento' }, 
        //{text: 'Existe CHL', value: 'existeChL' }, 
        //{text: 'Fecha CHL', value: 'fechaCreacionChL' }, 
        //{text: 'Días FC', value: 'dias FC/Hoy' }, 
        //{text: 'Días FCHL', value: 'dias FC/FCHL' }, 
        //{text: 'Fecha Fact.', value: 'fechaFacturacion' }, 
        //{text: 'Días FF', value: 'dias FCHL/FF' }, 
        //{text: 'IFS', value: 'ifs' }, 
        //{text: 'Cliente', value: 'cliente' }, 
        //{text: 'Pedido', value: 'pedido' }, 
        //{text: 'Anticipo', value: 'anticipoClientes' }, 
        // {text: 'Ingreso Honorarios', value: 'ingresoHonorarios' }, 
        // {text: 'Ingreso GCR', value: 'ingresoGCR' }, 
        // {text: 'Ingreso GCC', value: 'ingresoGCC' }, 
        // {text: 'Egreso', value: 'egreso' }, 
        // {text: 'Balance GC', value: 'balanceGC' }, 
        //{text: 'Balance General', value: 'balanceGeneral' }, 
        //{text: 'Patente', value: 'patente' }, 
        {text: 'Aduana', value: 'aduana' }, 
        // {text: 'Folio CHL', value: 'folioChL' }, 
        // {text: 'Estado CHL', value: 'estatusChL' }, 
        // {text: 'CHL Compo', value: 'chLComp' }, 
        // {text: 'Correo EF CHL', value: 'correoEFChL' }, 
      ],
      estados: [
        {text: 'Abierto', value: 'Abierto'},
        {text: 'Cerrado', value: 'Cerrado'},
        {text: 'Diferido', value: 'Diferido'},
      ],
      user: localStorage.getItem("user")
    }),
  mixins: [mixin],
  mounted () {
    this.cargarDatos()
  },
  methods: {
    ...mapActions("referencia", ['getCierreReferencia']),
    cargarDatos() {
      this.overlay = true
      this.getCierreReferencia()
        .then((res) => {
          this.registros = res.data
          this.overlay = false
        })
        .catch(() => this.overlay = false)
        .finally(() => this.overlay = false)
    },
  },
  computed: {
    tableHeight() {
      return window.innerHeight - 300;
    },
    visiblePages() {
      return 
        this.registros
        .filter(x => {
          return x.referencia.toLowerCase().includes(this.search2.toLowerCase())
        })
        .map(x => {
          const unique = x.referencia+e.pedido
          return {
            unique,
            ...x
          }
        })
        .slice((this.page - 1) * this.perPage, this.page * this.perPage)
    }
  }
}
</script>

<style scoped>
.v-expansion-panel {
  height: 36px;
}

.v-expansion-panel-header {
  padding-top: 1%;
}

.select-dense {
  height: 40px
}
</style>