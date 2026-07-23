// --- Model overview -----------------------------------------------------------
// The historical phase (introduction → 2026) is NOT simulated: it is a piecewise
// interpolation of documented census estimates (see history.ts). The projection
// phase (2026 → 2060) is a *density-independent* discrete model, matching the
// published science: Castelblanco-Martínez et al. (2023, Scientific Reports) fitted
// a Leslie matrix to five census counts and report ~9.6%/yr growth with "no
// indication that hippos will approach a carrying capacity in the coming decades"
// (the Magdalena basin could physically hold 20,000+). There is therefore no
// logistic ceiling — the population grows exponentially and management is what bends
// the curve, which is the whole point of the simulator.

export const INITIAL_POPULATION = 4 as const
export const INITIAL_YEAR = 1981 as const // founding herd at Hacienda Nápoles
export const CURRENT_YEAR = 2026 as const
export const PROJECTION_END_YEAR = 2060 as const

// Upper bound for pre-sizing the map's dot pool. The projection is exponential and
// can exceed 4,500 by 2060 (government baseline, no controls); 5,000 leaves headroom
// so the map keeps getting denser instead of silently capping.
export const MAP_MAX_POPULATION = 5000 as const

// A reference level, NOT a carrying capacity: 1,500 is roughly where the leading
// models cross in the early 2050s (2021 PVA: ~1,400 by 2039; 2023 Leslie matrix:
// >1,000 by 2050). Drawn as a milestone line on the chart, not an asymptote.
export const MILESTONE_POPULATION = 1500 as const

// Net per-capita growth for the projection = GROSS_BIRTH_RATE - NATURAL_DEATH_RATE
// ≈ 0.096, the fitted rate from Castelblanco-Martínez et al. (2023).
export const PROJECTION_NET_GROWTH_RATE = 0.096 as const

// Low natural mortality: no predators, no drought-driven starvation in Colombia.
export const NATURAL_DEATH_RATE = 0.02 as const

// Gross birth rate. births - deaths = 0.116 - 0.02 = 0.096 net at full fecundity.
// Sterilization reduces the birth component via the fertile-female fraction.
export const GROSS_BIRTH_RATE = 0.116 as const

// --- Waste-impact calibration -------------------------------------------------
// Wet feces egested per hippo per day. Derived from Stears et al. 2018 (PNAS):
// the Mara River population (~4,000 hippos) egests ~36,200 kg wet mass/day ≈ 9 kg
// per hippo; rounded to a clean, defensible 10 kg/day central estimate (range 5–15).
// NB: pair this WET mass with a WET density — the widely-quoted 8,500 kg/day Mara
// figure is dry matter and must not be combined with the density below.
export const WASTE_KG_PER_HIPPO_PER_DAY = 10 as const

// Wet dung is mostly water; use a water-like bulk density (proxy from wet-manure
// data, ~900–1,050 kg/m³). Makes mass→volume ≈ 1 kg per litre.
export const DUNG_DENSITY_KG_PER_M3 = 1000 as const

// Depth to which cumulative waste is imagined spread when computing covered area.
export const WASTE_SPREAD_DEPTH_M = 0.01 as const

// Volume of a standard Olympic pool: 50 m × 25 m × 2 m.
export const OLYMPIC_POOL_M3 = 2500 as const

// Reference footprint the waste coverage fills, in m². Set to Hacienda Nápoles — the
// estate the hippos escaped from — sized ~22 km² (the estate is variously reported at
// ~20–30 km²; 22 km² ≈ 5,500 acres is a mid estimate). Chosen so the default no-control
// projection fills a striking but unsaturated ~80%, keeping the fill dynamic as control
// measures shrink it. El Poblado (14.4 km²) was the previous reference but the
// exponential projection now overflows it. NB: the silhouette polygon (napoles.json) is
// a schematic outline near the real location — only this area value is load-bearing.
export const REFERENCE_AREA_M2 = 22_000_000 as const

// --- Land & water impact calibration ------------------------------------------
// Terrestrial grass grazed per hippo per night. Stears et al. 2018 (PNAS)
// reports 40–50 kg wet mass per nightly foraging bout (~1–1.5% of body weight);
// 45 kg is the midpoint. NB: no Colombian-specific intake has been measured — this
// is assumed from African data.
export const GRASS_KG_PER_HIPPO_PER_DAY = 45 as const

// Fresh grass held per m² of healthy pasture, used only to express grazed mass as a
// familiar area ("football pitches"). ~2 kg/m² fresh ≈ ~0.5 kg/m² dry, mid-range for
// grazed tropical pasture (grassland standing crop ~1 kg/m² dry, meadow ~0.3).
export const PASTURE_FRESH_KG_PER_M2 = 2 as const

// FIFA-recommended pitch: 105 m × 68 m.
export const FOOTBALL_PITCH_M2 = 7140 as const

// Nitrogen loaded into water per hippo per year. Derived from Subalusky et al. 2015
// (Freshwater Biology): ~180 t N/year for ~4,000 Mara hippos ÷ 4,000 ≈ 45 kg N/hippo.
// This is a loading rate, NOT a "volume of water contaminated" (no such figure exists);
// it drives the eutrophication / cyanobacteria / hypoxia documented for the Colombian
// lakes near Hacienda Nápoles (Shurin et al. 2020, Ecology).
export const NITROGEN_KG_PER_HIPPO_PER_YEAR = 45 as const
