import React, { useState, useRef, useEffect } from "react";
import Personalizacion3D from "../components/Personalizacion3D";
import { guardarDiseno, cotizarProducto } from "../services/api";
import { saveDesignLocally } from "../services/personalizationService";

const PersonalizacionPage = () => {
  const defaultColors = {
    taza: { interior: "#ffffff", base: "#ffffff", exterior: "#ffffff", asa: "#ffffff" },
  };

  const defaultTexts = {
    taza: { interior: "", exterior: "" },
  };

  const [colorsByModel, setColorsByModel] = useState(defaultColors);
  const [texturesByModel, setTexturesByModel] = useState({
    taza: null,
  });
  const [textsByModel, setTextsByModel] = useState(defaultTexts);
  const [modelo3D, setModelo3D] = useState("taza");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  const modelOptions = [];
  // const modelOptions = [
  //   { id: "taza", label: "Taza", description: "Modelo actual con asa y base redonda." },
  // ];

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearModel = () => {
    setTexturesByModel((prev) => ({ ...prev, [modelo3D]: null }));
    setColorsByModel((prev) => ({ ...prev, [modelo3D]: { ...defaultColors[modelo3D] } }));
    setTextsByModel((prev) => ({ ...prev, [modelo3D]: { ...defaultTexts[modelo3D] } }));
  };

  const setModelColor = (field, value) => {
    setColorsByModel((prev) => ({
      ...prev,
      [modelo3D]: { ...prev[modelo3D], [field]: value },
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validFormats = ["image/jpeg", "image/png", "image/gif"];
    if (!validFormats.includes(file.type)) {
      alert("Formato no soportado. Usa JPG, PNG o GIF.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert("El archivo excede los 25MB.");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setTexturesByModel((prev) => ({ ...prev, [modelo3D]: fileUrl }));
  };

  const setModelText = (field, value) => {
    setTextsByModel((prev) => ({
      ...prev,
      [modelo3D]: { ...prev[modelo3D], [field]: value },
    }));
  };

  useEffect(() => {
    const updateFullscreen = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(fullscreenElement === previewRef.current);
    };

    document.addEventListener("fullscreenchange", updateFullscreen);
    document.addEventListener("webkitfullscreenchange", updateFullscreen);
    document.addEventListener("mozfullscreenchange", updateFullscreen);
    document.addEventListener("MSFullscreenChange", updateFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreen);
      document.removeEventListener("webkitfullscreenchange", updateFullscreen);
      document.removeEventListener("mozfullscreenchange", updateFullscreen);
      document.removeEventListener("MSFullscreenChange", updateFullscreen);
    };
  }, []);

  const handleZoomIn = () => setZoomLevel((current) => Math.min(current + 0.2, 2.4));
  const handleZoomOut = () => setZoomLevel((current) => Math.max(current - 0.2, 0.6));
  const handleFullscreen = async () => {
    const el = previewRef.current;
    if (!el) return;

    const isFullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (isFullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } else {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
    }
  };

  const handleCotizar = async () => {
    try {
      const currentColors = colorsByModel[modelo3D] || {};
      const currentTexts = textsByModel[modelo3D] || {};
      const disenoData = {
        modelo: modelo3D,
        colorInterior: currentColors.interior,
        colorBase: currentColors.base,
        colorExterior: currentColors.exterior,
        colorAsa: currentColors.asa,
        textInterior: currentTexts.interior,
        textExterior: currentTexts.exterior,
        textureUrl: texturesByModel[modelo3D] || null,
        zoom: zoomLevel,
      };
      const result = await cotizarProducto(disenoData);
      alert(`Cotización: $${result.precio || "Consultando..."}`);
    } catch (error) {
      console.error("Error al cotizar:", error);
      alert("Error al cotizar el producto");
    }
  };

  const handleGuardarDiseno = async () => {
    try {
      const currentColors = colorsByModel[modelo3D] || {};
      const currentTexts = textsByModel[modelo3D] || {};
      const disenoData = {
        modelo: modelo3D,
        colorInterior: currentColors.interior,
        colorBase: currentColors.base,
        colorExterior: currentColors.exterior,
        colorAsa: currentColors.asa,
        textInterior: currentTexts.interior,
        textExterior: currentTexts.exterior,
        textureUrl: texturesByModel[modelo3D] || null,
        zoom: zoomLevel,
        nombre: `Diseño personalizado - ${new Date().toLocaleDateString()}`,
      };
      const savedDesign = saveDesignLocally({
        id: `diseno_${Date.now()}`,
        ...disenoData,
        savedAt: new Date().toISOString(),
      });

      try {
        const result = await guardarDiseno(disenoData);
        alert(`Diseño guardado${result?.mensaje ? ' en servidor y localmente' : ''}${result?.id || result?._id ? ` con ID: ${result.id || result._id}` : ''}`);
      } catch (error) {
        console.error("Error al guardar diseño en servidor:", error);
        alert("Diseño guardado localmente");
      }
    } catch (error) {
      console.error("Error al guardar diseño:", error);
      alert("Error al guardar el diseño");
    }
  };

  const handleCompartir = () => {
    const url = window.location.href;
    const textoCompartir = `Mira mi diseño personalizado: ${url}`;

    if (navigator.share) {
      navigator.share({
        title: "Mi Diseño Personalizado",
        text: textoCompartir,
        url,
      });
    } else {
      navigator.clipboard.writeText(textoCompartir);
      alert("Link copiado al portapapeles");
    }
  };

  const isRing = modelo3D === "anillo";

  return (
    <div className="container py-5 personalizacion-page">
      <div className="personalizacion-card mx-auto">
        <div className="d-flex flex-column flex-lg-row gap-4">
          <section className="flex-fill personalizacion-section">
            <div className="d-flex flex-column h-100">
              <div>
                <h1 className="personalizacion-title">Personaliza tu producto</h1>
                <p className="text-muted mb-4">
                  Ajusta color, textura y diseños con la misma experiencia visual de las demás pantallas.
                </p>

                <div className="personalizacion-model-buttons d-flex flex-wrap gap-2 mb-3">
                  {modelOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`btn btn-sm ${modelo3D === option.id ? 'btn-yesa-primary' : 'btn-outline-secondary'}`}
                      disabled={option.id === 'taza'}
                      onClick={() => option.id !== 'taza' && setModelo3D(option.id)}
                    >
                      <div className="text-start">
                        <strong>{option.label}</strong>
                        <div className="small text-muted">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="personalizacion-preview-fullscreen-wrapper" ref={previewRef}>
                <div className="personalizacion-preview mt-3 position-relative">
                  <Personalizacion3D 
                    modelo={modelo3D}
                    colorInterior={(colorsByModel[modelo3D] && colorsByModel[modelo3D].interior) || '#ffffff'}
                    colorBase={(colorsByModel[modelo3D] && colorsByModel[modelo3D].base) || '#ffffff'}
                    colorExterior={(colorsByModel[modelo3D] && colorsByModel[modelo3D].exterior) || '#ffffff'}
                    colorAsa={(colorsByModel[modelo3D] && colorsByModel[modelo3D].asa) || '#ffffff'}
                    texture={texturesByModel[modelo3D]} 
                    textInterior={(textsByModel[modelo3D] && textsByModel[modelo3D].interior) || ''}
                    textExterior={(textsByModel[modelo3D] && textsByModel[modelo3D].exterior) || ''}
                    zoom={zoomLevel} 
                  />
                  <div className="personalizacion-preview-overlay d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleZoomOut}>
                      -
                    </button>
                    <span className="text-dark small">{Math.round(zoomLevel * 100)}%</span>
                    <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleZoomIn}>
                      +
                    </button>
                    <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleFullscreen} title={isFullscreen ? "Salir de pantalla completa" : "Entrar a pantalla completa"}>
                      <i className={isFullscreen ? "bi bi-fullscreen-exit" : "bi bi-arrows-fullscreen"}></i>
                    </button>
                  </div>
                </div>

                <div className="personalizacion-preview-controls d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {isRing ? (
                      <>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <span className="small text-dark">Exterior</span>
                          <input
                            type="color"
                            value={(colorsByModel[modelo3D] && colorsByModel[modelo3D].exterior) || '#3b82f6'}
                            onChange={(e) => setModelColor('exterior', e.target.value)}
                            className="form-control form-control-color"
                            style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                          />
                        </label>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <span className="small text-dark">Texto interior</span>
                          <input
                            type="text"
                            value={(textsByModel[modelo3D] && textsByModel[modelo3D].interior) || ''}
                            onChange={(e) => setModelText('interior', e.target.value)}
                            className="form-control"
                            style={{ width: "180px", minWidth: "180px" }}
                            placeholder="Texto interior"
                          />
                        </label>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <span className="small text-dark">Texto exterior</span>
                          <input
                            type="text"
                            value={(textsByModel[modelo3D] && textsByModel[modelo3D].exterior) || ''}
                            onChange={(e) => setModelText('exterior', e.target.value)}
                            className="form-control"
                            style={{ width: "180px", minWidth: "180px" }}
                            placeholder="Texto exterior"
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <span className="small text-dark">Interior</span>
                          <input
                            type="color"
                            value={(colorsByModel[modelo3D] && colorsByModel[modelo3D].interior) || '#ffffff'}
                            onChange={(e) => setModelColor('interior', e.target.value)}
                            className="form-control form-control-color"
                            style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                          />
                        </label>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <span className="small text-dark">Base</span>
                          <input
                            type="color"
                            value={(colorsByModel[modelo3D] && colorsByModel[modelo3D].base) || '#ffffff'}
                            onChange={(e) => setModelColor('base', e.target.value)}
                            className="form-control form-control-color"
                            style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                          />
                        </label>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <span className="small text-dark">Exterior</span>
                          <input
                            type="color"
                            value={(colorsByModel[modelo3D] && colorsByModel[modelo3D].exterior) || '#ffffff'}
                            onChange={(e) => setModelColor('exterior', e.target.value)}
                            className="form-control form-control-color"
                            style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                          />
                        </label>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <span className="small text-dark">Oreja</span>
                          <input
                            type="color"
                            value={(colorsByModel[modelo3D] && colorsByModel[modelo3D].asa) || '#ffffff'}
                            onChange={(e) => setModelColor('asa', e.target.value)}
                            className="form-control form-control-color"
                            style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                          />
                        </label>
                      </>
                    )}
                    {!isRing && (
                      <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleFileSelect}>
                        Elegir archivo
                      </button>
                    )}
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleClearModel}>
                      Limpiar
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {!isFullscreen && (
                  <div className="personalizacion-actions d-flex flex-wrap justify-content-center gap-2 mt-4">
                    <button type="button" className="btn btn-yesa-primary" onClick={handleCotizar}>
                      Cotizar producto
                    </button>
                    <button type="button" className="btn btn-yesa-gold" onClick={handleGuardarDiseno}>
                      Guardar diseño
                    </button>
                    <button type="button" className="btn btn-yesa-tertiary" onClick={handleCompartir}>
                      Compartir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PersonalizacionPage;
