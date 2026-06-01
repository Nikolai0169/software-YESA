import React from "react";

const ColorPicker = ({ onChange }) => {
  return (
    <div>
      <h3>Selecciona un color</h3>
      <input
        type="color"
        defaultValue="#ff69b4"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ColorPicker;
