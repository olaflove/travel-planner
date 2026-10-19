import type { ButtonHTMLAttributes } from 'react'
import '../styles/chip.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }

export default function ChipButton({ selected = false, className = '', ...props }: Props) {
  return <button type="button" {...props} className={`chip-button ${className}`.trim()} aria-pressed={selected} />
}
