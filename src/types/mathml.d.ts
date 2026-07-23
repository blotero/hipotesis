/**
 * MathML JSX typings.
 *
 * react-dom already renders MathML into the correct namespace on both the client
 * and the server, but @types/react ships no MathML entries in JSX.IntrinsicElements.
 * Declared here rather than pulled from a package: the /about model formulas use a
 * dozen elements, and a hand-written declaration keeps the zero-dependency,
 * build-it-from-scratch approach the rest of the UI follows.
 *
 * Only the elements the formulas actually use are declared — add more as needed.
 */
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type MathMLProps = DetailedHTMLProps<HTMLAttributes<MathMLElement>, MathMLElement>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      /** Root element. `display="block"` centres it as display math. */
      math: MathMLProps & { readonly display?: 'block' | 'inline' }
      /** Fraction: exactly two children (numerator, denominator). */
      mfrac: MathMLProps
      /** Identifier — italic when a single character, upright when a word (`max`). */
      mi: MathMLProps
      /** Numeric literal. */
      mn: MathMLProps
      /** Operator, fence or separator. */
      mo: MathMLProps & {
        readonly form?: 'prefix' | 'infix' | 'postfix'
        readonly stretchy?: 'true' | 'false'
      }
      /** Horizontal grouping — needed wherever a slot takes exactly one child. */
      mrow: MathMLProps
      /** Subscript: exactly two children (base, subscript). */
      msub: MathMLProps
      /** Superscript: exactly two children (base, superscript). */
      msup: MathMLProps
      /** Literal text inside a formula. */
      mtext: MathMLProps
    }
  }
}
