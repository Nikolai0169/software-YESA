import React, { useEffect, useRef } from "react";
import * as THREE from "three";
/* eslint-disable react-hooks/exhaustive-deps */

const createTextSprite = (text, fontFamily = "sans-serif", fontSize = 24, color = "#ffffff") => {
  const width = 2048;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, width, height);
  const effectiveFontSize = Math.min(220, Math.max(36, Math.round(fontSize * 1.8)));
  ctx.fillStyle = color;
  ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = text ? text.split("\n") : [];
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, height / 2 + (index - (lines.length - 1) / 2) * (effectiveFontSize + 12));
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const Personalizacion3D = ({ modelo = "taza", colorInterior = "#ffffff", colorBase = "#ffffff", colorExterior = "#ffffff", colorAsa = "#ffffff", texture, overlayText = "", overlayTextFontFamily = "sans-serif", overlayTextFontSize = 24, overlayTextColor = "#ffffff", textInterior = "", textExterior = "", zoom = 1, autoRotate = true, textureOffset = { x: 0, y: 0 }, textureScale = 1 }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const autoRotateRef = useRef(autoRotate);
  const modelGroupRef = useRef(null);
  const isRingRef = useRef(false);
  const exteriorMaterialRef = useRef(null);
  const interiorMaterialRef = useRef(null);
  const baseMaterialRef = useRef(null);
  const asaMaterialRef = useRef(null);
  const textureRef = useRef(null);
  const ringSpritesRef = useRef([]);
  const resizeObserverRef = useRef(null);

  const disposeRingSprites = () => {
    ringSpritesRef.current.forEach((sprite) => {
      if (sprite.material.map) sprite.material.map.dispose();
      sprite.material.dispose();
      if (sprite.parent) sprite.parent.remove(sprite);
    });
    ringSpritesRef.current = [];
  };

  const addTextSprite = (text, zOffset, fontFamily = "sans-serif", fontSize = 24, color = "#ffffff") => {
    if (!text || !modelGroupRef.current) return;
    const textTexture = createTextSprite(text, fontFamily, fontSize, color);
    const spriteMaterial = new THREE.SpriteMaterial({ map: textTexture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    const scaleFactor = Math.min(6, Math.max(3, fontSize * 0.15 + 1.6));
    const heightFactor = Math.min(2.2, Math.max(1.0, fontSize * 0.06 + 0.6));
    sprite.scale.set(scaleFactor, heightFactor, 1);
    sprite.position.set(0, 0, zOffset);
    modelGroupRef.current.add(sprite);
    ringSpritesRef.current.push(sprite);
  };

  const updateRingTextSprites = () => {
    if (!isRingRef.current) return;
    disposeRingSprites();
    addTextSprite(textInterior, -0.75, overlayTextFontFamily, overlayTextFontSize, overlayTextColor);
    addTextSprite(textExterior, 0.75, overlayTextFontFamily, overlayTextFontSize, overlayTextColor);
    addTextSprite(overlayText, 1.1, overlayTextFontFamily, overlayTextFontSize, overlayTextColor);
  };

  const createTextureCanvas = (
    textureUrl,
    overlayText,
    fontFamily,
    fontSize,
    color,
    offset,
    scale,
    callback,
    backgroundColor = null
  ) => {
    const size = 2048;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0)";
      ctx.fillRect(0, 0, size, size);
    }

    const drawCanvas = (image) => {
      if (image) {
        const scaledSize = size * scale;
        const centerOffset = (size - scaledSize) / 2;
        const offsetX = centerOffset + (offset?.x || 0);
        const offsetY = centerOffset + (offset?.y || 0);
        ctx.drawImage(image, offsetX, offsetY, scaledSize, scaledSize);
      }

      if (overlayText) {
        ctx.fillStyle = color;
        const scaledFontSize = Math.min(220, Math.max(40, Math.round(fontSize * 2.5)));
        ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = overlayText.split("\n");
        const lineHeight = scaledFontSize + 16;
        lines.forEach((line, index) => {
          ctx.fillText(
            line,
            size / 2,
            size / 2 + (index - (lines.length - 1) / 2) * lineHeight
          );
        });
      }

      const canvasTexture = new THREE.CanvasTexture(canvas);
      canvasTexture.minFilter = THREE.LinearFilter;
      canvasTexture.magFilter = THREE.LinearFilter;
      canvasTexture.wrapS = THREE.ClampToEdgeWrapping;
      canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
      canvasTexture.needsUpdate = true;
      callback(canvasTexture);
    };

    if (!textureUrl || typeof textureUrl !== 'string' || textureUrl.trim() === '') {
      drawCanvas(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => drawCanvas(image);
    image.onerror = () => drawCanvas(null);
    image.src = textureUrl.trim();
  };

  const updateExteriorTexture = () => {
    if (!exteriorMaterialRef.current) return;

    const setMaterialMap = (canvasTexture) => {
      if (!exteriorMaterialRef.current) {
        if (canvasTexture) canvasTexture.dispose();
        return;
      }

      if (textureRef.current && textureRef.current !== canvasTexture) {
        textureRef.current.dispose();
      }
      textureRef.current = canvasTexture;
      exteriorMaterialRef.current.map = canvasTexture;
      exteriorMaterialRef.current.transparent = false;
      exteriorMaterialRef.current.alphaTest = 0;
      exteriorMaterialRef.current.needsUpdate = true;
    };

    createTextureCanvas(
      texture,
      overlayText,
      overlayTextFontFamily,
      overlayTextFontSize,
      overlayTextColor,
      textureOffset,
      textureScale,
      setMaterialMap,
      colorExterior || "#ffffff"
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Escena
    const scene = new THREE.Scene();
    const mountNode = mountRef.current;
    if (!mountNode) return;
    sceneRef.current = scene;
    isRingRef.current = modelo === "anillo";
    scene.background = new THREE.Color(0x333333);

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      mountNode.clientWidth / mountNode.clientHeight,
      0.1,
      1000
    );
    camera.position.z = isRingRef.current ? 4 : 5;
    cameraRef.current = camera;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rendererRef.current = renderer;
    // Cap the device pixel ratio for performance but keep clarity on high-DPI
    const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight, false);
    renderer.setClearColor(0xffffff, 1);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.backgroundColor = "#ffffff";
    renderer.domElement.style.imageRendering = 'auto';
    renderer.domElement.style.cursor = 'grab';
    mountNode.appendChild(renderer.domElement);

    const resizeScene = () => {
      if (!mountNode) return;
      const bounds = mountNode.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", resizeScene);
    document.addEventListener("fullscreenchange", resizeScene);
    document.addEventListener("webkitfullscreenchange", resizeScene);
    document.addEventListener("mozfullscreenchange", resizeScene);
    document.addEventListener("MSFullscreenChange", resizeScene);

    const resizeObserver = new ResizeObserver(resizeScene);
    resizeObserverRef.current = resizeObserver;
    resizeObserver.observe(mountNode);

    resizeScene();

    // Luz
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 8, 7);
    scene.add(directionalLight);

    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    if (isRingRef.current) {
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorExterior || "#ffffff"),
        roughness: 0.2,
        metalness: 0.9,
        side: THREE.DoubleSide,
        emissive: 0x0d3b82,
        emissiveIntensity: 0.05,
      });

      const radius = 0.7;
      const tube = 0.11;
      const segmentsRadial = 32;
      const segmentsTubular = 200;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, segmentsRadial, segmentsTubular),
        ringMaterial
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0, 0);
      modelGroup.add(ring);

      updateRingTextSprites();

      modelGroup.userData.disposeSprites = disposeRingSprites;
    } else {
      const interiorMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorInterior || "#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.BackSide,
      });
      interiorMaterialRef.current = interiorMaterial;

      const exteriorMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.FrontSide,
      });
      exteriorMaterialRef.current = exteriorMaterial;

      const baseMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorBase || "#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
      });
      baseMaterialRef.current = baseMaterial;

      const asaMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorAsa || "#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      asaMaterialRef.current = asaMaterial;

      const cupGroup = new THREE.Group();

      const cupGeometry = new THREE.CylinderGeometry(1, 1, 2, 32, 1, true);
      const cupInterior = new THREE.Mesh(cupGeometry, interiorMaterial);
      cupInterior.position.y = 0;
      cupGroup.add(cupInterior);

      const cupExterior = new THREE.Mesh(cupGeometry, exteriorMaterial);
      cupExterior.position.y = 0;
      cupGroup.add(cupExterior);

      const bottomGeometry = new THREE.CylinderGeometry(1.02, 1.02, 0.15, 32);
      const bottomMesh = new THREE.Mesh(bottomGeometry, baseMaterial);
      bottomMesh.position.y = -1.075;
      cupGroup.add(bottomMesh);

      class HandleCurve extends THREE.Curve {
        constructor(scale = 1) {
          super();
          this.scale = scale;
        }

        getPoint(t) {
          const angle = Math.PI * (t - 0.5);
          const radius = 0.5;
          const x = 1 + Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return new THREE.Vector3(x, y, 0).multiplyScalar(this.scale);
        }
      }

      const handleCurve = new HandleCurve();
      const handleGeometry = new THREE.TubeGeometry(handleCurve, 32, 0.12, 16, false);
      const handleMesh = new THREE.Mesh(handleGeometry, asaMaterial);
      cupGroup.add(handleMesh);

      const rimGeometry = new THREE.TorusGeometry(1.02, 0.08, 16, 100, Math.PI * 2);
      const rimMesh = new THREE.Mesh(rimGeometry, asaMaterial);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 1;
      cupGroup.add(rimMesh);

      modelGroup.add(cupGroup);

      modelGroup.userData.disposeSprites = disposeRingSprites;
    }

    const isDraggingRef = { current: false };
    const previousPointerRef = { current: { x: 0, y: 0 } };

    const onPointerDown = (event) => {
      if (event.preventDefault) event.preventDefault();
      isDraggingRef.current = true;
      previousPointerRef.current = { x: event.clientX, y: event.clientY };
      try {
        if (event.pointerId != null && renderer.domElement.setPointerCapture) renderer.domElement.setPointerCapture(event.pointerId);
      } catch (e) {
        // ignore capture errors
      }
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (event) => {
      if (!isDraggingRef.current) return;
      const deltaX = event.clientX - previousPointerRef.current.x;
      const deltaY = event.clientY - previousPointerRef.current.y;

      modelGroup.rotation.y += deltaX * 0.005;
      modelGroup.rotation.x = Math.max(Math.min(modelGroup.rotation.x + deltaY * 0.005, Math.PI / 2), -Math.PI / 2);
      previousPointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event) => {
      isDraggingRef.current = false;
      try {
        if (event.pointerId != null && renderer.domElement.releasePointerCapture) renderer.domElement.releasePointerCapture(event.pointerId);
      } catch (e) {
        // ignore
      }
      renderer.domElement.style.cursor = 'grab';
    };

    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerUp);

    const animate = () => {
      rendererRef.current && requestAnimationFrame(animate);
      if (!isDraggingRef.current && autoRotateRef.current) {
        modelGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeScene);
      document.removeEventListener("fullscreenchange", resizeScene);
      document.removeEventListener("webkitfullscreenchange", resizeScene);
      document.removeEventListener("mozfullscreenchange", resizeScene);
      document.removeEventListener("MSFullscreenChange", resizeScene);
      resizeObserverRef.current?.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerUp);
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
      if (modelGroup.userData.disposeSprites) {
        modelGroup.userData.disposeSprites();
      }
      if (mountNode && renderer.domElement && mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [modelo]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (interiorMaterialRef.current) {
      interiorMaterialRef.current.color = new THREE.Color(colorInterior || "#ffffff");
      interiorMaterialRef.current.needsUpdate = true;
    }
    if (baseMaterialRef.current) {
      baseMaterialRef.current.color = new THREE.Color(colorBase || "#ffffff");
      baseMaterialRef.current.needsUpdate = true;
    }
    if (asaMaterialRef.current) {
      asaMaterialRef.current.color = new THREE.Color(colorAsa || "#ffffff");
      asaMaterialRef.current.needsUpdate = true;
    }
    if (exteriorMaterialRef.current) {
      exteriorMaterialRef.current.color = new THREE.Color("#ffffff");
      exteriorMaterialRef.current.needsUpdate = true;
    }
  }, [colorInterior, colorBase, colorExterior, colorAsa]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isRingRef.current) {
      updateRingTextSprites();
    } else {
      updateExteriorTexture();
    }
  }, [texture, overlayText, overlayTextFontFamily, overlayTextFontSize, overlayTextColor, textInterior, textExterior, colorExterior, textureOffset, textureScale]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Manejo separado de zoom para evitar parpadeos
  useEffect(() => {
    if (!cameraRef.current) return;
    
    const baseZ = isRingRef.current ? 4 : 5;
    cameraRef.current.position.z = baseZ / zoom;
    cameraRef.current.updateProjectionMatrix();
  }, [zoom]);

  return <div className="personalizacion-3d-canvas" ref={mountRef}></div>;
};

export default Personalizacion3D;
