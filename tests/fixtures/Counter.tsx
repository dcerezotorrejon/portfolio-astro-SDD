import { useState } from "react";

interface CounterProps {
  initial?: number;
}

export default function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <section aria-label="Counter" className="space-y-2">
      <h1 className="text-xl font-semibold">Counter</h1>
      <output aria-live="polite">Count: {count}</output>
      <button type="button" onClick={() => setCount((prev) => prev + 1)}>
        Increment
      </button>
    </section>
  );
}
