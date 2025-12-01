export class ProductResponseDto {
  id: number;
  name: string;
  price: number;
  vendorId: number;
  vendorName: string;
  image?: string;     // filename saved in DB
  imageUrl?: string;  // full URL for frontend
}
