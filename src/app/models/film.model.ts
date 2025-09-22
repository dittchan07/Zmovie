export interface Film {
  id?: string;
  title: string;
  description: string;
  genre?: string;
  year: number;
  rating: number;
  poster: string;
  videoUrl: string;
  published: boolean;
  createdAt?: any;   
  updatedAt?: any;  
}
