import { useState } from 'react'
import Setup from './screens/Setup'
import ModoSeletor from './screens/ModoSeletor'
import Tradutor from './screens/Tradutor'

export default function App() {
  const [pronto, setPronto] = useState(false)
  const [modo, setModo] = useState(null)

  if (!pronto) return <Setup onPronto={() => setPronto(true)} />
  if (!modo)   return <ModoSeletor onSelecionar={setModo} />
  return <Tradutor modo={modo} onVoltar={() => setModo(null)} />
}