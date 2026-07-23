/**
 * The equations behind the simulator, as MathML.
 *
 * These mirror `src/lib/simulation/history.ts` (interpolation) and
 * `src/lib/simulation/engine.ts` (projection) exactly — if either changes, change
 * these too. Deliberately language-neutral: no words appear inside the math, so
 * every formula is shared by both locales and only its caption is translated.
 */
import type { ReactElement } from 'react'

/** Geometric interpolation between two consecutive census anchors. */
export function CensusInterpolation(): ReactElement {
  return (
    <math display="block">
      <mi>N</mi>
      <mo stretchy="false">(</mo>
      <mi>y</mi>
      <mo stretchy="false">)</mo>
      <mo>=</mo>
      <msub>
        <mi>N</mi>
        <mi>a</mi>
      </msub>
      <msup>
        <mrow>
          <mo>(</mo>
          <mfrac>
            <msub>
              <mi>N</mi>
              <mi>b</mi>
            </msub>
            <msub>
              <mi>N</mi>
              <mi>a</mi>
            </msub>
          </mfrac>
          <mo>)</mo>
        </mrow>
        <mfrac>
          <mrow>
            <mi>y</mi>
            <mo>−</mo>
            <msub>
              <mi>y</mi>
              <mi>a</mi>
            </msub>
          </mrow>
          <mrow>
            <msub>
              <mi>y</mi>
              <mi>b</mi>
            </msub>
            <mo>−</mo>
            <msub>
              <mi>y</mi>
              <mi>a</mi>
            </msub>
          </mrow>
        </mfrac>
      </msup>
    </math>
  )
}

/** Fraction of females still able to breed, given the standing sterilized stock. */
export function FertileFraction(): ReactElement {
  return (
    <math display="block">
      <msub>
        <mi>φ</mi>
        <mi>t</mi>
      </msub>
      <mo>=</mo>
      <mi>max</mi>
      <mo stretchy="false">(</mo>
      <mn>0</mn>
      <mo>,</mo>
      <mn>1</mn>
      <mo>−</mo>
      <mfrac>
        <msub>
          <mi>F</mi>
          <mi>t</mi>
        </msub>
        <mrow>
          <msub>
            <mi>N</mi>
            <mi>t</mi>
          </msub>
          <mo>/</mo>
          <mn>2</mn>
        </mrow>
      </mfrac>
      <mo stretchy="false">)</mo>
    </math>
  )
}

/** The one-year population step: births in, natural deaths and removals out. */
export function PopulationUpdate(): ReactElement {
  return (
    <math display="block">
      <msub>
        <mi>N</mi>
        <mrow>
          <mi>t</mi>
          <mo>+</mo>
          <mn>1</mn>
        </mrow>
      </msub>
      <mo>=</mo>
      <mi>max</mi>
      <mo stretchy="false">(</mo>
      <mn>0</mn>
      <mo>,</mo>
      <msub>
        <mi>N</mi>
        <mi>t</mi>
      </msub>
      <mo>+</mo>
      <mi>b</mi>
      <msub>
        <mi>N</mi>
        <mi>t</mi>
      </msub>
      <msub>
        <mi>φ</mi>
        <mi>t</mi>
      </msub>
      <mo>−</mo>
      <mi>d</mi>
      <msub>
        <mi>N</mi>
        <mi>t</mi>
      </msub>
      <mo>−</mo>
      <mi>L</mi>
      <mo>−</mo>
      <mi>X</mi>
      <mo stretchy="false">)</mo>
    </math>
  )
}

/**
 * Sterilized stocks: scaled by the year's survival ratio (removals are assumed
 * random with respect to sterilization status), then topped up by that year's
 * surgeries and capped at half the population.
 */
export function SterilizedUpdate(): ReactElement {
  return (
    <>
      <math display="block">
        <msub>
          <mi>s</mi>
          <mi>t</mi>
        </msub>
        <mo>=</mo>
        <mfrac>
          <msub>
            <mi>N</mi>
            <mrow>
              <mi>t</mi>
              <mo>+</mo>
              <mn>1</mn>
            </mrow>
          </msub>
          <msub>
            <mi>N</mi>
            <mi>t</mi>
          </msub>
        </mfrac>
      </math>
      <math display="block">
        <msub>
          <mi>F</mi>
          <mrow>
            <mi>t</mi>
            <mo>+</mo>
            <mn>1</mn>
          </mrow>
        </msub>
        <mo>=</mo>
        <mi>min</mi>
        <mo stretchy="false">(</mo>
        <msub>
          <mi>s</mi>
          <mi>t</mi>
        </msub>
        <msub>
          <mi>F</mi>
          <mi>t</mi>
        </msub>
        <mo>+</mo>
        <mi>f</mi>
        <mo>,</mo>
        <msub>
          <mi>N</mi>
          <mrow>
            <mi>t</mi>
            <mo>+</mo>
            <mn>1</mn>
          </mrow>
        </msub>
        <mo>/</mo>
        <mn>2</mn>
        <mo stretchy="false">)</mo>
      </math>
      <math display="block">
        <msub>
          <mi>M</mi>
          <mrow>
            <mi>t</mi>
            <mo>+</mo>
            <mn>1</mn>
          </mrow>
        </msub>
        <mo>=</mo>
        <mi>min</mi>
        <mo stretchy="false">(</mo>
        <msub>
          <mi>s</mi>
          <mi>t</mi>
        </msub>
        <msub>
          <mi>M</mi>
          <mi>t</mi>
        </msub>
        <mo>+</mo>
        <mi>m</mi>
        <mo>,</mo>
        <msub>
          <mi>N</mi>
          <mrow>
            <mi>t</mi>
            <mo>+</mo>
            <mn>1</mn>
          </mrow>
        </msub>
        <mo>/</mo>
        <mn>2</mn>
        <mo stretchy="false">)</mo>
      </math>
    </>
  )
}

/** Closed form of the recurrence when no control is applied (φ stays at 1). */
export function UncontrolledGrowth(): ReactElement {
  return (
    <>
      <math display="block">
        <msub>
          <mi>N</mi>
          <mi>t</mi>
        </msub>
        <mo>=</mo>
        <msub>
          <mi>N</mi>
          <mn>2026</mn>
        </msub>
        <msup>
          <mrow>
            <mo>(</mo>
            <mn>1</mn>
            <mo>+</mo>
            <mi>b</mi>
            <mo>−</mo>
            <mi>d</mi>
            <mo>)</mo>
          </mrow>
          <mrow>
            <mi>t</mi>
            <mo>−</mo>
            <mn>2026</mn>
          </mrow>
        </msup>
        <mo>=</mo>
        <msub>
          <mi>N</mi>
          <mn>2026</mn>
        </msub>
        <msup>
          <mrow>
            <mo>(</mo>
            <mn>1.096</mn>
            <mo>)</mo>
          </mrow>
          <mrow>
            <mi>t</mi>
            <mo>−</mo>
            <mn>2026</mn>
          </mrow>
        </msup>
      </math>
      <math display="block">
        <msub>
          <mi>T</mi>
          <mn>2</mn>
        </msub>
        <mo>=</mo>
        <mfrac>
          <mrow>
            <mi>ln</mi>
            <mn>2</mn>
          </mrow>
          <mrow>
            <mi>ln</mi>
            <mo stretchy="false">(</mo>
            <mn>1.096</mn>
            <mo stretchy="false">)</mo>
          </mrow>
        </mfrac>
        <mo>≈</mo>
        <mn>7.6</mn>
      </math>
    </>
  )
}

/** The single (unstable) fixed point of the removal-only recurrence. */
export function RemovalEquilibrium(): ReactElement {
  return (
    <math display="block">
      <msup>
        <mi>N</mi>
        <mo>∗</mo>
      </msup>
      <mo>=</mo>
      <mfrac>
        <mi>R</mi>
        <mrow>
          <mi>b</mi>
          <mo>−</mo>
          <mi>d</mi>
        </mrow>
      </mfrac>
      <mo>=</mo>
      <mfrac>
        <mrow>
          <mi>L</mi>
          <mo>+</mo>
          <mi>X</mi>
        </mrow>
        <mn>0.096</mn>
      </mfrac>
    </math>
  )
}

/** The share of females that must be sterilized before the population declines. */
export function SterilizationThreshold(): ReactElement {
  return (
    <>
      <math display="block">
        <mi>b</mi>
        <msub>
          <mi>φ</mi>
          <mi>t</mi>
        </msub>
        <mo>&lt;</mo>
        <mi>d</mi>
        <mo>⟺</mo>
        <msub>
          <mi>φ</mi>
          <mi>t</mi>
        </msub>
        <mo>&lt;</mo>
        <mfrac>
          <mi>d</mi>
          <mi>b</mi>
        </mfrac>
        <mo>≈</mo>
        <mn>0.172</mn>
      </math>
      <math display="block">
        <mfrac>
          <msub>
            <mi>F</mi>
            <mi>t</mi>
          </msub>
          <mrow>
            <msub>
              <mi>N</mi>
              <mi>t</mi>
            </msub>
            <mo>/</mo>
            <mn>2</mn>
          </mrow>
        </mfrac>
        <mo>&gt;</mo>
        <mn>0.828</mn>
      </math>
    </>
  )
}
