import { supabase } from '../../../../core/database.js';
import type {
  ICatalogRepository,
  CatalogItem
} from '../../application/ports/catalog.repository.js';

export class SupabaseCatalogAdapter implements ICatalogRepository {
  private async list(table: string): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from(table)
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as CatalogItem[];
  }

  public listCities(): Promise<CatalogItem[]> {
    return this.list('cities');
  }

  public listCommonAreas(): Promise<CatalogItem[]> {
    return this.list('catalog_common_areas');
  }

  public listAmenities(): Promise<CatalogItem[]> {
    return this.list('catalog_amenities');
  }
}
