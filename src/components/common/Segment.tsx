import styles from './Form.module.css'

interface SegmentProps<T extends string> {
  name: string
  legend: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

/** 라디오 그룹을 세그먼트 버튼처럼 보이게 한 선택 컨트롤 (키보드 방향키 지원은 네이티브 라디오 그대로) */
export function Segment<T extends string>({ name, legend, value, options, onChange }: SegmentProps<T>) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.segment} style={{ marginTop: 8 }}>
        {options.map((o) => (
          <label key={o.value} data-checked={value === o.value}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
