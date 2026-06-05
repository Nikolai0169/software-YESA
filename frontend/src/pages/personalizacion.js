import React, { useState, useRef, useEffect } from "react";
import Personalizacion3D from "../components/Personalizacion3D";
import { guardarDiseno, cotizarProducto } from "../services/api";
import { saveDesignLocally, getDesignToEdit, clearDesignToEdit } from "../services/personalizationService";

const PersonalizacionPage = () => {
  const defaultColors = {
    taza: { interior: "#ffffff", base: "#ffffff", exterior: "#ffffff", asa: "#ffffff" },
  };

  const defaultTexts = {
    taza: { texto: ""},
  };

  const [colorsByModel, setColorsByModel] = useState(defaultColors);
  const [texturesByModel, setTexturesByModel] = useState({
    taza: null,
  });
  const [textsByModel, setTextsByModel] = useState(defaultTexts);
  const [modelo3D, setModelo3D] = useState("taza");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRotating, setIsRotating] = useState(true);
  const [currentDesignId, setCurrentDesignId] = useState(null);
  const [currentDesignName, setCurrentDesignName] = useState("");
  const [overlayTextByModel, setOverlayTextByModel] = useState({ taza: "" });
  const [overlayTextSettingsByModel, setOverlayTextSettingsByModel] = useState({
    taza: { fontFamily: "sans-serif", fontSize: 24, color: "#000000" },
  });
  const [composedTextureUrl, setComposedTextureUrl] = useState(null);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [textEditorContent, setTextEditorContent] = useState("");
  const [textEditorFontFamily, setTextEditorFontFamily] = useState("sans-serif");
  const [textEditorFontSize, setTextEditorFontSize] = useState(24);
  const [textEditorColor, setTextEditorColor] = useState("#000000");
  const [textureOffset, setTextureOffset] = useState({ x: 0, y: 0 });
  const [textureScale, setTextureScale] = useState(1);
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
    setOverlayTextByModel((prev) => ({ ...prev, [modelo3D]: '' }));
    setOverlayTextSettingsByModel((prev) => ({
      ...prev,
      [modelo3D]: { fontFamily: 'sans-serif', fontSize: 24, color: '#000000' },
    }));
    setTextEditorContent('');
    setTextEditorFontFamily('sans-serif');
    setTextEditorFontSize(24);
    setTextEditorColor('#000000');
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

    const reader = new FileReader();
    reader.onload = () => {
      setTexturesByModel((prev) => ({ ...prev, [modelo3D]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const setModelText = (field, value) => {
    setTextsByModel((prev) => ({
      ...prev,
      [modelo3D]: { ...prev[modelo3D], [field]: value },
    }));
  };

  useEffect(() => {
    const designToEdit = getDesignToEdit();
    if (designToEdit) {
      const model = designToEdit.modelo || 'taza';
      setCurrentDesignId(designToEdit.id || null);
      setCurrentDesignName(
        designToEdit.nombre || `Diseño personalizado - ${new Date().toLocaleDateString()}`
      );
      setModelo3D(model);
      setColorsByModel((prev) => ({
        ...prev,
        [model]: {
          interior: designToEdit.colorInterior || '#ffffff',
          base: designToEdit.colorBase || '#ffffff',
          exterior: designToEdit.colorExterior || '#ffffff',
          asa: designToEdit.colorAsa || '#ffffff',
        },
      }));
      setTexturesByModel((prev) => ({
        ...prev,
        [model]: designToEdit.textureUrl || designToEdit.texture || null,
      }));
      setTextsByModel((prev) => ({
        ...prev,
        [model]: {
          interior: designToEdit.textInterior || '',
          exterior: designToEdit.textExterior || '',
        },
      }));
      setOverlayTextByModel((prev) => ({
        ...prev,
        [model]: designToEdit.overlayText || '',
      }));
      setOverlayTextSettingsByModel((prev) => ({
        ...prev,
        [model]: {
          fontFamily: designToEdit.overlayTextFontFamily || 'sans-serif',
          fontSize: designToEdit.overlayTextFontSize || 24,
          color: designToEdit.overlayTextColor || '#ffffff',
        },
      }));
      setZoomLevel(designToEdit.zoom || 1);
      clearDesignToEdit();
    }
  }, []);

  useEffect(() => {
    const currentTextureUrl = texturesByModel[modelo3D] || null;
    const currentOverlayText = overlayTextByModel[modelo3D] || '';
    const currentSettings = overlayTextSettingsByModel[modelo3D] || {
      fontFamily: 'sans-serif',
      fontSize: 24,
      color: '#000000',
    };

    if (!currentOverlayText) {
      setComposedTextureUrl(currentTextureUrl);
      return;
    }

    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const drawOverlayText = () => {
      ctx.fillStyle = currentSettings.color;
      ctx.font = `bold ${currentSettings.fontSize}px ${currentSettings.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = currentOverlayText.split('\n');
      const lineHeight = currentSettings.fontSize + 10;
      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          size / 2,
          size / 2 + (index - (lines.length - 1) / 2) * lineHeight
        );
      });
      setComposedTextureUrl(canvas.toDataURL('image/png'));
    };

    if (currentTextureUrl) {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        ctx.clearRect(0, 0, size, size);
        const scaledSize = size * textureScale;
        const centerOffset = (size - scaledSize) / 2;
        ctx.drawImage(
          image,
          centerOffset + textureOffset.x,
          centerOffset + textureOffset.y,
          scaledSize,
          scaledSize
        );
        drawOverlayText();
      };
      image.onerror = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        drawOverlayText();
      };
      image.src = currentTextureUrl;
    } else {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      drawOverlayText();
    }
  }, [modelo3D, overlayTextByModel, overlayTextSettingsByModel, texturesByModel, textureOffset, textureScale]);

  useEffect(() => {
    setTextureOffset({ x: 0, y: 0 });
    setTextureScale(1);
  }, [modelo3D]);

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

  const zoomIntervalRef = useRef(null);
  const zoomTimeoutRef = useRef(null);

  const moveTexture = (dx, dy) => {
    setTextureOffset((prev) => ({
      x: Math.max(Math.min(prev.x + dx, 300), -300),
      y: Math.max(Math.min(prev.y + dy, 300), -300),
    }));
  };

  const changeTextureScale = (delta) => {
    setTextureScale((current) => Math.max(Math.min(current + delta, 3), 0.4));
  };

  const handleZoomIn = () => setZoomLevel((current) => Math.min(current + 0.1, 2.0));
  const handleZoomOut = () => setZoomLevel((current) => Math.max(current - 0.1, 1.0));

  const clearZoomTimers = () => {
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = null;
    }
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
      zoomIntervalRef.current = null;
    }
  };

  const startZoomRepeat = (zoomFn) => {
    clearZoomTimers();
    zoomTimeoutRef.current = setTimeout(() => {
      zoomIntervalRef.current = setInterval(zoomFn, 120);
    }, 300);
  };

  useEffect(() => {
    return () => {
      clearZoomTimers();
    };
  }, []);

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
        id: currentDesignId || `diseno_${Date.now()}`,
        modelo: modelo3D,
        colorInterior: currentColors.interior,
        colorBase: currentColors.base,
        colorExterior: currentColors.exterior,
        colorAsa: currentColors.asa,
        textInterior: currentTexts.interior,
        textExterior: currentTexts.exterior,
        textureUrl: texturesByModel[modelo3D] || null,
        overlayText: overlayTextByModel[modelo3D] || '',
        overlayTextFontFamily: (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontFamily) || 'sans-serif',
        overlayTextFontSize: (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontSize) || 24,
        overlayTextColor: (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].color) || '#ffffff',
        zoom: zoomLevel,
        nombre:
          currentDesignName || `Diseño personalizado - ${new Date().toLocaleDateString()}`,
      };
      const savedDesign = saveDesignLocally({
        ...disenoData,
        savedAt: new Date().toISOString(),
      });
      setCurrentDesignId(savedDesign.id);
      setCurrentDesignName(savedDesign.nombre);

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
                    texture={composedTextureUrl}
                    overlayText={overlayTextByModel[modelo3D] || ''}
                    overlayTextFontFamily={(overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontFamily) || 'sans-serif'}
                    overlayTextFontSize={(overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontSize) || 24}
                    overlayTextColor={(overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].color) || '#ffffff'}
                    textInterior={(textsByModel[modelo3D] && textsByModel[modelo3D].interior) || ''}
                    textExterior={(textsByModel[modelo3D] && textsByModel[modelo3D].exterior) || ''}
                    zoom={zoomLevel}
                    autoRotate={isRotating}
                  />
                  <div className="personalizacion-image-scale-widget position-absolute top-50 start-0 translate-middle-y ms-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-yesa-secondary btn-icon"
                      onClick={() => changeTextureScale(0.1)}
                      disabled={!texturesByModel[modelo3D]}
                      title="Aumentar tamaño"
                    >
                      <i className="bi bi-plus" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-yesa-secondary btn-icon"
                      onClick={() => changeTextureScale(-0.1)}
                      disabled={!texturesByModel[modelo3D]}
                      title="Disminuir tamaño"
                    >
                      <i className="bi bi-dash" />
                    </button>
                  </div>
                  <div className="personalizacion-preview-overlay d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-yesa-secondary"
                      onClick={handleZoomOut}
                      onMouseDown={() => startZoomRepeat(handleZoomOut)}
                      onMouseUp={clearZoomTimers}
                      onMouseLeave={clearZoomTimers}
                      onTouchStart={() => startZoomRepeat(handleZoomOut)}
                      onTouchEnd={clearZoomTimers}
                    >
                      -
                    </button>
                    <span className="text-dark small">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-yesa-secondary"
                      onClick={handleZoomIn}
                      onMouseDown={() => startZoomRepeat(handleZoomIn)}
                      onMouseUp={clearZoomTimers}
                      onMouseLeave={clearZoomTimers}
                      onTouchStart={() => startZoomRepeat(handleZoomIn)}
                      onTouchEnd={clearZoomTimers}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${isRotating ? 'btn-rotate-active' : 'btn-rotate-paused'} btn-icon`}
                      onClick={() => setIsRotating((prev) => !prev)}
                      title={isRotating ? 'Detener rotación' : 'Rotar modelo'}
                    >
                      <i className="bi bi-arrow-clockwise" />
                    </button>
                    <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleFullscreen} title={isFullscreen ? "Salir de pantalla completa" : "Entrar a pantalla completa"}>
                      <i className={isFullscreen ? "bi bi-fullscreen-exit" : "bi bi-arrows-fullscreen"}></i>
                    </button>
                  </div>
                  <div className="personalizacion-image-position-widget position-absolute start-0 bottom-0 m-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-image fs-5" />
                      <span className="small fw-semibold">Ajustar</span>
                    </div>
                    <div className="image-position-grid">
                      <button
                        type="button"
                        className="btn btn-sm btn-yesa-secondary btn-icon"
                        onClick={() => moveTexture(0, -64)}
                        disabled={!texturesByModel[modelo3D]}
                        title="Mover arriba"
                      >
                        <i className="bi bi-arrow-up" />
                      </button>
                      <div className="d-flex justify-content-between gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-yesa-secondary btn-icon"
                          onClick={() => moveTexture(-64, 0)}
                          disabled={!texturesByModel[modelo3D]}
                          title="Mover izquierda"
                        >
                          <i className="bi bi-arrow-left" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-yesa-secondary btn-icon"
                          onClick={() => moveTexture(64, 0)}
                          disabled={!texturesByModel[modelo3D]}
                          title="Mover derecha"
                        >
                          <i className="bi bi-arrow-right" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-yesa-secondary btn-icon"
                        onClick={() => moveTexture(0, 64)}
                        disabled={!texturesByModel[modelo3D]}
                        title="Mover abajo"
                      >
                        <i className="bi bi-arrow-down" />
                      </button>
                    </div>
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
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-yesa-secondary"
                          onClick={() => {
                            setTextEditorContent(overlayTextByModel[modelo3D] || '');
                            const currentSettings = overlayTextSettingsByModel[modelo3D] || {
                              fontFamily: 'sans-serif',
                              fontSize: 24,
                              color: '#ffffff',
                            };
                            setTextEditorFontFamily(currentSettings.fontFamily);
                            setTextEditorFontSize(currentSettings.fontSize);
                            setTextEditorColor(currentSettings.color || '#000000');
                            setTextEditorOpen(true);
                          }}
                        >
                          Agregar texto
                        </button>
                        <button type="button" className="btn btn-sm btn-yesa-secondary" onClick={handleFileSelect}>
                          Elegir archivo
                        </button>
                      </>
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

                {textEditorOpen && (
                  <div className="text-editor-modal">
                    <div className="text-editor-dialog">
                      <div className="text-editor-header d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">Editor de texto</h5>
                          <p className="text-muted mb-0">Selecciona tipografía, tamaño y color para el texto del modelo.</p>
                        </div>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setTextEditorOpen(false)} />
                      </div>
                      <div className="text-editor-toolbar d-flex flex-wrap align-items-center gap-2 mt-3">
                        <label className="mb-0 small text-muted">Fuente</label>
                        <select
                          className="form-select form-select-sm"
                          value={textEditorFontFamily}
                          onChange={(e) => setTextEditorFontFamily(e.target.value)}
                          style={{ minWidth: '170px' }}
                        >
                          <option value="sans-serif">Sans serif</option>
                          <option value="Arial, Helvetica, sans-serif">Arial</option>
                          <option value="Segoe UI, Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
                          <option value="Tahoma, Geneva, Verdana, sans-serif">Tahoma</option>
                          <option value="serif">Serif</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Times New Roman, Times, serif">Times New Roman</option>
                          <option value="monospace">Monospace</option>
                          <option value="Courier New, Courier, monospace">Courier New</option>
                          <option value="Lucida Console, Monaco, monospace">Lucida Console</option>
                          <option value="cursive">Cursiva</option>
                          <option value="Brush Script MT, cursive">Brush Script</option>
                          <option value="Comic Sans MS, cursive, sans-serif">Comic Sans</option>
                        </select>
                        <label className="mb-0 small text-muted">Tamaño</label>
                        <select
                          className="form-select form-select-sm"
                          value={textEditorFontSize}
                          onChange={(e) => setTextEditorFontSize(Number(e.target.value))}
                          style={{ minWidth: '110px' }}
                        >
                          <option value={14}>14px</option>
                          <option value={16}>16px</option>
                          <option value={18}>18px</option>
                          <option value={20}>20px</option>
                          <option value={22}>22px</option>
                          <option value={24}>24px</option>
                          <option value={28}>28px</option>
                          <option value={32}>32px</option>
                          <option value={36}>36px</option>
                          <option value={40}>40px</option>
                          <option value={48}>48px</option>
                        </select>
                        <label className="mb-0 small text-muted">Color</label>
                        <input
                          type="color"
                          value={textEditorColor}
                          onChange={(e) => setTextEditorColor(e.target.value)}
                          style={{ width: '44px', height: '44px', padding: 0, borderRadius: '0.75rem', border: '1px solid rgba(148, 163, 184, 0.4)' }}
                        />
                      </div>
                      <div className="text-editor-body mt-3">
                        <textarea
                          rows={4}
                          value={textEditorContent}
                          onChange={(e) => {
                            setTextEditorContent(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          className="form-control"
                          placeholder="Escribe el texto que quieras aplicar al modelo"
                          style={{ fontFamily: textEditorFontFamily, fontSize: `${textEditorFontSize}px`, color: '#000000', minHeight: '120px', overflow: 'hidden' }}
                        />
                      </div>
                      <div className="text-editor-actions d-flex justify-content-end gap-2 mt-3">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setTextEditorOpen(false)}>
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-yesa-primary"
                          onClick={() => {
                            setOverlayTextByModel((prev) => ({
                              ...prev,
                              [modelo3D]: textEditorContent,
                            }));
                            setOverlayTextSettingsByModel((prev) => ({
                              ...prev,
                              [modelo3D]: {
                                fontFamily: textEditorFontFamily,
                                fontSize: textEditorFontSize,
                                color: textEditorColor,
                              },
                            }));
                            setTextEditorOpen(false);
                          }}
                        >
                          Aplicar texto
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
