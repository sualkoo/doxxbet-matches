/** Maps a sport name to a Material Icon ligature. */
export function sportIcon(sportName: string): string {
  const name = sportName.toLowerCase();
  if (name.includes('football') || name.includes('soccer')) return 'sports_soccer';
  if (name.includes('tennis')) return 'sports_tennis';
  if (name.includes('basketball')) return 'sports_basketball';
  if (name.includes('hockey') || name.includes('ice')) return 'sports_hockey';
  if (name.includes('volleyball')) return 'sports_volleyball';
  if (name.includes('baseball')) return 'sports_baseball';
  if (name.includes('golf')) return 'golf_course';
  if (name.includes('rugby')) return 'sports_rugby';
  if (name.includes('handball')) return 'sports_handball';
  if (name.includes('boxing') || name.includes('mma') || name.includes('fight')) return 'sports_mma';
  if (name.includes('motor') || name.includes('formula') || name.includes('nascar')) return 'sports_motorsports';
  if (name.includes('cycling') || name.includes('bike')) return 'directions_bike';
  if (name.includes('swim')) return 'pool';
  if (name.includes('esport') || name.includes('gaming') || name.includes('cyber')) return 'sports_esports';
  if (name.includes('american football')) return 'sports_football';
  return 'sports';
}
