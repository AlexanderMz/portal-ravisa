<template>
  <v-container>
    <v-toolbar dense>
      <v-toolbar-title>Dispersion de pagos</v-toolbar-title>
      <v-spacer> </v-spacer>
      <v-btn
        depressed
        color="primary"
        @click="generaLote"
        :disabled="!selectedToFile.length || isValidDataToSend"
        style="margin-right: 10px"
      >
        Generar
      </v-btn>
    </v-toolbar>
    <div>
      <!-- Operacion & Cuenta -->
      <v-row>
        <v-col class="d-flex" cols="4">
          <v-text-field dense label="Cliente" v-model="cliente">
          </v-text-field>
        </v-col>
        <v-col class="d-flex" cols="4">
          <v-text-field dense label="Nombre cliente" v-model="nombreCliente">
          </v-text-field>
        </v-col>
        <v-col class="d-flex" cols="4" >
          <v-btn dense color="primary"  @click="cargarDatos" :disabled="!cliente.length">
            Buscar
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="4">
          <v-select
            label="Cuenta banco"
            dense
            outfilled
            :items="cuentas"
            v-model="cuenta"
            item-text="nombreCuenta"
            item-value="cuenta"                 
            :disabled="selectedToFile.length > 0"
            full-width
          ></v-select>
        </v-col>
        <v-col class="d-flex" cols="4">
          <v-text-field dense label="Referencia" v-model="referencia">
          </v-text-field>
        </v-col>
        <v-col class="d-flex" cols="4">
          <v-text-field dense label="Comentarios" v-model="comentarios">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            label="Timbrar pago"
            dense
            outfilled
            :items="['Si', 'No']"
            v-model="selectedSociedad"
            full-width
          ></v-select>
        </v-col>
        <v-col>
          <v-dialog
          ref="dialog"
          v-model="modal"
          :return-value.sync="fecha"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="fecha"
              label="Fecha"
              prepend-icon="event"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="fecha"
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
              @click="saveDate"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-dialog>
        </v-col>
      </v-row>
      <!-- Tablas -->
      <v-row>
        <v-col cols="4" md="4" class="">
          <v-data-table
            dense
            v-if="!loadTable"
            v-model="selected"
            :headers="headers"
            :items="transferencias"
            :search="search"
            :custom-filter="customFilter"
            hide-default-footer
            disable-pagination
            disable-sort
            fixed-header
            item-key="name"
            class="elevation-1"
            ref="table"
            style="max-height: 500px"
            height="400px"
          >
            <template v-slot:top>
              <v-banner sticky icon="search" flat>
                <v-text-field
                  v-model="search"
                  label="Buscar factura"
                  class="mx-4"
                  @keydown.stop.enter="handlerEvent"
                ></v-text-field>
              </v-banner>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon small @click="addItem(item)">
                forward
              </v-icon>
            </template>
            <template v-slot:[`item.docTotal`]="{ item }">
              <span> {{ item.docTotal | currency }} </span>
            </template>
          </v-data-table>
          <v-skeleton-loader
            v-if="loadTable"
            class="mx-auto"
            type="table"
          ></v-skeleton-loader>
        </v-col>
        <v-col class="" cols="8" md="8">
          <v-data-table
            dense
            :headers="headers2"
            :items="selectedToFile"
            class="elevation-1"
            hide-default-footer
            disable-pagination
            disable-sort
            :fixed-header="true"
            style="max-height: 500px"
            height="500px"
            id="tabledetalle"
          >
            <template v-slot:top>
              <v-btn rounded icon @click="selectedToFile = []">
                <v-icon>delete</v-icon>
              </v-btn>
              {{ selectedToFile.length }} seleccionadas | Total:
              {{ getTotal | currency }}
              <v-dialog v-model="dialogDelete" max-width="600px">
                <v-card>
                  <v-card-title class="headline"
                    >¿Esta seguro que desea borrar esta factura?</v-card-title
                  >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete"
                      >Cancelar</v-btn
                    >
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                      >OK</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon small @click="deleteItem(item)">
                delete
              </v-icon>
            </template>
            <template v-slot:[`item.total`]="{ item }">
              <span> {{ item.total | currency }} </span>
            </template>
            <template v-slot:[`item.montoPago`]="{ item }">
              <v-edit-dialog
                :return-value.sync="item.montoPago"
                large
                persistent
              >
                <div>{{ item.montoPago | currency }}</div>
                <template v-slot:input>
                  <div class="mt-4 text-h6">
                   Documentos: {{ item.documento }}
                  </div>
                  <v-text-field
                    v-model.number="item.montoPago"
                    label="Edit"
                    single-line
                    counter
                    autofocus
                  ></v-text-field>
                </template>
              </v-edit-dialog>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </div>
    <!-- Dialog -->
    <v-dialog v-model="alertlote" persistent width="400">
      <v-card>
        <v-card-title class="headline">
          Resultado
        </v-card-title>
        <v-card-text>
          <v-btn
            text
            @click="alertlote = false"
            >Proceso realizado con exito!</v-btn
          >
        </v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="alertlote = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "Dispersion",
  data: () => ({
    archivo: "",
    archivos: [],
    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    selectedSociedad: null,
    cuenta: "",
    referencia: "",
    cliente: "",
    nombreCliente: "",
    comentarios: "",
    search: "",
    modal:false,
    fecha: new Date().toISOString().substr(0, 10),
    selected: [],
    selectedToFile: [],
    loadSucural: false,
    loadRest: false,
    loadTable: false,
    overlay: false,
    headers: [
      { text: "Documento", value: "documento" },
      { text: "Total", value: "total", align: "right" },
      { text: "Add", value: "actions" },
    ],
    headers2: [
      { text: "Borrar", value: "actions" },
      { text: "Docmento", value: "documento" },
      { text: "Moneda", value: "moneda" },
      { text: "Total", value: "total" },
      { text: "Monto pago", value: "montoPago" },
      { text: "Sucursal", value: "sucursal" },
      { text: "invoicesDocEntry", value: "invoicesDocEntry" },
      { text: "invoicesDocLine", value: "invoicesDocLine" },
      { text: "Saldo Vencido", value: "saldoVencido" },
      { text: "Fecha", value: "fecha" },
      { text: "Seria", value: "serie" },
    ],
    alertlote: false,
    alertuno: false,
  }),
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  methods: {
    ...mapActions("dispersion", [
      "getTransfers",
      "generarTxtxLote",
      "getNombreCliente",
      "getCuentas",
      "limpiar",
    ]),
    saveDate () {
      this.$refs.dialog.save(this.fecha)
    },
    async cargarDatos() {
      this.loadTable = true;
      this.nombreCliente = await this.getNombreCliente(this.cliente)
      this.getTransfers({
        cod: this.cod,
        cuenta: this.cliente,
      }).then((res) => {
        this.loadTable = false;
      });
    },
    handlerEvent(e) {
      if (this.$refs.table._data.internalCurrentItems.length > 0) {
        this.selectedToFile.push(
          this.$refs.table._data.internalCurrentItems[0]
        );
        this.selectedToFile = [...new Set(this.selectedToFile)];
        this.search = "";
      } else alert("Factura no encontrada, intente de nuevo.");
    },
    addItem(item) {
      this.selectedToFile.push(item);
      this.selectedToFile = [...new Set(this.selectedToFile)];
    },
    deleteItem(item) {
      this.editedIndex = this.selectedToFile.indexOf(item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      this.selectedToFile.splice(this.editedIndex, 1);
      this.closeDelete();
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
      });
    },
    generaLote() {
      this.overlay = true;
      let data = {
        transferencias: this.selectedToFile,
        cuenta: this.cuenta,
        referencia: this.cliente,
        comentarios: this.comentarios,
        fecha: this.fecha
      };
      console.log(data);
      this.generarTxtxLote(data)
        .then((res) => {
          this.alertlote = true;
            this.overlay = false;
            this.cancelProcess();
        })
        .catch((err) => {
          this.overlay = false;
          alert(err);
        });
    },
    cancelProcess() {
      this.search = "";
      this.selectedToFile = [];
      this.cuenta = ""
      this.comentarios = ""
      this.referencia = ""
      this.cliente = ""
      this.nombreCliente = ""
      this.limpiar();
    },
    customFilter(documento, search, filter) {
      return filter.documento.toString().indexOf(search) !== -1 || filter.total.toString().indexOf(search) !== -1;
    },
  },
  computed: {    
    transferencias() {
      return this.$store.state.dispersion.transferencias;
    },
    cuentas() {
      return this.$store.state.dispersion.cuentas;
    },
    getValuesFromSet() {
      return this.selectedToFile.entries().next().value;
    },
    getTotal() {
      return this.selectedToFile.reduce((a, b) => a + (b["montoPago"] || 0), 0);
    },
    isValidDataToSend() {
      return this.selectedToFile.some(x => !x.montoPago>0)
    }
  },
  mounted() {
    this.limpiar();
    this.getCuentas()
  },
};
</script>

<style scoped></style>
