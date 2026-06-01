import React from "react";

const UploadImage = ({ onUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    const validFormats = ["image/jpeg", "image/png", "image/gif"];
    if (!validFormats.includes(file.type)) {
      alert("Formato no soportado. Usa JPG, PNG o GIF.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert("El archivo excede los 25MB.");
      return;
    }

    // Crear URL temporal para vista previa
    const fileUrl = URL.createObjectURL(file);
    onUpload(fileUrl);
  };

  return (
    <div>
      <h3>Imagen Personalizada</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

export default UploadImage;
