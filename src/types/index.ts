export interface Site {
  id: string;
  url: string;
  userId: string;
  createdAt: Date;
  ga4PropertyId?: string | null;
}
