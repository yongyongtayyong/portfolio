#!/usr/bin/env python3
"""
Builds public/food/nyc-map.json — the neighbourhood shapes for the Food tab.

Inputs (free public data):
  1. NYC 2020 Neighborhood Tabulation Areas, GeoJSON
     https://data.cityofnewyork.us/d/9nt8-h7nd  (Export → GeoJSON)
  2. US Census cartographic boundaries, NJ county subdivisions (KML, zipped)
     https://www2.census.gov/geo/tiger/GENZ2025/kml/cb_2025_34_cousub_500k.zip

Usage:
  python3 tools/build-food-map.py <nta.geojson> <cb_..._cousub_500k.zip> public/food/nyc-map.json

Only the Python standard library is used. Shapes are projected to a local flat
map (1 unit ≈ 111 m north–south), simplified, and rounded to keep the file small.
"""
import json, math, re, sys, zipfile
import xml.etree.ElementTree as ET

LON0, LAT0, K = -74.0, 40.72, 1000.0
C = math.cos(math.radians(LAT0))
# what to keep (lon/lat box around the five boroughs + Hudson/Essex/Union waterfront)
BOX = (-74.27, 40.49, -73.69, 40.93)
TOL = 0.32        # Douglas–Peucker tolerance, map units (~35 m)
MIN_AREA = 0.6    # drop rings smaller than this (map units²)


def proj(lon, lat):
    return ((lon - LON0) * C * K, (LAT0 - lat) * K)


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    ax, ay = a; bx, by = b
    dx, dy = bx - ax, by - ay
    L = math.hypot(dx, dy) or 1e-9
    idx, dmax = 0, -1.0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * px - dx * py + bx * ay - by * ax) / L if L > 1e-9 else math.hypot(px - ax, py - ay)
        if d > dmax:
            idx, dmax = i, d
    if dmax > tol:
        left = dp(pts[: idx + 1], tol)
        right = dp(pts[idx:], tol)
        return left[:-1] + right
    return [a, b]


def ring_area(pts):
    s = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2


def simplify_ring(ll):
    pts = [proj(lon, lat) for lon, lat in ll]
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts = pts[:-1]
    if len(pts) < 3 or ring_area(pts) < MIN_AREA:
        return None
    # split closed ring in two halves so DP keeps its shape
    mid = len(pts) // 2
    s = dp(pts[: mid + 1], TOL)[:-1] + dp(pts[mid:] + [pts[0]], TOL)[:-1]
    if len(s) < 3:
        return None
    flat = []
    for x, y in s:
        flat += [round(x, 1), round(y, 1)]
    return flat


def in_box(rings_ll):
    xs = [p[0] for r in rings_ll for p in r]; ys = [p[1] for r in rings_ll for p in r]
    return not (max(xs) < BOX[0] or min(xs) > BOX[2] or max(ys) < BOX[1] or min(ys) > BOX[3])


def centroid(rings):
    r = max(rings, key=lambda f: len(f))
    xs = r[0::2]; ys = r[1::2]
    return [round(sum(xs) / len(xs), 1), round(sum(ys) / len(ys), 1)]


def prop(props, *names):
    low = {k.lower(): v for k, v in props.items()}
    for n in names:
        if n in low and low[n] not in (None, ""):
            return low[n]
    return None


def load_nta(path):
    gj = json.load(open(path))
    out = []
    for f in gj["features"]:
        g = f.get("geometry") or {}
        props = f.get("properties") or {}
        polys = g["coordinates"] if g.get("type") == "MultiPolygon" else [g.get("coordinates", [])]
        rings_ll = [ring for poly in polys for ring in poly]
        if not rings_ll or not in_box(rings_ll):
            continue
        rings = [r for r in (simplify_ring(rl) for rl in rings_ll) if r]
        if not rings:
            continue
        ntype = str(prop(props, "ntatype") or "0")
        out.append({
            "n": prop(props, "ntaname", "nta_name", "name") or "",
            "b": prop(props, "boroname", "boro_name", "borough") or "",
            "t": 0 if ntype in ("0", "") else 1,
            "r": rings,
        })
    return out


def load_nj(path):
    z = zipfile.ZipFile(path)
    kml_name = next(n for n in z.namelist() if n.lower().endswith(".kml"))
    xml = z.read(kml_name).decode("utf-8", "replace")
    xml = re.sub(r'\sxmlns(:\w+)?="[^"]+"', "", xml, count=0)  # drop namespaces
    root = ET.fromstring(xml)
    out = []
    for pm in root.iter("Placemark"):
        name = None
        for sd in pm.iter("SimpleData"):
            if sd.get("name", "").upper() in ("NAME", "NAMELSAD") and not name:
                name = sd.text
        if not name:
            nm = pm.find("name"); name = nm.text if nm is not None else ""
        rings_ll = []
        for coords in pm.iter("coordinates"):
            pts = []
            for tok in coords.text.split():
                parts = tok.split(",")
                if len(parts) >= 2:
                    pts.append((float(parts[0]), float(parts[1])))
            if len(pts) >= 3:
                rings_ll.append(pts)
        if not rings_ll or not in_box(rings_ll):
            continue
        rings = [r for r in (simplify_ring(rl) for rl in rings_ll) if r]
        if not rings:
            continue
        out.append({"n": name or "", "b": "New Jersey", "t": 0, "nj": 1, "r": rings})
    return out


def main():
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(1)
    nta, nj, dest = sys.argv[1:]
    polys = load_nta(nta) + load_nj(nj)
    for p in polys:
        p["c"] = centroid(p["r"])
    xs = [v for p in polys for r in p["r"] for v in r[0::2]]
    ys = [v for p in polys for r in p["r"] for v in r[1::2]]
    out = {
        "proj": {"lon0": LON0, "lat0": LAT0, "k": K},
        "ext": [round(min(xs), 1), round(min(ys), 1), round(max(xs), 1), round(max(ys), 1)],
        "polys": polys,
        "source": "NYC DCP 2020 NTAs (NYC Open Data); US Census Bureau cartographic boundaries",
    }
    with open(dest, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    pts = sum(len(r) // 2 for p in polys for r in p["r"])
    print(f"wrote {dest}: {len(polys)} shapes ({sum(1 for p in polys if p.get('nj'))} NJ), {pts} points")


if __name__ == "__main__":
    main()
