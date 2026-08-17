export function simulationLoadingVehicleName(input: { brandLabel: string; carTypeName: string; isOtherCarType: boolean }): string | null {
  const brand = input.brandLabel.trim();
  if (!brand) return null;
  if (input.isOtherCarType) return brand;
  const carType = input.carTypeName.trim();
  if (!carType) return null;
  return `${brand} ${carType}`;
}
