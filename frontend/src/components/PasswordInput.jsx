import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

export function PasswordInput({
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  function handleCapsCheck(event) {
    if (typeof event.getModifierState === "function") {
      setCapsOn(event.getModifierState("CapsLock"));
    }
  }

  return (
    <div className="password-field">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={handleCapsCheck}
        onKeyUp={handleCapsCheck}
        onBlur={() => setCapsOn(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setShow((current) => !current)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      {capsOn ? (
        <small className="caps-hint">
          <LockKeyhole size={12} /> Caps lock is on
        </small>
      ) : null}
    </div>
  );
}
