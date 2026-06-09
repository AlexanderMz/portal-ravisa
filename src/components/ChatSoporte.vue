<template>
  <div class="chat-soporte">
    <!-- Botón flotante -->
    <v-btn v-if="!abierto" fab fixed bottom right color="primary" elevation="8"
           class="chat-fab" @click="abierto = true" title="Soporte del Control Summary">
      <v-icon>support_agent</v-icon>
    </v-btn>

    <!-- Panel de chat -->
    <v-card v-if="abierto" class="chat-panel rounded-lg" elevation="12" :dark="$vuetify.theme.dark">
      <v-toolbar dense color="primary" dark flat>
        <v-icon left small>support_agent</v-icon>
        <v-toolbar-title class="subtitle-2">Asistente · Control Summary</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small @click="abierto = false"><v-icon small>close</v-icon></v-btn>
      </v-toolbar>

      <div class="chat-body pa-3" ref="body">
        <div v-for="(m, i) in mensajes" :key="i" class="mb-2 d-flex"
             :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
          <div class="chat-burbuja" :class="m.role === 'user' ? 'burbuja-user' : 'burbuja-bot'">{{ m.text }}</div>
        </div>
        <div v-if="cargando" class="d-flex justify-start mb-2">
          <div class="chat-burbuja burbuja-bot">
            <v-progress-circular indeterminate size="14" width="2" class="mr-1"></v-progress-circular> escribiendo…
          </div>
        </div>
      </div>

      <v-divider></v-divider>
      <div class="pa-2 d-flex align-center">
        <v-text-field v-model="entrada" dense outlined hide-details rounded
                      placeholder="Pregunta sobre el reporte…"
                      @keyup.enter="enviar" :disabled="cargando"></v-text-field>
        <v-btn icon color="primary" class="ml-1" :disabled="cargando || !entrada.trim()" @click="enviar">
          <v-icon>send</v-icon>
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'ChatSoporte',
  data: () => ({
    abierto: false,
    entrada: '',
    cargando: false,
    mensajes: [
      { role: 'model', text: 'Hola 👋 Soy el asistente del Control Summary. Pregúntame sobre las columnas, por qué no aparece una referencia, los balances, etc.' }
    ]
  }),
  methods: {
    ...mapActions('referencia', ['enviarMensajeChat']),
    enviar() {
      const t = (this.entrada || '').trim()
      if (!t || this.cargando) return
      this.mensajes.push({ role: 'user', text: t })
      this.entrada = ''
      this.cargando = true
      this.scrollAbajo()
      const payload = { messages: this.mensajes.slice(-12).map(m => ({ role: m.role, text: m.text })) }
      this.enviarMensajeChat(payload)
        .then(res => {
          const reply = (res && res.data && res.data.reply) ? res.data.reply : 'No obtuve respuesta.'
          this.mensajes.push({ role: 'model', text: reply })
        })
        .catch(() => { this.mensajes.push({ role: 'model', text: 'No pude conectar con el asistente. Intenta de nuevo.' }) })
        .finally(() => { this.cargando = false; this.scrollAbajo() })
    },
    scrollAbajo() {
      this.$nextTick(() => { const b = this.$refs.body; if (b) b.scrollTop = b.scrollHeight })
    }
  }
}
</script>

<style scoped>
.chat-fab { z-index: 210; }
.chat-panel {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 370px;
  max-width: calc(100vw - 24px);
  height: 540px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  z-index: 210;
  overflow: hidden;
}
.chat-body { flex: 1 1 auto; overflow-y: auto; }
.chat-burbuja {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.35;
  white-space: pre-wrap;
  word-break: break-word;
}
.burbuja-user { background: #1867c0; color: #fff; border-bottom-right-radius: 4px; }
.burbuja-bot { background: rgba(0,0,0,0.06); color: inherit; border-bottom-left-radius: 4px; }
.theme--dark .burbuja-bot { background: rgba(255,255,255,0.10); }
</style>
