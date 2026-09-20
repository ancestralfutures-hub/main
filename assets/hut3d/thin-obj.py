#!/usr/bin/env python3
"""Thin and compact Hut_OBJ.obj for the web.

Pass 1 decides which faces survive; pass 2 writes a new OBJ carrying only
the vertices those faces reference, renumbered from 1.

Two things are dropped: the ground plane that only exists to catch a
shadow in the renderer, and a share of the thatch. Each blade of thatch is
its own smoothing group (`s 1` ... `s 8715`), a five-sided tube of about
83 triangles, so keeping one blade in KEEP_EVERY thins the roof evenly
rather than gouging holes in it.
"""
import sys
from collections import OrderedDict

SRC = sys.argv[1]
DST = sys.argv[2]
KEEP_EVERY = int(sys.argv[3]) if len(sys.argv) > 3 else 1

DROP_GROUPS = {"pPlane1"}          # the shadow-catcher floor
GRASS_MTL = "aiStandardSurface2SG"  # the thatch


def walk(handle):
    """Yield (line, keep) for every line, tracking group/material/blade."""
    group = ""
    mtl = ""
    blade = -1
    for line in handle:
        tag = line[:2]
        if tag == "g ":
            group = line[2:].strip()
            blade = -1
            yield line, False
        elif line.startswith("usemtl"):
            mtl = line[7:].strip()
            yield line, False
        elif tag == "s ":
            blade += 1
            yield line, False
        elif tag == "f ":
            drop = group in DROP_GROUPS or (
                mtl == GRASS_MTL and KEEP_EVERY > 1 and blade % KEEP_EVERY
            )
            yield line, not drop
        else:
            yield line, False


def main():
    used_v, used_vt, used_vn = set(), set(), set()

    with open(SRC) as handle:
        for line, keep in walk(handle):
            if not keep:
                continue
            for corner in line.split()[1:]:
                parts = corner.split("/")
                used_v.add(int(parts[0]))
                if len(parts) > 1 and parts[1]:
                    used_vt.add(int(parts[1]))
                if len(parts) > 2 and parts[2]:
                    used_vn.add(int(parts[2]))

    # Renumber survivors in file order, so the new file reads top to bottom.
    def table(used):
        return {old: new for new, old in enumerate(sorted(used), start=1)}

    map_v, map_vt, map_vn = table(used_v), table(used_vt), table(used_vn)

    # Second pass: emit the kept vertices first, then the kept faces grouped
    # by material, which is what a converter wants to see.
    verts, uvs, norms = {}, {}, {}
    faces = OrderedDict()
    counts = {"v": 0, "vt": 0, "vn": 0}
    lo = [float("inf")] * 3
    hi = [float("-inf")] * 3

    with open(SRC) as handle:
        group = ""
        mtl = ""
        for line, keep in walk(handle):
            tag = line[:2]
            if tag == "v ":
                counts["v"] += 1
                new = map_v.get(counts["v"])
                if new:
                    xyz = [float(n) for n in line.split()[1:4]]
                    for axis in range(3):
                        lo[axis] = min(lo[axis], xyz[axis])
                        hi[axis] = max(hi[axis], xyz[axis])
                    verts[new] = xyz
            elif tag == "vt":
                counts["vt"] += 1
                new = map_vt.get(counts["vt"])
                if new:
                    uvs[new] = line.split()[1:3]
            elif tag == "vn":
                counts["vn"] += 1
                new = map_vn.get(counts["vn"])
                if new:
                    norms[new] = line.split()[1:4]
            elif tag == "g ":
                group = line[2:].strip()
            elif line.startswith("usemtl"):
                mtl = line[7:].strip()
            elif keep:
                corners = []
                for corner in line.split()[1:]:
                    parts = (corner.split("/") + ["", ""])[:3]
                    corners.append(
                        "%d/%s/%s"
                        % (
                            map_v[int(parts[0])],
                            map_vt[int(parts[1])] if parts[1] else "",
                            map_vn[int(parts[2])] if parts[2] else "",
                        )
                    )
                faces.setdefault((group, mtl), []).append("f " + " ".join(corners) + "\n")

    # Stand the hut on y = 0 and put its middle on the vertical axis, so the
    # viewer can frame it without knowing anything about the model.
    shift = (-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2)

    with open(DST, "w") as out:
        out.write("# Thinned from Hut_OBJ.obj for the web. Units: centimetres.\n")
        out.write("mtllib hut.mtl\n")
        for index in range(1, len(verts) + 1):
            xyz = verts[index]
            out.write("v %.4f %.4f %.4f\n" % tuple(xyz[a] + shift[a] for a in range(3)))
        for index in range(1, len(uvs) + 1):
            out.write("vt %s %s\n" % tuple(uvs[index]))
        for index in range(1, len(norms) + 1):
            out.write("vn %s %s %s\n" % tuple(norms[index]))
        total = 0
        for (group, mtl), lines in faces.items():
            out.write("g %s\n" % (group or "default"))
            out.write("usemtl %s\n" % mtl)
            out.writelines(lines)
            total += len(lines)

    print(
        "v %d  vt %d  vn %d  faces %d  groups %s"
        % (len(verts), len(uvs), len(norms), total, [g for g, _ in faces])
    )
    print("size (cm): %s" % [round(hi[a] - lo[a], 2) for a in range(3)])


main()
