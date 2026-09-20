"use client";

import { useEffect, useRef, useState } from "react";
// Types only, erased on the way out: the library itself is fetched in the
// effect below, and nothing of it reaches the bundle from this line.
import type * as ThreeModule from "three";

/*
  The hut as the model rather than the photograph: the same shape in the
  same place on the screen, but turnable.

  It stands in for <Hut />, and keeps that component's two glows, which are
  siblings painted behind it and carry the fire. What it does not keep is
  the screen blend. The photograph needed it to lose its black sky; a
  WebGL canvas is drawn on transparency to begin with, so the model sits on
  the page's own sky and the stars pass behind it with nothing to undo.

  Everything three.js is fetched inside the effect rather than imported at
  the top. three is around half a megabyte and this is the only page that
  wants it, so nothing is spent on the pages that do not, and the server
  never has to render any of it.

  The model is compressed with EXT_meshopt_compression (see
  assets/hut3d/README.md), so the decoder is handed to the loader before
  anything is read.
*/
export default function Hut3D({ src, alt }: { src: string; alt: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const node = holder.current;
    if (!node) return;

    // The effect can be torn down mid-download; everything set up after
    // an await checks this before touching the page.
    let cancelled = false;
    let teardown: (() => void) | null = null;

    (async () => {
      let three, loaders, meshopt, orbit;
      try {
        [three, loaders, meshopt, orbit] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/libs/meshopt_decoder.module.js"),
          import("three/examples/jsm/controls/OrbitControls.js"),
        ]);
      } catch {
        if (!cancelled) setState("failed");
        return;
      }
      if (cancelled) return;

      const THREE = three;
      const scene = new THREE.Scene();

      /* The night, and the fire inside, after the photograph: a warm hut
         on a cold sky, and no floor under it.

         Cool light from above for the sky and the thatch, so the hut is
         never a flat black shape; a warm wash from the viewer's side
         standing in for the ground the photograph has and the model does
         not; and the fire itself, inside, which is what the doorway shows
         and what lights the underside of the eaves. The fire falls off
         within the hut's own width, so it reads as light in a room rather
         than a lamp on a stage. */
      scene.add(new THREE.HemisphereLight(0x44495a, 0x2a170c, 1.15));

      const moon = new THREE.DirectionalLight(0x9fb6d0, 0.6);
      moon.position.set(-6, 9, 4);
      scene.add(moon);

      const bounce = new THREE.DirectionalLight(0xffa368, 1);
      bounce.position.set(2, -1, 7);
      scene.add(bounce);

      const fire = new THREE.PointLight(0xffb070, 80, 16, 2);
      fire.position.set(0, 2.0, 0);
      scene.add(fire);
      const ember = new THREE.PointLight(0xd4602b, 30, 24, 2);
      ember.position.set(0, 3.6, 0);
      scene.add(ember);

      let gltf;
      try {
        const loader = new loaders.GLTFLoader().setMeshoptDecoder(meshopt.MeshoptDecoder);
        gltf = await loader.loadAsync(src);
      } catch {
        if (!cancelled) setState("failed");
        return;
      }
      if (cancelled) return;

      /* The model arrives with the renderer's own shading baked into its
         materials. Mud and dry thatch have no highlight and no metal in
         them, so both are taken back to matte, and the maps are told to
         repeat: the thatch tubes run their texture well past 0..1. */
      const model = gltf.scene;
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const material = child.material as ThreeModule.MeshStandardMaterial;
        material.roughness = 1;
        material.metalness = 0;
        material.side = THREE.DoubleSide;
        if (material.map) {
          material.map.wrapS = THREE.RepeatWrapping;
          material.map.wrapT = THREE.RepeatWrapping;
          material.map.anisotropy = 4;
        }
      });

      // Stand it on nothing in particular and put its middle at the origin,
      // so the camera below can frame it from its size alone.
      const bounds = new THREE.Box3().setFromObject(model);
      const middle = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      model.position.sub(middle);
      scene.add(model);

      // The model has moved down by middle.y, so the fire moves with it.
      fire.position.y -= middle.y;
      ember.position.y -= middle.y;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearAlpha(0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", alt);
      node.appendChild(renderer.domElement);

      /* What the camera looks at, and turns around: a little under the
         middle of the hut, which lifts the hut by the same amount on the
         screen. Seen from close to level the near wall falls further below
         the middle than the far eaves rise above it, and without this the
         base ends up on top of the month.

         Everything below is measured from this point rather than from the
         origin, because the angle the camera sees the hut at is the angle
         between the two, not the height the camera happens to sit at. */
      const aim = new THREE.Vector3(0, -size.y * 0.055, 0);

      /* A long lens, standing well back. A wide one this close to a hut
         twice as wide as it is tall bows the near eaves out towards the
         viewer; the photograph was not taken that way and neither is this.

         It starts all but level with the eaves, as the photograph is. Tilt
         the camera down and the roof opens out into a disc, which makes
         the hut taller on the screen than it is wide is deep, and the box
         it has to sit in is not tall. Only the direction is set here: how
         far back to stand is worked out under frame(). */
      const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 400);
      camera.position.setFromSphericalCoords(1, Math.PI * 0.495, 0).add(aim);

      const controls = new orbit.OrbitControls(camera, renderer.domElement);
      controls.target.copy(aim);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      // A little above the eaves and a little below them, and no further:
      // from overhead the hut is a disc of thatch, and from underneath it
      // is a floor that was never modelled.
      controls.minPolarAngle = Math.PI * 0.33;
      controls.maxPolarAngle = Math.PI * 0.52;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 0.6;

      // It turns by itself until someone takes hold of it, and then stays
      // where they leave it. Held still for anyone who asks for less motion.
      const still = window.matchMedia("(prefers-reduced-motion: reduce)");
      controls.autoRotate = !still.matches;
      controls.autoRotateSpeed = 0.45;
      const stopTurning = () => {
        controls.autoRotate = false;
      };
      controls.addEventListener("start", stopTurning);
      const onStill = () => {
        if (still.matches) controls.autoRotate = false;
      };
      still.addEventListener("change", onStill);

      /* How far back the camera has to stand for the hut to sit in the box
         the way the photograph does.

         The box is 756 by 440 on a laptop, but the line above it and the
         month below each lap about 32px over it, so the hut has to keep to
         the 375px between them. The padding below is what holds it there,
         and it lands the hut at about the size the photograph's is.

         Whichever of width and height needs more room wins, so a narrow
         phone pulls back rather than cropping the eaves. The width used is
         the larger of the two ground measurements, which is the widest
         silhouette the hut can turn to show.

         This is worked out again on every resize, because it depends on
         the shape of the box. Anyone who has zoomed keeps the fraction
         they zoomed to rather than being snapped back. */
      const spread = Math.max(size.x, size.z);
      const rise = Math.tan((camera.fov * Math.PI) / 360);
      let framed = 0;

      const frame = () => {
        const next = Math.max(size.y / 2 / rise, spread / 2 / (rise * camera.aspect)) * 1.36;
        const reach = framed ? (next * camera.position.distanceTo(controls.target)) / framed : next;
        // Only the length of this changes. First time through it is the one
        // unit the camera was parked at above, which was never a distance,
        // only the direction to look at the hut from.
        const eye = camera.position.clone().sub(controls.target);
        camera.position.copy(controls.target).add(eye.setLength(reach));
        framed = next;
        controls.minDistance = next * 0.45;
        controls.maxDistance = next * 1.8;
      };

      const resize = () => {
        const { clientWidth, clientHeight } = node;
        if (!clientWidth || !clientHeight) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        frame();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(node);

      // Nothing is drawn while the tab is in the background.
      renderer.setAnimationLoop(() => {
        if (document.hidden) return;
        controls.update();
        renderer.render(scene, camera);
      });

      setState("ready");

      teardown = () => {
        renderer.setAnimationLoop(null);
        observer.disconnect();
        still.removeEventListener("change", onStill);
        controls.removeEventListener("start", stopTurning);
        controls.dispose();
        renderer.domElement.remove();
        renderer.dispose();
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.dispose();
          for (const material of [child.material].flat()) {
            (material as ThreeModule.MeshStandardMaterial).map?.dispose();
            material.dispose();
          }
        });
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [src, alt]);

  return (
    <div className="hut">
      <span aria-hidden="true" className="hut-glow" />
      <span aria-hidden="true" className="hut-glow-core" />
      <div ref={holder} className="hut-stage" data-state={state} />
      {/* Until the model is on screen, and for good if it never arrives:
          the same words the photograph carries, and a line saying what can
          be done with it once it is there. */}
      <p className="hut-note" data-state={state} role="status">
        {state === "failed" ? alt : state === "loading" ? "Loading the hut…" : "Drag to turn · scroll to come closer"}
      </p>
    </div>
  );
}
