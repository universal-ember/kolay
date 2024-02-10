/**
 * Tutorials (and groups) are all 123-name
 * This is so that we can sort them manually on the file system.
 * However, it's human understanding that 10 comes after 9 and before 11,
 * instead of the file system default of after 1 and before 2.
 *
 * This sort function fixes the sort to be intuitive.
 * If some file systems correctly sort files starting with numbers,
 * then this is a no-op.
 */
export function betterSort(property) {
  return (a, b) => {
    let aFull = property ? a[property] : a;
    let bFull = property ? b[property] : b;

    let [aNumStr, ...aRest] = aFull.split('-');
    let [bNumStr, ...bRest] = bFull.split('-');

    // Throw things starting with x at the end
    if (aNumStr === 'x') return 1;
    if (bNumStr === 'x') return 1;

    let aNum = Number(aNumStr);
    let bNum = Number(bNumStr);

    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;

    let aName = aRest.join('-');
    let bName = bRest.join('-');

    return aName.localeCompare(bName);
  };
}
