# The hut, in three dimensions

> **Not in use.** The page this was built for, `/hut`, was tried and taken
> out again; the site shows the designer's photograph, as it always has.
> Nothing here is loaded by anything. It is kept because the hard part was
> getting 400MB of renderer output down to a 4.4MB model, and that is
> worth not having to work out twice.
>
> The page itself, `app/hut/page.tsx` and `components/Hut3D.tsx`, is in the
> history: `git show 6b53c52` is the last version of it, and `git revert`
> of the commit that removed it brings the whole thing back.

What follows is how the model was made, and how to make it again if the
original changes. Where it says the page loads `public/hut.glb`, that file
is no longer built — step 4 below is what would produce it.

## What arrived

From the renderer, and **not in this repository**: around 400MB of it, and
`Hut_OBJ.obj` alone is half again over the 100MB a single file may be on
GitHub, so a push carrying it would be refused. `.gitignore` keeps the
folder out and lets through only this file, `thin-obj.py` and `hut.mtl`.
Keep the originals wherever the artwork is kept.

| File | What it is |
|---|---|
| `Hut_OBJ.obj` | The model. 149MB, 747,679 points, 1,319,128 faces |
| `HUT_FBX.fbx` | The same scene as FBX. Unused |
| `mud.jpg` | The walls, 2382 × 2107 |
| `68434190-dry-grass-used-for-make-wall-or-roof.jpg` | The thatch, 1300 × 866 |
| `tree.jpg` | The door frame, 612 × 408 |
| `*_sRGB_ACEScg.jpg.tx` | The renderer's own texture caches. Unused |

Two things about the OBJ are worth knowing before touching it.

The `.mtl` it names, `Hut FBX.mtl`, was never sent. All that survives is
the four Arnold shader names its faces are grouped under, and `hut.mtl`
here maps each to the texture that came with it:

| Group | Shader | Texture |
|---|---|---|
| `Wall` | `aiStandardSurface1SG` | `mud.jpg` |
| `pPlane1` | `aiShadowMatte1SG` | none — see below |
| `Roof` ×2 | `aiStandardSurface2SG` | the dry grass |
| `Door_frame` ×3 | `aiStandardSurface3SG` | `tree.jpg` |

And almost all of it is thatch: two roof groups of about 8,715 blades
each, every blade a five-sided tube of some 83 triangles, and every blade
its own smoothing group (`s 1` … `s 8715`). That last detail is what makes
thinning possible — see below.

## How the web copy was made

Everything runs from this folder. `obj2gltf` and `gltf-transform` are not
dependencies of the site; fetch them for the job and throw them away.

```sh
npm install obj2gltf @gltf-transform/cli

# The thatch texture is named by hut.mtl without its long prefix.
cp 68434190-dry-grass-used-for-make-wall-or-roof.jpg grass.jpg

# 0. Take the colour out of all three. components/Hut3D.tsx multiplies
#    each one by a colour off the page's palette, so what is wanted from
#    these files is the grain and nothing else — see "Why greyscale".
GREY="/System/Library/ColorSync/Profiles/Generic Gray Gamma 2.2 Profile.icc"
for f in mud grass tree; do
  sips -s format jpeg --matchTo "$GREY" "$f.jpg" --out "$f-grey.jpg"
done

# 1. Thin and compact. One blade of thatch in three, which is the whole
#    of the saving; the walls and the door frame are kept entire.
python3 thin-obj.py Hut_OBJ.obj hut-web.obj 3

# 2. To glTF, with hut.mtl supplying the materials.
npx obj2gltf -i hut-web.obj -o step.glb

# 3. Fold duplicate materials together, merge points that sit on top of
#    one another, bring the textures down to 1024 and re-encode as WebP.
npx gltf-transform dedup  step.glb step.glb
npx gltf-transform weld   step.glb step.glb
npx gltf-transform resize step.glb step.glb --width 1024 --height 1024
npx gltf-transform webp   step.glb step.glb --quality 82

# 4. Quantise and compress the geometry. This is the step that matters:
#    20.3MB in, 4.4MB out.
npx gltf-transform meshopt step.glb ../../public/hut.glb
```

Step 4 writes `EXT_meshopt_compression`, so `components/Hut3D.tsx` hands
three.js the meshopt decoder before it reads the file. Changing that step
means changing the loader to match.

### Why greyscale

Rendered with their own colours these photographs make an accurate hut,
which is the one thing a page of black, cream and orange cannot use: it
reads as somebody's 3D model set down on a poster. Carried as greyscale
and multiplied by one colour per part in `Hut3D.tsx`, the grain of the mud
and the turn of every blade survive, and the greens and greys that belong
to no part of this page do not.

Dropping the maps altogether was tried first. The thatch held up, being
seventeen thousand modelled blades, but the walls went to flat plastic
cylinders: on a round wall lit by a single fire there is nothing to look
at but the shading, and shading alone was not enough.

The tints are in `Hut3D.tsx`, keyed on the shader names, and are the one
place to change how the hut is coloured. Nothing needs rebuilding for it.

### What `thin-obj.py` does

It drops two things and renumbers what is left.

**The ground.** `pPlane1` is a shadow catcher: a flat square that exists
only so the renderer has something to cast a shadow onto. On the page the
hut stands on the star field with nothing under it, as it does in the
photograph, so the plane goes.

**Two blades of thatch in three.** Because each blade is its own smoothing
group, they can be counted and dropped one at a time, which thins the roof
evenly. Simplifying the mesh instead would have collapsed the blades
themselves, and a thatch of melted stubs is worse than a thinner thatch.
The roof still reads as full at the size the page draws it.

Then only the points the surviving faces actually use are written out,
renumbered from 1, which is most of the drop from 149MB to 55MB before
anything is compressed. The hut is also moved so it stands on y = 0 with
its middle on the vertical axis, so the viewer can frame it from its
measurements alone.

The third argument is how many blades to keep one of. What each costs:

| Keep | Faces | `hut.glb` |
|---|---|---|
| every blade | 1,319,128 | 8.3MB |
| 1 in 2 | 659,766 | 5.8MB |
| **1 in 3** | **440,150** | **4.4MB** |
| 1 in 4 | 330,138 | 3.6MB |

One in three is what is published. The page is a night sky with one object
on it, so it can afford some weight, but half of what the full roof costs
buys a roof nobody can tell apart at this size.

## The model itself

16.62 × 8.74 × 17.04 in the file's units, which its header calls
centimetres and which nothing downstream cares about: `Hut3D.tsx` measures
the model on load and frames it from that, so these numbers can change
without the page needing to know.
