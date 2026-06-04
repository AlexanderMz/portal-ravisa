<template>
  <v-container fluid class="informe-ref pa-4">
    <!-- Encabezado -->
    <v-card class="rounded-lg mb-4 header-card" elevation="3">
      <v-card-text class="d-flex flex-wrap align-center py-3">
        <v-avatar color="primary" size="42" class="mr-3">
          <v-icon dark>assessment</v-icon>
        </v-avatar>
        <div class="mr-4">
          <div class="text-h6 font-weight-medium">Informe Referencias</div>
          <div class="text-caption grey--text">Consulta y análisis de referencias aduanales</div>
        </div>
        <v-chip class="mr-2" small label color="primary" v-if="registros.length">
          <v-icon left x-small>list</v-icon>
          {{ registrosFiltrados.length }} / {{ registros.length }}
        </v-chip>

        <v-spacer></v-spacer>

        <v-btn color="blue-grey" outlined small rounded class="mr-3 text-none" @click="resetFiltros">
          <v-icon left small>clear</v-icon>
          Limpiar filtros
        </v-btn>

        <!-- Selector de columnas (persistente por usuario) -->
        <v-menu :close-on-content-click="false" offset-y left max-height="500">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" outlined small rounded class="mr-3 text-none" v-bind="attrs" v-on="on">
              <v-icon left small>view_column</v-icon>
              Columnas
              <v-chip x-small class="ml-2" color="primary">{{ selectedColumns.length }}/{{ allColumns.length }}</v-chip>
            </v-btn>
          </template>
          <v-card width="340" class="rounded-lg">
            <v-card-text class="pb-0">
              <v-text-field
                v-model="colSearch"
                dense
                outlined
                rounded
                hide-details
                clearable
                label="Filtrar columnas"
                prepend-inner-icon="search"
              ></v-text-field>
            </v-card-text>
            <v-card-actions class="py-1">
              <v-btn x-small text @click="selectAllColumns">Todas</v-btn>
              <v-btn x-small text @click="clearColumns">Ninguna</v-btn>
              <v-spacer></v-spacer>
              <v-btn x-small text color="primary" @click="resetColumns">
                <v-icon left x-small>refresh</v-icon>Restablecer
              </v-btn>
            </v-card-actions>
            <v-divider></v-divider>
            <div class="px-4 py-1 d-flex align-center grey--text caption">
              <v-icon x-small class="mr-1">open_with</v-icon>
              Arrastra para ordenar · marca para mostrar
            </div>
            <v-divider></v-divider>
            <v-list dense class="column-list">
              <v-list-item
                v-for="col in filteredColumnOptions"
                :key="col.value"
                draggable="true"
                @dragstart="onDragStart(col.value)"
                @dragover.prevent="onDragOver(col.value)"
                @drop.prevent="onDrop(col.value)"
                @dragend="onDragEnd"
                :class="{ 'drag-over': dragOverValue === col.value, 'dragging': dragValue === col.value }"
                @click="toggleColumn(col.value)"
              >
                <v-list-item-icon class="my-0 mr-2 drag-handle" title="Arrastrar para reordenar">
                  <v-icon small>drag_indicator</v-icon>
                </v-list-item-icon>
                <v-list-item-action class="my-0 mr-3">
                  <v-checkbox
                    :input-value="selectedColumns.includes(col.value)"
                    dense
                    hide-details
                    @click.stop="toggleColumn(col.value)"
                  ></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ col.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <export-excel
          class="export-btn v-btn v-btn--rounded theme--dark v-size--small success"
          :data="registrosFiltrados"
          :fields="exportFields"
          worksheet="Datos"
          :name="`${date}-summary.xls`"
          v-if="registros.length && selectedColumns.length"
        >
          <v-icon small left>cloud_download</v-icon>
          Exportar
        </export-excel>
      </v-card-text>
    </v-card>

    <!-- Filtros -->
    <v-card class="rounded-lg mb-4" elevation="2">
      <v-card-text class="py-3">
        <div class="text-overline grey--text mb-1">
          <v-icon x-small class="mr-1">tune</v-icon>Filtros
        </div>
        <v-row dense align="center">
          <v-col cols="12" sm="4" md="4">
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
                  prepend-inner-icon="event"
                  outlined
                  dense
                  rounded
                  hide-details
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
          <v-col cols="12" sm="4" md="4">
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
                  prepend-inner-icon="event"
                  outlined
                  dense
                  rounded
                  hide-details
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
                  @click="setDateFin"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-dialog>
          </v-col>
          <!-- Filtro de estatus (selección múltiple) -->
          <v-col cols="12" sm="4" md="4">
            <v-select
              v-model="estado"
              :items="estados"
              label="Estatus (todos si vacío)"
              prepend-inner-icon="filter_list"
              outlined
              dense
              hide-details
              multiple
              clearable
              small-chips
            >
              <template v-slot:selection="{ item, index }">
                <v-chip v-if="index < 2" x-small label :color="estadoColor(item.value)" dark>
                  {{ item.text }}
                </v-chip>
                <span v-else-if="index === 2" class="grey--text caption ml-1">
                  +{{ estado.length - 2 }}
                </span>
              </template>
            </v-select>
          </v-col>
        </v-row>
        <v-row dense class="mt-1" align="center">
          <v-col cols="12" sm="4" md="3" class="d-flex align-center">
            <v-switch
              v-model="soloConSaldo"
              label="Solo con saldo"
              inset
              dense
              hide-details
              class="mt-0 pt-0"
            ></v-switch>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small class="ml-2 grey--text" v-bind="attrs" v-on="on">help_outline</v-icon>
              </template>
              <span>Muestra solo referencias con saldo de anticipos &gt; 0 (omite las que están en 0)</span>
            </v-tooltip>
          </v-col>
          <v-col cols="12" sm="5" md="5" class="d-flex align-center">
            <v-text-field
              v-model.number="ocultarBalanceHasta"
              type="number"
              min="0"
              prefix="$-"
              label="Ocultar Balance GC negativo hasta"
              prepend-inner-icon="visibility_off"
              outlined
              dense
              rounded
              hide-details
              clearable
            ></v-text-field>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small class="ml-2 grey--text" v-bind="attrs" v-on="on">help_outline</v-icon>
              </template>
              <span>Oculta referencias con Balance GC entre −(este monto) y 0. Vacío = no oculta nada. No muestra por debajo del piso del servidor (−10).</span>
            </v-tooltip>
          </v-col>
          <v-col cols="12" sm="3" md="4" class="d-flex justify-end">
            <v-btn
              color="primary"
              rounded
              depressed
              :loading="overlay"
              @click="cargarDatos"
            >
              <v-icon left>play_circle_filled</v-icon>
              Generar informe
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card class="rounded-lg" elevation="2">
      <v-data-table :headers="tableHeaders" dense :items="registrosFiltrados" :items-per-page="25" :single-expand="true"
        :expanded.sync="expanded" show-expand item-key="referencia" :search="search2"
        fixed-header height="62vh" :footer-props="footerProps" class="tabla-moderna rounded-lg"
        @item-expanded="cargarDatosRefencia">
        <template v-slot:top>
          <div class="d-flex align-center px-4 pt-3 pb-1">
            <v-text-field v-model="search2" label="Buscar en el informe..."
              prepend-inner-icon="search" outlined dense rounded hide-details clearable
              class="search-field"></v-text-field>
          </div>
        </template>
        <template v-slot:[`item.estatus`]="{ item }">
          <v-chip x-small label :color="estadoColor(item.estatus)" dark v-if="item.estatus">
            {{ item.estatus }}
          </v-chip>
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
          <template v-slot:[`item.anticipoProveedor`]="{ item }">
            <span> {{ item.anticipoProveedor | currency }} </span>
          </template>
          <template v-slot:[`item.costoVentas`]="{ item }">
            <span> {{ item.costoVentas | currency }} </span>
          </template>
          <template v-slot:[`item.notadeCreditoAnticipo`]="{ item }">
            <span :class="{ 'red--text': item.notadeCreditoAnticipo < 0 }"> {{ item.notadeCreditoAnticipo | currency }} </span>
          </template>
          <template v-slot:[`item.saldo`]="{ item }">
            <span :class="{ 'red--text': item.saldo < 0 }"> {{ item.saldo | currency }} </span>
          </template>
          <template v-slot:[`item.balanceGC`]="{ item }">
            <span :class="{ 'red--text': item.balanceGC < 0 }"> {{ item.balanceGC | currency }} </span>
          </template>
          <template v-slot:[`item.balanceGeneral`]="{ item }">
            <span :class="{ 'red--text': item.balanceGeneral < 0 }"> {{ item.balanceGeneral | currency }} </span>
          </template>
          <template v-slot:[`item.impuesto`]="{ item }">
            <span :class="{ 'red--text': item.impuesto < 0 }"> {{ item.impuesto }} % </span>
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
                <template v-slot:[`item.saldo`]="{ item }">
                  <span> {{ item.saldo | currency }} </span>
                </template>
                <template v-slot:[`item.ingreso`]="{ item }">
                  <span> {{ item.ingreso | currency }} </span>
                </template>
                <template v-slot:[`item.egreso`]="{ item }">
                  <span> {{ item.egreso | currency }} </span>
                </template>
                <template v-slot:[`item.fecha`]="{ item }">
                  <span> {{ item.fecha }} </span>
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
    </v-card>
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
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      search: '',
      search2: '',
      referencia: '',
      date: new Date().toISOString().substr(0, 10),
      dateIni: '2025-01-01',
      dateFin: new Date().toISOString().substr(0, 10),
      estado: [],
      soloConSaldo: false,
      ocultarBalanceHasta: null,
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
      colSearch: '',
      selectedColumns: [],
      columnOrder: [],
      dragValue: null,
      dragOverValue: null,
      user: localStorage.getItem('user') || 'anon',
      footerProps: {
        'items-per-page-options': [25, 50, 100, 200]
      },
      estados: [
        { text: 'Abierto', value: 'Abierto' },
        { text: 'Cerrado', value: 'Cerrado' },
        { text: 'Diferido', value: 'Diferido' },
        { text: 'Reabierto', value: 'Reabierto' },
      ],
      dateFields: ['fecha Cruze', 'fecha Pago Pedimento', 'fechaCreacionChL', 'fechaFacturacion'],
      allColumns: [
        {text: 'Referncia', value: 'referencia' },
        {text: 'Pedimento', value: 'pedimento' },
        {text: 'Fecha Cruze', value: 'fecha Cruze', align: 'center' },
        {text: 'Fecha Pago', value: 'fecha Pago Pedimento', align: 'center' },
        {text: 'Existe CHL', value: 'existeChL', align: 'center' },
        {text: 'Fecha CHL', value: 'fechaCreacionChL', align: 'center' },
        {text: 'Días FC', value: 'dias FC/Hoy', align: 'end' },
        {text: 'Días FCHL', value: 'dias FC/FCHL', align: 'end' },
        {text: 'Fecha Fact.', value: 'fechaFacturacion', align: 'center' },
        {text: 'Días FF', value: 'dias FCHL/FF', align: 'end' },
        {text: 'IFS', value: 'ifs' },
        {text: 'Cliente', value: 'cliente' },
        {text: 'Pedido', value: 'pedido', align: 'end' },
        {text: 'Anticipo', value: 'anticipoClientes', align: 'end' },
        {text: 'Ingreso Honorarios', value: 'ingresoHonorarios', align: 'end' },
        {text: 'Ingreso GCR', value: 'ingresoGCR', align: 'end' },
        {text: 'Ingreso GCC', value: 'ingresoGCC', align: 'end' },
        {text: 'Egreso', value: 'egreso', align: 'end' },
        {text: 'Anticipo Prov.', value: 'anticipoProveedor', align: 'end' },
        {text: 'Costo de ventas', value: 'costoVentas', align: 'end' },
        {text: 'NC Anticipos', value: 'notadeCreditoAnticipo', align: 'end' },
        {text: 'Saldo', value: 'saldo', align: 'end' },
        {text: 'Balance GC', value: 'balanceGC', align: 'end' },
        {text: 'Balance General', value: 'balanceGeneral', align: 'end' },
        {text: 'Impuesto', value: 'impuesto', align: 'end' },
        {text: 'Patente', value: 'patente', align: 'center' },
        {text: 'Aduana', value: 'aduana', align: 'center' },
        {text: 'Folio Factura Proveedor', value: 'folioFacturaProveedor', align: 'center' },
        {text: 'Folio CHL', value: 'folioChL', align: 'center' },
        {text: 'Estado CHL', value: 'estatusChL', align: 'center' },
        {text: 'CHL Compo', value: 'chLComp' },
        {text: 'Correo EF CHL', value: 'correoEFChL' },
        {text: 'Estado', value: 'estatus', align: 'center' },
      ],
      responseColumns: [
        {text:'Tipo Documento', value: 'tipoDocumento'},
        {text:'Sucursal', value: 'sucursal'},
        {text:'Folio', value: 'folio'},
        {text:'Folio Fact. Prov.', value: 'folioFacturaProveedor'},
        {text:'Fecha', value: 'fecha'},
        {text:'Fecha Pago', value: 'fechaPago'},
        {text:'Codigo Cliente', value: 'codigoCliente'},
        {text:'Socio Negocios', value: 'socioNegocios'},
        {text:'Moneda', value: 'moneda'},
        {text:'Pedido', value: 'pedido'},
        {text:'Anticipo cliente', value: 'anticipoCliente'},
        {text:'Saldo', value: 'saldo'},
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
  created() {
    this.loadColumnPrefs()
  },
  watch: {
    selectedColumns() {
      this.saveColumnPrefs()
    },
    columnOrder() {
      this.saveColumnPrefs()
    }
  },
  computed: {
    storageKey() {
      return `informeReferencia.columns.${this.user}`
    },
    defaultColumnValues() {
      return this.allColumns.map(c => c.value)
    },
    columnMap() {
      const map = {}
      this.allColumns.forEach(c => { map[c.value] = c })
      return map
    },
    orderedColumns() {
      return this.columnOrder.map(v => this.columnMap[v]).filter(Boolean)
    },
    tableHeaders() {
      return this.columnOrder
        .filter(v => this.selectedColumns.includes(v))
        .map(v => this.columnMap[v])
        .filter(Boolean)
    },
    filteredColumnOptions() {
      const q = (this.colSearch || '').toLowerCase()
      if (!q) return this.orderedColumns
      return this.orderedColumns.filter(c => c.text.toLowerCase().includes(q))
    },
    registrosFiltrados() {
      let data = this.registros
      if (this.estado && this.estado.length) {
        const set = this.estado.map(e => e.toString().toLowerCase())
        data = data.filter(r => set.includes((r.estatus || '').toString().toLowerCase()))
      }
      if (this.soloConSaldo) {
        data = data.filter(r => Number(r.saldo) > 0)
      }
      const umbral = Number(this.ocultarBalanceHasta) || 0
      if (umbral > 0) {
        // oculta Balance GC negativos chicos: entre -umbral y 0 (no toca positivos ni cero)
        data = data.filter(r => {
          const b = Number(r.balanceGC)
          return !(b < 0 && b > -umbral)
        })
      }
      return data
    },
    exportFields() {
      const fields = {}
      this.tableHeaders.forEach(h => { fields[h.text] = h.value })
      return fields
    }
  },
  methods: {
    ...mapActions("referencia", ['getReferencias', 'getReferencia', 'getReferenciaObjeto']),
    resetFiltros() {
      // Limpia solo los filtros (no toca fechas ni columnas). Instantáneo.
      this.estado = []
      this.soloConSaldo = false
      this.ocultarBalanceHasta = null
      this.search2 = ''
    },
    estadoColor(estatus) {
      switch ((estatus || '').toString().toLowerCase()) {
        case 'abierto': return 'green darken-1'
        case 'cerrado': return 'blue-grey darken-1'
        case 'diferido': return 'orange darken-2'
        case 'reabierto': return 'purple darken-1'
        default: return 'grey'
      }
    },
    loadColumnPrefs() {
      const known = this.defaultColumnValues
      let saved = null
      try {
        saved = JSON.parse(localStorage.getItem(this.storageKey))
      } catch (e) {
        saved = null
      }
      if (saved && Array.isArray(saved.order)) {
        // Formato nuevo: { order: [...], visible: [...] }
        const order = saved.order.filter(v => known.includes(v))
        // inserta columnas nuevas en su posición por defecto (junto a sus vecinas),
        // no al final, para respetar el orden previsto del catálogo
        known.forEach((v, i) => {
          if (order.includes(v)) return
          let inserted = false
          for (let j = i + 1; j < known.length; j++) {
            const idx = order.indexOf(known[j])
            if (idx !== -1) { order.splice(idx, 0, v); inserted = true; break }
          }
          if (!inserted) order.push(v)
        })
        this.columnOrder = order
        this.selectedColumns = Array.isArray(saved.visible)
          ? saved.visible.filter(v => known.includes(v))
          : known.slice()
      } else if (Array.isArray(saved)) {
        // Formato anterior: solo lista de columnas visibles
        this.columnOrder = known.slice()
        const filtered = known.filter(v => saved.includes(v))
        this.selectedColumns = filtered.length ? filtered : known.slice()
      } else {
        this.columnOrder = known.slice()
        this.selectedColumns = known.slice()
      }
    },
    saveColumnPrefs() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify({
          order: this.columnOrder,
          visible: this.selectedColumns
        }))
      } catch (e) {
        console.log(e)
      }
    },
    toggleColumn(value) {
      if (this.selectedColumns.includes(value)) {
        this.selectedColumns = this.selectedColumns.filter(v => v !== value)
      } else {
        // mantener el orden definido por el usuario
        this.selectedColumns = this.columnOrder
          .filter(v => v === value || this.selectedColumns.includes(v))
      }
    },
    selectAllColumns() {
      this.selectedColumns = this.columnOrder.slice()
    },
    clearColumns() {
      this.selectedColumns = []
    },
    resetColumns() {
      this.columnOrder = this.defaultColumnValues.slice()
      this.selectedColumns = this.defaultColumnValues.slice()
    },
    onDragStart(value) {
      this.dragValue = value
    },
    onDragOver(value) {
      this.dragOverValue = value
    },
    onDrop(targetValue) {
      const from = this.columnOrder.indexOf(this.dragValue)
      const to = this.columnOrder.indexOf(targetValue)
      this.dragValue = null
      this.dragOverValue = null
      if (from < 0 || to < 0 || from === to) return
      const order = this.columnOrder.slice()
      const [moved] = order.splice(from, 1)
      order.splice(to, 0, moved)
      this.columnOrder = order
    },
    onDragEnd() {
      this.dragValue = null
      this.dragOverValue = null
    },
    setDateIni () {
      this.$refs.dialog.save(this.dateIni)
      this.modal = false
    },
    setDateFin () {
      this.$refs.dialog1.save(this.dateFin)
      this.modal1 = false
    },
    // Normaliza cualquier fecha al formato AAAA-MM-DD
    toYmd(value) {
      if (value === null || value === undefined) return value
      const s = value.toString().trim()
      if (!s) return s
      if (/^\d{8}$/.test(s)) return `${s.substr(0, 4)}-${s.substr(4, 2)}-${s.substr(6, 2)}`
      const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
      const dmy = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/)
      if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
      const d = new Date(s)
      if (!isNaN(d.getTime())) {
        const mo = String(d.getMonth() + 1).padStart(2, '0')
        const da = String(d.getDate()).padStart(2, '0')
        return `${d.getFullYear()}-${mo}-${da}`
      }
      return s
    },
    formatearFechas(rows, campos) {
      if (!Array.isArray(rows)) return rows
      rows.forEach(r => {
        campos.forEach(c => {
          if (r[c] !== undefined && r[c] !== null && r[c] !== '') {
            r[c] = this.toYmd(r[c])
          }
        })
      })
      return rows
    },
    cargarDatosRefencia(e) {
      if (!e.value) {
        return;
      }
      this.selected = []
      this.loading = true
      this.getReferencia(e.item.referencia)
        .then((res) => {
          this.selected = this.formatearFechas(res.data, ['fecha', 'fechaPago'])
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
          this.details = this.formatearFechas(res.data, ['fecha'])
          this.loading = false
        })
        .catch(() => this.loading = false)
        .finally(() => this.loading = false)
    },
    cargarDatos() {
      this.overlay = true
      this.getReferencias({ FechaFin: this.dateFin.replaceAll("-", ""), FechaIni: this.dateIni.replaceAll("-", "") })
        .then((res) => {
          this.registros = this.formatearFechas(res.data, this.dateFields)
          this.overlay = false
        })
        .catch(() => this.overlay = false)
        .finally(() => this.overlay = false)
    },
  }
}
</script>

<style scoped>
.informe-ref {
  max-width: 1800px;
}

/* Encabezado con acento de color */
.header-card {
  border-left: 4px solid var(--v-primary-base);
}

.column-list {
  max-height: 320px;
  overflow-y: auto;
}

/* Reordenamiento por arrastre */
.column-list .v-list-item {
  cursor: pointer;
}

.column-list .drag-handle {
  cursor: grab;
}

.column-list .v-list-item.dragging {
  opacity: 0.5;
}

.column-list .v-list-item.drag-over {
  border-top: 2px solid var(--v-primary-base, #FF6A13);
  background-color: rgba(255, 106, 19, 0.08);
}

.search-field {
  max-width: 420px;
}

/* Botón de exportar (componente vue-excel-export) */
.export-btn {
  cursor: pointer;
  text-transform: none;
  padding: 0 16px;
  height: 32px;
}

/* Tabla más limpia y legible */
.tabla-moderna >>> thead th {
  text-transform: uppercase;
  font-size: 0.7rem !important;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

/* Filas: una sola línea, sin saltos, alineación pareja */
.tabla-moderna >>> tbody td {
  white-space: nowrap;
  vertical-align: middle;
  height: 38px;
  font-size: 0.82rem;
}

.tabla-moderna >>> tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04) !important;
}

.tabla-moderna >>> tbody tr:nth-of-type(even) {
  background-color: rgba(255, 255, 255, 0.015);
}
</style>
