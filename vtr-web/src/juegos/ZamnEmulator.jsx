/**
 * Compat: ZAMN vía emulador SNES genérico.
 */
import SnesEmulator, { SNES_GAMES } from './SnesEmulator.jsx'

export default function ZamnEmulator({ onSalir }) {
  const g = SNES_GAMES.zamn
  return (
    <SnesEmulator
      onSalir={onSalir}
      romFolder={g.romFolder}
      romFile={g.romFile}
      title={g.title}
      regionLabel={g.regionLabel}
      gameId={g.gameId}
      accent={g.accent}
    />
  )
}
