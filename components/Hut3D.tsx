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

      /* The hut is drawn in three colours, not photographed.

         The model came with the photographs its shaders used: mud, dry
         grass, bark. Rendered as they are they make an accurate hut, which
         is the one thing a page of black, cream and orange cannot use —
         it reads as somebody's 3D model set down on a poster.

         So the maps are carried as greyscale (see assets/hut3d/README.md)
         and each is multiplied here by one colour off the page's own
         palette. The grain of the mud and the turn of every blade survive;
         the photographs' own colours, the greens and the greys that belong
         to no part of this page, do not. Abstract, and still a hut.

         Dropping the maps altogether was tried first. The thatch held up,
         being seventeen thousand modelled blades, but the walls went to
         flat plastic cylinders: on a round wall lit by one fire there is
         nothing but the shading to look at, and no shading is enough.

         Keyed on the shader names the scene arrived under, which are all
         that survived of its materials. Anything unnamed takes the clay.

         Mud and dry grass have no highlight and no metal in them, so both
         are matte, and everything is double-sided. Single-sided was tried
         and is wrong here: a blade of thatch is an open tube whose far
         wall is seen through its near one, and the hut can be walked into,
         where every surface is being looked at from behind. There are only
         a few hundred triangles outside the thatch, so it costs nothing. */
      const PALETTE: Record<string, number> = {
        aiStandardSurface1SG: 0xc07a4e, // the walls: clay, warm but not red
        aiStandardSurface2SG: 0xb59a72, // the thatch: dry grass, the green gone
        aiStandardSurface3SG: 0x5c3b26, // the door frame: dark wood
      };

      const model = gltf.scene;
      const walls: ThreeModule.Mesh[] = [];
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const material = child.material as ThreeModule.MeshStandardMaterial;
        if (material.name === "aiStandardSurface1SG") walls.push(child);
        material.color.setHex(PALETTE[material.name] ?? PALETTE.aiStandardSurface1SG);
        material.roughness = 1;
        material.metalness = 0;
        material.side = THREE.DoubleSide;
        if (material.map) {
          material.map.wrapS = THREE.RepeatWrapping;
          material.map.wrapT = THREE.RepeatWrapping;
          material.map.anisotropy = 4;
        }
        material.needsUpdate = true;
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

      /* A floor, which the scene did not come with.

         What it came with was a large square under the hut that existed
         only to catch a shadow, and that was dropped when the model was
         cut down, so that the hut could stand on the stars the way the
         photograph does. Without it, though, the doorway is a hole
         straight through to the page — from outside you read the month
         through it, and from inside you stand on nothing.

         So: a disc, a little narrower than the walls, sitting on the base.
         It never shows past them, so the hut still floats.

         Measured off the walls and not off the whole model, whose width is
         the roof's: the eaves reach a quarter as far again as the wall
         they cover, and a floor cut to them lies out in the open all round
         the hut like a saucer.

         The world matrices are brought up to date first. Box3.setFromObject
         refreshes the matrix of the object it is given but not those of its
         parents, and the model has just been moved: without this the walls
         are measured where they used to be, and the floor ends up a disc
         hanging two thirds of the way up inside the hut, with the doorway
         still looking clean through to the page underneath it.

         The radius is the nearest the wall comes to the axis, not the
         furthest, so that a wall which is not perfectly round still covers
         the floor's edge the whole way about. */
      model.updateMatrixWorld(true);
      const room = new THREE.Box3();
      for (const wall of walls) room.union(new THREE.Box3().setFromObject(wall));
      const inside =
        Math.min(Math.abs(room.min.x), room.max.x, Math.abs(room.min.z), room.max.z) * 0.98;

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(inside, 64),
        new THREE.MeshStandardMaterial({ color: 0x3a2214, roughness: 1, metalness: 0 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = room.min.y + 0.02;
      scene.add(floor);

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

      /* Standing well back, on a lens wide enough to be somewhere once you
         are close. At rest the camera is far enough away that the hut is
         nearly flat on, which is how the photograph reads; come in through
         the door and the same lens opens the room out around you.

         It starts all but level with the eaves, as the photograph is. Tilt
         the camera down and the roof opens out into a disc, which makes
         the hut taller on the screen than it is wide is deep, and the slot
         it has to sit in is not tall. Only the direction is set here: how
         far back to stand is worked out under frame(). */
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
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

      /* Where the hut sits, and how big.

         The canvas is the whole window, not the hut's slot in the column.
         That is the point of it: there are no edges to run into, so coming
         closer makes the hut bigger rather than uncovering a rectangle,
         and it can grow straight past the words and out of the frame.

         The slot is still there, as the empty box the column reserves, and
         at rest the hut is put exactly into it. `perUnit` is how many
         pixels one unit of the model has to take for that to happen:
         whichever of the slot's width and height runs out first, with the
         padding that lands the hut at about the size the photograph's is.
         How far back to stand follows from that and the window's height.

         The width used is the larger of the two ground measurements, which
         is the widest silhouette the hut can turn to show, so it does not
         grow as it turns.

         Then the whole rendering is slid down by the gap between the
         middle of the window and the middle of the slot, which is what
         setViewOffset is for. Moving the camera would have tilted it, and
         moving the model would have carried the fire along with it. */
      const spread = Math.max(size.x, size.z);
      const rise = Math.tan((camera.fov * Math.PI) / 360);
      let framed = 0;

      const frame = () => {
        const { clientWidth: width, clientHeight: height } = node;
        const slot = node.parentElement?.getBoundingClientRect();
        if (!slot?.height) return;

        const perUnit = Math.min(slot.width / (spread * 1.36), slot.height / (size.y * 1.36));
        const next = height / (2 * rise * perUnit);

        // Anyone who has come closer keeps the fraction they came to,
        // rather than being pushed back out again by a resize.
        const reach = framed ? (next * camera.position.distanceTo(controls.target)) / framed : next;
        // Only the length of this changes. First time through it is the one
        // unit the camera was parked at above, which was never a distance,
        // only the direction to look at the hut from.
        const eye = camera.position.clone().sub(controls.target);
        camera.position.copy(controls.target).add(eye.setLength(reach));
        framed = next;

        camera.aspect = width / height;
        camera.setViewOffset(width, height, 0, height / 2 - (slot.top + slot.bottom) / 2, width, height);

        /* As near as the doorway, and no nearer.

           Going right in was tried. The controls turn about the middle of
           the hut, so once inside you face a wall from a few feet away and
           the screen is a field of mud: the room is empty, there being no
           fire modelled and no floor but the one added above. Stopping
           here leaves the hut overflowing the screen with the doorway at
           the middle of it, on the point of going in, which is the better
           picture and the one the room cannot spoil. */
        controls.minDistance = next * 0.26;
        controls.maxDistance = next * 1.8;
      };

      const resize = () => {
        const { clientWidth, clientHeight } = node;
        if (!clientWidth || !clientHeight) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(clientWidth, clientHeight, false);
        frame();
      };
      resize();
      // The window sizes the canvas and the slot says where in the column
      // the hut has to land. Both can change, and not always together.
      const observer = new ResizeObserver(resize);
      observer.observe(node);
      if (node.parentElement) observer.observe(node.parentElement);

      /* How far in the viewer has come, from 0 at rest to 1 at the nearest
         the controls allow, published to the column as --hut-zoom.

         The words are the page, not scenery, so they are not moved out of
         the way: they hold their places and recede, going soft and dim as
         the hut grows over them, and come back the moment you pull out.
         app/globals.css does that part. data-immersed marks the point at
         which the button has finished fading out, so that it can stop
         taking the pointer: it leaves at three times the rate of the rest,
         so it is gone by a third of the way in.

         Written only when it has actually moved, since a style set on
         every frame is a style recalculated on every frame. */
      const page = document.documentElement;
      const column = node.closest<HTMLElement>(".hero");
      let published = -1;

      const publish = () => {
        const span = framed - controls.minDistance;
        const came = span > 0 ? (framed - camera.position.distanceTo(controls.target)) / span : 0;
        const depth = Math.min(Math.max(came, 0), 1);
        if (Math.abs(depth - published) < 0.004) return;
        // On the page, not the column: the stars in front of everything are
        // not inside the column and they go with the rest.
        page.style.setProperty("--hut-zoom", depth.toFixed(3));
        column?.toggleAttribute("data-immersed", depth >= 1 / 3);
        published = depth;
      };

      // Nothing is drawn while the tab is in the background.
      renderer.setAnimationLoop(() => {
        if (document.hidden) return;
        controls.update();
        publish();
        renderer.render(scene, camera);
      });

      setState("ready");

      teardown = () => {
        renderer.setAnimationLoop(null);
        // Leave the page as it was found, or the words stay faded out with
        // nothing left on it to bring them back.
        page.style.removeProperty("--hut-zoom");
        column?.removeAttribute("data-immersed");
        observer.disconnect();
        still.removeEventListener("change", onStill);
        controls.removeEventListener("start", stopTurning);
        controls.dispose();
        renderer.domElement.remove();
        renderer.dispose();
        floor.geometry.dispose();
        (floor.material as ThreeModule.MeshStandardMaterial).dispose();
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
      {/* The two glows are wrapped so they can be faded as one. They sit
          in the slot and cannot follow the hut out of it, so once the hut
          has grown past them they would only be a halo in its middle. */}
      <span aria-hidden="true" className="hut-fire">
        <span className="hut-glow" />
        <span className="hut-glow-core" />
      </span>
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
