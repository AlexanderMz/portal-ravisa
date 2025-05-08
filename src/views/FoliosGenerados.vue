<template>
  <v-container>
    <v-toolbar dense>
      <v-toolbar-title>Pagos generados</v-toolbar-title>
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
      <v-col
        class="text-center"
        cols="12"
        md="12"
      >
        <v-expansion-panels accordion>
          <v-expansion-panel
            v-for="(item,i) in registros"
            :key="i"
          >
            <v-expansion-panel-header>
              <v-row no-gutters>
                <v-col cols="2">
                  {{item.NumControl}}
                </v-col>
                <v-col cols="2">
                  {{item.Cliente}}
                </v-col>
                <v-col cols="2">
                  {{item.Moneda}}
                </v-col>
                <v-col cols="2">
                  {{item.MontoPagado | currency}}
                </v-col>
                <v-col cols="2">
                  {{item.Cuenta}}
                </v-col>
                <v-col cols="2">
                  {{item.FechaPago}}
                </v-col>
              </v-row>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-data-table
                dense
                :headers="responseColumns"
                :items="item.D"
                class="elevation-1"
                item-key="id"
                loading="true"
                :items-per-page="7"                
              >
                <template v-slot:[`item.MontoPago`]="{ item }">
                  <span> {{item.MontoPago | currency}} </span>
                </template>
              </v-data-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-overlay
      style="text-align: center"
      :value="overlay"
    >
      <p>Generando informe</p>
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data () {
    return {
      search: '',
      modal: false,
      modal1: false,
      dateIni: new Date().toISOString().substr(0, 10),
      dateFin: new Date().toISOString().substr(0, 10),
      selected: [],
      registros: [],
      overlay: false,
      showResult: false,
      responseColumns: [
        { text: 'Sucursal', value: 'Sucursal' },
        { text: 'Documento', value: 'Documento' },
        { text: 'Moneda', value: 'Moneda' },
        { text: 'MontoPago', value: 'MontoPago', align: 'end' },        
      ],
    }
  },
  methods: {
    ...mapActions("tunel", ['getPagosGenerados']),
    setDateIni () {
      this.$refs.dialog.save(this.dateIni)
      this.registros = []
      this.modal = false
    },
    cargarDatos () {
      this.$refs.dialog1.save(this.dateFin)
      this.overlay = true
      this.getPagosGenerados({ FechaFin: this.dateFin.replaceAll("-", ""), FechaIni: this.dateIni.replaceAll("-", "") })
        .then((res) => {
          this.registros = res 
          this.overlay = false
        })
        .catch(() => this.overlay = false)
        .finally(() => this.overlay = false)
    },
  },
  computed: {
    tableHeight () {
      return window.innerHeight - 300;
    },
  }
}
</script>

<style>
</style>