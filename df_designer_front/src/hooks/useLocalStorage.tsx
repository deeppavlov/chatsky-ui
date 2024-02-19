import { Dispatch, SetStateAction, useEffect, useState } from "react";

function useLocalStorage<S>(key: string, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(JSON.parse(localStorage.getItem(key)) ?? initialState)

    useEffect(() => {
      const rawValue = JSON.stringify(state);
      localStorage.setItem(key, rawValue);
  }, [key, state]);

  return [state, setState]
}

export default useLocalStorage