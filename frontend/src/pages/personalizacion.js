import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Personalizacion3D from "../components/Personalizacion3D";
import { useAuth } from "../context/AuthContext";
import { guardarDiseno, cotizarProducto } from "../services/api";
import {
  saveDesignLocally,
  getDesignToEdit,
  clearDesignToEdit,
  setPendingDesignToEdit,
  getPendingDesignToEdit,
  clearPendingDesignToEdit,
} from "../services/personalizationService";
import { formatCurrency, normalizePersonalizacionDesign } from "../utils/helpers";

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:');

const buildQuotePayload = (design) => {
  const payload = { ...design };

  if (isDataUrl(payload.textureUrl)) {
    delete payload.textureUrl;
  }

  delete payload.composedTextureUrl;
  delete payload.textEditorOpen;
  delete payload.textEditorContent;
  delete payload.textEditorFontFamily;
  delete payload.textEditorFontSize;
  delete payload.textEditorColor;

  return payload;
};

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
  const [cotizacion, setCotizacion] = useState(null);
  const [cotizando, setCotizando] = useState(false);
  const [nombreCotizacion, setNombreCotizacion] = useState('');
  const [notasCotizacion, setNotasCotizacion] = useState('');
  const { isAuthenticated, isCliente } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const canvasRef = useRef(null);
  const blobUrlRef = useRef(null);
  const CANVAS_SIZE = 2048;

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

  const buildCurrentDesignState = () => {
    const currentColors = colorsByModel[modelo3D] || {};
    const currentTexts = textsByModel[modelo3D] || {};

    return normalizePersonalizacionDesign({
      id: currentDesignId || `diseno_${Date.now()}`,
      nombre:
        currentDesignName || `Diseño personalizado - ${new Date().toLocaleDateString()}`,
      modelo: modelo3D,
      colorInterior: currentColors.interior,
      colorBase: currentColors.base,
      colorExterior: currentColors.exterior,
      colorAsa: currentColors.asa,
      textInterior: currentTexts.interior,
      textExterior: currentTexts.exterior,
      textureUrl: texturesByModel[modelo3D] || null,
      overlayText: overlayTextByModel[modelo3D] || '',
      overlayTextFontFamily:
        (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontFamily) || 'sans-serif',
      overlayTextFontSize:
        (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontSize) || 24,
      overlayTextColor:
        (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].color) || '#ffffff',
      zoom: zoomLevel,
      textureOffsetX: textureOffset?.x,
      textureOffsetY: textureOffset?.y,
      textureScale,
      textEditorOpen,
      textEditorContent,
      textEditorFontFamily,
      textEditorFontSize,
      textEditorColor,
    });
  };

  const redirectToLoginWithDesign = () => {
    setPendingDesignToEdit(buildCurrentDesignState());
    navigate('/login', { state: { from: location.pathname || '/personalizacion' } });
  };

  useEffect(() => {
    const pendingDesign = getPendingDesignToEdit();
    const designToEdit = pendingDesign || getDesignToEdit();
    if (designToEdit) {
      const normalizedDesign = normalizePersonalizacionDesign(designToEdit);
      setNombreCotizacion(designToEdit.nombre || '');
      const model = normalizedDesign.modelo || 'taza';
      setCurrentDesignId(normalizedDesign.id || null);
      setCurrentDesignName(
        normalizedDesign.nombre || `Diseño personalizado - ${new Date().toLocaleDateString()}`
      );
      setModelo3D(model);
      setColorsByModel((prev) => ({
        ...prev,
        [model]: {
          interior: normalizedDesign.colorInterior || '#ffffff',
          base: normalizedDesign.colorBase || '#ffffff',
          exterior: normalizedDesign.colorExterior || '#ffffff',
          asa: normalizedDesign.colorAsa || '#ffffff',
        },
      }));
      setTexturesByModel((prev) => ({
        ...prev,
        [model]: normalizedDesign.textureUrl || normalizedDesign.texture || null,
      }));
      setTextsByModel((prev) => ({
        ...prev,
        [model]: {
          interior: normalizedDesign.textInterior || '',
          exterior: normalizedDesign.textExterior || '',
        },
      }));
      setOverlayTextByModel((prev) => ({
        ...prev,
        [model]: normalizedDesign.overlayText || '',
      }));
      setOverlayTextSettingsByModel((prev) => ({
        ...prev,
        [model]: {
          fontFamily: normalizedDesign.overlayTextFontFamily || 'sans-serif',
          fontSize: normalizedDesign.overlayTextFontSize || 24,
          color: normalizedDesign.overlayTextColor || '#ffffff',
        },
      }));
      setZoomLevel(normalizedDesign.zoom);
      setTextureOffset(normalizedDesign.textureOffset);
      setTextureScale(normalizedDesign.textureScale);
      setTextEditorOpen(!!normalizedDesign.textEditorOpen);
      setTextEditorContent(normalizedDesign.textEditorContent || '');
      setTextEditorFontFamily(normalizedDesign.textEditorFontFamily || 'sans-serif');
      setTextEditorFontSize(normalizedDesign.textEditorFontSize || 24);
      setTextEditorColor(normalizedDesign.textEditorColor || '#000000');
      if (pendingDesign) {
        clearPendingDesignToEdit();
      } else {
        clearDesignToEdit();
      }
    }
  }, []);

  useEffect(() => {
    // Inicializar canvas solo una vez
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = CANVAS_SIZE;
      canvasRef.current.height = CANVAS_SIZE;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = CANVAS_SIZE;
    const currentTextureUrl = texturesByModel[modelo3D] || null;
    const currentOverlayText = overlayTextByModel[modelo3D] || '';
    const currentSettings = overlayTextSettingsByModel[modelo3D] || {
      fontFamily: 'sans-serif',
      fontSize: 24,
      color: '#000000',
    };

    const updateTexture = () => {
      // Limpiar blob anterior
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      // Rellenar canvas con blanco (fondo sólido sin transparencia)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Dibujar la imagen si existe
      if (currentTextureUrl) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          const scaledSize = size * textureScale;
          const centerOffset = (size - scaledSize) / 2;
          ctx.drawImage(
            image,
            centerOffset + textureOffset.x,
            centerOffset + textureOffset.y,
            scaledSize,
            scaledSize
          );
          drawOverlayAndUpdate();
        };
        image.onerror = () => {
          drawOverlayAndUpdate();
        };
        image.src = currentTextureUrl;
      } else {
        drawOverlayAndUpdate();
      }
    };

    const drawOverlayAndUpdate = () => {
      // Dibujar texto overlay si existe
      if (currentOverlayText) {
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
      }

      // Convertir canvas a blob y crear URL
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('No se pudo generar la textura compuesta del canvas');
          return;
        }

        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setComposedTextureUrl(url);
      }, 'image/png');
    };

    updateTexture();

    // Limpiar al desmontar
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [
    modelo3D,
    texturesByModel[modelo3D],
    overlayTextByModel[modelo3D],
    overlayTextSettingsByModel[modelo3D]?.fontFamily,
    overlayTextSettingsByModel[modelo3D]?.fontSize,
    overlayTextSettingsByModel[modelo3D]?.color,
    textureOffset?.x,
    textureOffset?.y,
    textureScale,
  ]);

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
    const maxOffset = CANVAS_SIZE * 0.6;
    setTextureOffset((prev) => ({
      x: Math.max(Math.min(prev.x + dx, maxOffset), -maxOffset),
      y: Math.max(Math.min(prev.y + dy, maxOffset), -maxOffset),
    }));
  };

  const changeTextureScale = (delta) => {
    setTextureScale((current) => Math.max(Math.min(current + delta, 3), 0.1));
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
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para cotizar tu diseño.');
      redirectToLoginWithDesign();
      return;
    }

    const nombreFinal = nombreCotizacion.trim();
    if (!nombreFinal) {
      alert('Ingresa un nombre para tu diseño antes de cotizar.');
      return;
    }

    try {
      setCotizando(true);
      setCotizacion(null);
      const currentColors = colorsByModel[modelo3D] || {};
      const currentTexts = textsByModel[modelo3D] || {};
      const hasTexture = Boolean(texturesByModel[modelo3D]);
      const disenoData = normalizePersonalizacionDesign({
        modelo: modelo3D,
        colorInterior: currentColors.interior,
        colorBase: currentColors.base,
        colorExterior: currentColors.exterior,
        colorAsa: currentColors.asa,
        textInterior: currentTexts.interior,
        textExterior: currentTexts.exterior,
        hasTexture,
        textureUrl: texturesByModel[modelo3D] || null,
        overlayText: overlayTextByModel[modelo3D] || '',
        overlayTextFontFamily:
          (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontFamily) || 'sans-serif',
        overlayTextFontSize:
          (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontSize) || 24,
        overlayTextColor:
          (overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].color) || '#ffffff',
        textureOffsetX: textureOffset?.x,
        textureOffsetY: textureOffset?.y,
        textureScale,
        zoom: zoomLevel,
        nombre: nombreFinal,
        notas: notasCotizacion.trim() || undefined,
      });
      const result = await cotizarProducto(buildQuotePayload(disenoData));
      setCotizacion({ mensaje: result.mensaje || 'Cotización enviada y pendiente' });
    } catch (error) {
      console.error('Error al cotizar:', error);
      const message = error.response?.data?.message || error.message || 'Error al cotizar el producto';
      setCotizacion({ error: true, mensaje: message });
    } finally {
      setCotizando(false);
    }
  };

  const handleGuardarDiseno = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para guardar tu diseño.');
      redirectToLoginWithDesign();
      return;
    }

    try {
      const disenoData = buildCurrentDesignState();
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
                <h1 className="personalizacion-title">Personaliza tu taza</h1>
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
                    texture={texturesByModel[modelo3D] || null}
                    overlayText={overlayTextByModel[modelo3D] || ''}
                    overlayTextFontFamily={(overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontFamily) || 'sans-serif'}
                    overlayTextFontSize={(overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].fontSize) || 24}
                    overlayTextColor={(overlayTextSettingsByModel[modelo3D] && overlayTextSettingsByModel[modelo3D].color) || '#ffffff'}
                    textInterior={(textsByModel[modelo3D] && textsByModel[modelo3D].interior) || ''}
                    textExterior={(textsByModel[modelo3D] && textsByModel[modelo3D].exterior) || ''}
                    zoom={zoomLevel}
                    autoRotate={isRotating}
                    textureOffset={textureOffset}
                    textureScale={textureScale}
                  />
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
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div>
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
                          <div className="d-flex justify-content-center gap-1">
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
                              onClick={() => moveTexture(0, 64)}
                              disabled={!texturesByModel[modelo3D]}
                              title="Mover abajo"
                            >
                              <i className="bi bi-arrow-down" />
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
                        </div>
                      </div>
                      <div className="personalizacion-image-scale-widget-inline">
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
                  <>
                    <div className="mt-4 w-100">
                      <label className="form-label small fw-semibold">Nombre del diseño para la cotización</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Taza personalizada para regalo"
                        value={nombreCotizacion}
                        onChange={(e) => setNombreCotizacion(e.target.value)}
                      />
                    </div>

                    <div className="mt-3 w-100">
                      <label className="form-label small fw-semibold">Notas para la cotización</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Agrega detalles o comentarios para el equipo de cotización"
                        value={notasCotizacion}
                        onChange={(e) => setNotasCotizacion(e.target.value)}
                      />
                      <small className="text-muted">Estas notas se enviarán junto con tu cotización.</small>
                    </div>

                    <div className="personalizacion-actions d-flex flex-wrap justify-content-center gap-2 mt-4">
                      <button
                      type="button"
                      className="btn btn-yesa-primary"
                      onClick={handleCotizar}
                      disabled={cotizando}
                    >
                      {cotizando ? 'Cotizando...' : 'Cotizar producto'}
                    </button>
                      <button type="button" className="btn btn-yesa-gold" onClick={handleGuardarDiseno}>
                        Guardar diseño
                      </button>
                      <button type="button" className="btn btn-yesa-tertiary" onClick={handleCompartir}>
                        Compartir
                      </button>
                    </div>
                    {!isAuthenticated && (
                      <div className="mt-3 alert alert-warning">
                        Debes iniciar sesión para guardar tu diseño o cotizar. Al iniciar sesión volverás a esta pantalla con el diseño que llevas hasta el momento.
                      </div>
                    )}
                    {cotizacion && (
                      <div className={`mt-3 alert ${cotizacion.error ? 'alert-danger' : 'alert-success'}`}>
                        <strong>{cotizacion.mensaje || 'Cotización generada'}</strong>
                        {!cotizacion.error && cotizacion.precio !== undefined && (
                          <div>Precio estimado: <strong>{formatCurrency(cotizacion.precio)}</strong></div>
                        )}
                      </div>
                    )}
                  </>
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
