export namespace ArrayUtils {
    
    /**
     * Checks all the elements
     * @param arr
     */
    export function checkNonNull<T>(arr: (T | null | undefined)[]): arr is T[] {
        for (const e of arr) {
            if (e == null) {
                return false;
            }
        }
        return true;
    }
    
}
