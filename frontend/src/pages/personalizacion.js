import React, { useState, useRef, useEffect } from "react";
import Personalizacion3D from "../components/Personalizacion3D";
import { guardarDiseno, cotizarProducto } from "../services/api";
import carritoService from "../services/carritoService";

const PersonalizacionPage = () => {
  const [colorInterior, setColorInterior] = useState("#ffffff");
  const [colorBase, setColorBase] = useState("#ffffff");
  const [colorExterior, setColorExterior] = useState("#ffffff");
  const [colorAsa, setColorAsa] = useState("#ffffff");
  const [texture, setTexture] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    setTexture(fileUrl);
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

    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
    }
  };

  const handleCotizar = async () => {
    try {
      const disenoData = {
        colorInterior,
        colorBase,
        colorExterior,
        colorAsa,
        textureUrl: texture,
        zoom: zoomLevel,
      };
      const result = await cotizarProducto(disenoData);
      alert(`Cotización: $${result.precio || "Consultando..."}`);
    } catch (error) {
      console.error("Error al cotizar:", error);
      alert("Error al cotizar el producto");
    }
  };

  const handleAgregarCarrito = async () => {
    try {
      const disenoData = {
        colorInterior,
        colorBase,
        colorExterior,
        colorAsa,
        textureUrl: texture,
        zoom: zoomLevel,
        nombre: "Producto Personalizado",
        precio: 0,
        imagen: null,
      };
      const result = await carritoService.agregarAlCarrito("personalizacion_" + Date.now(), 1, disenoData);
      if (result.success) {
        alert("Producto agregado al carrito");
      } else {
        alert(result.message || "Error al agregar al carrito");
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert(error?.message || "Error al agregar al carrito");
    }
  };

  const handleGuardarDiseno = async () => {
    try {
      const disenoData = {
        colorInterior,
        colorBase,
        colorExterior,
        colorAsa,
        textureUrl: texture,
        zoom: zoomLevel,
        nombre: `Diseño personalizado - ${new Date().toLocaleDateString()}`,
      };
      const result = await guardarDiseno(disenoData);
      alert(`Diseño guardado con ID: ${result.id || result._id}`);
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
              </div>

              <div className="personalizacion-preview-fullscreen-wrapper" ref={previewRef}>
                <div className="personalizacion-preview mt-3">
                  <Personalizacion3D 
                    colorInterior={colorInterior}
                    colorBase={colorBase}
                    colorExterior={colorExterior}
                    colorAsa={colorAsa}
                    texture={texture} 
                    zoom={zoomLevel} 
                  />
                </div>

                <div className="personalizacion-preview-controls d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleZoomOut}>
                      -
                    </button>
                    <span className="text-dark small">Zoom: {Math.round(zoomLevel * 100)}%</span>
                    <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleZoomIn}>
                      +
                    </button>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <label className="d-flex align-items-center gap-2 mb-0">
                      <span className="small text-dark">Interior</span>
                      <input
                        type="color"
                        value={colorInterior}
                        onChange={(e) => setColorInterior(e.target.value)}
                        className="form-control form-control-color"
                        style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                      />
                    </label>
                    <label className="d-flex align-items-center gap-2 mb-0">
                      <span className="small text-dark">Base</span>
                      <input
                        type="color"
                        value={colorBase}
                        onChange={(e) => setColorBase(e.target.value)}
                        className="form-control form-control-color"
                        style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                      />
                    </label>
                    <label className="d-flex align-items-center gap-2 mb-0">
                      <span className="small text-dark">Exterior</span>
                      <input
                        type="color"
                        value={colorExterior}
                        onChange={(e) => setColorExterior(e.target.value)}
                        className="form-control form-control-color"
                        style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                      />
                    </label>
                    <label className="d-flex align-items-center gap-2 mb-0">
                      <span className="small text-dark">Asa</span>
                      <input
                        type="color"
                        value={colorAsa}
                        onChange={(e) => setColorAsa(e.target.value)}
                        className="form-control form-control-color"
                        style={{ width: "44px", height: "44px", padding: 0, border: "1px solid rgba(148, 163, 184, 0.4)", borderRadius: "0.75rem", background: "transparent" }}
                      />
                    </label>
                    <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleFileSelect}>
                      Elegir archivo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <button type="button" className="btn btn-sm btn-yesa-primary" onClick={handleFullscreen}>
                      Pantalla completa
                    </button>
                  </div>
                </div>

                {!isFullscreen && (
                  <div className="personalizacion-actions d-flex flex-wrap justify-content-center gap-2 mt-4">
                    <button type="button" className="btn btn-yesa-primary" onClick={handleCotizar}>
                      Cotizar producto
                    </button>
                    <button type="button" className="btn btn-yesa-secondary" onClick={handleAgregarCarrito}>
                      Agregar al carrito
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleGuardarDiseno}>
                      Guardar diseño
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCompartir}>
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
