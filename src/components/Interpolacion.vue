<script setup>
import { ref, watch, computed } from 'vue'
import { lagrange } from './Metodos.js'

const gradoInterpolacion = ref('')
const valorX = ref('')
const mostrarAlerta = ref(false)
const msjAlerta = ref('')
const resultados = ref(null)

const puntos = ref([])

const numPuntosNecesarios = computed(() => {
  const grado = parseInt(gradoInterpolacion.value)
  return isNaN(grado) ? 0 : grado + 1
})

watch(gradoInterpolacion, (nuevoGrado) => {
  if (nuevoGrado === '' || parseInt(nuevoGrado) < 1) {
    puntos.value = []
    resultados.value = null
    return
  }
  
  const n = parseInt(nuevoGrado) + 1
  puntos.value = Array(n).fill(null).map(() => ['', ''])
  resultados.value = null
})

function bloquearTeclas(event) {
  if(["e", "E"].includes(event.key)) {
    event.preventDefault()
    return
  }
}

function bloquearNegativos(event) {
  if(["e", "E", "-", "+"].includes(event.key)) {
    event.preventDefault()
    return
  }
}

function validarInputs() {
  if (gradoInterpolacion.value === '' || parseInt(gradoInterpolacion.value) < 1) {
    return false
  }
  
  if (valorX.value === '') {
    return false
  }
  
  const n = numPuntosNecesarios.value
  
  for (let i = 0; i < n; i++) {
    if (puntos.value[i][0] === '' || puntos.value[i][0] === null ||
        puntos.value[i][1] === '' || puntos.value[i][1] === null) {
      return false
    }
  }
  
  return true
}

function cerrarAlerta() {
  mostrarAlerta.value = false
}

function calcularInterpolacion() {
  mostrarAlerta.value = false
  
  if (!validarInputs()) {
    msjAlerta.value = 'Llena todos los campos requeridos y la tabla de puntos'
    mostrarAlerta.value = true
    return
  }
  
  const puntosNumericos = puntos.value.map(fila => fila.map(val => parseFloat(val)))
  const xEvaluar = parseFloat(valorX.value)
  
  for (let i = 0; i < puntosNumericos.length; i++) {
    for (let j = 0; j < puntosNumericos[i].length; j++) {
      if (isNaN(puntosNumericos[i][j])) {
        msjAlerta.value = 'Error: Todos los valores deben ser numeros validos'
        mostrarAlerta.value = true
        return
      }
    }
  }
  
  if (isNaN(xEvaluar)) {
    msjAlerta.value = 'Error: El valor de x debe ser un numero valido'
    mostrarAlerta.value = true
    return
  }
  
  // Verificar que no haya valores de x repetidos
  const valoresX = puntosNumericos.map(p => p[0])
  const valoresXUnicos = new Set(valoresX)
  if (valoresX.length !== valoresXUnicos.size) {
    msjAlerta.value = 'Error: No puede haber valores de x repetidos'
    mostrarAlerta.value = true
    return
  }
  
  try {
    const n = parseInt(gradoInterpolacion.value)
    const resultado = lagrange(puntosNumericos, n, xEvaluar)
    
    if (isNaN(resultado) || !isFinite(resultado)) {
      throw new Error('No se puede calcular la interpolacion.')
    }
    
    resultados.value = {
      valorX: xEvaluar,
      valorY: parseFloat(resultado.toFixed(6)),
      grado: n,
      puntos: puntosNumericos.map(p => ({
        x: parseFloat(p[0].toFixed(4)),
        y: parseFloat(p[1].toFixed(4))
      }))
    }
    
  } catch (error) {
    msjAlerta.value = 'Error al calcular la interpolacion: ' + error.message
    mostrarAlerta.value = true
    resultados.value = null
  }
}

function limpiarDatos() {
  if (puntos.value.length > 0) {
    const n = numPuntosNecesarios.value
    puntos.value = Array(n).fill(null).map(() => ['', ''])
    resultados.value = null
    valorX.value = ''
  }
}
</script>

<template>
  <div class="container">
    <h1>Interpolacion de Lagrange</h1>
    <p>Ingresa el grado de interpolacion, los puntos conocidos y el valor de x para calcular y.</p>
    
    <div v-if="mostrarAlerta" class="alerta">
      <div class="alerta-contenido">
        <span class="icono-alerta">⚠</span>
        <span class="mensaje-alerta">{{ msjAlerta }}</span>
        <button class="boton-cerrar" @click="cerrarAlerta">×</button>
      </div>
    </div>

    <div class="parametros">
      <div class="parametros-grid">
        <label class="input-parametro">
          Grado de interpolacion
          <input
            type="number"
            v-model.number="gradoInterpolacion"
            @keydown="bloquearNegativos"
            min="1"
            step="1"
            class="input-numero"
            placeholder="Ej: 2 (cuadratica)"
          />
        </label>

        <label v-if="gradoInterpolacion !== ''" class="input-parametro">
          Valor de x a evaluar
          <input
            type="number"
            v-model.number="valorX"
            @keydown="bloquearTeclas"
            step="0.01"
            class="input-numero"
            placeholder="Ej: 1.5"
          />
        </label>
      </div>

    </div>

    <div v-if="puntos.length > 0" class="seccion-datos">
      <div class="datos-header">
        <h3>Puntos Conocidos</h3>
        <button @click="limpiarDatos" class="boton-limpiar">
          Limpiar Datos
        </button>
      </div>
      
      <div class="tabla-container">
        <table class="tabla-datos">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th class="col-dato">xᵢ</th>
              <th class="col-dato">yᵢ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fila, i) in puntos" :key="'fila-' + i">
              <td class="col-index">{{ i }}</td>
              <td class="col-dato">
                <input
                  type="number"
                  v-model.number="puntos[i][0]"
                  @keydown="bloquearTeclas"
                  step="0.01"
                  class="input-dato"
                  placeholder="x"
                />
              </td>
              <td class="col-dato">
                <input
                  type="number"
                  v-model.number="puntos[i][1]"
                  @keydown="bloquearTeclas"
                  step="0.01"
                  class="input-dato"
                  placeholder="y"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="puntos.length > 0" class="botones-accion">
      <button @click="calcularInterpolacion" class="boton-principal">
        Calcular Interpolacion
      </button>
    </div>

    <div v-if="resultados" class="resultados-wrapper">
      <div class="resultados-header">
        <h2>Resultado</h2>
        <div class="metodo-usado">
        </div>
      </div>

      <div class="resultado-principal">
        <h3>Valor interpolado:</h3>
        <div class="resultado-valor">
          <span class="valor-x">P({{ resultados.valorX }})</span>
          <span class="igual">=</span>
          <span class="valor-y">{{ resultados.valorY }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
  background: #242424;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  font-family: system-ui, sans-serif;
  color: #f9fafb;
}

h1 {
  text-align: center;
  color: #60a5fa;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

p {
  color: #d1d5db;
  text-align: center;
  margin-bottom: 1.5rem;
}

.alerta {
  margin-bottom: 1rem;
  animation: slideDown 0.3s ease-out;
}

.alerta-contenido {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #7c2d12;
  border: 1px solid #dc2626;
  border-radius: 0.5rem;
  color: #fef2f2;
  position: relative;
}

.icono-alerta {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.mensaje-alerta {
  flex: 1;
  font-weight: 500;
}

.boton-cerrar {
  background: none;
  border: none;
  color: #fef2f2;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.boton-cerrar:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.parametros {
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.parametros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-parametro {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #e5e7eb;
  position: relative;
}

.input-numero {
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 0.5rem;
  margin-top: 0.3rem;
  background: #2d2d2d;
  color: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 1rem;
}

.input-numero:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.input-numero::-webkit-outer-spin-button,
.input-numero::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-numero[type="number"] {
  -moz-appearance: textfield;
}

.info-puntos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  color: #93c5fd;
  font-size: 0.9rem;
}

.seccion-datos {
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.datos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.datos-header h3 {
  color: #60a5fa;
  margin: 0;
  font-size: 1.2rem;
}

.boton-limpiar {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.boton-limpiar:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.tabla-container {
  overflow-x: auto;
}

.tabla-datos {
  width: 100%;
  border-collapse: collapse;
}

.tabla-datos thead {
  background: #2d2d2d;
}

.tabla-datos th {
  padding: 0.75rem;
  text-align: center;
  color: #60a5fa;
  font-weight: 600;
  border: 1px solid #444;
}

.tabla-datos td {
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #444;
  vertical-align: middle;
}

.col-dato {
  min-width: 150px;
  width: auto;
}

.col-index {
  background: #2d2d2d;
  color: #d1d5db;
  font-weight: 600;
  width: 60px;
}

.input-dato {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 0.3rem;
  background: #242424;
  color: #f9fafb;
  text-align: center;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input-dato:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.input-dato::-webkit-outer-spin-button,
.input-dato::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-dato[type="number"] {
  -moz-appearance: textfield;
}

.botones-accion {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.boton-principal {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.boton-principal:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.resultados-wrapper {
  margin-top: 2rem;
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #333;
  animation: fadeIn 0.5s ease-out;
}

.resultados-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.resultados-header h2 {
  color: #60a5fa;
  margin: 0;
  font-size: 1.4rem;
}

.metodo-badge {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.resultado-principal {
  background: #2d2d2d;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 2px solid #8b5cf6;
}

.resultado-principal h3 {
  color: #8b5cf6;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.resultado-valor {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  flex-wrap: wrap;
}

.valor-x {
  color: #a78bfa;
}

.igual {
  color: #d1d5db;
}

.valor-y {
  color: #22c55e;
  font-size: 1.8rem;
}


@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .parametros-grid {
    grid-template-columns: 1fr;
  }
  
  .puntos-grid {
    grid-template-columns: 1fr;
  }
  
  .resultado-valor {
    font-size: 1.2rem;
  }
  
  .valor-y {
    font-size: 1.5rem;
  }
}
</style>