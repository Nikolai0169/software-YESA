import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Personalizacion3D = ({ colorInterior = "#ffffff", colorBase = "#ffffff", colorExterior = "#ffffff", colorAsa = "#ffffff", texture, zoom = 1 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5 / zoom;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mountRef.current.appendChild(renderer.domElement);

    const resizeScene = () => {
      if (!mountRef.current) return;
      const bounds = mountRef.current.getBoundingClientRect();
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
    resizeObserver.observe(mountRef.current);

    resizeScene();

    // Luz
    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Geometría de ejemplo (pocillo con cilindro abierto, fondo y asa)
    // Material para el interior (sin textura)
    const interiorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorInterior || "#ffffff"),
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.BackSide, // Solo la cara interior
    });

    // Material para el exterior (con textura)
    const exteriorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorExterior || "#ffffff"),
      map: texture ? new THREE.TextureLoader().load(texture) : null,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.FrontSide, // Solo la cara exterior
    });

    // Material para la base
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorBase || "#ffffff"),
      roughness: 0.3,
      metalness: 0.1,
    });

    // Material para el asa
    const asaMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorAsa || "#ffffff"),
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const cupGroup = new THREE.Group();

    const cupGeometry = new THREE.CylinderGeometry(1, 1, 2, 32, 1, true);
    
    // Malla para interior
    const cupInterior = new THREE.Mesh(cupGeometry, interiorMaterial);
    cupInterior.position.y = 0;
    cupGroup.add(cupInterior);
    
    // Malla para exterior
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

    scene.add(cupGroup);

    const isDraggingRef = { current: false };
    const previousPointerRef = { current: { x: 0, y: 0 } };

    const onPointerDown = (event) => {
      isDraggingRef.current = true;
      previousPointerRef.current = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!isDraggingRef.current) return;
      const deltaX = event.clientX - previousPointerRef.current.x;
      const deltaY = event.clientY - previousPointerRef.current.y;

      cupGroup.rotation.y += deltaX * 0.005;
      cupGroup.rotation.x = Math.max(Math.min(cupGroup.rotation.x + deltaY * 0.005, Math.PI / 2), -Math.PI / 2);
      previousPointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event) => {
      isDraggingRef.current = false;
      if (event.pointerId != null) renderer.domElement.releasePointerCapture(event.pointerId);
    };

    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerUp);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      cupGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeScene);
      document.removeEventListener("fullscreenchange", resizeScene);
      document.removeEventListener("webkitfullscreenchange", resizeScene);
      document.removeEventListener("mozfullscreenchange", resizeScene);
      document.removeEventListener("MSFullscreenChange", resizeScene);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerUp);
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [colorInterior, colorBase, colorExterior, colorAsa, texture, zoom]);

  return <div className="personalizacion-3d-canvas" ref={mountRef}></div>;
};

export default Personalizacion3D;
