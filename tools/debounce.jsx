import { useEffect, useState } from "react"

export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

    }, [value, delay])

    return debouncedValue
}
export default useDebounce