import { useCallback, useState } from 'react'

/**
 * 시트/모달 열림 상태.
 * mounted 는 처음 열 때 true 가 되어 계속 유지되므로,
 * lazy 로 불러온 시트 컴포넌트가 닫힐 때도 exit 애니메이션을 재생할 수 있습니다.
 */
export function useDisclosure() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const show = useCallback(() => {
    setMounted(true)
    setOpen(true)
  }, [])
  const hide = useCallback(() => setOpen(false), [])
  return { open, mounted, show, hide }
}
