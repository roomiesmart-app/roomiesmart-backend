export class PublishSpaceDto {
  cityId!: string;
  title!: string;
  description!: string;
  monthlyPrice!: number;
  locationAddress!: string;
  neighborhood!: string;
  spaceType!: string;
  commonAreas!: string[];
  amenities!: string[];
  images!: string[];

  public validate(): void {
    if (!this.title || !this.monthlyPrice || !this.locationAddress) {
      throw new Error('Faltan campos obligatorios (título, precio o dirección).');
    }
    if (!this.cityId) {
      throw new Error('La ciudad (cityId) es obligatoria.');
    }
    if (!this.neighborhood || !this.neighborhood.trim()) {
      throw new Error('El barrio/sector (neighborhood) es obligatorio.');
    }
    if (!this.spaceType || !this.spaceType.trim()) {
      throw new Error('El tipo de espacio (spaceType) es obligatorio.');
    }
    if (!Array.isArray(this.commonAreas) || this.commonAreas.length === 0) {
      throw new Error('Debes indicar al menos un área común (commonAreas).');
    }
    if (!Array.isArray(this.amenities) || this.amenities.length === 0) {
      throw new Error('Debes indicar al menos una amenidad (amenities).');
    }
    if (!this.images || !Array.isArray(this.images) || this.images.length < 5) {
      throw new Error('Debes subir al menos 5 fotos de tu departamento.');
    }
    if (Number(this.monthlyPrice) <= 0) {
      throw new Error('El precio mensual debe ser mayor a cero.');
    }
  }
}
