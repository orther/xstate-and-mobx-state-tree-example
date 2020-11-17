import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react-lite'
import { types } from 'mobx-state-tree'
import { Machine, interpret } from 'xstate'

const machineConfig = {
  initial: 'Left',
  states: {
    Left: {
      on: {
        Toggle: { target: 'Right' }
      }
    },
    Right: {
      on: {
        Toggle: { target: 'Left' }
      }
    }
  }
}

const MSTMachine = types
  .model({
    machineConfig: types.frozen()
  })
  .views(m => ({
    get state() {
      return m.machineState.value
    }
  }))
  .volatile(m => ({
    machine: undefined,
    machineState: undefined
  }))
  .actions(m => ({
    afterCreate() {
      m.machine = interpret(Machine(m.machineConfig))
      m.machine.onTransition(m.updateState)
      m.machine.start()
    },
    updateState() {
      m.machineState = m.machine.state
    },
    send(val) {
      m.machine.send(val)
    }
  }))

const store = MSTMachine.create({ machineConfig })

const ToggleButton = observer(() => (
  <button onClick={() => store.send('Toggle')}>Send 'Toggle' to machine</button>
))

const MachineState = observer(() => (
  <pre>machine state: {JSON.stringify(store.machineState, null, 2)})</pre>
))

const UsesMachineState = observer(() => (
  <div>{store.state === 'Left' ? '◀' : '▶'}</div>
))

const Main = () => (
  <>
    <UsesMachineState />
    <ToggleButton />
    <MachineState />
  </>
)

const rootElement = document.getElementById('root')
ReactDOM.render(<Main />, rootElement)
