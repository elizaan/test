import { ComponentBlock } from '../parser/types';
import { Sequence } from '../store/types';

export function getSequenceFlatMap<T extends Sequence | ComponentBlock>(sequence: T): string[] {
  return sequence.components.flatMap((component) => (typeof component === 'string' ? component : getSequenceFlatMap(component)));
}

type SkipConditionWithExtents = {
  currentBlock: Sequence;
  firstIndex: number;
  lastIndex: number;
};

function _findBlockForStep(sequence: Sequence, step: number, distance: number): (SkipConditionWithExtents & { parentBlocks: SkipConditionWithExtents[] }) | number {
  let componentsSeen = 0;
  for (let i = 0; i < sequence.components.length; i += 1) {
    const component = sequence.components[i];
    if (typeof component === 'string') {
      if (step === distance + componentsSeen) {
        return {
          currentBlock: sequence,
          firstIndex: distance,
          lastIndex: distance + sequence.components.length - 1,
          parentBlocks: [],
        };
      }
      componentsSeen += 1;
    } else {
      const result = _findBlockForStep(component, step, distance + componentsSeen);
      if (typeof result === 'number') {
        componentsSeen += result;
      } else {
        const newParentBlock = { currentBlock: sequence, firstIndex: distance, lastIndex: result.lastIndex };
        return { ...result, parentBlocks: newParentBlock ? [...result.parentBlocks, newParentBlock] : result.parentBlocks };
      }
    }
  }
  return componentsSeen;
}

export function findBlockForStep(sequence: Sequence, step: number) {
  const toReturn = _findBlockForStep(sequence, step, 0);
  return typeof toReturn === 'number' ? null : toReturn;
}

export function _findIndexOfBlock(sequence: Sequence, to: string, distance: number): { found: boolean, distance: number } {
  if (sequence.id === to) {
    return { found: true, distance };
  }
  let componentsSeen = 0;
  for (let i = 0; i < sequence.components.length; i += 1) {
    const component = sequence.components[i];
    if (typeof component === 'string') {
      componentsSeen += 1;
    } else {
      const result = _findIndexOfBlock(component, to, distance + componentsSeen);
      if (result.found) {
        return result;
      }
      componentsSeen += result.distance;
    }
  }
  return { found: false, distance: componentsSeen };
}

export function findIndexOfBlock(sequence: Sequence, to: string): number {
  const toReturn = _findIndexOfBlock(sequence, to, 0);
  return toReturn.found ? toReturn.distance : -1;
}
