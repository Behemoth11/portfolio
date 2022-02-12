import { useRoutingStateContext } from './../../TransitionManager/usePageTransition';
import { clamp } from "./utils";

import { useState, useRef, useEffect, useMemo } from "react";

export const useIntersectionObserver: (
  cb: IntersectionObserverCallback,
  config: IntersectionObserverInit,
  getRoot?: () => HTMLElement
) => IntersectionObserver = (cb, config, getRoot) => {
  const [observer, setObserver] = useState<IntersectionObserver>();

  useEffect(() => {
    config.root = getRoot && getRoot();
    setObserver(new IntersectionObserver(cb, config));
  }, []);

  return observer as IntersectionObserver;
};

/**
 * Create a ref object that follows the change of value of a state object;
 *
 * @param state value to track using ref
 * @returns react ref with the value saved as the Note property
 */
export function useSyncRef<T>(state: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = state;
  }, [state]);

  return ref as React.MutableRefObject<T>;
}

/**
 * Hook that indicate it's the first time the component is loading
 *
 * @returns a boolean indicating if the it's the first time a component is loading
 */
export const useFirstTimeLoading = () => {
  const load = useRef(true);
  useEffect(() => {
    load.current = false;
  }, []);

  return load.current as boolean;
};

export function useSequentialState<T>(
  states: readonly T[],
  unauthorizedSequence: string[]
) {
  const [stateIndex, setState] = useState(0);
  const currentState = states[stateIndex];

  const updateState = (direction: 1 | -1) => {
    let succeeded = true;
    setState((prevStateIndex) => {
      let desiredStateIndex = prevStateIndex + direction;
      let greatestIndex = states.length - 1;

      if (desiredStateIndex < 0) desiredStateIndex = greatestIndex;
      else if (desiredStateIndex > greatestIndex) desiredStateIndex = 0;

      if (
        unauthorizedSequence.includes(
          states[prevStateIndex] + "_" + states[desiredStateIndex]
        )
      ){
        succeeded = false;
        return prevStateIndex;
      }

      return desiredStateIndex;
    });

    if (!succeeded) {
      direction === -1 ? advance() : rewind();
    }
  };

  const tryChange = (desiredState: T, backward?: boolean) => {
    let succeeded = true;

    setState((prevStateIndex) => {
      // console.log(desiredState)
      if (states[prevStateIndex] === desiredState) return prevStateIndex;
      
      const desiredStateIndex = backward
        ? prevStateIndex - 1
        : prevStateIndex + 1;

      let possibleState: T = states[desiredStateIndex];

      if (
        possibleState !== desiredState ||
        unauthorizedSequence.includes(
          states[prevStateIndex] + "_" + desiredState
        )
      ) {
        succeeded = false;
        return prevStateIndex;
      }


      return desiredStateIndex;
    });

    if (!succeeded) {
      backward ? advance() : rewind();
    }

    return succeeded;
  };

  const advance = () => updateState(1);
  const rewind = () => updateState(-1);

  return {
    currentState,
    stateIndex,
    tryChange,
    advance,
    rewind,
  };
}

/**
 * Returns a function that can be used to force the rerender of a component
 *
 */
export const useForcedRender = () => {
  const [_, setState] = useState({});
  return () => setState({});
};

export const useSectionIs = (section: string, key: string) => {
  
  const isSection = useMemo(() => {
    return new RegExp(`^${section}`).test(key);
  }, [key])


  return isSection;
}

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Redux/createStore";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
