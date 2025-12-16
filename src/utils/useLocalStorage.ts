// useLocalStorage.js
import { useState } from 'react';

export default function useLocalStorage<T>(key: string, initialValue?: T): [T | undefined, (newValue: T) => void] {

  // Get stored value from local storage or use initial value
  try {
    const storedValue = JSON.parse(localStorage.getItem(key)!);
    if (storedValue !== null) {
      initialValue = storedValue;
    }
  }
  catch (e) {
    console.log(`WARN: Failed to parse localStorage key ${key}=${localStorage.getItem(key)}. Using default`);
  }

  // State to hold the current value
  const [value, setValue] = useState(initialValue);

  // Update local storage and state when the value changes
  const updateValue = (newValue: T) => {
    localStorage.setItem(key, JSON.stringify(newValue));
    setValue(newValue);
  };

  return [value, updateValue];
}
