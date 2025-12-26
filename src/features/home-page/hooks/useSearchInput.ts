import { useState, useCallback } from "react";

export function useSearchInput() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const clear = useCallback(() => {
    setValue("");
  }, []);

  return {
    value,
    isFocused,
    handleFocus,
    handleBlur,
    handleChange,
    clear,
  };
}


