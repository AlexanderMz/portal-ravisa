<template>
  <v-container>
      <v-toolbar dense>
          <v-toolbar-title>Informe Referencias</v-toolbar-title>
          <v-spacer> </v-spacer>

          <v-btn color="success"
                 outlined
                 href="/Formato_Cancelaciones.xlsx"
                 download="Formato_Cancelaciones.xlsx"
                 class="mr-4">
              <v-icon left>mdi-file-excel</v-icon>
              Descargar Plantilla
          </v-btn>

          <export-excel class="v-btn v-btn--depressed theme--dark v-size--default primary"
                        :data="registros"
                        worksheet="Datos"
                        :name="`${date}-summary.xls`"
                        v-if="registros.length">
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
      <v-col 
        cols="6"
        sm="6"
        md="4"
      >
          <v-file-input
            label="Buscar archivo"
            outlined
            dense
            @change="onFileChange"
            v-model="selectedFile"
          ></v-file-input>
        </v-col> 
    </v-row>
    <v-row dense>
      <v-col class="text-center" cols="12" md="12">
        <v-data-table :headers="topColumns" dense :items="registros" :items-per-page="25" item-key="unique" :search="search2">
          <template v-slot:top>
            <v-toolbar flat icon="search">
              <v-text-field v-model="search2" label="Buscar..." class="mx-4"></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:[`item.pedido`]="{ item }">
            <span :class="{ 'red--text': item.pedido < 0 }"> {{ item.pedido | currency }} </span>
          </template>
          <template v-slot:item.estatus="{ item }">
            <v-select
              :value="item.estatus"
              :items="estados"
              class="select-dense"
              dense
              outlined              
              flat
              :disabled="item._guardando"
              @change="cambiarEstatus(item, $event)"
            ></v-select>
          </template>
          <template v-slot:item.motivoCierreId="{ item }">
            <v-select
              v-if="item.estatus === 'Cerrado'"
              v-model="item.motivoCierreId"
              :items="motivosCierre"
              item-text="descripcion"
              item-value="id"
              label="Motivo"
              class="select-dense"
              dense
              outlined
              flat
              :disabled="item._guardando"
              @change="guardarReferencia(item)"
            ></v-select>
            <span v-else>{{ item.motivoCierre || '' }}</span>
          </template>
          <template v-slot:[`item.balanceGeneral`]="{ item }">
            <span :class="{ 'red--text': item.balanceGeneral < 0 }"> {{ item.balanceGeneral | currency }} </span>
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
      selectedFile: null,
      motivosCierre: [],
      topColumns: [
        {text: 'Referncia', value: 'referencia' }, 
        {text: 'Pedimento', value: 'pedimento' }, 
        {text: 'Fecha Cruze', value: 'fecha Cruze' }, 
        {text: 'Fecha Pago', value: 'fecha Pago Pedimento' }, 
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
        {text: 'Balance General', value: 'balanceGeneral' }, 
        {text: 'Patente', value: 'patente' }, 
        {text: 'Aduana', value: 'aduana' }, 
        // {text: 'Folio CHL', value: 'folioChL' }, 
        // {text: 'Estado CHL', value: 'estatusChL' }, 
        // {text: 'CHL Compo', value: 'chLComp' }, 
        // {text: 'Correo EF CHL', value: 'correoEFChL' }, 
        {text: 'Estado', value: 'estatus'},
        {text: 'Motivo de cierre', value: 'motivoCierreId', width: 260}
      ],
      estados: [
        {text: 'Abierto', value: 'Abierto'},
        {text: 'Cerrado', value: 'Cerrado'},
        {text: 'Diferido', value: 'Diferido'},
      ],
      user: localStorage.getItem("user")
    }),
  mixins: [mixin],
  mounted() {
    this.cargarMotivosCierre()
  },
  methods: {
    ...mapActions("referencia", ['getReferencias', 'updateReferencia', 'updateReferencias', 'getMotivosCierre']),
    cargarMotivosCierre() {
      this.getMotivosCierre().then(res => {
        this.motivosCierre = (res.data || []).map(m => ({
          id: Number(m.id !== undefined ? m.id : m.Id),
          descripcion: m.descripcion || m.Descripcion
        }))
      }).catch(() => {
        alert('No fue posible cargar el catálogo de motivos de cierre.')
      })
    },
    cambiarEstatus(item, estatus) {
      const anterior = item.estatus
      item.estatus = estatus
      if (estatus === 'Cerrado' && !item.motivoCierreId) return
      this.guardarReferencia(item, anterior)
    },
    guardarReferencia(item, estatusAnterior) {
      if (item.estatus === 'Cerrado' && !item.motivoCierreId) return
      item._guardando = true
      return this.updateReferencia({ user: this.user, ...item })
        .then(() => {
          const motivo = this.motivosCierre.find(m => m.id === Number(item.motivoCierreId))
          if (motivo) item.motivoCierre = motivo.descripcion
        })
        .catch(err => {
          if (estatusAnterior) item.estatus = estatusAnterior
          const mensaje = err && err.data ? err.data : 'No fue posible guardar la referencia.'
          alert(mensaje)
        })
        .finally(() => { item._guardando = false })
    },
    setDateIni () {
      this.$refs.dialog.save(this.dateIni)
      this.registros = []
      this.modal = false
    },
    handledSelection(e) {
      console.log("---------------------------", e);
      this.loading = true
      this.updateReferencia({user: this.user, ...e})
        .then((res) => {
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
          this.registros = (res.data || []).map(r => ({ ...r, _guardando: false }))
          this.overlay = false
        })
        .catch(() => this.overlay = false)
        .finally(() => this.overlay = false)
    },
    onFileChange(event) {
      if (!this.selectedFile) {
        this.rows = [];
        return;
      }
      if (!/\.(xls|xlsx)$/.test(this.selectedFile.name.toLowerCase())) {
        return alert(
          "The upload format is incorrect. Please upload xls or xlsx format"
        );
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        try {
          this.loading = true
          const data = ev.target.result;
          const XLSX = xlsx;
          const workbook = XLSX.read(data, {
            type: "binary",
          });
          const wsname = workbook.SheetNames[0];
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]);
          
          const a = workbook.Sheets[workbook.SheetNames[0]];
          const headers = this.getHeader(a);
          this.setTable(headers, ws);
          const usuarioActualizacion = this.user;
          const postData = this.rows.map(item => {
            const textoMotivo = item.motivoCierre || item['Motivo de cierre']
            const motivo = this.motivosCierre.find(m =>
              (m.descripcion || '').toLowerCase() === (textoMotivo || '').toString().trim().toLowerCase())
            return {
              usuarioActualizacion,
              ...item,
              motivoCierreId: item.motivoCierreId || (motivo ? motivo.id : null)
            }
          })
          const sinMotivo = postData.find(item =>
            (item.estatus || '').toString().toLowerCase() === 'cerrado' && !item.motivoCierreId)
          if (sinMotivo) {
            this.loading = false
            return alert(`Falta un motivo de cierre válido para la referencia ${sinMotivo.referencia}.`)
          }
          
          this.updateReferencias(postData)
              .then((res) => {
                this.loading = false
                alert("Archivo procesado con exito")
                this.registros = this.rows
              })
              .catch(() => this.loading = false)
              .finally(() => this.loading = false)
        } catch (e) {
          return alert("Read failure!");
        }
      };
      fileReader.readAsBinaryString(this.selectedFile);
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
