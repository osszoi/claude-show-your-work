// Settings: the /show-your-work pane and its switches.
import { atom, update } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import { SETTINGS, settings, state } from './state'
import type { Field } from './state'
import { redraw } from './player'
import type { Ui } from './player'

export const WELCOME = 'show-your-work-welcome'
// The settings pane's redraws. Declared in each file that reads or updates
// it: the engine only reads an atom declared in the same file.
const welcome = atom({ plugin: 'show-your-work', key: 'welcome' } as const, 0)

// Reads the saved settings once per plugin load. A reload starts with the
// defaults in memory, and without this pictures would be laid out as Standard
// until the next session start.
let hasLoadedSettings = false
export async function ensureSettings($: EngineInterface) {
  if (hasLoadedSettings) return
  hasLoadedSettings = true
  // Unreadable (no store): the defaults stand.
  await loadSettings($).catch(() => undefined)
}

export async function loadSettings($: EngineInterface) {
  const saved = ((await $.store.get('settings')) ?? {}) as Partial<Record<Field, unknown>>
  for (const { field } of SETTINGS) if (typeof saved[field] === 'boolean') settings[field] = saved[field] as boolean
}

async function switchSetting($: EngineInterface, field: Field, value: boolean) {
  // The saved choices, not this module's copy: a reload resets the copy.
  await loadSettings($)
  settings[field] = value
  await $.store.set('settings', { ...settings })
  // Players already on screen redraw at the new size.
  if (field === 'standard_size') redraw($)
  await update($, welcome, n => n + 1)
}

// /show-your-work: the switches, in a pane.
export async function openSettings($: EngineInterface) {
  await $.ui.open({ id: WELCOME, title: 'Settings', focus: true, closeOnEscape: true, holdToasts: true, rows: 10, columns: 70 })
  await update($, welcome, n => n + 1)
}

export function Settings(ui: Ui, $: EngineInterface) {
  const { Box, Text, Button } = ui
  return (
    <Box flexDirection="column" paddingX={2} paddingBottom={1}>
      <Box flexDirection="row" columnGap={2} marginBottom={1}>
        <Button key="close" label="✕ Close" onPress={() => void $.ui.close({ id: WELCOME })} />
      </Box>
      <Box marginBottom={1}><Text bold>Show Your Work Settings</Text></Box>
      {SettingRows(ui, $)}
    </Box>
  )
}

// Quiet: plain words, the choice marked ● and the other ○, in columns that
// line up, so choosing moves nothing.
function SettingRows(ui: Ui, $: EngineInterface) {
  const { Box, Text, Button } = ui
  const first = Math.max(...SETTINGS.map(s => s.options[0].length)) + 4
  return (
    <Box flexDirection="column">
      {SETTINGS.map(s => (
        <Box key={`row-${s.field}`} flexDirection="row">
          <Box width={24} flexShrink={0}><Text dimColor>{s.title}</Text></Box>
          {s.options.map((label, k) => {
            const isChosen = settings[s.field] === (k === 0)
            return (
              <Box key={`slot-${s.field}-${k}`} width={k === 0 ? first : undefined} flexShrink={0}>
                {/* The default in green, the other in orange; the one not chosen
                    dim. Before Claude Code 2.1.295 a Button holds only its label. */}
                {state.canColourButtons ? (
                  <Button key={`${s.field}-${k}`} plain label={`${isChosen ? '●' : '○'} ${label}`} onPress={() => void switchSetting($, s.field, k === 0)}>
                    <Text color={k === 0 ? 'success' : 'claude'} dimColor={!isChosen}>{`${isChosen ? '●' : '○'} ${label}`}</Text>
                  </Button>
                ) : (
                  <Button key={`${s.field}-${k}`} plain {...(isChosen ? {} : { dimColor: true })} label={`${isChosen ? '●' : '○'} ${label}`} onPress={() => void switchSetting($, s.field, k === 0)} />
                )}
              </Box>
            )
          })}
        </Box>
      ))}
    </Box>
  )
}
