import React, {forwardRef, useImperativeHandle, useRef} from "react";

const ScoreInput = forwardRef(({ value, onChange, disabled, nextRef }, ref) => {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
        value: localRef.current?.value
    }));

    const handleChange = (e) => {
        const val = e.target.value;

        if (!/^\d?$/.test(val)) return;

        if (value !== '' && val.length === 1) {
            onChange(val);

            setTimeout(() => {
                const shouldJump = nextRef?.current && nextRef.current.value === '';
                if (shouldJump) {
                    nextRef.current.focus();
                } else {
                    localRef.current?.blur();
                }
            }, 0);
        } else {
            onChange(val);

            if (val.length === 1) {
                setTimeout(() => {
                    const shouldJump = nextRef?.current && nextRef.current.value === '';
                    if (shouldJump) {
                        nextRef.current.focus();
                    } else {
                        localRef.current?.blur();
                    }
                }, 0);
            }
        }
    };

    const handleFocus = (e) => {
        requestAnimationFrame(() => {
            e.target.select();
        });
    };

    return (
        <input
            ref={localRef}
            type="text"
            inputMode="numeric"
            value={value ?? ''}
            onChange={handleChange}
            onFocus={handleFocus}
            disabled={disabled}
            placeholder="+"
            className="score-input"
        />
    );
});

export default ScoreInput;
