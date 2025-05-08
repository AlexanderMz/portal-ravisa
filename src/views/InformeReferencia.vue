<template>
  <v-container>
    <v-toolbar dense>
      <v-toolbar-title>Informe Referencias</v-toolbar-title>
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
      <v-col
        cols="6"
        sm="6"
        md="4"
      >
        <v-dialog
          ref="dialog"
          v-model="modal"
          :return-value.sync="dateIni"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateIni"
              label="Fecha inicial"
              prepend-icon="event"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dateIni"
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              @click="modal = false"
            >
              Cancel
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="setDateIni"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-dialog>
      </v-col>      
      <v-col
        cols="6"
        sm="6"
        md="4"
      >
        <v-dialog
          ref="dialog1"
          v-model="modal1"
          :return-value.sync="dateFin"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateFin"
              label="Fecha final"
              prepend-icon="event"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dateFin"
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              @click="modal1 = false"
            >
              Cancel
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="cargarDatos"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-dialog>
      </v-col>      
    </v-row>
    <v-row dense>
      <v-col class="text-center" cols="12" md="12">
        <v-data-table :headers="topColumns" dense :items="registros" :items-per-page="25" :single-expand="true"
          :expanded.sync="expanded" show-expand item-key="referencia" :search="search2"
          @item-expanded="cargarDatosRefencia">
          <template v-slot:top>
            <v-toolbar flat icon="search">
              <v-text-field v-model="search2" label="Buscar..." class="mx-4"></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:[`item.pedido`]="{ item }">
            <span :class="{ 'red--text': item.pedido < 0 }"> {{ item.pedido | currency }} </span>
          </template>
          <template v-slot:item.anticipoClientes="{ item }">
            <span :class="{ 'red--text': item.anticipoClientes < 0 }"> {{ item.anticipoClientes | currency }} </span>
          </template>
          <template v-slot:[`item.ingresoHonorarios`]="{ item }">
            <span :class="{ 'red--text': item.ingresoHonorarios < 0 }"> {{ item.ingresoHonorarios | currency }} </span>
          </template>
          <template v-slot:[`item.ingresoGCR`]="{ item }">
            <span :class="{ 'red--text': item.ingresoGCR < 0 }"> {{ item.ingresoGCR | currency }} </span>
          </template>
          <template v-slot:[`item.ingresoGCC`]="{ item }">
            <span :class="{ 'red--text': item.ingresoGCC < 0 }"> {{ item.ingresoGCC | currency }} </span>
          </template>
          <template v-slot:[`item.egreso`]="{ item }">
            <span :class="{ 'red--text': item.egreso < 0 }"> {{ item.egreso | currency }} </span>
          </template>
          <template v-slot:[`item.balanceGC`]="{ item }">
            <span :class="{ 'red--text': item.balanceGC < 0 }"> {{ item.balanceGC | currency }} </span>
          </template>
          <template v-slot:[`item.balanceGeneral`]="{ item }">
            <span :class="{ 'red--text': item.balanceGeneral < 0 }"> {{ item.balanceGeneral | currency }} </span>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <v-data-table dense :items="selected" class="elevation-1" loading="true" :items-per-page="7"
                :search="search" :headers="responseColumns" :loading="loading">
                <template v-slot:top>
                  <v-toolbar icon="search" flat>
                    <v-text-field v-model="search" label="Buscar factura" class="mx-4"></v-text-field>
                  </v-toolbar>
                </template>
                <template v-slot:[`item.pedido`]="{ item }">
                  <span> {{ item.pedido | currency }} </span>
                </template>
                <template v-slot:[`item.ingreso`]="{ item }">
                  <span> {{ item.ingreso | currency }} </span>
                </template>
                <template v-slot:[`item.egreso`]="{ item }">
                  <span> {{ item.egreso | currency }} </span>
                </template>
                <template v-slot:[`item.fecha`]="{ item }">
                  <span> {{ item.fecha.substr(0, 10) }} </span>
                </template>
                <!-- <template v-slot:[`item.actions`]="{ item }">
                  <v-icon small @click="cargarDatosRefenciaObjeto(item)">
                    summarize
                  </v-icon>
                </template> -->
              </v-data-table>
            </td>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <!-- Dialog -->
    <v-dialog v-model="showDetail" persistent>
      <v-card>
        <v-card-title class="headline">
          Referencia: {{ referencia }}
        </v-card-title>
        <v-card-text>
          <v-data-table
            dense
            :items="details"
            :headers="detailColumns"
            hide-default-footer
            disable-pagination
            fixed-header
            disable-sort
            class="elevation-1"
            style="max-height: 300px"
            height="300px"
          >
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="showDetail = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-overlay style="text-align: center" :value="overlay">
      <p>Generando informe</p>
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      search: '',
      search2: '',
      referencia: '',
      date: new Date().toISOString().substr(0, 10),      
      dateIni: new Date().toISOString().substr(0, 10),
      dateFin: new Date().toISOString().substr(0, 10),
      page: 1,
      perPage: 30,
      selected: [],
      details: [],
      registros: [],
      expanded: [],
      overlay: false,
      loading: false,
      showDetail: false,
      modal: false,
      modal1: false,
      topColumns: [
        {text: 'Referncia', value: 'referencia' }, 
        {text: 'Pedimento', value: 'pedimento' }, 
        {text: 'Fecha Cruze', value: 'fecha Cruze' }, 
        {text: 'Fecha Pago', value: 'fecha Pago Pedimento' }, 
        {text: 'Existe CHL', value: 'existeChL' }, 
        {text: 'Fecha CHL', value: 'fechaCreacionChL' }, 
        {text: 'Días FC', value: 'dias FC/Hoy' }, 
        {text: 'Días FCHL', value: 'dias FC/FCHL' }, 
        {text: 'Fecha Fact.', value: 'fechaFacturacion' }, 
        {text: 'Días FF', value: 'dias FCHL/FF' }, 
        {text: 'IFS', value: 'ifs' }, 
        {text: 'Cliente', value: 'cliente' }, 
        {text: 'Pedido', value: 'pedido' }, 
        {text: 'Anticipo', value: 'anticipoClientes' }, 
        {text: 'Ingreso Honorarios', value: 'ingresoHonorarios' }, 
        {text: 'Ingreso GCR', value: 'ingresoGCR' }, 
        {text: 'Ingreso GCC', value: 'ingresoGCC' }, 
        {text: 'Egreso', value: 'egreso' }, 
        {text: 'Balance GC', value: 'balanceGC' }, 
        {text: 'Balance General', value: 'balanceGeneral' }, 
        {text: 'Patente', value: 'patente' }, 
        {text: 'Aduana', value: 'aduana' }, 
        {text: 'Folio CHL', value: 'folioChL' }, 
        {text: 'Estado CHL', value: 'estatusChL' }, 
        {text: 'CHL Compo', value: 'chLComp' }, 
        {text: 'Correo EF CHL', value: 'correoEFChL' }, 
      ],
      responseColumns: [
        {text:'Tipo Documento', value: 'tipoDocumento'},        
        {text:'Sucursal', value: 'sucursal'},        
        {text:'Folio', value: 'folio'},
        {text:'Fecha', value: 'fecha'},
        {text:'Fecha Pago', value: 'fechaPago'},
        {text:'Codigo Cliente', value: 'codigoCliente'},
        {text:'Socio Negocios', value: 'socioNegocios'},
        {text:'Moneda', value: 'moneda'},
        {text:'Pedido', value: 'pedido'},
        {text:'Anticipo cliente', value: 'anticipoCliente'},
        {text:'Ingreso', value: 'ingreso'},
        {text:'Egreso', value: 'egreso'},
        {text:'Pedimento', value: 'pedimento'},
        {text:'Aduana', value: 'aduana'},
        {text:'Patente', value: 'patente'},
        {text:'Estatus', value: 'estatus'}
      ],
      detailColumns: [
        {text:'Tipo Documento', value: 'tipoDocumento'},        
        {text:'Sucursal', value: 'sucursal'},        
        {text:'Folio', value: 'folio'},
        {text:'Fecha', value: 'fecha'},
        {text:'Hora', value: 'hora'},
        {text:'Codigo Cliente', value: 'codigoCliente'},
        {text:'Socio Negocios', value: 'socioNegocios'},
        {text:'Moneda', value: 'Moneda'},
        {text:'Pedido', value: 'pedido'},
        {text:'Anticipo cliente', value: 'anticipoCliente'},
        {text:'Ingreso', value: 'ingreso'},
        {text:'Egreso', value: 'egreso'},
        {text:'Pedimento', value: 'pedimento'},
        {text:'Aduana', value: 'aduana'},
        {text:'Patente', value: 'patente'},
        {text:'Estatus', value: 'estatus'}
      ]
    }
  },
  // mounted() {
  //   this.cargarDatos()
  // },
  methods: {
    ...mapActions("referencia", ['getReferencias', 'getReferencia', 'getReferenciaObjeto']),
    setDateIni () {
      this.$refs.dialog.save(this.dateIni)
      this.registros = []
      this.modal = false
    },
    cargarDatosRefencia(e) {
      if (!e.value) {
        return;
      }
      this.selected = []
      this.loading = true
      this.getReferencia(e.item.referencia)
        .then((res) => {
          this.selected = res.data
          this.loading = false
        })
        .catch(() => this.loading = false)
        .finally(() => this.loading = false)
    },
    cargarDatosRefenciaObjeto(e) {
      this.details = []
      this.loading = true
      this.referencia = e.referencia
      this.getReferenciaObjeto(e)
        .then((res) => {
          this.showDetail = true
          this.details = res.data
          this.loading = false
        })
        .catch(() => this.loading = false)
        .finally(() => this.loading = false)
    },
    cargarDatos() {
      this.overlay = true
      this.$refs.dialog1.save(this.dateFin)
      this.getReferencias({ FechaFin: this.dateFin.replaceAll("-", ""), FechaIni: this.dateIni.replaceAll("-", "") })
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
      return this.registros.filter(x => {
        return x.referencia.toLowerCase().includes(this.search2.toLowerCase())
      }).slice((this.page - 1) * this.perPage, this.page * this.perPage)
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
</style>