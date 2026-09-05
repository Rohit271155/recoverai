import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const AnimatedCounter = ({ value, prefix = '', suffix = '', isCurrency = false }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isUpdated, setIsUpdated] = useState(false);
  const valueRef = useRef({ val: 0 });
  const prevTargetRef = useRef(null);

  useEffect(() => {
    const targetValue = Number(value) || 0;

    // Detect real value update after initial mount
    if (prevTargetRef.current !== null && prevTargetRef.current !== targetValue) {
      setIsUpdated(true);
      const timer = setTimeout(() => setIsUpdated(false), 1200);
      gsap.to(valueRef.current, {
        val: targetValue,
        duration: 1.1,
        ease: 'power3.out',
        onUpdate: () => setDisplayValue(valueRef.current.val),
      });
      prevTargetRef.current = targetValue;
      return () => clearTimeout(timer);
    } else {
      prevTargetRef.current = targetValue;
      gsap.to(valueRef.current, {
        val: targetValue,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => setDisplayValue(valueRef.current.val),
      });
    }
  }, [value]);

  const formatNumber = (num) => {
    if (isCurrency) {
      return Math.round(num).toLocaleString('en-IN');
    }
    if (num % 1 !== 0) {
      return num.toFixed(1);
    }
    return Math.round(num).toLocaleString('en-IN');
  };

  return (
    <span className={`font-mono-numeric transition-all duration-300 inline-block ${isUpdated ? 'counter-value-updated' : ''}`}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
