export interface CatalogItem {
  id: string;
  name: string;
}

export interface ICatalogRepository {
  listCities(): Promise<CatalogItem[]>;
  listCommonAreas(): Promise<CatalogItem[]>;
  listAmenities(): Promise<CatalogItem[]>;
}
