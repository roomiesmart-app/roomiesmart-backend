export class UpdateSpaceDto {
  cityId?: string;
  title?: string;
  description?: string;
  monthlyPrice?: number;
  locationAddress?: string;
  neighborhood?: string;
  spaceType?: string;
  commonAreas?: string[];
  amenities?: string[];
  images?: string[];

  public validate(): void {
    if (this.title !== undefined && !this.title.trim()) {
      throw new Error('El título no puede quedar vacío.');
    }
    if (this.monthlyPrice !== undefined && Number(this.monthlyPrice) <= 0) {
      throw new Error('El precio mensual debe ser mayor a cero.');
    }
    if (this.locationAddress !== undefined && !this.locationAddress.trim()) {
      throw new Error('La dirección no puede quedar vacía.');
    }
    if (this.neighborhood !== undefined && !this.neighborhood.trim()) {
      throw new Error('El barrio/sector no puede quedar vacío.');
    }
    if (this.spaceType !== undefined && !this.spaceType.trim()) {
      throw new Error('El tipo de espacio no puede quedar vacío.');
    }
    if (
      this.commonAreas !== undefined &&
      (!Array.isArray(this.commonAreas) || this.commonAreas.length === 0)
    ) {
      throw new Error('Debes indicar al menos un área común.');
    }
    if (
      this.amenities !== undefined &&
      (!Array.isArray(this.amenities) || this.amenities.length === 0)
    ) {
      throw new Error('Debes indicar al menos una amenidad.');
    }
    if (
      this.images !== undefined &&
      (!Array.isArray(this.images) || this.images.length < 5)
    ) {
      throw new Error('La publicación debe mantener al menos 5 fotos.');
    }
  }
}
