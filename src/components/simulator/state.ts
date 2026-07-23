import type { ControlStrategy } from '@/lib/simulation/types'

export type SimulatorAction =
  | { type: 'TOGGLE_LETHAL' }
  | { type: 'SET_LETHAL_RATE'; value: number }
  | { type: 'TOGGLE_STERILIZATION' }
  | { type: 'SET_STERILIZATION_MALES'; value: number }
  | { type: 'SET_STERILIZATION_FEMALES'; value: number }
  | { type: 'TOGGLE_DISPLACEMENT' }
  | { type: 'SET_DISPLACEMENT_RATE'; value: number }

export const INITIAL_STRATEGY: ControlStrategy = {
  lethalControl: { enabled: false, individualsPerYear: 20 },
  sterilization: { enabled: false, malesPerYear: 10, femalesPerYear: 10 },
  displacement: { enabled: false, individualsPerYear: 3 },
}

export const RANGES = {
  lethal: { min: 10, max: 40, step: 1 },
  sterilizationMales: { min: 4, max: 30, step: 1 },
  sterilizationFemales: { min: 4, max: 30, step: 1 },
  displacement: { min: 2, max: 12, step: 1 },
} as const

export const simulatorReducer = (
  state: ControlStrategy,
  action: SimulatorAction,
): ControlStrategy => {
  switch (action.type) {
    case 'TOGGLE_LETHAL':
      return {
        ...state,
        lethalControl: { ...state.lethalControl, enabled: !state.lethalControl.enabled },
      }
    case 'SET_LETHAL_RATE':
      return {
        ...state,
        lethalControl: { ...state.lethalControl, individualsPerYear: action.value },
      }
    case 'TOGGLE_STERILIZATION':
      return {
        ...state,
        sterilization: { ...state.sterilization, enabled: !state.sterilization.enabled },
      }
    case 'SET_STERILIZATION_MALES':
      return {
        ...state,
        sterilization: { ...state.sterilization, malesPerYear: action.value },
      }
    case 'SET_STERILIZATION_FEMALES':
      return {
        ...state,
        sterilization: { ...state.sterilization, femalesPerYear: action.value },
      }
    case 'TOGGLE_DISPLACEMENT':
      return {
        ...state,
        displacement: { ...state.displacement, enabled: !state.displacement.enabled },
      }
    case 'SET_DISPLACEMENT_RATE':
      return {
        ...state,
        displacement: { ...state.displacement, individualsPerYear: action.value },
      }
  }
}
